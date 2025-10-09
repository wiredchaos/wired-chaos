/**
 * WIRED CHAOS - Swarm Communication Protocol
 * Defines common interfaces and types for swarm communication
 */

export interface SwarmTask {
  id: string;
  type: 'gamma-automation' | 'cloudflare-compute' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirements: string[];
  dependencies: string[];
  assignedSwarm: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SwarmTaskResult {
  taskId: string;
  status: 'completed' | 'failed';
  data?: any;
  error?: string;
  executionTime: number;
  timestamp: string;
}

export interface SwarmStatus {
  swarmId: string;
  swarmType: 'gamma' | 'cloudflare';
  status: 'online' | 'offline' | 'busy' | 'maintenance';
  capacity: number;
  currentLoad: number;
  tasksProcessed: number;
  lastHeartbeat: string;
  metadata?: Record<string, any>;
}

export interface SwarmMessage {
  id: string;
  type: 'task_assignment' | 'status_update' | 'result' | 'heartbeat';
  from: string;
  to: string;
  payload: any;
  timestamp: string;
}

export interface SwarmCapability {
  name: string;
  description: string;
  enabled: boolean;
  metadata?: Record<string, any>;
}

export interface SwarmConfig {
  swarmId: string;
  swarmType: 'gamma' | 'cloudflare';
  capabilities: SwarmCapability[];
  maxConcurrentTasks: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

/**
 * Protocol version for compatibility checking
 */
export const PROTOCOL_VERSION = '1.0.0';

/**
 * Standard error codes
 */
export enum SwarmErrorCode {
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  SWARM_OFFLINE = 'SWARM_OFFLINE',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  INVALID_TASK = 'INVALID_TASK',
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  TIMEOUT = 'TIMEOUT',
  DEPENDENCY_FAILED = 'DEPENDENCY_FAILED',
}

/**
 * Helper function to create a standard error response
 */
export function createSwarmError(
  code: SwarmErrorCode,
  message: string,
  details?: any
): SwarmTaskResult {
  return {
    taskId: '',
    status: 'failed',
    error: `${code}: ${message}`,
    data: details,
    executionTime: 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to validate task
 */
export function validateTask(task: Partial<SwarmTask>): string[] {
  const errors: string[] = [];
  
  if (!task.id) errors.push('Task ID is required');
  if (!task.type) errors.push('Task type is required');
  if (!task.priority) errors.push('Task priority is required');
  if (!task.description) errors.push('Task description is required');
  
  return errors;
}
