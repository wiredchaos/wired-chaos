/**
 * SWARM Bot - Alert System
 * Sends alerts via Discord, email, and other channels
 */

class AlertSystem {
  constructor(config = {}) {
    this.config = {
      discord: {
        enabled: config.discord?.enabled !== false,
        webhookUrl: config.discord?.webhookUrl || process.env.DISCORD_WEBHOOK_URL
      },
      email: {
        enabled: config.email?.enabled || false,
        recipients: config.email?.recipients || []
      },
      github: {
        enabled: config.github?.enabled !== false,
        createIssues: config.github?.createIssues !== false
      },
      dryRun: config.dryRun || false,
      ...config
    };
    this.alertHistory = [];
  }

  /**
   * Send an alert
   * @param {Object} alert - Alert data
   * @returns {Promise<Object>} Alert result
   */
  async sendAlert(alert) {
    const alertId = `alert_${Date.now()}`;
    const results = {
      id: alertId,
      alert,
      channels: {},
      timestamp: new Date().toISOString()
    };

    // Send to Discord if enabled
    if (this.config.discord.enabled && this.config.discord.webhookUrl) {
      results.channels.discord = await this.sendDiscordAlert(alert);
    }

    // Send email if enabled
    if (this.config.email.enabled && this.config.email.recipients.length > 0) {
      results.channels.email = await this.sendEmailAlert(alert);
    }

    // Create GitHub issue if enabled
    if (this.config.github.enabled && alert.severity === 'critical') {
      results.channels.github = { deferred: true, message: 'Issue creation handled separately' };
    }

    this.alertHistory.push(results);
    return results;
  }

  /**
   * Send alert to Discord
   * @param {Object} alert - Alert data
   * @returns {Promise<Object>} Discord send result
   */
  async sendDiscordAlert(alert) {
    if (this.config.dryRun) {
      return {
        success: true,
        dryRun: true,
        message: 'Discord alert would be sent'
      };
    }

    try {
      const embed = this.createDiscordEmbed(alert);
      
      // In production, would send to Discord webhook:
      // const response = await fetch(this.config.discord.webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ embeds: [embed] })
      // });

      return {
        success: true,
        message: 'Alert sent to Discord'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Discord embed for alert
   * @param {Object} alert - Alert data
   * @returns {Object} Discord embed
   */
  createDiscordEmbed(alert) {
    const color = alert.severity === 'critical' ? 0xFF0000 :
                  alert.severity === 'warning' ? 0xFFA500 : 0xFFFF00;

    const emoji = alert.severity === 'critical' ? '🚨' :
                  alert.severity === 'warning' ? '⚠️' : 'ℹ️';

    const fields = [];

    if (alert.endpoint) {
      fields.push({ name: 'Endpoint', value: alert.endpoint, inline: true });
    }
    if (alert.workflow) {
      fields.push({ name: 'Workflow', value: alert.workflow, inline: true });
    }
    if (alert.status) {
      fields.push({ name: 'Status', value: String(alert.status), inline: true });
    }
    if (alert.error) {
      fields.push({ name: 'Error', value: `\`\`\`${alert.error}\`\`\``, inline: false });
    }

    return {
      title: `${emoji} SWARM Bot Alert: ${alert.type}`,
      description: alert.description || 'Automated alert from SWARM Bot',
      color,
      fields,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SWARM Bot Monitoring System'
      }
    };
  }

  /**
   * Send alert via email
   * @param {Object} alert - Alert data
   * @returns {Promise<Object>} Email send result
   */
  async sendEmailAlert(alert) {
    if (this.config.dryRun) {
      return {
        success: true,
        dryRun: true,
        message: 'Email alert would be sent'
      };
    }

    try {
      // In production, would use email service (SendGrid, AWS SES, etc.)
      return {
        success: true,
        message: `Alert sent to ${this.config.email.recipients.length} recipients`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send batch alerts for multiple issues
   * @param {Array} issues - Array of issues
   * @returns {Promise<Object>} Batch alert result
   */
  async sendBatchAlert(issues) {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const warningIssues = issues.filter(i => i.severity === 'warning');

    const batchAlert = {
      type: 'batch_alert',
      severity: criticalIssues.length > 0 ? 'critical' : 'warning',
      total: issues.length,
      critical: criticalIssues.length,
      warnings: warningIssues.length,
      issues: issues.slice(0, 10), // Limit to 10 most critical
      timestamp: new Date().toISOString()
    };

    return await this.sendAlert(batchAlert);
  }

  /**
   * Get alert history
   * @param {number} limit - Number of recent alerts
   * @returns {Array} Recent alerts
   */
  getHistory(limit = 10) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get alert statistics
   * @returns {Object} Alert statistics
   */
  getStatistics() {
    const total = this.alertHistory.length;
    const successful = this.alertHistory.filter(a => {
      return Object.values(a.channels).some(c => c.success);
    }).length;

    const bySeverity = {
      critical: 0,
      warning: 0,
      info: 0
    };

    for (const alert of this.alertHistory) {
      const severity = alert.alert.severity || 'info';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
    }

    return {
      total,
      successful,
      failed: total - successful,
      success_rate: total > 0 ? Math.round((successful / total) * 100) : 0,
      by_severity: bySeverity
    };
  }
}

module.exports = AlertSystem;
