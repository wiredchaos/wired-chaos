#!/usr/bin/env node
/**
 * SWARM Bot - Demo Script
 * Demonstrates the capabilities of the SWARM bot system
 */

const SwarmBot = require('./src/swarm-bot');
const SwarmHealthIntegration = require('../health-triage/sync-swarm');
const ReportGenerator = require('./src/escalation/report-generator');
const config = require('./config/monitoring-config');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

async function demonstrateSwarmBot() {
  log('\n🤖 SWARM Bot - Deployment Blocker Automation Demo', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

  // Initialize SWARM bot in dry-run mode for demo
  const swarmBot = new SwarmBot({
    ...config,
    dryRun: true,
    autoResolve: true
  });

  // 1. Demonstrate Monitoring
  logSection('1. Running Monitoring Cycle');
  log('Checking endpoints, builds, dependencies, and performance...', 'yellow');
  
  const monitoringResults = await swarmBot.monitoringCycle();
  
  log('\n✅ Monitoring complete!', 'green');
  log(`   Duration: ${monitoringResults.duration}ms`, 'cyan');

  // 2. Show Current Status
  logSection('2. Current System Status');
  const status = swarmBot.getStatus();
  const healthScore = swarmBot.getHealthScore();

  log(`Health Score: ${healthScore.score}% (${healthScore.status})`, 
    healthScore.status === 'excellent' ? 'green' : 
    healthScore.status === 'good' ? 'yellow' : 'red');
  log(`Running: ${status.running ? '✅' : '❌'}`);
  log(`Current Issues: ${status.currentIssues}`);
  log(`Critical Issues: ${status.criticalIssues}`);
  log(`Last Check: ${status.lastCheck}`);

  // 3. Show Component Status
  logSection('3. Component Health');
  
  if (status.monitors.endpoint) {
    log(`\n📍 Endpoints: ${status.monitors.endpoint.status}`, 
      status.monitors.endpoint.status === 'healthy' ? 'green' : 'red');
    log(`   Healthy: ${status.monitors.endpoint.healthy}/${status.monitors.endpoint.total}`);
  }

  if (status.monitors.build) {
    log(`\n🔨 Builds: ${status.monitors.build.status}`,
      status.monitors.build.status === 'healthy' ? 'green' : 'red');
    log(`   Failed: ${status.monitors.build.failed}/${status.monitors.build.total}`);
  }

  if (status.monitors.dependency) {
    log(`\n📦 Dependencies: ${status.monitors.dependency.status}`,
      status.monitors.dependency.status === 'healthy' ? 'green' : 'red');
    if (status.monitors.dependency.vulnerabilities) {
      const vulns = status.monitors.dependency.vulnerabilities;
      if (vulns.critical + vulns.high + vulns.moderate + vulns.low > 0) {
        log(`   Vulnerabilities: C:${vulns.critical} H:${vulns.high} M:${vulns.moderate} L:${vulns.low}`);
      }
    }
  }

  if (status.monitors.performance) {
    log(`\n⚡ Performance: ${status.monitors.performance.status}`,
      status.monitors.performance.status === 'healthy' ? 'green' : 'red');
    log(`   Avg Response Time: ${status.monitors.performance.avg_response_time}ms`);
  }

  // 4. Demonstrate Issue Detection
  logSection('4. Detected Issues');
  const issues = swarmBot.getIssues();
  
  if (issues.length === 0) {
    log('✅ No issues detected!', 'green');
  } else {
    log(`Found ${issues.length} issue(s):\n`, 'yellow');
    issues.forEach((issue, index) => {
      const icon = issue.severity === 'critical' ? '🔴' : 
                   issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      log(`${icon} [${issue.severity}] ${issue.type}`, 
        issue.severity === 'critical' ? 'red' : 'yellow');
      if (issue.endpoint) log(`   Endpoint: ${issue.endpoint}`, 'cyan');
      if (issue.workflow) log(`   Workflow: ${issue.workflow}`, 'cyan');
      if (issue.error) log(`   Error: ${issue.error}`, 'cyan');
      log(`   Resolvable: ${issue.resolvable ? 'Yes' : 'No'}`, 'cyan');
      console.log();
    });
  }

  // 5. Demonstrate Auto-Resolution
  if (issues.length > 0 && issues.some(i => i.resolvable)) {
    logSection('5. Auto-Resolution (Dry Run)');
    log('Attempting to resolve issues automatically...\n', 'yellow');
    
    const resolvableIssues = issues.filter(i => i.resolvable);
    for (const issue of resolvableIssues.slice(0, 3)) { // Limit to 3 for demo
      const resolution = await swarmBot.resolveIssue(issue);
      
      if (resolution.success) {
        log(`✅ Resolved: ${issue.type}`, 'green');
        log(`   Strategy: ${resolution.strategy}`, 'cyan');
        if (resolution.dryRun) {
          log(`   [DRY RUN MODE]`, 'yellow');
        }
      } else {
        log(`❌ Failed: ${issue.type}`, 'red');
        log(`   Reason: ${resolution.reason || resolution.error}`, 'cyan');
      }
      console.log();
    }
  }

  // 6. Show Resolution Statistics
  logSection('6. Resolution Statistics');
  const resolutions = swarmBot.getResolutions();
  
  if (resolutions.length > 0) {
    const successful = resolutions.filter(r => r.success).length;
    const successRate = Math.round((successful / resolutions.length) * 100);
    
    log(`Total Resolutions: ${resolutions.length}`);
    log(`Successful: ${successful}`, 'green');
    log(`Failed: ${resolutions.length - successful}`, 'red');
    log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'yellow');
    
    log('\nRecent Resolutions:', 'cyan');
    resolutions.slice(-3).forEach(r => {
      const icon = r.success ? '✅' : '❌';
      log(`  ${icon} ${r.issue.type} (${r.duration}ms)`);
    });
  } else {
    log('No resolutions attempted yet', 'yellow');
  }

  // 7. Demonstrate Health Triage Integration
  logSection('7. Health Triage Integration');
  const integration = new SwarmHealthIntegration();
  
  // Mock health triage data
  const healthTriageData = {
    systemHealth: 95,
    components: [
      { name: 'PR Manager', status: 'healthy' },
      { name: 'Deployment', status: 'healthy' }
    ],
    alerts: []
  };
  
  log('Sharing data with Health Triage Bot...', 'yellow');
  integration.shareHealthDataToSwarm(healthTriageData);
  
  log('Receiving SWARM data...', 'yellow');
  integration.receiveSwarmData({
    status: status,
    healthScore: healthScore,
    issues: issues
  });
  
  const combinedHealth = integration.calculateCombinedHealthScore();
  log('\n✅ Integration complete!', 'green');
  log(`Combined Health Score: ${combinedHealth.score}% (${combinedHealth.status})`,
    combinedHealth.status === 'excellent' ? 'green' : 'yellow');
  log(`  Health Triage: ${combinedHealth.health_triage_contribution}%`, 'cyan');
  log(`  SWARM Bot: ${combinedHealth.swarm_contribution}%`, 'cyan');

  // 8. Generate Report
  logSection('8. Diagnostic Report');
  const reportGenerator = new ReportGenerator();
  const report = reportGenerator.generateSystemReport(swarmBot);
  
  log('Generating comprehensive report...\n', 'yellow');
  
  log('Report Summary:', 'cyan');
  log(`  Overall Health: ${report.summary.overall_health}`);
  log(`  Active Issues: ${report.summary.active_issues}`);
  log(`  Critical Issues: ${report.summary.critical_issues}`);
  log(`  Recent Resolutions: ${report.summary.recent_resolutions}`);
  
  if (report.recommendations.length > 0) {
    log('\nRecommendations:', 'cyan');
    report.recommendations.slice(0, 3).forEach(rec => {
      const icon = rec.priority === 'critical' ? '🔴' :
                   rec.priority === 'high' ? '🟠' : 
                   rec.priority === 'medium' ? '🟡' : 'ℹ️';
      log(`  ${icon} [${rec.priority}] ${rec.message}`, 
        rec.priority === 'critical' ? 'red' : 'yellow');
    });
  }

  // 9. Summary
  logSection('9. Demo Summary');
  log('✅ Demonstrated Features:', 'green');
  log('  • Automated endpoint monitoring with retry logic');
  log('  • Build status tracking');
  log('  • Dependency and performance monitoring');
  log('  • Safe auto-resolution with dry-run mode');
  log('  • Health Triage Bot integration');
  log('  • Combined health scoring');
  log('  • Comprehensive diagnostic reporting');
  
  log('\n📚 Next Steps:', 'cyan');
  log('  1. Configure environment variables (.env)');
  log('  2. Set SWARM_DRY_RUN=false for production');
  log('  3. Enable GitHub Actions workflow');
  log('  4. Monitor via /api/swarm/status endpoint');
  log('  5. Review reports and adjust thresholds');

  log('\n🤖 SWARM Bot Demo Complete!', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// Run demo
if (require.main === module) {
  demonstrateSwarmBot().catch(error => {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = demonstrateSwarmBot;
