/**
 * WIRED CHAOS - Task Queue Management
 * Manages task queue with priority and dependency handling
 */

import type { SwarmTask } from '../../swarms/shared/protocol';

export interface QueueMetrics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageWaitTime: number;
  averageExecutionTime: number;
}

export class TaskQueue {
  private tasks: Map<string, SwarmTask>;
  private pendingQueue: SwarmTask[];
  private inProgressQueue: SwarmTask[];
  private completedTasks: SwarmTask[];
  private failedTasks: SwarmTask[];

  constructor() {
    this.tasks = new Map();
    this.pendingQueue = [];
    this.inProgressQueue = [];
    this.completedTasks = [];
    this.failedTasks = [];
  }

  /**
   * Add a task to the queue
   */
  enqueue(task: SwarmTask): void {
    this.tasks.set(task.id, task);
    
    if (task.status === 'pending') {
      this.pendingQueue.push(task);
      this.sortByPriority();
    }
  }

  /**
   * Get the next task to process
   */
  dequeue(): SwarmTask | null {
    // Check for tasks with satisfied dependencies
    const readyTask = this.pendingQueue.find((task) => {
      return this.areDependenciesSatisfied(task);
    });

    if (readyTask) {
      // Remove from pending queue
      this.pendingQueue = this.pendingQueue.filter((t) => t.id !== readyTask.id);
      
      // Add to in-progress queue
      readyTask.status = 'in-progress';
      readyTask.updatedAt = new Date().toISOString();
      this.inProgressQueue.push(readyTask);
      
      return readyTask;
    }

    return null;
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: SwarmTask['status'], data?: any): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    if (data) {
      task.metadata = { ...task.metadata, ...data };
    }

    // Move task between queues based on status
    if (status === 'completed') {
      this.inProgressQueue = this.inProgressQueue.filter((t) => t.id !== taskId);
      task.completedAt = new Date().toISOString();
      this.completedTasks.push(task);
    } else if (status === 'failed') {
      this.inProgressQueue = this.inProgressQueue.filter((t) => t.id !== taskId);
      this.failedTasks.push(task);
    }
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): SwarmTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks with a specific status
   */
  getTasksByStatus(status: SwarmTask['status']): SwarmTask[] {
    switch (status) {
      case 'pending':
        return [...this.pendingQueue];
      case 'in-progress':
        return [...this.inProgressQueue];
      case 'completed':
        return [...this.completedTasks];
      case 'failed':
        return [...this.failedTasks];
      default:
        return [];
    }
  }

  /**
   * Get all tasks for a specific swarm
   */
  getTasksBySwarm(swarmId: string): SwarmTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedSwarm === swarmId
    );
  }

  /**
   * Check if task dependencies are satisfied
   */
  private areDependenciesSatisfied(task: SwarmTask): boolean {
    if (task.dependencies.length === 0) {
      return true;
    }

    return task.dependencies.every((depId) => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  /**
   * Sort pending queue by priority
   */
  private sortByPriority(): void {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    this.pendingQueue.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same priority, sort by creation time
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  /**
   * Get queue metrics
   */
  getMetrics(): QueueMetrics {
    const totalTasks = this.tasks.size;
    const pendingTasks = this.pendingQueue.length;
    const inProgressTasks = this.inProgressQueue.length;
    const completedTasks = this.completedTasks.length;
    const failedTasks = this.failedTasks.length;

    // Calculate average wait time (time from creation to in-progress)
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    
    this.inProgressQueue.forEach((task) => {
      const waitTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
      totalWaitTime += waitTime;
      waitTimeCount++;
    });

    this.completedTasks.forEach((task) => {
      const waitTime = new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime();
      totalWaitTime += waitTime;
      waitTimeCount++;
    });

    const averageWaitTime = waitTimeCount > 0 ? totalWaitTime / waitTimeCount : 0;

    // Calculate average execution time
    let totalExecutionTime = 0;
    let executionCount = 0;

    this.completedTasks.forEach((task) => {
      if (task.completedAt) {
        const executionTime = new Date(task.completedAt).getTime() - new Date(task.updatedAt).getTime();
        totalExecutionTime += executionTime;
        executionCount++;
      }
    });

    const averageExecutionTime = executionCount > 0 ? totalExecutionTime / executionCount : 0;

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      failedTasks,
      averageWaitTime,
      averageExecutionTime,
    };
  }

  /**
   * Clear completed and failed tasks older than specified days
   */
  cleanup(daysToKeep: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTime = cutoffDate.getTime();

    this.completedTasks = this.completedTasks.filter((task) => {
      const completedTime = task.completedAt ? new Date(task.completedAt).getTime() : 0;
      const shouldKeep = completedTime > cutoffTime;
      
      if (!shouldKeep) {
        this.tasks.delete(task.id);
      }
      
      return shouldKeep;
    });

    this.failedTasks = this.failedTasks.filter((task) => {
      const updatedTime = new Date(task.updatedAt).getTime();
      const shouldKeep = updatedTime > cutoffTime;
      
      if (!shouldKeep) {
        this.tasks.delete(task.id);
      }
      
      return shouldKeep;
    });
  }
}
