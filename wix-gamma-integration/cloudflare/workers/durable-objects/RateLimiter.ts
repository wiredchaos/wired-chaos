/**
 * WIRED CHAOS - Rate Limiter Durable Object
 * Distributed rate limiting using Cloudflare Durable Objects
 */

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/check') {
      return this.handleCheck(request);
    } else if (path === '/reset') {
      return this.handleReset(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleCheck(request: Request): Promise<Response> {
    try {
      const body = await request.json() as {
        identifier: string;
        config: RateLimitConfig;
      };

      const { identifier, config } = body;
      const result = await this.checkLimit(identifier, config);

      return new Response(JSON.stringify(result), {
        status: result.allowed ? 200 : 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  private async handleReset(request: Request): Promise<Response> {
    try {
      const body = await request.json() as { identifier: string };
      const { identifier } = body;

      await this.state.storage.delete(`ratelimit:${identifier}`);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  private async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();

    // Get current count and window start
    const data = await this.state.storage.get<{
      count: number;
      windowStart: number;
    }>(key);

    let count = 0;
    let windowStart = now;

    if (data) {
      // Check if we're still within the window
      if (now - data.windowStart < config.windowMs) {
        count = data.count;
        windowStart = data.windowStart;
      }
    }

    // Check if limit exceeded
    if (count >= config.requests) {
      const resetTime = windowStart + config.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Increment count
    count++;
    await this.state.storage.put(key, {
      count,
      windowStart,
    });

    // Set expiration alarm
    const expirationTime = windowStart + config.windowMs + 10000; // 10s buffer
    await this.state.storage.setAlarm(expirationTime);

    return {
      allowed: true,
      remaining: config.requests - count,
      resetTime: windowStart + config.windowMs,
    };
  }

  async alarm(): Promise<void> {
    // Clean up expired entries
    const now = Date.now();
    const entries = await this.state.storage.list<{
      count: number;
      windowStart: number;
    }>();

    const keysToDelete: string[] = [];

    entries.forEach((value, key) => {
      if (key.startsWith('ratelimit:')) {
        // Assuming a max window of 1 hour for cleanup
        if (now - value.windowStart > 3600000) {
          keysToDelete.push(key);
        }
      }
    });

    if (keysToDelete.length > 0) {
      await this.state.storage.delete(keysToDelete);
    }
  }
}
