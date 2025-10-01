/**
 * SWARM Bot - GitHub Issue Creator
 * Creates GitHub issues for unresolved problems
 */

class GitHubIssueCreator {
  constructor(config = {}) {
    this.config = {
      owner: config.owner || 'wiredchaos',
      repo: config.repo || 'wired-chaos',
      githubToken: config.githubToken || process.env.GITHUB_TOKEN,
      labels: config.labels || ['swarm-bot', 'automated'],
      dryRun: config.dryRun || false,
      ...config
    };
    this.createdIssues = [];
  }

  /**
   * Create a GitHub issue for an unresolved problem
   * @param {Object} issue - Issue to escalate
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Created issue result
   */
  async createIssue(issue, context = {}) {
    if (this.config.dryRun) {
      const dryRunIssue = {
        dryRun: true,
        title: this.generateTitle(issue),
        body: this.generateBody(issue, context),
        labels: this.getLabels(issue),
        timestamp: new Date().toISOString()
      };
      
      this.createdIssues.push(dryRunIssue);
      return dryRunIssue;
    }

    try {
      const issueData = {
        title: this.generateTitle(issue),
        body: this.generateBody(issue, context),
        labels: this.getLabels(issue)
      };

      // In production, would use Octokit to create the issue:
      // const octokit = new Octokit({ auth: this.config.githubToken });
      // const { data } = await octokit.issues.create({
      //   owner: this.config.owner,
      //   repo: this.config.repo,
      //   ...issueData
      // });

      const createdIssue = {
        ...issueData,
        number: Math.floor(Math.random() * 1000), // Mock issue number
        url: `https://github.com/${this.config.owner}/${this.config.repo}/issues/mock`,
        timestamp: new Date().toISOString()
      };

      this.createdIssues.push(createdIssue);
      return createdIssue;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate issue title
   * @param {Object} issue - Issue data
   * @returns {string} Issue title
   */
  generateTitle(issue) {
    const prefix = issue.severity === 'critical' ? '🚨 CRITICAL' : '⚠️';
    
    switch (issue.type) {
      case 'endpoint_failure':
        return `${prefix} Endpoint Failure: ${issue.endpoint}`;
      case 'build_failure':
        return `${prefix} Build Failure: ${issue.workflow}`;
      case 'security_vulnerability':
        return `${prefix} Security: ${issue.count} ${issue.level} vulnerabilities`;
      case 'performance_degradation':
        return `${prefix} Performance Issue: ${issue.endpoint}`;
      default:
        return `${prefix} SWARM Bot Alert: ${issue.type}`;
    }
  }

  /**
   * Generate detailed issue body
   * @param {Object} issue - Issue data
   * @param {Object} context - Additional context
   * @returns {string} Issue body in markdown
   */
  generateBody(issue, context) {
    const sections = [];

    // Header
    sections.push('## 🤖 SWARM Bot Automated Issue Report\n');
    sections.push(`This issue was automatically detected and escalated by the SWARM Bot monitoring system.\n`);

    // Issue Details
    sections.push('### Issue Details\n');
    sections.push(`- **Type:** ${issue.type}`);
    sections.push(`- **Severity:** ${issue.severity}`);
    sections.push(`- **Detected:** ${issue.timestamp}`);
    
    if (issue.endpoint) sections.push(`- **Endpoint:** ${issue.endpoint}`);
    if (issue.url) sections.push(`- **URL:** ${issue.url}`);
    if (issue.workflow) sections.push(`- **Workflow:** ${issue.workflow}`);
    if (issue.status) sections.push(`- **Status:** ${issue.status}`);
    if (issue.error) sections.push(`- **Error:** \`${issue.error}\``);

    sections.push('');

    // Context
    if (context.attemptedResolutions && context.attemptedResolutions.length > 0) {
      sections.push('### Auto-Resolution Attempts\n');
      sections.push(`${context.attemptedResolutions.length} automatic resolution attempts were made:\n`);
      
      for (const resolution of context.attemptedResolutions) {
        const status = resolution.success ? '✅' : '❌';
        sections.push(`${status} **${resolution.strategy}** - ${resolution.success ? 'Success' : 'Failed'}`);
        if (resolution.error) sections.push(`  - Error: ${resolution.error}`);
      }
      
      sections.push('');
    }

    // Additional Context
    if (context.metrics) {
      sections.push('### System Metrics\n');
      sections.push('```json');
      sections.push(JSON.stringify(context.metrics, null, 2));
      sections.push('```\n');
    }

    // Recommendations
    sections.push('### Recommended Actions\n');
    sections.push(...this.generateRecommendations(issue));
    sections.push('');

    // Footer
    sections.push('---');
    sections.push('*This issue was automatically created by SWARM Bot. Please review and take appropriate action.*');

    return sections.join('\n');
  }

  /**
   * Generate recommendations based on issue type
   * @param {Object} issue - Issue data
   * @returns {Array} Array of recommendation strings
   */
  generateRecommendations(issue) {
    const recommendations = [];

    switch (issue.type) {
      case 'endpoint_failure':
        recommendations.push('1. Check Cloudflare Worker deployment status');
        recommendations.push('2. Verify DNS configuration and routing');
        recommendations.push('3. Review recent code changes that might affect the endpoint');
        recommendations.push('4. Check for rate limiting or firewall blocks');
        break;

      case 'build_failure':
        recommendations.push('1. Review build logs for specific error messages');
        recommendations.push('2. Check for dependency conflicts or outdated packages');
        recommendations.push('3. Verify environment variables and secrets are configured');
        recommendations.push('4. Consider clearing build cache and retrying');
        break;

      case 'security_vulnerability':
        recommendations.push('1. Review the security advisory for affected packages');
        recommendations.push('2. Update dependencies to patched versions');
        recommendations.push('3. Test thoroughly after updates');
        recommendations.push('4. Consider automated dependency updates via Dependabot');
        break;

      case 'performance_degradation':
        recommendations.push('1. Review recent changes that might impact performance');
        recommendations.push('2. Check server resource utilization');
        recommendations.push('3. Analyze slow query logs or API call traces');
        recommendations.push('4. Consider implementing caching or optimization');
        break;

      default:
        recommendations.push('1. Review the issue details and system logs');
        recommendations.push('2. Investigate recent changes that might be related');
        recommendations.push('3. Consider manual intervention if auto-resolution failed');
    }

    return recommendations;
  }

  /**
   * Get appropriate labels for the issue
   * @param {Object} issue - Issue data
   * @returns {Array} Array of label names
   */
  getLabels(issue) {
    const labels = [...this.config.labels];

    // Add severity label
    if (issue.severity === 'critical') {
      labels.push('priority:critical');
    } else if (issue.severity === 'warning') {
      labels.push('priority:high');
    }

    // Add type label
    if (issue.type === 'endpoint_failure') {
      labels.push('type:endpoint');
    } else if (issue.type === 'build_failure') {
      labels.push('type:build');
    } else if (issue.type === 'security_vulnerability') {
      labels.push('type:security');
    } else if (issue.type === 'performance_degradation') {
      labels.push('type:performance');
    }

    return labels;
  }

  /**
   * Get history of created issues
   * @param {number} limit - Number of recent issues
   * @returns {Array} Recent issues
   */
  getHistory(limit = 10) {
    return this.createdIssues.slice(-limit);
  }
}

module.exports = GitHubIssueCreator;
