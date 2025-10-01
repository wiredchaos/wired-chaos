/**
 * WIRED CHAOS - Cloudflare Worker
 * API proxy and routing for the WIRED CHAOS ecosystem
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // CORS headers for all responses
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      };

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }

      // Health check endpoint
      if (url.pathname === '/health' || url.pathname === '/') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'wired-chaos-meta',
          environment: env.ENVIRONMENT || 'production',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // API proxy endpoint
      if (url.pathname.startsWith('/api/') && env.UG_API_BASE && env.UG_API_TOKEN) {
        const target = env.UG_API_BASE + url.pathname + url.search;
        const init = {
          method: request.method,
          headers: {
            'Authorization': env.UG_API_TOKEN,
            'Content-Type': 'application/json',
            'User-Agent': 'WIRED-CHAOS-Worker/1.0.0'
          }
        };

        // Add body for non-GET requests
        if (!['GET', 'HEAD'].includes(request.method)) {
          init.body = await request.text();
        }

        const resp = await fetch(target, init);
        const responseText = await resp.text();
        
        return new Response(responseText, {
          status: resp.status,
          headers: {
            'Content-Type': resp.headers.get('Content-Type') || 'application/json',
            ...corsHeaders
          }
        });
      }

      // Default response for unmatched routes
      return new Response(JSON.stringify({
        error: 'Route not found',
        message: 'WIRED CHAOS Worker is running, but the requested route is not configured.',
        availableEndpoints: ['/health', '/api/*'],
        timestamp: new Date().toISOString()
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred in the WIRED CHAOS Worker.',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
