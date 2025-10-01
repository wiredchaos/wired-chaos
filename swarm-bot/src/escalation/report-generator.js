/**
 * SWARM Bot - Report Generator
 * Generates detailed diagnostic reports
 */

class ReportGenerator {
  constructor(config = {}) {
    this.config = {
      includeHistory: config.includeHistory !== false,
      historyLimit: config.historyLimit || 10,
      includeMetrics: config.includeMetrics !== false,
      includeTrends: config.includeTrends !== false,
      ...config
    };
  }

  /**
   * Generate comprehensive system report
   * @param {Object} swarmBot - SWARM bot instance
   * @returns {Object} Generated report
   */
  generateSystemReport(swarmBot) {
    const status = swarmBot.getStatus();
    const healthScore = swarmBot.getHealthScore();
    const issues = swarmBot.getIssues();
    const resolutions = swarmBot.getResolutions(this.config.historyLimit);

    return {
      generated_at: new Date().toISOString(),
      summary: this.generateSummary(status, healthScore),
      health_score: healthScore,
      current_status: status,
      issues: this.formatIssues(issues),
      resolutions: this.formatResolutions(resolutions),
      metrics: this.config.includeMetrics ? this.generateMetrics(swarmBot) : null,
      trends: this.config.includeTrends ? this.generateTrends(swarmBot) : null,
      recommendations: this.generateRecommendations(status, healthScore, issues)
    };
  }

  /**
   * Generate executive summary
   * @param {Object} status - Current status
   * @param {Object} healthScore - Health score
   * @returns {Object} Summary
   */
  generateSummary(status, healthScore) {
    return {
      overall_health: `${healthScore.score}% (${healthScore.status})`,
      system_status: status.running ? 'Running' : 'Stopped',
      active_issues: status.currentIssues,
      critical_issues: status.criticalIssues,
      recent_resolutions: status.resolutions.successful,
      last_check: status.lastCheck
    };
  }

  /**
   * Format issues for report
   * @param {Array} issues - Array of issues
   * @returns {Object} Formatted issues
   */
  formatIssues(issues) {
    const grouped = {
      critical: [],
      warning: [],
      info: []
    };

    for (const issue of issues) {
      const severity = issue.severity || 'info';
      grouped[severity].push({
        type: issue.type,
        description: this.getIssueDescription(issue),
        details: issue,
        timestamp: issue.timestamp
      });
    }

    return {
      total: issues.length,
      by_severity: {
        critical: grouped.critical.length,
        warning: grouped.warning.length,
        info: grouped.info.length
      },
      issues: grouped
    };
  }

  /**
   * Get human-readable issue description
   * @param {Object} issue - Issue object
   * @returns {string} Description
   */
  getIssueDescription(issue) {
    switch (issue.type) {
      case 'endpoint_failure':
        return `Endpoint ${issue.endpoint} is not responding (${issue.status})`;
      case 'build_failure':
        return `Build ${issue.workflow} failing (${issue.success_rate} success rate)`;
      case 'security_vulnerability':
        return `${issue.count} ${issue.level} security vulnerabilities detected`;
      case 'performance_degradation':
        return `${issue.endpoint} response time ${issue.avg_response_time} exceeds threshold`;
      case 'dependency_conflict':
        return `Dependency conflict detected in ${issue.package || 'unknown package'}`;
      default:
        return `${issue.type} issue detected`;
    }
  }

  /**
   * Format resolutions for report
   * @param {Array} resolutions - Array of resolutions
   * @returns {Object} Formatted resolutions
   */
  formatResolutions(resolutions) {
    const successful = resolutions.filter(r => r.success);
    const failed = resolutions.filter(r => !r.success);

    return {
      total: resolutions.length,
      successful: successful.length,
      failed: failed.length,
      success_rate: resolutions.length > 0 
        ? Math.round((successful.length / resolutions.length) * 100)
        : 0,
      recent: resolutions.map(r => ({
        id: r.id,
        issue_type: r.issue?.type || 'unknown',
        strategy: r.strategy,
        success: r.success,
        duration: `${r.duration || 0}ms`,
        timestamp: r.timestamp
      }))
    };
  }

  /**
   * Generate metrics section
   * @param {Object} swarmBot - SWARM bot instance
   * @returns {Object} Metrics
   */
  generateMetrics(swarmBot) {
    const status = swarmBot.getStatus();

    return {
      monitoring: {
        endpoints: {
          total: status.monitors.endpoint?.total || 0,
          healthy: status.monitors.endpoint?.healthy || 0,
          unhealthy: (status.monitors.endpoint?.total || 0) - (status.monitors.endpoint?.healthy || 0)
        },
        builds: {
          total: status.monitors.build?.total || 0,
          failed: status.monitors.build?.failed || 0,
          success_rate: status.monitors.build?.total > 0
            ? Math.round(((status.monitors.build.total - status.monitors.build.failed) / status.monitors.build.total) * 100)
            : 0
        },
        dependencies: {
          status: status.monitors.dependency?.status || 'unknown',
          vulnerabilities: status.monitors.dependency?.vulnerabilities || {}
        },
        performance: {
          status: status.monitors.performance?.status || 'unknown',
          avg_response_time: status.monitors.performance?.avg_response_time || 0
        }
      },
      resolution: {
        total_attempts: status.resolutions.total,
        successful: status.resolutions.successful,
        failed: status.resolutions.total - status.resolutions.successful,
        success_rate: status.resolutions.total > 0
          ? Math.round((status.resolutions.successful / status.resolutions.total) * 100)
          : 0
      }
    };
  }

  /**
   * Generate trends section
   * @param {Object} swarmBot - SWARM bot instance
   * @returns {Object} Trends
   */
  generateTrends(swarmBot) {
    // Get performance monitor for trend analysis
    const performanceHistory = swarmBot.monitors.performance.getHistory(10);
    
    let trend = 'stable';
    if (performanceHistory.length >= 2) {
      const recent = performanceHistory.slice(-5);
      const older = performanceHistory.slice(0, Math.min(5, performanceHistory.length - 5));
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, r) => sum + (r.avg_response_time || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, r) => sum + (r.avg_response_time || 0), 0) / older.length;
        
        if (recentAvg > olderAvg * 1.2) trend = 'degrading';
        else if (recentAvg < olderAvg * 0.8) trend = 'improving';
      }
    }

    return {
      performance: {
        trend,
        message: trend === 'degrading' 
          ? 'System performance is declining'
          : trend === 'improving'
          ? 'System performance is improving'
          : 'System performance is stable'
      },
      health_score: {
        current: swarmBot.getHealthScore().score,
        trend: 'stable' // Would calculate from historical data
      }
    };
  }

  /**
   * Generate recommendations
   * @param {Object} status - Current status
   * @param {Object} healthScore - Health score
   * @param {Array} issues - Current issues
   * @returns {Array} Recommendations
   */
  generateRecommendations(status, healthScore, issues) {
    const recommendations = [];

    // Critical health score
    if (healthScore.status === 'critical') {
      recommendations.push({
        priority: 'critical',
        category: 'system_health',
        message: 'System health is critical - immediate action required',
        actions: [
          'Review all critical issues',
          'Check system resources',
          'Consider emergency deployment procedures'
        ]
      });
    }

    // Multiple critical issues
    if (status.criticalIssues > 2) {
      recommendations.push({
        priority: 'high',
        category: 'issue_management',
        message: `${status.criticalIssues} critical issues detected`,
        actions: [
          'Triage and prioritize critical issues',
          'Allocate resources for resolution',
          'Consider disabling non-essential features'
        ]
      });
    }

    // Low resolution success rate
    const resolutionRate = status.resolutions.total > 0
      ? (status.resolutions.successful / status.resolutions.total) * 100
      : 100;
    
    if (resolutionRate < 50 && status.resolutions.total > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'auto_resolution',
        message: `Low auto-resolution success rate (${Math.round(resolutionRate)}%)`,
        actions: [
          'Review resolution strategies',
          'Update resolution rules',
          'Consider manual intervention for recurring issues'
        ]
      });
    }

    // Endpoint failures
    const endpointIssues = issues.filter(i => i.type === 'endpoint_failure');
    if (endpointIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'endpoints',
        message: `${endpointIssues.length} endpoint(s) failing`,
        actions: [
          'Check Cloudflare Worker status',
          'Verify DNS configuration',
          'Review recent deployments'
        ]
      });
    }

    // Build failures
    const buildIssues = issues.filter(i => i.type === 'build_failure');
    if (buildIssues.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'builds',
        message: `${buildIssues.length} build workflow(s) failing`,
        actions: [
          'Review build logs',
          'Check for dependency issues',
          'Verify CI/CD configuration'
        ]
      });
    }

    // Security vulnerabilities
    const securityIssues = issues.filter(i => i.type === 'security_vulnerability');
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'security',
        message: 'Security vulnerabilities detected',
        actions: [
          'Review security advisories',
          'Update affected dependencies',
          'Test thoroughly after updates'
        ]
      });
    }

    // All good
    if (recommendations.length === 0 && healthScore.status === 'excellent') {
      recommendations.push({
        priority: 'info',
        category: 'maintenance',
        message: 'System is healthy',
        actions: [
          'Continue regular monitoring',
          'Review and update dependencies',
          'Maintain documentation'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate markdown report
   * @param {Object} report - Report object
   * @returns {string} Markdown formatted report
   */
  generateMarkdown(report) {
    const lines = [];

    lines.push('# SWARM Bot System Report\n');
    lines.push(`Generated: ${report.generated_at}\n`);
    lines.push('---\n');

    // Summary
    lines.push('## 📊 Executive Summary\n');
    lines.push(`**Overall Health:** ${report.summary.overall_health}`);
    lines.push(`**System Status:** ${report.summary.system_status}`);
    lines.push(`**Active Issues:** ${report.summary.active_issues} (${report.summary.critical_issues} critical)`);
    lines.push(`**Recent Resolutions:** ${report.summary.recent_resolutions}`);
    lines.push(`**Last Check:** ${report.summary.last_check}\n`);

    // Issues
    if (report.issues.total > 0) {
      lines.push('## 🚨 Current Issues\n');
      lines.push(`Total: ${report.issues.total}\n`);

      if (report.issues.issues.critical.length > 0) {
        lines.push('### Critical Issues\n');
        report.issues.issues.critical.forEach(issue => {
          lines.push(`- 🔴 **${issue.description}**`);
        });
        lines.push('');
      }

      if (report.issues.issues.warning.length > 0) {
        lines.push('### Warnings\n');
        report.issues.issues.warning.forEach(issue => {
          lines.push(`- ⚠️  ${issue.description}`);
        });
        lines.push('');
      }
    }

    // Recommendations
    if (report.recommendations.length > 0) {
      lines.push('## 💡 Recommendations\n');
      report.recommendations.forEach(rec => {
        const icon = rec.priority === 'critical' ? '🔴' :
                     rec.priority === 'high' ? '🟠' :
                     rec.priority === 'medium' ? '🟡' : 'ℹ️';
        lines.push(`### ${icon} ${rec.message}\n`);
        rec.actions.forEach(action => {
          lines.push(`- ${action}`);
        });
        lines.push('');
      });
    }

    lines.push('---');
    lines.push('*Generated by SWARM Bot*');

    return lines.join('\n');
  }
}

module.exports = ReportGenerator;
