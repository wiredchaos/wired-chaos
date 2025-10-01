# Infrastructure Standards & Patterns

Complete infrastructure documentation for WIRED CHAOS on Cloudflare's global edge network.

## 🌍 Global Edge Deployment

### Cloudflare Network
- **200+ Cities**: Global presence in 200+ cities worldwide
- **100+ Countries**: Coverage across all continents
- **Sub-50ms Latency**: Worldwide average latency under 50ms
- **Unlimited Bandwidth**: No bandwidth limits on Workers or Pages
- **DDoS Protection**: Automatic DDoS mitigation at edge

### Edge Deployment Pattern
```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Client Request                                   │  │
│  └──────────────────┬────────────────────────────────┘  │
│                     │                                    │
│  ┌──────────────────▼────────────────────────────────┐  │
│  │  Cloudflare Workers (Edge Compute)               │  │
│  │  - Authentication                                 │  │
│  │  - Routing                                        │  │
│  │  - API Proxy                                      │  │
│  └──────────────────┬────────────────────────────────┘  │
│                     │                                    │
│       ┌─────────────┼─────────────┐                     │
│       │             │             │                      │
│  ┌────▼───┐   ┌────▼────┐   ┌───▼────┐                │
│  │ Pages  │   │   KV    │   │   R2   │                 │
│  │ (Static)│   │ (Data)  │   │(Objects)│                │
│  └────────┘   └─────────┘   └────────┘                 │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Auto-Scaling Configuration

### Cloudflare Workers Auto-Scaling
Workers scale automatically based on demand:
- **Unlimited Concurrency**: No manual scaling configuration needed
- **0-100k RPS**: Handles 0 to 100,000+ requests per second automatically
- **CPU Time**: 50ms per request (extensible to 30s with Unbound Workers)
- **Memory**: 128 MB per request

### Configuration
```toml
# wrangler.toml
name = "wired-chaos-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

# Workers limits (automatic)
# - Requests: Unlimited
# - CPU Time: 50ms (or 30s for Unbound)
# - Memory: 128 MB per request

# KV Namespaces
kv_namespaces = [
  { binding = "CACHE", id = "your-kv-id", preview_id = "preview-kv-id" },
  { binding = "SESSIONS", id = "sessions-kv-id" },
  { binding = "AUDIT_LOGS", id = "audit-kv-id" }
]

# R2 Buckets
r2_buckets = [
  { binding = "ASSETS", bucket_name = "wired-chaos-assets", preview_bucket_name = "wired-chaos-assets-preview" }
]

# Environment Variables (secrets set via CLI)
[vars]
ENVIRONMENT = "production"

# Rate Limiting (optional)
# Implemented in code, not configuration
```

### Rate Limiting Pattern
```javascript
class RateLimiter {
  constructor(kvNamespace, options = {}) {
    this.kv = kvNamespace;
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
  }
  
  async checkLimit(identifier) {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    
    // Get current count
    const data = await this.kv.get(key);
    let count = 0;
    let windowStart = now;
    
    if (data) {
      const parsed = JSON.parse(data);
      if (now - parsed.windowStart < this.windowMs) {
        count = parsed.count;
        windowStart = parsed.windowStart;
      }
    }
    
    // Check if limit exceeded
    if (count >= this.maxRequests) {
      const resetTime = windowStart + this.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }
    
    // Increment count
    count++;
    await this.kv.put(
      key,
      JSON.stringify({ count, windowStart }),
      { expirationTtl: Math.ceil(this.windowMs / 1000) + 10 }
    );
    
    return {
      allowed: true,
      remaining: this.maxRequests - count,
      resetTime: windowStart + this.windowMs
    };
  }
}

// Usage
const rateLimiter = new RateLimiter(env.CACHE, {
  windowMs: 60000, // 1 minute
  maxRequests: 100
});

export default {
  async fetch(request, env, ctx) {
    const ip = request.headers.get('CF-Connecting-IP');
    const limit = await rateLimiter.checkLimit(ip);
    
    if (!limit.allowed) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': limit.retryAfter.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(limit.resetTime).toISOString()
        }
      });
    }
    
    // Process request
    const response = await handleRequest(request, env);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(limit.resetTime).toISOString());
    
    return response;
  }
};
```

## 🏥 Health Monitoring Endpoints

### Health Check Implementation
```javascript
class HealthChecker {
  constructor(env) {
    this.env = env;
    this.checks = [];
  }
  
  addCheck(name, checkFn) {
    this.checks.push({ name, checkFn });
  }
  
  async runChecks() {
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      uptime: performance.now()
    };
    
    for (const check of this.checks) {
      try {
        const startTime = performance.now();
        const result = await check.checkFn();
        const duration = performance.now() - startTime;
        
        results.checks[check.name] = {
          status: result.healthy ? 'pass' : 'fail',
          message: result.message,
          duration: `${duration.toFixed(2)}ms`,
          ...result.metadata
        };
        
        if (!result.healthy) {
          results.status = 'degraded';
        }
      } catch (error) {
        results.checks[check.name] = {
          status: 'fail',
          message: error.message,
          error: error.toString()
        };
        results.status = 'unhealthy';
      }
    }
    
    return results;
  }
}

// Setup health checks
const healthChecker = new HealthChecker(env);

// KV connectivity check
healthChecker.addCheck('kv', async () => {
  try {
    await env.CACHE.put('health_check', 'ok', { expirationTtl: 60 });
    const value = await env.CACHE.get('health_check');
    return {
      healthy: value === 'ok',
      message: 'KV storage accessible'
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'KV storage error: ' + error.message
    };
  }
});

// R2 connectivity check
healthChecker.addCheck('r2', async () => {
  try {
    if (env.ASSETS) {
      const testObject = await env.ASSETS.head('health_check.txt');
      return {
        healthy: true,
        message: 'R2 storage accessible'
      };
    }
    return {
      healthy: true,
      message: 'R2 not configured (optional)'
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'R2 storage error: ' + error.message
    };
  }
});

// External API check
healthChecker.addCheck('backend', async () => {
  try {
    const response = await fetch(env.BACKEND_URL + '/health', {
      signal: AbortSignal.timeout(5000)
    });
    return {
      healthy: response.ok,
      message: 'Backend API accessible',
      metadata: { status: response.status }
    };
  } catch (error) {
    return {
      healthy: false,
      message: 'Backend API unreachable: ' + error.message
    };
  }
});

// Health endpoint
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      const healthStatus = await healthChecker.runChecks();
      
      const statusCode = 
        healthStatus.status === 'healthy' ? 200 :
        healthStatus.status === 'degraded' ? 200 :
        503;
      
      return new Response(JSON.stringify(healthStatus, null, 2), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    return handleRequest(request, env);
  }
};
```

### Readiness vs Liveness Probes
```javascript
// Liveness: Is the service running?
app.get('/health/live', () => {
  return new Response(JSON.stringify({ status: 'alive' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
});

// Readiness: Is the service ready to handle requests?
app.get('/health/ready', async (request, env) => {
  const checks = await runDependencyChecks(env);
  const allReady = Object.values(checks).every(c => c.status === 'ready');
  
  return new Response(JSON.stringify({
    status: allReady ? 'ready' : 'not_ready',
    checks
  }), {
    status: allReady ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
});
```

## 💾 KV Storage Patterns

### Cache-First Pattern
```javascript
async function cacheFirst(key, fetchFn, ttl = 3600) {
  // Try cache first
  const cached = await env.CACHE.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from origin
  const data = await fetchFn();
  
  // Store in cache
  await env.CACHE.put(key, JSON.stringify(data), {
    expirationTtl: ttl
  });
  
  return data;
}

// Usage
const userData = await cacheFirst(
  `user:${userId}`,
  async () => {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },
  3600 // 1 hour TTL
);
```

### Stale-While-Revalidate Pattern
```javascript
async function staleWhileRevalidate(key, fetchFn, ttl = 3600) {
  const cached = await env.CACHE.get(key, { type: 'json', cacheTtl: ttl });
  
  if (cached) {
    // Return cached data immediately
    // Revalidate in background (if stale)
    ctx.waitUntil(async () => {
      const fresh = await fetchFn();
      await env.CACHE.put(key, JSON.stringify(fresh), {
        expirationTtl: ttl
      });
    }());
    
    return cached;
  }
  
  // No cache, fetch and store
  const data = await fetchFn();
  await env.CACHE.put(key, JSON.stringify(data), {
    expirationTtl: ttl
  });
  
  return data;
}
```

### Atomic Updates
```javascript
class AtomicKV {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
  }
  
  async increment(key, delta = 1, ttl = null) {
    let retries = 5;
    
    while (retries > 0) {
      // Get current value with metadata
      const current = await this.kv.getWithMetadata(key);
      const currentValue = current.value ? parseInt(current.value) : 0;
      const newValue = currentValue + delta;
      
      // Try to update
      try {
        await this.kv.put(key, newValue.toString(), {
          expirationTtl: ttl,
          metadata: { version: (current.metadata?.version || 0) + 1 }
        });
        
        return newValue;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 100 * (6 - retries)));
      }
    }
  }
}
```

## 🔄 Real-Time Event Bus Implementation

### Durable Objects Event Bus
```javascript
// Durable Object for event bus
export class EventBus {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }
  
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/subscribe') {
      // WebSocket connection for real-time events
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 400 });
      }
      
      const [client, server] = Object.values(new WebSocketPair());
      
      await this.handleSession(server);
      
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }
    
    if (url.pathname === '/publish' && request.method === 'POST') {
      const event = await request.json();
      await this.broadcast(event);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
  
  async handleSession(webSocket) {
    webSocket.accept();
    
    this.sessions.push(webSocket);
    
    webSocket.addEventListener('message', async (msg) => {
      try {
        const data = JSON.parse(msg.data);
        await this.broadcast(data);
      } catch (error) {
        webSocket.send(JSON.stringify({ error: error.message }));
      }
    });
    
    webSocket.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== webSocket);
    });
  }
  
  async broadcast(event) {
    const message = JSON.stringify({
      type: event.type,
      data: event.data,
      timestamp: Date.now()
    });
    
    // Store in state
    const history = await this.state.storage.get('event_history') || [];
    history.push({ ...event, timestamp: Date.now() });
    
    // Keep last 100 events
    if (history.length > 100) {
      history.shift();
    }
    
    await this.state.storage.put('event_history', history);
    
    // Broadcast to all connected clients
    this.sessions.forEach(session => {
      try {
        session.send(message);
      } catch (error) {
        console.error('Failed to send to session:', error);
      }
    });
  }
}

// Worker that uses EventBus
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/events')) {
      // Get Durable Object instance
      const id = env.EVENT_BUS.idFromName('global');
      const obj = env.EVENT_BUS.get(id);
      
      return obj.fetch(request);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### Event Publishing Pattern
```javascript
async function publishEvent(env, eventType, eventData) {
  // Get event bus instance
  const id = env.EVENT_BUS.idFromName('global');
  const eventBus = env.EVENT_BUS.get(id);
  
  // Publish event
  await eventBus.fetch(new Request('https://eventbus/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: eventType,
      data: eventData
    })
  }));
}

// Usage
await publishEvent(env, 'NFT_MINTED', {
  tokenId: '12345',
  owner: '0xABC...',
  chain: 'ethereum',
  timestamp: Date.now()
});
```

## 📊 Monitoring & Alerting

### Cloudflare Analytics
```javascript
// Custom analytics with Workers Analytics Engine
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    
    try {
      const response = await handleRequest(request, env);
      const duration = Date.now() - startTime;
      
      // Log metrics
      if (env.ANALYTICS) {
        ctx.waitUntil(
          env.ANALYTICS.writeDataPoint({
            blobs: [
              request.headers.get('CF-Connecting-IP'),
              request.headers.get('User-Agent'),
              new URL(request.url).pathname
            ],
            doubles: [duration],
            indexes: [response.status.toString()]
          })
        );
      }
      
      return response;
    } catch (error) {
      // Log error
      console.error('Request failed:', error);
      
      if (env.ANALYTICS) {
        ctx.waitUntil(
          env.ANALYTICS.writeDataPoint({
            blobs: ['error', error.message],
            doubles: [Date.now() - startTime],
            indexes: ['500']
          })
        );
      }
      
      throw error;
    }
  }
};
```

### Error Tracking
```javascript
class ErrorTracker {
  constructor(env) {
    this.env = env;
  }
  
  async track(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context: {
        url: context.url,
        method: context.method,
        headers: context.headers,
        userId: context.userId
      }
    };
    
    // Store in KV for analysis
    const key = `error:${Date.now()}:${crypto.randomUUID()}`;
    await this.env.ERROR_LOGS.put(
      key,
      JSON.stringify(errorData),
      { expirationTtl: 2592000 } // 30 days
    );
    
    // Send to external service (e.g., Sentry)
    if (this.env.SENTRY_DSN) {
      await this.sendToSentry(errorData);
    }
    
    console.error('Error tracked:', errorData);
  }
  
  async sendToSentry(errorData) {
    // Implementation for Sentry integration
  }
}
```

## 🔐 Secrets Management

### Using Wrangler CLI
```bash
# Set secret
wrangler secret put API_TOKEN

# List secrets (doesn't show values)
wrangler secret list

# Delete secret
wrangler secret delete API_TOKEN

# Bulk upload from .env file
wrangler secret bulk .env.production
```

### Accessing Secrets in Code
```javascript
export default {
  async fetch(request, env, ctx) {
    // Access secrets from env object
    const apiToken = env.API_TOKEN;
    const dbUrl = env.DATABASE_URL;
    
    // Never log secrets!
    console.log('Using API token:', apiToken.substring(0, 4) + '****');
    
    return new Response('OK');
  }
};
```

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Infrastructure Team
