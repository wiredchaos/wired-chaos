/**
 * WIRED CHAOS - Result Aggregator
 * Collects and synthesizes outputs from multiple swarms
 */

import type { SwarmTask, SwarmTaskResult } from '../../swarms/shared/protocol';

export interface AggregatedResult {
  taskId: string;
  overallStatus: 'completed' | 'partial' | 'failed';
  results: SwarmTaskResult[];
  aggregatedData: any;
  totalExecutionTime: number;
  completedAt: string;
}

export class ResultAggregator {
  private resultCache: Map<string, SwarmTaskResult[]>;
  private taskDependencies: Map<string, string[]>;

  constructor() {
    this.resultCache = new Map();
    this.taskDependencies = new Map();
  }

  /**
   * Add a task result
   */
  addResult(result: SwarmTaskResult): void {
    const results = this.resultCache.get(result.taskId) || [];
    results.push(result);
    this.resultCache.set(result.taskId, results);
  }

  /**
   * Get all results for a task
   */
  getResults(taskId: string): SwarmTaskResult[] {
    return this.resultCache.get(taskId) || [];
  }

  /**
   * Aggregate results for a task
   */
  aggregateTaskResults(taskId: string): AggregatedResult | null {
    const results = this.resultCache.get(taskId);
    
    if (!results || results.length === 0) {
      return null;
    }

    // Determine overall status
    const hasFailures = results.some((r) => r.status === 'failed');
    const allCompleted = results.every((r) => r.status === 'completed');
    
    let overallStatus: 'completed' | 'partial' | 'failed';
    if (allCompleted) {
      overallStatus = 'completed';
    } else if (hasFailures && results.some((r) => r.status === 'completed')) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'failed';
    }

    // Aggregate data from all results
    const aggregatedData = this.mergeResultData(results);

    // Calculate total execution time
    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      taskId,
      overallStatus,
      results,
      aggregatedData,
      totalExecutionTime,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Aggregate results for a hybrid task that involves multiple swarms
   */
  aggregateHybridResults(parentTaskId: string, subtaskIds: string[]): AggregatedResult {
    const allResults: SwarmTaskResult[] = [];
    
    subtaskIds.forEach((subtaskId) => {
      const results = this.resultCache.get(subtaskId) || [];
      allResults.push(...results);
    });

    const hasFailures = allResults.some((r) => r.status === 'failed');
    const allCompleted = allResults.every((r) => r.status === 'completed');
    
    let overallStatus: 'completed' | 'partial' | 'failed';
    if (allCompleted) {
      overallStatus = 'completed';
    } else if (hasFailures && allResults.some((r) => r.status === 'completed')) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'failed';
    }

    const aggregatedData = this.mergeResultData(allResults);
    const totalExecutionTime = allResults.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      taskId: parentTaskId,
      overallStatus,
      results: allResults,
      aggregatedData,
      totalExecutionTime,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Merge data from multiple results
   */
  private mergeResultData(results: SwarmTaskResult[]): any {
    const merged: any = {
      outputs: [],
      errors: [],
      metadata: {},
    };

    results.forEach((result) => {
      if (result.data) {
        merged.outputs.push(result.data);
      }
      
      if (result.error) {
        merged.errors.push(result.error);
      }
    });

    return merged;
  }

  /**
   * Set task dependencies for aggregation tracking
   */
  setTaskDependencies(taskId: string, dependencies: string[]): void {
    this.taskDependencies.set(taskId, dependencies);
  }

  /**
   * Check if all dependencies are complete
   */
  areDependenciesComplete(taskId: string): boolean {
    const dependencies = this.taskDependencies.get(taskId);
    
    if (!dependencies || dependencies.length === 0) {
      return true;
    }

    return dependencies.every((depId) => {
      const results = this.resultCache.get(depId);
      return results && results.length > 0 && results.every((r) => r.status === 'completed');
    });
  }

  /**
   * Clear results for a task
   */
  clearResults(taskId: string): void {
    this.resultCache.delete(taskId);
  }

  /**
   * Clear old results
   */
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;
    
    for (const [taskId, results] of this.resultCache.entries()) {
      const isOld = results.every((r) => {
        const resultTime = new Date(r.timestamp).getTime();
        return resultTime < cutoffTime;
      });
      
      if (isOld) {
        this.resultCache.delete(taskId);
      }
    }
  }

  /**
   * Get aggregation statistics
   */
  getStats(): {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    partialTasks: number;
  } {
    const stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      partialTasks: 0,
    };

    for (const taskId of this.resultCache.keys()) {
      const aggregated = this.aggregateTaskResults(taskId);
      if (aggregated) {
        stats.totalTasks++;
        
        if (aggregated.overallStatus === 'completed') {
          stats.completedTasks++;
        } else if (aggregated.overallStatus === 'failed') {
          stats.failedTasks++;
        } else if (aggregated.overallStatus === 'partial') {
          stats.partialTasks++;
        }
      }
    }

    return stats;
  }
}
