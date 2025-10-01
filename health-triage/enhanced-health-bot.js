/**
 * Enhanced Health Bot with SWARM Integration
 * Combines Health Triage Bot with SWARM monitoring
 */

const { HealthBotVSCodeIntegration } = require('../health-bot-vscode-integration');
const SwarmBot = require('../swarm-bot/src/swarm-bot');
const SwarmHealthIntegration = require('./sync-swarm');
const swarmConfig = require('../swarm-bot/config/monitoring-config');

class EnhancedHealthBot {
  constructor(config = {}) {
    this.config = {
      syncInterval: config.syncInterval || 60000, // 1 minute
      enableSwarm: config.enableSwarm !== false,
      ...config
    };

    // Initialize both bots
    this.healthBot = new HealthBotVSCodeIntegration();
    this.swarmBot = new SwarmBot(swarmConfig);
    this.integration = new SwarmHealthIntegration();

    this.syncTimer = null;
  }

  /**
   * Start enhanced monitoring
   */
  async start() {
    console.log('🚀 Starting Enhanced Health Bot with SWARM integration...');

    if (this.config.enableSwarm) {
      // Start SWARM bot
      await this.swarmBot.start();
      
      // Start periodic sync
      this.startSync();
    }

    console.log('✅ Enhanced Health Bot started successfully');
  }

  /**
   * Stop monitoring
   */
  stop() {
    console.log('🛑 Stopping Enhanced Health Bot...');

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.config.enableSwarm) {
      this.swarmBot.stop();
    }

    console.log('✅ Enhanced Health Bot stopped');
  }

  /**
   * Start periodic synchronization
   */
  startSync() {
    this.syncTimer = setInterval(() => {
      this.syncData().catch(error => {
        console.error('❌ Sync failed:', error.message);
      });
    }, this.config.syncInterval);

    // Initial sync
    this.syncData().catch(error => {
      console.error('❌ Initial sync failed:', error.message);
    });
  }

  /**
   * Synchronize data between systems
   */
  async syncData() {
    try {
      // Get Health Triage data
      const healthData = await this.healthBot.generateHealthDashboard();
      
      // Share with SWARM
      this.integration.shareHealthDataToSwarm(healthData);
      
      // Get SWARM data
      const swarmStatus = this.swarmBot.getStatus();
      const swarmHealth = this.swarmBot.getHealthScore();
      const swarmIssues = this.swarmBot.getIssues();
      
      // Process in integration layer
      this.integration.receiveSwarmData({
        status: swarmStatus,
        healthScore: swarmHealth,
        issues: swarmIssues
      });

      return {
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get comprehensive health dashboard
   */
  async getComprehensiveDashboard() {
    const healthDashboard = await this.healthBot.generateHealthDashboard();
    const swarmStatus = this.swarmBot.getStatus();
    const swarmHealth = this.swarmBot.getHealthScore();
    const enriched = this.integration.enrichHealthData();

    return {
      timestamp: new Date().toISOString(),
      combined_health: enriched?.combined_health_score || {
        score: healthDashboard.overallScore,
        status: 'unknown'
      },
      health_triage: {
        system_health: healthDashboard.overallScore,
        pr_status: healthDashboard.pullRequests,
        deployment_status: healthDashboard.deploymentHealth
      },
      swarm_monitoring: {
        health_score: swarmHealth.score,
        status: swarmHealth.status,
        current_issues: swarmStatus.currentIssues,
        critical_issues: swarmStatus.criticalIssues,
        monitors: swarmStatus.monitors
      },
      correlated_issues: enriched?.correlated_issues || [],
      recommendations: enriched?.recommendations || []
    };
  }

  /**
   * Handle issue detected by either system
   */
  async handleIssue(issue) {
    // Coordinate response
    const coordination = await this.integration.coordinateResponse(issue);

    console.log(`🎯 Issue coordination: ${coordination.handler} will handle ${issue.type}`);

    // Execute coordinated actions
    for (const action of coordination.actions) {
      console.log(`  ${action.system}: ${action.action} - ${action.message}`);
      
      if (action.system === 'swarm_bot' && action.action === 'auto_resolve') {
        await this.swarmBot.resolveIssue(issue);
      } else if (action.system === 'health_triage_bot' && action.action === 'alert') {
        await this.healthBot.triggerEmergencyResponse('LEVEL_3_CRITICAL', issue);
      }
    }

    return coordination;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return this.integration.getSyncStatus();
  }
}

module.exports = EnhancedHealthBot;

// Example usage
if (require.main === module) {
  const bot = new EnhancedHealthBot({
    enableSwarm: true,
    syncInterval: 60000
  });

  bot.start().then(async () => {
    console.log('\n📊 Getting comprehensive dashboard...');
    const dashboard = await bot.getComprehensiveDashboard();
    console.log('\nCombined Health:', dashboard.combined_health);
    console.log('Health Triage:', dashboard.health_triage.system_health);
    console.log('SWARM Monitoring:', dashboard.swarm_monitoring.health_score);
    
    // Stop after demo
    setTimeout(() => {
      bot.stop();
      process.exit(0);
    }, 5000);
  }).catch(error => {
    console.error('❌ Failed to start:', error.message);
    process.exit(1);
  });
}
