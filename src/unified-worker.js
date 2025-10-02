// 🧠 WIRED CHAOS Unified Command Processor - Cloudflare Worker
// Main entry point for the AI-controlled digital empire

import { UnifiedCommandProcessor } from './unified-command-processor.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Initialize the unified command processor
    const processor = new UnifiedCommandProcessor(env);

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
      'Access-Control-Max-Age': '86400'
    };

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      // 🏥 HEALTH CHECK ENDPOINT
      if (path === '/health' && method === 'GET') {
        const healthData = {
          ok: true,
          timestamp: new Date().toISOString(),
          worker: 'wired-chaos-unified-processor',
          version: '1.0.0',
          uptime: Date.now(),
          environment: env.ENVIRONMENT || 'staging'
        };

        return new Response(JSON.stringify(healthData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 🧠 UNIFIED COMMAND PROCESSING
      if (path === '/command' && method === 'POST') {
        const body = await request.json();
        const { command } = body;

        if (!command) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Command is required',
            example: '/system health enterprise'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        console.log(`🧠 Processing unified command: ${command}`);
        const result = await processor.processUnifiedCommand(command);

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 🌐 WIX INTEGRATION ENDPOINTS
      if (path.startsWith('/wix/')) {
        return await this.handleWixEndpoints(path, method, request, processor, corsHeaders);
      }

      // 🎨 GAMMA INTEGRATION ENDPOINTS  
      if (path.startsWith('/gamma/')) {
        return await this.handleGammaEndpoints(path, method, request, processor, corsHeaders);
      }

      // ⚡ ZAPIER WEBHOOK ENDPOINTS
      if (path.startsWith('/zapier/')) {
        return await this.handleZapierEndpoints(path, method, request, processor, corsHeaders);
      }

      // 🔧 ADMIN ENDPOINTS
      if (path.startsWith('/admin/')) {
        return await this.handleAdminEndpoints(path, method, request, env, corsHeaders);
      }

      // 🎓 EDUCATION ENDPOINTS
      if (path.startsWith('/education/')) {
        return await this.handleEducationEndpoints(path, method, request, processor, corsHeaders);
      }

      // 🎮 VRG33589 GAME ENDPOINTS
      if (path.startsWith('/game/')) {
        return await this.handleGameEndpoints(path, method, request, processor, corsHeaders);
      }

      // 💼 BUSINESS ENDPOINTS
      if (path.startsWith('/business/')) {
        return await this.handleBusinessEndpoints(path, method, request, processor, corsHeaders);
      }

      // 📊 SYSTEM ENDPOINTS
      if (path.startsWith('/system/')) {
        return await this.handleSystemEndpoints(path, method, request, processor, corsHeaders);
      }

      // 🤖 NOTION AI BOT WEBHOOK
      if (path === '/notion/webhook' && method === 'POST') {
        return await this.handleNotionWebhook(request, processor, corsHeaders);
      }

      // Default response for unmatched routes
      return new Response(JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
          '/health',
          '/command',
          '/wix/*',
          '/gamma/*', 
          '/zapier/*',
          '/admin/*',
          '/education/*',
          '/business/*',
          '/system/*',
          '/notion/webhook'
        ]
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  },

  // 🌐 WIX ENDPOINT HANDLERS
  async handleWixEndpoints(path, method, request, processor, corsHeaders) {
    const segments = path.split('/');
    const action = segments[2]; // /wix/[action]

    switch (action) {
      case 'sync':
        if (method === 'POST') {
          const url = new URL(request.url);
          const dryRun = url.searchParams.get('dryRun') === '1';
          
          const result = dryRun 
            ? await this.mockWixSync()
            : await processor.processUnifiedCommand('/wix store sync');

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'analytics':
        if (method === 'GET') {
          const result = await processor.processUnifiedCommand('/wix store analytics');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'members':
        if (method === 'POST') {
          const result = await processor.processUnifiedCommand('/wix member import');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown Wix action: ${action}`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },

  // 🎨 GAMMA ENDPOINT HANDLERS
  async handleGammaEndpoints(path, method, request, processor, corsHeaders) {
    const segments = path.split('/');
    const action = segments[2]; // /gamma/[action]

    switch (action) {
      case 'generate':
        if (method === 'POST') {
          const url = new URL(request.url);
          const dryRun = url.searchParams.get('dryRun') === '1';
          
          if (dryRun) {
            return new Response(JSON.stringify({
              success: true,
              message: '🎨 Gamma bulk generation (DRY RUN)',
              jobId: `gamma_dry_${Date.now()}`,
              estimatedDecks: 12,
              estimatedTime: '5 minutes'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          const result = await processor.processUnifiedCommand('/gamma bulk generate-university');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'template':
        if (method === 'GET') {
          const result = await processor.processUnifiedCommand('/gamma template library');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown Gamma action: ${action}`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },

  // ⚡ ZAPIER ENDPOINT HANDLERS
  async handleZapierEndpoints(path, method, request, processor, corsHeaders) {
    const segments = path.split('/');
    const action = segments[2]; // /zapier/[action]

    switch (action) {
      case 'relay':
        if (method === 'POST') {
          const body = await request.json();
          const { type, payload } = body;

          // Forward to Zapier webhook
          const zapierUrl = processor.integrations?.zapier?.webhookUrl || 'https://hooks.zapier.com/hooks/catch/mock';
          
          try {
            const response = await fetch(zapierUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, payload, timestamp: new Date().toISOString() })
            });

            return new Response(JSON.stringify({
              success: true,
              forwarded: true,
              zapierStatus: response.status,
              type: type
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          } catch (error) {
            return new Response(JSON.stringify({
              success: false,
              forwarded: false,
              error: error.message
            }), {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }
        }
        break;

      case 'status':
        if (method === 'GET') {
          const result = await processor.processUnifiedCommand('/zapier status all');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown Zapier action: ${action}`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },

  // 🔧 ADMIN ENDPOINT HANDLERS
  async handleAdminEndpoints(path, method, request, env, corsHeaders) {
    // Verify admin token
    const adminToken = request.headers.get('X-Admin-Token');
    if (adminToken !== env.ADMIN_TOKEN) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid admin token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const segments = path.split('/');
    const action = segments[2]; // /admin/[action]

    switch (action) {
      case 'flag':
        if (method === 'POST') {
          const body = await request.json();
          const { key, value } = body;

          // Store flag in KV (if available)
          if (env.BUS_KV) {
            await env.BUS_KV.put(`flag:${key}`, value);
          }

          return new Response(JSON.stringify({
            success: true,
            message: `Flag ${key} set to ${value}`,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'circuit-breaker':
        if (method === 'POST') {
          // Toggle circuit breaker
          const body = await request.json();
          const { state } = body; // 'open' or 'closed'

          if (env.BUS_KV) {
            await env.BUS_KV.put('circuit:breaker', state);
          }

          return new Response(JSON.stringify({
            success: true,
            message: `🚨 Circuit breaker ${state}`,
            state: state,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown admin action: ${action}`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },

  // 🎮 VRG33589 GAME ENDPOINT HANDLERS
  async handleGameEndpoints(path, method, request, processor, corsHeaders) {
    const segments = path.split('/');
    const action = segments[2]; // /game/[action]

    switch (action) {
      case 'state':
        if (method === 'GET') {
          const wallet = segments[3];
          if (!wallet) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Wallet address required'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            });
          }

          // Proxy to backend game API
          return new Response(JSON.stringify({
            success: true,
            message: 'Game state endpoint - proxy to backend',
            wallet: wallet
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'initialize':
        if (method === 'POST') {
          const body = await request.json();
          const { wallet_address } = body;

          return new Response(JSON.stringify({
            success: true,
            message: 'Game initialized',
            wallet: wallet_address,
            layer: 'surface'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'puzzle':
        if (method === 'POST') {
          return new Response(JSON.stringify({
            success: true,
            message: 'Puzzle submission endpoint',
            swarm_verification: 'pending'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;

      case 'leaderboard':
        if (method === 'GET') {
          return new Response(JSON.stringify({
            success: true,
            leaderboard: [],
            message: 'Game leaderboard endpoint'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        break;
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown game action: ${action}`
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  },

  // 🤖 NOTION AI BOT WEBHOOK HANDLER
  async handleNotionWebhook(request, processor, corsHeaders) {
    try {
      const body = await request.json();
      const { command, user, context } = body;

      if (!command) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Command is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log(`🤖 Notion AI Bot command: ${command} from user: ${user}`);

      // Process the command through unified processor
      const result = await processor.processUnifiedCommand(command);

      // Log to Notion database (if configured)
      if (processor.integrations?.notion) {
        try {
          await processor.integrations.notion.createDatabaseRecord('ai_bot_logs', {
            Command: { title: [{ text: { content: command } }] },
            User: { rich_text: [{ text: { content: user || 'unknown' } }] },
            Success: { checkbox: result.success },
            Response: { rich_text: [{ text: { content: JSON.stringify(result).substring(0, 2000) } }] },
            Timestamp: { date: { start: new Date().toISOString() } }
          });
        } catch (logError) {
          console.error('Failed to log to Notion:', logError);
        }
      }

      return new Response(JSON.stringify({
        ...result,
        source: 'notion_ai_bot',
        user: user
      }), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Notion webhook error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to process Notion webhook',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  },

  // Mock methods for dry runs
  async mockWixSync() {
    return {
      success: true,
      message: '🛒 Wix store sync (DRY RUN)',
      details: {
        synced: 47,
        new: 3,
        updated: 12,
        errors: 0,
        dryRun: true
      }
    };
  }
};