/**
 * WIRED CHAOS - Task Management API Routes
 * Endpoints for creating, managing, and monitoring tasks
 */

import { TaskRouter } from '../../../../apps/task-engine/src/router';
import { TaskQueue } from '../../../../apps/task-engine/src/queue';
import { SwarmClient } from '../../../../apps/task-engine/src/swarm-client';
import { ResultAggregator } from '../../../../apps/task-engine/src/aggregator';
import type { SwarmTask } from '../../../../apps/swarms/shared/protocol';
import { validateTask } from '../../../../apps/swarms/shared/protocol';

// Initialize task management components
const taskRouter = new TaskRouter();
const taskQueue = new TaskQueue();
const swarmClient = new SwarmClient();
const resultAggregator = new ResultAggregator();

/**
 * Create a new task
 */
export async function createTask(request: Request): Promise<Response> {
  try {
    const body = await request.json() as Partial<SwarmTask>;

    // Validate task
    const errors = validateTask(body);
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create task with defaults
    const task: SwarmTask = {
      id: body.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: body.type || 'cloudflare-compute',
      priority: body.priority || 'medium',
      description: body.description || '',
      requirements: body.requirements || [],
      dependencies: body.dependencies || [],
      assignedSwarm: '',
      status: 'pending',
      metadata: body.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Route task to appropriate swarm
    task.assignedSwarm = taskRouter.routeTask(task);

    // Add to queue
    taskQueue.enqueue(task);

    // Process task asynchronously
    processTaskAsync(task);

    return new Response(
      JSON.stringify({ success: true, task }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Get task status
 */
export async function getTask(request: Request, taskId: string): Promise<Response> {
  try {
    const task = taskQueue.getTask(taskId);

    if (!task) {
      return new Response(
        JSON.stringify({ success: false, error: 'Task not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get results if completed
    let results = null;
    if (task.status === 'completed' || task.status === 'failed') {
      results = resultAggregator.getResults(taskId);
    }

    return new Response(
      JSON.stringify({ success: true, task, results }),
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
 * List tasks with optional filtering
 */
export async function listTasks(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as SwarmTask['status'] | null;
    const swarmId = url.searchParams.get('swarmId');

    let tasks: SwarmTask[] = [];

    if (status) {
      tasks = taskQueue.getTasksByStatus(status);
    } else if (swarmId) {
      tasks = taskQueue.getTasksBySwarm(swarmId);
    } else {
      // Get all tasks (pending + in-progress)
      tasks = [
        ...taskQueue.getTasksByStatus('pending'),
        ...taskQueue.getTasksByStatus('in-progress'),
      ];
    }

    return new Response(
      JSON.stringify({ success: true, tasks, count: tasks.length }),
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
 * Get queue metrics
 */
export async function getMetrics(request: Request): Promise<Response> {
  try {
    const queueMetrics = taskQueue.getMetrics();
    const aggregatorStats = resultAggregator.getStats();

    return new Response(
      JSON.stringify({
        success: true,
        metrics: {
          queue: queueMetrics,
          aggregator: aggregatorStats,
        },
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
 * Cancel a task
 */
export async function cancelTask(request: Request, taskId: string): Promise<Response> {
  try {
    const task = taskQueue.getTask(taskId);

    if (!task) {
      return new Response(
        JSON.stringify({ success: false, error: 'Task not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cancel task in swarm if in progress
    if (task.status === 'in-progress') {
      await swarmClient.cancelTask(taskId, task.assignedSwarm);
    }

    // Update task status
    taskQueue.updateTaskStatus(taskId, 'failed', { cancelled: true });

    return new Response(
      JSON.stringify({ success: true, message: 'Task cancelled' }),
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
 * Process task asynchronously
 */
async function processTaskAsync(task: SwarmTask): Promise<void> {
  try {
    // Assign task to swarm
    const result = await swarmClient.assignTask(task, task.assignedSwarm);

    // Add result to aggregator
    resultAggregator.addResult(result);

    // Update task status
    if (result.status === 'completed') {
      taskQueue.updateTaskStatus(task.id, 'completed', result.data);
    } else {
      taskQueue.updateTaskStatus(task.id, 'failed', { error: result.error });
    }
  } catch (error) {
    console.error(`Failed to process task ${task.id}:`, error);
    taskQueue.updateTaskStatus(task.id, 'failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

/**
 * Route handler for task management API
 */
export async function handleTasksRoute(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Extract task ID from path if present
  const taskIdMatch = path.match(/\/api\/tasks\/([^/]+)/);
  const taskId = taskIdMatch ? taskIdMatch[1] : null;

  try {
    if (request.method === 'POST' && path === '/api/tasks') {
      return await createTask(request);
    }

    if (request.method === 'GET' && taskId) {
      return await getTask(request, taskId);
    }

    if (request.method === 'GET' && path === '/api/tasks') {
      return await listTasks(request);
    }

    if (request.method === 'GET' && path === '/api/tasks/metrics') {
      return await getMetrics(request);
    }

    if (request.method === 'DELETE' && taskId) {
      return await cancelTask(request, taskId);
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
