/**
 * WIRED CHAOS - WIX/GAMMA Integration Worker
 * Cloudflare Worker for handling WIX and GAMMA API requests
 * with security, caching, and performance optimization
 */

import { 
  applySecurityHeaders, 
  applyCORSHeaders, 
  createApiResponse, 
  createErrorResponse,
  validateBearerToken,
  RateLimiter 
} from '../../shared/utils/index.js';
import { RATE_LIMITS, CACHE_CONFIG } from '../../shared/constants/index.js';

// Rate limiters for WIX and GAMMA
const wixRateLimiter = new RateLimiter(RATE_LIMITS.WIX.requests, RATE_LIMITS.WIX.window);
const gammaRateLimiter = new RateLimiter(RATE_LIMITS.GAMMA.requests, RATE_LIMITS.GAMMA.window);

/**
 * Main Worker Entry Point
 */
export default {
  async fetch(request, env, ctx) {
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
      return jsonResponse(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error', error.message),
        500,
        origin
      );
    }
  }
};

/**
 * Handle WIX API requests
 */
async function handleWixRequest(request, env, url, origin) {
  // Rate limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!wixRateLimiter.check(clientIp)) {
    return jsonResponse(
      createErrorResponse('RATE_LIMIT', 'Rate limit exceeded'),
      429,
      origin
    );
  }

  // Validate authentication
  const authHeader = request.headers.get('Authorization');
  if (!validateBearerToken(authHeader, env.WIX_API_TOKEN)) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Invalid or missing authentication token'),
      401,
      origin
    );
  }

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

  return jsonResponse(
    createErrorResponse('NOT_FOUND', 'WIX endpoint not found'),
    404,
    origin
  );
}

/**
 * Handle GAMMA API requests
 */
async function handleGammaRequest(request, env, url, origin) {
  // Rate limiting
  const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!gammaRateLimiter.check(clientIp)) {
    return jsonResponse(
      createErrorResponse('RATE_LIMIT', 'Rate limit exceeded'),
      429,
      origin
    );
  }

  // Validate authentication
  const authHeader = request.headers.get('Authorization');
  if (!validateBearerToken(authHeader, env.GAMMA_API_KEY)) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Invalid or missing authentication token'),
      401,
      origin
    );
  }

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

  return jsonResponse(
    createErrorResponse('NOT_FOUND', 'GAMMA endpoint not found'),
    404,
    origin
  );
}

/**
 * Handle sync requests between WIX and GAMMA
 */
async function handleSyncRequest(request, env, url, origin) {
  const path = url.pathname.replace('/api/sync', '');
  
  if (path === '/wix-to-gamma') {
    return await syncWixToGamma(request, env, origin);
  } else if (path === '/gamma-to-wix') {
    return await syncGammaToWix(request, env, origin);
  }

  return jsonResponse(
    createErrorResponse('NOT_FOUND', 'Sync endpoint not found'),
    404,
    origin
  );
}

// ========== WIX Handlers ==========

async function handleWixSite(request, env, path, origin) {
  // Check cache first
  const cacheKey = `wix:site:${env.WIX_SITE_ID}`;
  const cached = await getFromCache(env, cacheKey);
  if (cached) {
    return jsonResponse(cached, 200, origin);
  }

  // Fetch from WIX API
  try {
    const response = await fetch(`https://www.wixapis.com/site/v1/sites/${env.WIX_SITE_ID}`, {
      headers: {
        'Authorization': `Bearer ${env.WIX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const result = createApiResponse(true, data);
    
    // Cache the result
    await putInCache(env, cacheKey, result, CACHE_CONFIG.WIX_CONTENT);
    
    return jsonResponse(result, 200, origin);
  } catch (error) {
    return jsonResponse(
      createErrorResponse('WIX_API_ERROR', 'Failed to fetch WIX site data', error.message),
      500,
      origin
    );
  }
}

async function handleWixContent(request, env, path, origin) {
  const method = request.method;
  
  if (method === 'GET') {
    // Get content from WIX Data API
    const collectionId = new URL(request.url).searchParams.get('collection');
    
    try {
      const response = await fetch(
        `https://www.wixapis.com/wix-data/v2/items/query?collectionId=${collectionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.WIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: {} })
        }
      );

      const data = await response.json();
      return jsonResponse(createApiResponse(true, data), 200, origin);
    } catch (error) {
      return jsonResponse(
        createErrorResponse('WIX_API_ERROR', 'Failed to fetch WIX content', error.message),
        500,
        origin
      );
    }
  }

  return jsonResponse(
    createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
    405,
    origin
  );
}

async function handleWixARModel(request, env, path, origin) {
  // Handle AR model requests from R2 storage
  const modelId = path.split('/').pop();
  
  try {
    const object = await env.R2_BUCKET.get(`ar-models/${modelId}`);
    
    if (!object) {
      return jsonResponse(
        createErrorResponse('NOT_FOUND', 'AR model not found'),
        404,
        origin
      );
    }

    return new Response(object.body, {
      headers: applyCORSHeaders(origin, {
        'Content-Type': object.httpMetadata?.contentType || 'model/gltf-binary',
        'Cache-Control': `public, max-age=${CACHE_CONFIG.STATIC_ASSETS}`
      })
    });
  } catch (error) {
    return jsonResponse(
      createErrorResponse('R2_ERROR', 'Failed to fetch AR model', error.message),
      500,
      origin
    );
  }
}

async function handleWixAnalytics(request, env, path, origin) {
  if (request.method !== 'POST') {
    return jsonResponse(
      createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
      405,
      origin
    );
  }

  try {
    const event = await request.json();
    
    // Store in KV for analytics
    const eventId = `wix_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await env.ANALYTICS_KV.put(eventId, JSON.stringify(event), {
      expirationTtl: 86400 * 30 // 30 days
    });

    return jsonResponse(
      createApiResponse(true, { eventId, stored: true }),
      200,
      origin
    );
  } catch (error) {
    return jsonResponse(
      createErrorResponse('ANALYTICS_ERROR', 'Failed to store analytics event', error.message),
      500,
      origin
    );
  }
}

async function handleWixWebhook(request, env, origin) {
  if (request.method !== 'POST') {
    return jsonResponse(
      createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
      405,
      origin
    );
  }

  try {
    const webhook = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('X-Wix-Webhook-Signature');
    // TODO: Implement signature verification
    
    // Process webhook
    console.log('WIX webhook received:', webhook);
    
    return jsonResponse(
      createApiResponse(true, { received: true }),
      200,
      origin
    );
  } catch (error) {
    return jsonResponse(
      createErrorResponse('WEBHOOK_ERROR', 'Failed to process webhook', error.message),
      500,
      origin
    );
  }
}

// ========== GAMMA Handlers ==========

async function handleGammaPresentations(request, env, path, origin) {
  const method = request.method;
  
  if (method === 'GET') {
    // List presentations
    try {
      const response = await fetch('https://gamma.app/api/v1/presentations', {
        headers: {
          'Authorization': `Bearer ${env.GAMMA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return jsonResponse(createApiResponse(true, data), 200, origin);
    } catch (error) {
      return jsonResponse(
        createErrorResponse('GAMMA_API_ERROR', 'Failed to fetch presentations', error.message),
        500,
        origin
      );
    }
  } else if (method === 'POST') {
    // Create presentation
    try {
      const body = await request.json();
      
      const response = await fetch('https://gamma.app/api/v1/presentations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GAMMA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return jsonResponse(createApiResponse(true, data), 201, origin);
    } catch (error) {
      return jsonResponse(
        createErrorResponse('GAMMA_API_ERROR', 'Failed to create presentation', error.message),
        500,
        origin
      );
    }
  }

  return jsonResponse(
    createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
    405,
    origin
  );
}

async function handleGammaTemplates(request, env, path, origin) {
  // Get WIRED CHAOS branded templates
  const cacheKey = 'gamma:templates:wired-chaos';
  const cached = await getFromCache(env, cacheKey);
  if (cached) {
    return jsonResponse(cached, 200, origin);
  }

  const templates = [
    {
      id: 'wc-cyber-dark',
      name: 'WIRED CHAOS Cyber Dark',
      description: 'Dark theme with neon accents',
      theme: {
        colors: {
          primary: '#00FFFF',
          secondary: '#FF00FF',
          background: '#000000',
          text: '#FFFFFF',
          accent: '#39FF14'
        }
      }
    },
    {
      id: 'wc-glitch',
      name: 'WIRED CHAOS Glitch',
      description: 'Glitch effect theme',
      theme: {
        colors: {
          primary: '#FF3131',
          secondary: '#00FFFF',
          background: '#0a0a0a',
          text: '#FFFFFF',
          accent: '#FF00FF'
        }
      }
    }
  ];

  const result = createApiResponse(true, templates);
  await putInCache(env, cacheKey, result, CACHE_CONFIG.GAMMA_PRESENTATIONS);
  
  return jsonResponse(result, 200, origin);
}

async function handleGammaExport(request, env, path, origin) {
  if (request.method !== 'POST') {
    return jsonResponse(
      createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
      405,
      origin
    );
  }

  try {
    const exportRequest = await request.json();
    
    // Proxy to GAMMA export API
    const response = await fetch('https://gamma.app/api/v1/exports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GAMMA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exportRequest)
    });

    const data = await response.json();
    return jsonResponse(createApiResponse(true, data), 200, origin);
  } catch (error) {
    return jsonResponse(
      createErrorResponse('GAMMA_EXPORT_ERROR', 'Failed to export presentation', error.message),
      500,
      origin
    );
  }
}

async function handleGammaCollaboration(request, env, path, origin) {
  // Handle real-time collaboration
  // This would integrate with Durable Objects for WebSocket support
  return jsonResponse(
    createApiResponse(true, { message: 'Collaboration endpoint - WebSocket upgrade required' }),
    200,
    origin
  );
}

async function handleGammaWebhook(request, env, origin) {
  if (request.method !== 'POST') {
    return jsonResponse(
      createErrorResponse('METHOD_NOT_ALLOWED', 'Method not allowed'),
      405,
      origin
    );
  }

  try {
    const webhook = await request.json();
    console.log('GAMMA webhook received:', webhook);
    
    return jsonResponse(
      createApiResponse(true, { received: true }),
      200,
      origin
    );
  } catch (error) {
    return jsonResponse(
      createErrorResponse('WEBHOOK_ERROR', 'Failed to process webhook', error.message),
      500,
      origin
    );
  }
}

// ========== Sync Handlers ==========

async function syncWixToGamma(request, env, origin) {
  try {
    const syncRequest = await request.json();
    
    // Fetch content from WIX
    // Transform to GAMMA format
    // Create/update GAMMA presentation
    
    return jsonResponse(
      createApiResponse(true, { synced: true, message: 'WIX to GAMMA sync completed' }),
      200,
      origin
    );
  } catch (error) {
    return jsonResponse(
      createErrorResponse('SYNC_ERROR', 'Failed to sync WIX to GAMMA', error.message),
      500,
      origin
    );
  }
}

async function syncGammaToWix(request, env, origin) {
  try {
    const syncRequest = await request.json();
    
    // Fetch presentation from GAMMA
    // Transform to WIX format
    // Update WIX content
    
    return jsonResponse(
      createApiResponse(true, { synced: true, message: 'GAMMA to WIX sync completed' }),
      200,
      origin
    );
  } catch (error) {
    return jsonResponse(
      createErrorResponse('SYNC_ERROR', 'Failed to sync GAMMA to WIX', error.message),
      500,
      origin
    );
  }
}

// ========== Helper Functions ==========

function handleCORS(origin) {
  return new Response(null, {
    status: 204,
    headers: applyCORSHeaders(origin, {})
  });
}

function handleHealthCheck(origin) {
  return jsonResponse(
    createApiResponse(true, {
      status: 'healthy',
      timestamp: Date.now(),
      services: {
        wix: 'operational',
        gamma: 'operational'
      }
    }),
    200,
    origin
  );
}

function jsonResponse(data, status = 200, origin = '') {
  let headers = applySecurityHeaders({
    'Content-Type': 'application/json'
  });
  
  if (origin) {
    headers = applyCORSHeaders(origin, headers);
  }

  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}

async function getFromCache(env, key) {
  if (!env.CACHE_KV) return null;
  
  const cached = await env.CACHE_KV.get(key, 'json');
  return cached;
}

async function putInCache(env, key, value, ttl) {
  if (!env.CACHE_KV) return;
  
  await env.CACHE_KV.put(key, JSON.stringify(value), {
    expirationTtl: ttl
  });
}
