/**
 * SWARM Bot - Main Orchestrator
 * Coordinates monitoring, resolution, and escalation
 */

const EndpointMonitor = require('./monitors/endpoint-monitor');
const BuildMonitor = require('./monitors/build-monitor');
const DependencyMonitor = require('./monitors/dependency-monitor');
const PerformanceMonitor = require('./monitors/performance-monitor');

const EndpointResolver = require('./resolvers/endpoint-resolver');
const BuildResolver = require('./resolvers/build-resolver');

class SwarmBot {
  constructor(config = {}) {
    this.config = {
      autoResolve: config.autoResolve !== false,
      dryRun: config.dryRun || false,
      monitoringInterval: config.monitoringInterval || 300000, // 5 minutes
      ...config
    };

    // Initialize monitors
    this.monitors = {
      endpoint: new EndpointMonitor(config.endpoint),
      build: new BuildMonitor(config.build),
      dependency: new DependencyMonitor(config.dependency),
      performance: new PerformanceMonitor(config.performance)
    };

    // Initialize resolvers
    this.resolvers = {
      endpoint: new EndpointResolver({ dryRun: this.config.dryRun }),
      build: new BuildResolver({ dryRun: this.config.dryRun })
    };

    this.state = {
      running: false,
      lastCheck: null,
      issues: [],
      resolutions: []
    };
  }

  /**
   * Start SWARM bot monitoring
   */
  async start() {
    if (this.state.running) {
      throw new Error('SWARM bot is already running');
    }

    console.log('🤖 SWARM Bot starting...');
    this.state.running = true;

    // Initial monitoring cycle
    await this.monitoringCycle();

    // Schedule periodic monitoring
    this.monitoringTimer = setInterval(
      () => this.monitoringCycle(),
      this.config.monitoringInterval
    );

    console.log('✅ SWARM Bot started successfully');
  }

  /**
   * Stop SWARM bot monitoring
   */
  stop() {
    if (!this.state.running) return;

    console.log('🛑 SWARM Bot stopping...');
    this.state.running = false;

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    console.log('✅ SWARM Bot stopped');
  }

  /**
   * Execute one monitoring cycle
   */
  async monitoringCycle() {
    console.log('🔍 Starting monitoring cycle...');
    const cycleStartTime = Date.now();

    try {
      // Run all monitors in parallel
      const [endpoint, build, dependency, performance] = await Promise.all([
        this.monitors.endpoint.checkAll(),
        this.monitors.build.checkBuilds(),
        this.monitors.dependency.checkDependencies(),
        this.monitors.performance.checkPerformance()
      ]);

      // Collect all issues
      const issues = [
        ...this.monitors.endpoint.getIssues(),
        ...this.monitors.build.getIssues(),
        ...this.monitors.dependency.getIssues(),
        ...this.monitors.performance.getIssues()
      ];

      this.state.issues = issues;
      this.state.lastCheck = new Date().toISOString();

      console.log(`📊 Monitoring complete: ${issues.length} issues found`);

      // Attempt auto-resolution if enabled
      if (this.config.autoResolve && issues.length > 0) {
        await this.autoResolveIssues(issues);
      }

      const cycleDuration = Date.now() - cycleStartTime;
      console.log(`⏱️  Cycle completed in ${cycleDuration}ms`);

      return {
        endpoint,
        build,
        dependency,
        performance,
        issues,
        duration: cycleDuration
      };
    } catch (error) {
      console.error('❌ Monitoring cycle failed:', error.message);
      return {
        error: error.message,
        duration: Date.now() - cycleStartTime
      };
    }
  }

  /**
   * Attempt to auto-resolve issues
   * @param {Array} issues - Array of issues to resolve
   */
  async autoResolveIssues(issues) {
    console.log(`🔧 Attempting to auto-resolve ${issues.length} issues...`);

    const resolvableIssues = issues.filter(issue => issue.resolvable);
    console.log(`  ${resolvableIssues.length} issues are resolvable`);

    for (const issue of resolvableIssues) {
      try {
        const resolution = await this.resolveIssue(issue);
        this.state.resolutions.push(resolution);

        if (resolution.success) {
          console.log(`  ✅ Resolved: ${issue.type} - ${issue.endpoint || issue.workflow}`);
        } else {
          console.log(`  ❌ Failed to resolve: ${issue.type} - ${resolution.reason || resolution.error}`);
        }
      } catch (error) {
        console.error(`  ❌ Error resolving issue:`, error.message);
      }
    }
  }

  /**
   * Resolve a single issue
   * @param {Object} issue - Issue to resolve
   * @returns {Promise<Object>} Resolution result
   */
  async resolveIssue(issue) {
    // Select appropriate resolver
    let resolver;
    if (issue.type === 'endpoint_failure' || issue.type === 'performance_degradation') {
      resolver = this.resolvers.endpoint;
    } else if (issue.type === 'build_failure') {
      resolver = this.resolvers.build;
    } else {
      return {
        success: false,
        reason: 'no_resolver',
        message: `No resolver available for issue type: ${issue.type}`
      };
    }

    return await resolver.resolve(issue);
  }

  /**
   * Get current SWARM bot status
   * @returns {Object} Current status
   */
  getStatus() {
    const endpointStats = this.monitors.endpoint.getHistory(1)[0] || {};
    const buildStats = this.monitors.build.getHistory(1)[0] || {};
    const dependencyStats = this.monitors.dependency.getHistory(1)[0] || {};
    const performanceStats = this.monitors.performance.getHistory(1)[0] || {};

    return {
      running: this.state.running,
      lastCheck: this.state.lastCheck,
      currentIssues: this.state.issues.length,
      criticalIssues: this.state.issues.filter(i => i.severity === 'critical').length,
      monitors: {
        endpoint: {
          status: endpointStats.status,
          healthy: endpointStats.healthy,
          total: endpointStats.total
        },
        build: {
          status: buildStats.status,
          failed: buildStats.failed,
          total: buildStats.total
        },
        dependency: {
          status: dependencyStats.status,
          vulnerabilities: dependencyStats.vulnerabilities
        },
        performance: {
          status: performanceStats.status,
          avg_response_time: performanceStats.avg_response_time
        }
      },
      resolutions: {
        total: this.state.resolutions.length,
        successful: this.state.resolutions.filter(r => r.success).length,
        recent: this.state.resolutions.slice(-5)
      }
    };
  }

  /**
   * Get all current issues
   * @returns {Array} Current issues
   */
  getIssues() {
    return this.state.issues;
  }

  /**
   * Get recent resolutions
   * @param {number} limit - Number of resolutions to return
   * @returns {Array} Recent resolutions
   */
  getResolutions(limit = 10) {
    return this.state.resolutions.slice(-limit);
  }

  /**
   * Manually trigger resolution for a specific issue
   * @param {string} issueType - Type of issue to resolve
   * @param {Object} issueData - Issue data
   * @returns {Promise<Object>} Resolution result
   */
  async triggerResolution(issueType, issueData) {
    console.log(`🎯 Manual resolution triggered for: ${issueType}`);
    
    const issue = {
      type: issueType,
      ...issueData,
      resolvable: true,
      manual: true
    };

    return await this.resolveIssue(issue);
  }

  /**
   * Get overall health score
   * @returns {Object} Health score and status
   */
  getHealthScore() {
    const endpointHealth = this.monitors.endpoint.getHistory(1)[0];
    const buildHealth = this.monitors.build.getHistory(1)[0];
    const dependencyHealth = this.monitors.dependency.getHistory(1)[0];
    const performanceHealth = this.monitors.performance.getHistory(1)[0];

    const scores = [];

    // Endpoint health (40% weight)
    if (endpointHealth && endpointHealth.total > 0) {
      const score = (endpointHealth.healthy / endpointHealth.total) * 100;
      scores.push({ score, weight: 0.4 });
    }

    // Build health (30% weight)
    if (buildHealth && buildHealth.total > 0) {
      const score = ((buildHealth.total - buildHealth.failed) / buildHealth.total) * 100;
      scores.push({ score, weight: 0.3 });
    }

    // Dependency health (20% weight)
    if (dependencyHealth && dependencyHealth.status) {
      const score = dependencyHealth.status === 'healthy' ? 100 :
                    dependencyHealth.status === 'degraded' ? 70 : 40;
      scores.push({ score, weight: 0.2 });
    }

    // Performance health (10% weight)
    if (performanceHealth && performanceHealth.status) {
      const score = performanceHealth.status === 'healthy' ? 100 :
                    performanceHealth.status === 'degraded' ? 70 : 40;
      scores.push({ score, weight: 0.1 });
    }

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedScore = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    return {
      score: finalScore,
      status: finalScore >= 95 ? 'excellent' :
              finalScore >= 85 ? 'good' :
              finalScore >= 70 ? 'degraded' : 'critical',
      components: {
        endpoint: endpointHealth?.status,
        build: buildHealth?.status,
        dependency: dependencyHealth?.status,
        performance: performanceHealth?.status
      }
    };
  }
}

module.exports = SwarmBot;
