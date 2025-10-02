/**
 * WIRED CHAOS Edge Worker - Main Entry Point
 * InsightX Integration + Resources Repository
 */

import { handleTicker } from './routes/ticker.js';
import { handleHeatMap } from './routes/heatmap.js';
import { handleResources } from './routes/resources.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Cookie'
        }
      });
    }
    
    try {
      // InsightX Integration Routes
      if (path === '/api/ticker') {
        return await handleTicker(request, env);
      }
      
      if (path === '/api/heatmap') {
        return await handleHeatMap(request, env);
      }
      
      // Resources Repository Routes
      if (path.startsWith('/api/profile') || 
          path.startsWith('/api/providers') || 
          path.startsWith('/api/vault')) {
        return await handleResources(request, env);
      }
      
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          ok: true,
          timestamp: Date.now(),
          version: '1.0.0',
          services: {
            ticker: 'operational',
            heatmap: 'operational',
            resources: 'operational'
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Not found
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
