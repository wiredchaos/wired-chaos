/**
 * WIRED CHAOS - WIX/GAMMA Integration Worker (TypeScript)
 * Cloudflare Worker for handling WIX and GAMMA API requests
 * with security, caching, and performance optimization
 */

import {
  applySecurityHeaders,
  applyCORSHeaders,
  createApiResponse,
  createErrorResponse,
  validateBearerToken,
} from '../../shared/utils/index.js';
import { RATE_LIMITS } from '../../shared/constants/index.js';
import type {
  Env,
  ApiResponse,
  WixWebhook,
  GitHubWebhook,
  RateLimitConfig,
} from './types';

// Export Durable Objects
export { RateLimiter } from './durable-objects/RateLimiter';
export { AuditLogger } from './durable-objects/AuditLogger';

/**
 * Main Worker Entry Point
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(origin);
    }

    try {
      // Route requests
      if (url.pathname.startsWith('/api/wix/')) {
        return await handleWixRequest(request, env, url, origin);
      } else if (url.pathname.startsWith('/api/gamma/')) {
        return await handleGammaRequest(request, env, url, origin);
      } else if (url.pathname.startsWith('/api/sync/')) {
        return await handleSyncRequest(request, env, url, origin);
      } else if (url.pathname === '/api/health') {
        return handleHealthCheck(origin);
      } else {
        return jsonResponse(
          createErrorResponse('NOT_FOUND', 'Endpoint not found'),
          404,
          origin
        );
      }
    } catch (error) {
      console.error('Worker error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return jsonResponse(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error', errorMessage),
        500,
        origin
      );
    }
  },
};

/**
 * Handle WIX API requests
 */
async function handleWixRequest(
  request: Request,
  env: Env,
  url: URL,
  origin: string
): Promise<Response> {
  // Rate limiting using Durable Object
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const limitResult = await checkRateLimit(env, clientIp, 'wix', RATE_LIMITS.WIX);

  if (!limitResult.allowed) {
    return jsonResponse(
      createErrorResponse('RATE_LIMIT', 'Rate limit exceeded'),
      429,
      origin,
      {
        'Retry-After': limitResult.retryAfter?.toString() || '60',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
      }
    );
  }

  // Validate authentication
  const authHeader = request.headers.get('Authorization');
  if (!validateBearerToken(authHeader, env.WIX_API_TOKEN || '')) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Invalid or missing authentication token'),
      401,
      origin
    );
  }

  // Log the request for audit
  await logAudit(env, {
    type: 'wix_request',
    action: 'api_call',
    ip: clientIp,
    details: {
      path: url.pathname,
      method: request.method,
    },
  });

  const path = url.pathname.replace('/api/wix', '');

  // Route to specific WIX endpoints
  if (path.startsWith('/site')) {
    return await handleWixSite(request, env, path, origin);
  } else if (path.startsWith('/content')) {
    return await handleWixContent(request, env, path, origin);
  } else if (path.startsWith('/ar-model')) {
    return await handleWixARModel(request, env, path, origin);
  } else if (path.startsWith('/analytics')) {
    return await handleWixAnalytics(request, env, path, origin);
  } else if (path === '/webhook') {
    return await handleWixWebhook(request, env, origin);
  }

  return jsonResponse(createErrorResponse('NOT_FOUND', 'WIX endpoint not found'), 404, origin);
}

/**
 * Check rate limit using Durable Object
 */
async function checkRateLimit(
  env: Env,
  identifier: string,
  type: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number; retryAfter?: number }> {
  try {
    // Get Durable Object ID
    const id = env.RATE_LIMITER.idFromName(`${type}:${identifier}`);
    const stub = env.RATE_LIMITER.get(id);

    // Check rate limit
    const response = await stub.fetch('https://rate-limiter/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, config }),
    });

    const result = await response.json();
    return result as {
      allowed: boolean;
      remaining: number;
      resetTime: number;
      retryAfter?: number;
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limiter fails
    return { allowed: true, remaining: 0, resetTime: Date.now() + 60000 };
  }
}

/**
 * Log audit event using Durable Object
 */
async function logAudit(
  env: Env,
  entry: {
    type: string;
    action: string;
    userId?: string;
    ip?: string;
    details: Record<string, unknown>;
  }
): Promise<void> {
  try {
    // Get Durable Object ID (use a single logger for all events, or shard by date)
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const id = env.AUDIT_LOGGER.idFromName(dateKey);
    const stub = env.AUDIT_LOGGER.get(id);

    // Log the entry
    await stub.fetch('https://audit-logger/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't fail the request if logging fails
  }
}

/**
 * Handle GAMMA API requests
 */
async function handleGammaRequest(
  request: Request,
  env: Env,
  url: URL,
  origin: string
): Promise<Response> {
  // Rate limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  const limitResult = await checkRateLimit(env, clientIp, 'gamma', RATE_LIMITS.GAMMA);

  if (!limitResult.allowed) {
    return jsonResponse(
      createErrorResponse('RATE_LIMIT', 'Rate limit exceeded'),
      429,
      origin
    );
  }

  // Validate authentication
  const authHeader = request.headers.get('Authorization');
  if (!validateBearerToken(authHeader, env.GAMMA_API_KEY || '')) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Invalid or missing authentication token'),
      401,
      origin
    );
  }

  // Log the request
  await logAudit(env, {
    type: 'gamma_request',
    action: 'api_call',
    ip: clientIp,
    details: {
      path: url.pathname,
      method: request.method,
    },
  });

  const path = url.pathname.replace('/api/gamma', '');

  // Route to specific GAMMA endpoints
  if (path.startsWith('/presentations')) {
    return await handleGammaPresentations(request, env, path, origin);
  } else if (path.startsWith('/templates')) {
    return await handleGammaTemplates(request, env, path, origin);
  } else if (path.startsWith('/export')) {
    return await handleGammaExport(request, env, path, origin);
  } else if (path.startsWith('/collaboration')) {
    return await handleGammaCollaboration(request, env, path, origin);
  } else if (path === '/webhook') {
    return await handleGammaWebhook(request, env, origin);
  }

  return jsonResponse(createErrorResponse('NOT_FOUND', 'GAMMA endpoint not found'), 404, origin);
}

/**
 * Handle Wix webhook events
 */
async function handleWixWebhook(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(
      createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
      405,
      origin
    );
  }

  try {
    const webhook = (await request.json()) as WixWebhook;
    const githubEvent = request.headers.get('X-GitHub-Event');

    // Handle GitHub webhook events
    if (githubEvent) {
      return await handleGitHubWebhook(webhook as unknown as GitHubWebhook, githubEvent, env, origin);
    }

    // Handle Wix webhook events
    const signature = request.headers.get('X-Wix-Webhook-Signature');

    // Verify webhook signature if configured
    if (env.WIX_WEBHOOK_SECRET && signature) {
      const isValid = await verifyWixSignature(
        JSON.stringify(webhook),
        signature,
        env.WIX_WEBHOOK_SECRET
      );

      if (!isValid) {
        return jsonResponse(
          createErrorResponse('UNAUTHORIZED', 'Invalid webhook signature'),
          401,
          origin
        );
      }
    }

    // Process Wix webhook
    console.log('WIX webhook received:', webhook);

    // Store webhook event for audit using Durable Object
    await logAudit(env, {
      type: 'wix_webhook',
      action: 'received',
      details: { event: webhook },
    });

    return jsonResponse(
      createApiResponse(true, { received: true }),
      200,
      origin
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse(
      createErrorResponse('WEBHOOK_ERROR', 'Failed to process webhook', errorMessage),
      500,
      origin
    );
  }
}

/**
 * Verify Wix webhook signature
 */
async function verifyWixSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Handle GitHub webhook events and trigger Wix AI Bot actions
 */
async function handleGitHubWebhook(
  webhook: GitHubWebhook,
  eventType: string,
  env: Env,
  origin: string
): Promise<Response> {
  console.log(`GitHub webhook received: ${eventType}`);

  // Log the webhook
  await logAudit(env, {
    type: 'github_webhook',
    action: eventType,
    details: { webhook },
  });

  // Placeholder for GitHub webhook processing
  return jsonResponse(
    createApiResponse(true, { received: true, event: eventType }),
    200,
    origin
  );
}

/**
 * Handle sync requests
 */
async function handleSyncRequest(
  request: Request,
  env: Env,
  url: URL,
  origin: string
): Promise<Response> {
  const path = url.pathname.replace('/api/sync', '');

  if (path === '/wix-to-gamma') {
    return await syncWixToGamma(request, env, origin);
  } else if (path === '/gamma-to-wix') {
    return await syncGammaToWix(request, env, origin);
  }

  return jsonResponse(createErrorResponse('NOT_FOUND', 'Sync endpoint not found'), 404, origin);
}

// ========== Stub Handlers (to be implemented) ==========

async function handleWixSite(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'WIX Site handler' }), 200, origin);
}

async function handleWixContent(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'WIX Content handler' }), 200, origin);
}

async function handleWixARModel(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'WIX AR Model handler' }), 200, origin);
}

async function handleWixAnalytics(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'WIX Analytics handler' }), 200, origin);
}

async function handleGammaPresentations(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(
    createApiResponse(true, { message: 'GAMMA Presentations handler' }),
    200,
    origin
  );
}

async function handleGammaTemplates(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'GAMMA Templates handler' }), 200, origin);
}

async function handleGammaExport(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'GAMMA Export handler' }), 200, origin);
}

async function handleGammaCollaboration(
  request: Request,
  env: Env,
  path: string,
  origin: string
): Promise<Response> {
  return jsonResponse(
    createApiResponse(true, { message: 'GAMMA Collaboration handler' }),
    200,
    origin
  );
}

async function handleGammaWebhook(request: Request, env: Env, origin: string): Promise<Response> {
  return jsonResponse(createApiResponse(true, { message: 'GAMMA Webhook handler' }), 200, origin);
}

async function syncWixToGamma(request: Request, env: Env, origin: string): Promise<Response> {
  return jsonResponse(
    createApiResponse(true, { synced: true, message: 'WIX to GAMMA sync completed' }),
    200,
    origin
  );
}

async function syncGammaToWix(request: Request, env: Env, origin: string): Promise<Response> {
  return jsonResponse(
    createApiResponse(true, { synced: true, message: 'GAMMA to WIX sync completed' }),
    200,
    origin
  );
}

// ========== Helper Functions ==========

function handleCORS(origin: string): Response {
  return new Response(null, {
    status: 204,
    headers: applyCORSHeaders(origin, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    }),
  });
}

function handleHealthCheck(origin: string): Response {
  return jsonResponse(
    createApiResponse(true, {
      status: 'healthy',
      timestamp: Date.now(),
      services: {
        wix: 'operational',
        gamma: 'operational',
      },
    }),
    200,
    origin
  );
}

function jsonResponse(
  data: ApiResponse | Record<string, unknown>,
  status = 200,
  origin = '',
  additionalHeaders: Record<string, string> = {}
): Response {
  let headers: Record<string, string> = applySecurityHeaders({
    'Content-Type': 'application/json',
    ...additionalHeaders,
  });

  if (origin) {
    headers = applyCORSHeaders(origin, headers);
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}
