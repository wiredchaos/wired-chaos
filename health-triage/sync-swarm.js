/**
 * Health Triage Bot - SWARM Integration
 * Coordinates between Health Triage Bot and SWARM Bot
 */

class SwarmHealthIntegration {
  constructor(config = {}) {
    this.config = {
      syncInterval: config.syncInterval || 60000, // 1 minute
      shareData: config.shareData !== false,
      coordinateResponses: config.coordinateResponses !== false,
      ...config
    };
    
    this.healthTriageData = null;
    this.swarmData = null;
    this.coordinationLog = [];
  }

  /**
   * Share monitoring data from Health Triage Bot to SWARM Bot
   * @param {Object} healthData - Health triage data
   * @returns {Object} Shared data result
   */
  shareHealthDataToSwarm(healthData) {
    const sharedData = {
      timestamp: new Date().toISOString(),
      source: 'health_triage_bot',
      data: {
        systemHealth: healthData.systemHealth,
        components: healthData.components,
        alerts: healthData.alerts,
        metrics: {
          deploymentSuccess: healthData.deploymentSuccess,
          conflictResolution: healthData.conflictResolution,
          emergencyResponse: healthData.emergencyResponse
        }
      }
    };

    this.healthTriageData = sharedData;
    return sharedData;
  }

  /**
   * Receive and process data from SWARM Bot
   * @param {Object} swarmData - SWARM bot monitoring data
   * @returns {Object} Processed data
   */
  receiveSwarmData(swarmData) {
    this.swarmData = {
      timestamp: new Date().toISOString(),
      source: 'swarm_bot',
      data: swarmData
    };

    // Enrich health triage data with SWARM insights
    return this.enrichHealthData();
  }

  /**
   * Enrich health triage data with SWARM insights
   * @returns {Object} Enriched health data
   */
  enrichHealthData() {
    if (!this.healthTriageData || !this.swarmData) {
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      combined_health_score: this.calculateCombinedHealthScore(),
      health_triage: this.healthTriageData.data,
      swarm_monitoring: this.swarmData.data,
      correlated_issues: this.correlateIssues(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Calculate combined health score from both systems
   * @returns {Object} Combined health score
   */
  calculateCombinedHealthScore() {
    let totalScore = 0;
    let componentCount = 0;

    // Health Triage Bot score (50% weight)
    if (this.healthTriageData?.data?.systemHealth) {
      totalScore += this.healthTriageData.data.systemHealth * 0.5;
      componentCount += 0.5;
    }

    // SWARM Bot score (50% weight)
    if (this.swarmData?.data?.healthScore?.score) {
      totalScore += this.swarmData.data.healthScore.score * 0.5;
      componentCount += 0.5;
    }

    const finalScore = componentCount > 0 ? totalScore / componentCount : 0;

    return {
      score: Math.round(finalScore),
      status: finalScore >= 95 ? 'excellent' :
              finalScore >= 85 ? 'good' :
              finalScore >= 70 ? 'degraded' : 'critical',
      health_triage_contribution: this.healthTriageData?.data?.systemHealth,
      swarm_contribution: this.swarmData?.data?.healthScore?.score
    };
  }

  /**
   * Correlate issues between both systems
   * @returns {Array} Correlated issues
   */
  correlateIssues() {
    const correlatedIssues = [];

    // Get issues from both systems
    const healthTriageAlerts = this.healthTriageData?.data?.alerts || [];
    const swarmIssues = this.swarmData?.data?.issues || [];

    // Find overlapping issues
    for (const alert of healthTriageAlerts) {
      for (const issue of swarmIssues) {
        if (this.issuesOverlap(alert, issue)) {
          correlatedIssues.push({
            type: 'correlated',
            health_triage_alert: alert,
            swarm_issue: issue,
            severity: this.determineCorrelatedSeverity(alert, issue),
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return correlatedIssues;
  }

  /**
   * Check if two issues overlap
   * @param {Object} alert - Health triage alert
   * @param {Object} issue - SWARM issue
   * @returns {boolean} True if issues overlap
   */
  issuesOverlap(alert, issue) {
    // Check for common endpoints or components
    if (alert.component && issue.endpoint) {
      return alert.component.toLowerCase().includes(issue.endpoint.toLowerCase()) ||
             issue.endpoint.toLowerCase().includes(alert.component.toLowerCase());
    }

    // Check for similar issue types
    if (alert.level && issue.type) {
      const alertType = alert.level.toLowerCase();
      const issueType = issue.type.toLowerCase();
      return alertType.includes('endpoint') && issueType.includes('endpoint') ||
             alertType.includes('build') && issueType.includes('build') ||
             alertType.includes('performance') && issueType.includes('performance');
    }

    return false;
  }

  /**
   * Determine severity for correlated issues
   * @param {Object} alert - Health triage alert
   * @param {Object} issue - SWARM issue
   * @returns {string} Combined severity
   */
  determineCorrelatedSeverity(alert, issue) {
    const alertLevel = alert.level === 'LEVEL_3_CRITICAL' ? 3 :
                       alert.level === 'LEVEL_2_ALERT' ? 2 : 1;
    const issueLevel = issue.severity === 'critical' ? 3 :
                       issue.severity === 'warning' ? 2 : 1;

    const maxLevel = Math.max(alertLevel, issueLevel);
    return maxLevel >= 3 ? 'critical' :
           maxLevel >= 2 ? 'warning' : 'info';
  }

  /**
   * Generate coordinated recommendations
   * @returns {Array} Recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const correlatedIssues = this.correlateIssues();

    if (correlatedIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        message: `${correlatedIssues.length} correlated issues detected across systems`,
        action: 'Investigate common root cause'
      });
    }

    // Check if SWARM bot is actively resolving issues
    if (this.swarmData?.data?.resolutions?.recent?.length > 0) {
      recommendations.push({
        priority: 'info',
        message: 'SWARM bot is actively resolving issues',
        action: 'Monitor resolution progress'
      });
    }

    // Check for declining health trend
    const combinedScore = this.calculateCombinedHealthScore();
    if (combinedScore.status === 'degraded' || combinedScore.status === 'critical') {
      recommendations.push({
        priority: 'critical',
        message: `System health is ${combinedScore.status} (${combinedScore.score}%)`,
        action: 'Immediate attention required'
      });
    }

    return recommendations;
  }

  /**
   * Coordinate response between both systems
   * @param {Object} issue - Issue to coordinate on
   * @returns {Object} Coordination result
   */
  async coordinateResponse(issue) {
    const coordination = {
      id: `coord_${Date.now()}`,
      issue,
      timestamp: new Date().toISOString(),
      actions: []
    };

    // Determine which system should handle the issue
    if (issue.type === 'endpoint_failure' || issue.type === 'build_failure') {
      coordination.handler = 'swarm_bot';
      coordination.actions.push({
        system: 'swarm_bot',
        action: 'auto_resolve',
        message: 'SWARM bot will attempt auto-resolution'
      });
      coordination.actions.push({
        system: 'health_triage_bot',
        action: 'monitor',
        message: 'Health Triage bot will monitor resolution progress'
      });
    } else if (issue.level && issue.level.includes('CRITICAL')) {
      coordination.handler = 'both';
      coordination.actions.push({
        system: 'swarm_bot',
        action: 'escalate',
        message: 'SWARM bot will create GitHub issue'
      });
      coordination.actions.push({
        system: 'health_triage_bot',
        action: 'alert',
        message: 'Health Triage bot will send emergency alerts'
      });
    } else {
      coordination.handler = 'health_triage_bot';
      coordination.actions.push({
        system: 'health_triage_bot',
        action: 'triage',
        message: 'Health Triage bot will handle triage'
      });
    }

    this.coordinationLog.push(coordination);
    return coordination;
  }

  /**
   * Get coordination history
   * @param {number} limit - Number of recent coordinations
   * @returns {Array} Recent coordinations
   */
  getCoordinationHistory(limit = 10) {
    return this.coordinationLog.slice(-limit);
  }

  /**
   * Get sync status
   * @returns {Object} Sync status
   */
  getSyncStatus() {
    return {
      last_health_triage_update: this.healthTriageData?.timestamp,
      last_swarm_update: this.swarmData?.timestamp,
      sync_active: this.config.shareData,
      coordination_active: this.config.coordinateResponses,
      coordination_count: this.coordinationLog.length
    };
  }
}

module.exports = SwarmHealthIntegration;
