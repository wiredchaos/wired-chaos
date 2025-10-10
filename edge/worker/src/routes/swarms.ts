/**
 * WIRED CHAOS - Swarm Status and Control API Routes
 * Endpoints for monitoring and controlling swarms
 */

import { GammaSwarmHandler } from '../../../../apps/swarms/gamma/handler';
import { CloudflareSwarmHandler } from '../../../../apps/swarms/cloudflare/handler';
import type { SwarmTask } from '../../../../apps/swarms/shared/protocol';

// Initialize swarm handlers
const gammaSwarm = new GammaSwarmHandler('gamma-swarm-1');
const cloudflareSwarm = new CloudflareSwarmHandler('cloudflare-swarm-1');

/**
 * Get all swarm statuses
 */
export async function getAllSwarmStatuses(request: Request): Promise<Response> {
  try {
    const swarms = [
      gammaSwarm.getStatus(),
      cloudflareSwarm.getStatus(),
    ];

    return new Response(
      JSON.stringify({ success: true, swarms }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get specific swarm status
 */
export async function getSwarmStatus(request: Request, swarmId: string): Promise<Response> {
  try {
    let status = null;

    if (swarmId.includes('gamma')) {
      status = gammaSwarm.getStatus();
    } else if (swarmId.includes('cloudflare')) {
      status = cloudflareSwarm.getStatus();
    }

    if (!status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Swarm not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle swarm task assignment (internal endpoint)
 */
export async function handleSwarmTask(request: Request, swarmType: 'gamma' | 'cloudflare'): Promise<Response> {
  try {
    const body = await request.json() as { action: string; task?: SwarmTask; taskId?: string };

    if (body.action === 'assign' && body.task) {
      let result;
      
      if (swarmType === 'gamma') {
        result = await gammaSwarm.handleTask(body.task);
      } else {
        result = await cloudflareSwarm.handleTask(body.task);
      }

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'status' && body.taskId) {
      let taskResult;
      
      if (swarmType === 'gamma') {
        taskResult = gammaSwarm.getTaskResult(body.taskId);
      } else {
        taskResult = cloudflareSwarm.getTaskResult(body.taskId);
      }

      return new Response(
        JSON.stringify({ success: true, result: taskResult }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get swarm capabilities
 */
export async function getSwarmCapabilities(request: Request, swarmId: string): Promise<Response> {
  try {
    let status = null;

    if (swarmId.includes('gamma')) {
      status = gammaSwarm.getStatus();
    } else if (swarmId.includes('cloudflare')) {
      status = cloudflareSwarm.getStatus();
    }

    if (!status) {
      return new Response(
        JSON.stringify({ success: false, error: 'Swarm not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        swarmId: status.swarmId,
        capabilities: status.metadata?.capabilities || [] 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Route handler for swarm management API
 */
export async function handleSwarmsRoute(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Extract swarm ID or type from path if present
  const swarmMatch = path.match(/\/api\/swarms\/([^/]+)/);
  const swarmIdentifier = swarmMatch ? swarmMatch[1] : null;

  try {
    // GET /api/swarms - List all swarms
    if (request.method === 'GET' && path === '/api/swarms') {
      return await getAllSwarmStatuses(request);
    }

    // GET /api/swarms/{swarmId} - Get specific swarm status
    if (request.method === 'GET' && swarmIdentifier && !path.includes('/capabilities')) {
      return await getSwarmStatus(request, swarmIdentifier);
    }

    // GET /api/swarms/{swarmId}/capabilities - Get swarm capabilities
    if (request.method === 'GET' && swarmIdentifier && path.includes('/capabilities')) {
      return await getSwarmCapabilities(request, swarmIdentifier);
    }

    // POST /api/swarms/gamma - Handle gamma swarm task
    if (request.method === 'POST' && swarmIdentifier === 'gamma') {
      return await handleSwarmTask(request, 'gamma');
    }

    // POST /api/swarms/cloudflare - Handle cloudflare swarm task
    if (request.method === 'POST' && swarmIdentifier === 'cloudflare') {
      return await handleSwarmTask(request, 'cloudflare');
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
