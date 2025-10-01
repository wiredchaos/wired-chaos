#!/usr/bin/env node
/**
 * SWARM Bot - Monitoring Script
 * Runs monitoring cycle and reports results
 */

const SwarmBot = require('../src/swarm-bot');
const config = require('../config/monitoring-config');

async function main() {
  console.log('🤖 SWARM Bot Monitoring Script Starting...\n');

  try {
    // Initialize SWARM bot
    const swarmBot = new SwarmBot(config);

    // Run one monitoring cycle
    const results = await swarmBot.monitoringCycle();

    // Get current status
    const status = swarmBot.getStatus();
    const healthScore = swarmBot.getHealthScore();

    console.log('\n📊 Monitoring Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Health Score: ${healthScore.score}% (${healthScore.status})`);
    console.log(`Current Issues: ${status.currentIssues}`);
    console.log(`Critical Issues: ${status.criticalIssues}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Log component status
    console.log('Component Status:');
    if (status.monitors.endpoint) {
      console.log(`  Endpoints: ${status.monitors.endpoint.status} (${status.monitors.endpoint.healthy}/${status.monitors.endpoint.total})`);
    }
    if (status.monitors.build) {
      console.log(`  Builds: ${status.monitors.build.status} (${status.monitors.build.failed} failed)`);
    }
    if (status.monitors.dependency) {
      console.log(`  Dependencies: ${status.monitors.dependency.status}`);
    }
    if (status.monitors.performance) {
      console.log(`  Performance: ${status.monitors.performance.status} (avg: ${status.monitors.performance.avg_response_time}ms)`);
    }

    // List issues if any
    if (status.currentIssues > 0) {
      console.log('\n🚨 Current Issues:');
      const issues = swarmBot.getIssues();
      issues.forEach((issue, index) => {
        const icon = issue.severity === 'critical' ? '🔴' : '⚠️';
        console.log(`  ${icon} [${issue.severity}] ${issue.type}: ${issue.endpoint || issue.workflow || 'N/A'}`);
      });
    }

    // Exit with appropriate code
    if (healthScore.status === 'critical') {
      console.log('\n❌ CRITICAL: System health is critical');
      process.exit(1);
    } else if (healthScore.status === 'degraded') {
      console.log('\n⚠️  WARNING: System health is degraded');
      process.exit(0); // Don't fail workflow, just warn
    } else {
      console.log('\n✅ System health is good');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Monitoring failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = main;
