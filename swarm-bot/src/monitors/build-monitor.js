/**
 * SWARM Bot - Build Status Monitor
 * Monitors GitHub Actions workflow runs for failures
 */

class BuildMonitor {
  constructor(config = {}) {
    this.config = {
      owner: config.owner || 'wiredchaos',
      repo: config.repo || 'wired-chaos',
      workflows: config.workflows || [
        'deploy-worker.yml',
        'deploy-frontend.yml',
        'edge-smoke.yml',
        'emergent-deploy.yml'
      ],
      lookbackHours: config.lookbackHours || 24,
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      ...config
    };
    this.results = [];
  }

  /**
   * Check GitHub Actions workflow runs
   * @returns {Promise<Object>} Build status results
   */
  async checkBuilds() {
    if (!this.config.githubToken) {
      return {
        error: 'GitHub token not configured',
        status: 'unknown',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const since = new Date(Date.now() - this.config.lookbackHours * 60 * 60 * 1000).toISOString();
      
      // Mock implementation - in production, would use Octokit
      const workflowRuns = await this.fetchWorkflowRuns(since);
      
      const summary = {
        timestamp: new Date().toISOString(),
        lookbackHours: this.config.lookbackHours,
        total: workflowRuns.length,
        successful: workflowRuns.filter(r => r.conclusion === 'success').length,
        failed: workflowRuns.filter(r => r.conclusion === 'failure').length,
        cancelled: workflowRuns.filter(r => r.conclusion === 'cancelled').length,
        in_progress: workflowRuns.filter(r => r.status === 'in_progress').length,
        workflows: this.groupByWorkflow(workflowRuns),
        status: this.determineStatus(workflowRuns)
      };

      this.results.push(summary);
      return summary;
    } catch (error) {
      return {
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch workflow runs from GitHub API
   * @param {string} since - ISO timestamp to look back from
   * @returns {Promise<Array>} Array of workflow runs
   */
  async fetchWorkflowRuns(since) {
    // In production, use Octokit:
    // const octokit = new Octokit({ auth: this.config.githubToken });
    // const { data } = await octokit.actions.listWorkflowRunsForRepo({
    //   owner: this.config.owner,
    //   repo: this.config.repo,
    //   created: `>=${since}`
    // });
    // return data.workflow_runs;

    // Mock data for testing
    return [
      {
        id: 1,
        name: 'Deploy Worker',
        workflow_name: 'deploy-worker.yml',
        status: 'completed',
        conclusion: 'success',
        created_at: new Date().toISOString()
      }
    ];
  }

  /**
   * Group workflow runs by workflow name
   * @param {Array} runs - Array of workflow runs
   * @returns {Object} Grouped results
   */
  groupByWorkflow(runs) {
    const grouped = {};
    
    for (const run of runs) {
      const name = run.workflow_name;
      if (!grouped[name]) {
        grouped[name] = {
          total: 0,
          successful: 0,
          failed: 0,
          success_rate: 0
        };
      }
      
      grouped[name].total++;
      if (run.conclusion === 'success') grouped[name].successful++;
      if (run.conclusion === 'failure') grouped[name].failed++;
    }

    // Calculate success rates
    for (const name in grouped) {
      const workflow = grouped[name];
      workflow.success_rate = workflow.total > 0 
        ? Math.round((workflow.successful / workflow.total) * 100)
        : 0;
    }

    return grouped;
  }

  /**
   * Determine overall build health status
   * @param {Array} runs - Array of workflow runs
   * @returns {string} Status: 'healthy', 'degraded', or 'critical'
   */
  determineStatus(runs) {
    if (runs.length === 0) return 'unknown';

    const recentRuns = runs.slice(-10); // Last 10 runs
    const failureRate = recentRuns.filter(r => r.conclusion === 'failure').length / recentRuns.length;

    if (failureRate >= 0.5) return 'critical';
    if (failureRate >= 0.2) return 'degraded';
    return 'healthy';
  }

  /**
   * Get issues that need resolution
   * @returns {Array} Array of build issues
   */
  getIssues() {
    if (this.results.length === 0) return [];

    const latest = this.results[this.results.length - 1];
    const issues = [];

    for (const [workflow, stats] of Object.entries(latest.workflows || {})) {
      if (stats.success_rate < 80) {
        issues.push({
          type: 'build_failure',
          severity: stats.success_rate < 50 ? 'critical' : 'warning',
          workflow,
          success_rate: `${stats.success_rate}%`,
          failed: stats.failed,
          total: stats.total,
          timestamp: latest.timestamp,
          resolvable: true
        });
      }
    }

    return issues;
  }

  /**
   * Get recent monitoring history
   * @param {number} limit - Number of recent results to return
   * @returns {Array} Recent results
   */
  getHistory(limit = 10) {
    return this.results.slice(-limit);
  }
}

module.exports = BuildMonitor;
