/**
 * WIRED CHAOS - Task Router
 * Intelligently assigns tasks to appropriate swarms based on task type
 */

import type { SwarmTask, SwarmStatus } from '../../swarms/shared/protocol';

export interface RoutingRule {
  pattern: RegExp | string;
  swarmType: 'gamma' | 'cloudflare' | 'hybrid';
  priority: number;
}

export class TaskRouter {
  private routingRules: RoutingRule[];
  private swarmStatuses: Map<string, SwarmStatus>;

  constructor() {
    this.routingRules = this.initializeRoutingRules();
    this.swarmStatuses = new Map();
  }

  /**
   * Initialize routing rules based on task patterns
   */
  private initializeRoutingRules(): RoutingRule[] {
    return [
      // Gamma WIX Zapier Notion Swarm Tasks
      {
        pattern: /zapier|wix|notion|workflow|automation|integration|sync/i,
        swarmType: 'gamma',
        priority: 1,
      },
      {
        pattern: /content|cms|database|document|form/i,
        swarmType: 'gamma',
        priority: 2,
      },
      
      // Cloudflare Worker Swarm Tasks
      {
        pattern: /api|endpoint|compute|process|calculation|data-processing/i,
        swarmType: 'cloudflare',
        priority: 1,
      },
      {
        pattern: /edge|cdn|cache|distribute|serverless|worker/i,
        swarmType: 'cloudflare',
        priority: 2,
      },
      {
        pattern: /auth|security|rate-limit|firewall/i,
        swarmType: 'cloudflare',
        priority: 1,
      },
      
      // Hybrid tasks
      {
        pattern: /hybrid|cross-platform|multi-system/i,
        swarmType: 'hybrid',
        priority: 1,
      },
    ];
  }

  /**
   * Route a task to the appropriate swarm
   */
  routeTask(task: SwarmTask): string {
    // If task type is explicitly set and not hybrid, use it
    if (task.type === 'gamma-automation') {
      return this.selectGammaSwarm();
    }
    if (task.type === 'cloudflare-compute') {
      return this.selectCloudflareSwarm();
    }

    // Analyze task description and requirements for routing
    const taskContent = `${task.description} ${task.requirements.join(' ')}`.toLowerCase();
    
    // Apply routing rules
    const matches = this.routingRules
      .map((rule) => {
        const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern, 'i');
        const match = pattern.test(taskContent);
        return match ? rule : null;
      })
      .filter((rule): rule is RoutingRule => rule !== null)
      .sort((a, b) => a.priority - b.priority);

    if (matches.length === 0) {
      // Default to cloudflare for general compute tasks
      return this.selectCloudflareSwarm();
    }

    const selectedRule = matches[0];
    
    if (selectedRule.swarmType === 'gamma') {
      return this.selectGammaSwarm();
    } else if (selectedRule.swarmType === 'cloudflare') {
      return this.selectCloudflareSwarm();
    } else {
      // Hybrid - return both
      return 'hybrid';
    }
  }

  /**
   * Select the best available Gamma swarm instance
   */
  private selectGammaSwarm(): string {
    const gammaSwarms = Array.from(this.swarmStatuses.values())
      .filter((s) => s.swarmType === 'gamma' && s.status === 'online')
      .sort((a, b) => (a.currentLoad / a.capacity) - (b.currentLoad / b.capacity));

    return gammaSwarms.length > 0 ? gammaSwarms[0].swarmId : 'gamma-swarm-1';
  }

  /**
   * Select the best available Cloudflare swarm instance
   */
  private selectCloudflareSwarm(): string {
    const cloudflareSwarms = Array.from(this.swarmStatuses.values())
      .filter((s) => s.swarmType === 'cloudflare' && s.status === 'online')
      .sort((a, b) => (a.currentLoad / a.capacity) - (b.currentLoad / b.capacity));

    return cloudflareSwarms.length > 0 ? cloudflareSwarms[0].swarmId : 'cloudflare-swarm-1';
  }

  /**
   * Update swarm status for load balancing
   */
  updateSwarmStatus(status: SwarmStatus): void {
    this.swarmStatuses.set(status.swarmId, status);
  }

  /**
   * Get all swarm statuses
   */
  getAllSwarmStatuses(): SwarmStatus[] {
    return Array.from(this.swarmStatuses.values());
  }

  /**
   * Check if a swarm is available
   */
  isSwarmAvailable(swarmId: string): boolean {
    const status = this.swarmStatuses.get(swarmId);
    return status?.status === 'online' && status.currentLoad < status.capacity;
  }
}
