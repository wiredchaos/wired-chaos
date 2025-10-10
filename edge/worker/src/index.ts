/**
 * WIRED CHAOS - Task Management Worker
 * Main worker entry point integrating task and swarm management routes
 */

import { handleTasksRoute } from './routes/tasks';
import { handleSwarmsRoute } from './routes/swarms';

export interface Env {
  // Add your environment variables here
  // Example: API_TOKEN: string;
}

/**
 * Main worker fetch handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // Route to task management endpoints
      if (path.startsWith('/api/tasks')) {
        const response = await handleTasksRoute(request);
        return addCorsHeaders(response, corsHeaders);
      }

      // Route to swarm management endpoints
      if (path.startsWith('/api/swarms')) {
        const response = await handleSwarmsRoute(request);
        return addCorsHeaders(response, corsHeaders);
      }

      // Health check endpoint
      if (path === '/api/health' || path === '/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'wired-chaos-task-management',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Default 404
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Not Found',
          path,
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

/**
 * Helper function to add CORS headers to response
 */
function addCorsHeaders(response: Response, corsHeaders: Record<string, string>): Response {
  const newHeaders = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
