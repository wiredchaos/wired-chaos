# SWARM Bot - Health Triage Integration Guide

## Overview

This guide explains how to integrate SWARM Bot with the existing Health Triage Bot for comprehensive deployment health monitoring and coordinated issue resolution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Monitoring Layer                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐      ┌──────────────────────┐     │
│  │  Health Triage Bot  │◄────►│     SWARM Bot        │     │
│  │                     │      │                      │     │
│  │  • PR Monitoring    │      │  • Endpoint Monitor  │     │
│  │  • VSCode Automation│      │  • Build Monitor     │     │
│  │  • Deployment Status│      │  • Dependency Check  │     │
│  │  • Manual Triage    │      │  • Auto-Resolution   │     │
│  └─────────────────────┘      └──────────────────────┘     │
│           │                              │                   │
│           └──────────┬───────────────────┘                   │
│                      │                                       │
│              ┌───────▼────────┐                             │
│              │ SwarmHealth    │                             │
│              │ Integration    │                             │
│              │                │                             │
│              │ • Data Sharing │                             │
│              │ • Coordination │                             │
│              │ • Combined     │                             │
│              │   Health Score │                             │
│              └────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## Integration Components

### 1. SwarmHealthIntegration Class

Located in `health-triage/sync-swarm.js`, this class coordinates between both bots.

**Key Responsibilities:**
- Share monitoring data between systems
- Calculate combined health scores
- Correlate issues across both systems
- Coordinate response strategies

### 2. Data Flow

```
Health Triage Bot                SWARM Bot
      │                               │
      │ 1. Generate health data       │
      ├──────────────────────────────►│
      │    (PR status, deployment)    │
      │                               │
      │                               │ 2. Run monitoring cycle
      │                               │    (endpoints, builds, etc.)
      │                               │
      │ 3. Receive SWARM data         │
      │◄──────────────────────────────┤
      │    (issues, resolutions)      │
      │                               │
      │ 4. Calculate combined health  │
      ├───────────┐         ┌─────────┤
      │           │         │         │
      │       ┌───▼─────────▼───┐     │
      │       │ SwarmHealth     │     │
      │       │ Integration     │     │
      │       └─────────────────┘     │
      │                               │
      │ 5. Coordinated response       │
      ├──────────────┬────────────────┤
      │              │                │
      ▼              ▼                ▼
   Alert         Resolve          Escalate
```

## Setup Instructions

### Step 1: Install Dependencies

Both bots are part of the same repository, so dependencies are already available.

```bash
cd /home/runner/work/wired-chaos/wired-chaos
npm install
```

### Step 2: Configure Environment Variables

Add to your `.env` file:

```bash
# Existing Health Triage settings
GITHUB_TOKEN=your_github_token

# SWARM Bot settings
SWARM_DRY_RUN=false
SWARM_LOG_LEVEL=info
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Integration settings
SWARM_HEALTH_SYNC=true
SWARM_COORDINATION=true
```

### Step 3: Initialize Integration

```javascript
// In your main application or server
const { HealthBotVSCodeIntegration } = require('./health-bot-vscode-integration');
const SwarmBot = require('./swarm-bot/src/swarm-bot');
const SwarmHealthIntegration = require('./health-triage/sync-swarm');

// Initialize bots
const healthBot = new HealthBotVSCodeIntegration();
const swarmBot = new SwarmBot(require('./swarm-bot/config/monitoring-config'));
const integration = new SwarmHealthIntegration();

// Start monitoring
await swarmBot.start();
```

### Step 4: Set Up Data Sharing

```javascript
// Periodic sync (every 60 seconds)
setInterval(async () => {
  // Get data from Health Triage Bot
  const healthData = await healthBot.generateHealthDashboard();
  
  // Share with SWARM Bot
  integration.shareHealthDataToSwarm(healthData);
  
  // Get data from SWARM Bot
  const swarmStatus = swarmBot.getStatus();
  const swarmHealth = swarmBot.getHealthScore();
  
  // Process in integration layer
  const swarmData = {
    status: swarmStatus,
    healthScore: swarmHealth,
    issues: swarmBot.getIssues()
  };
  
  integration.receiveSwarmData(swarmData);
  
  // Get combined insights
  const enriched = integration.enrichHealthData();
  console.log('Combined health:', enriched.combined_health_score);
}, 60000);
```

## Usage Examples

### Example 1: Basic Integration

```javascript
const SwarmHealthIntegration = require('./health-triage/sync-swarm');

const integration = new SwarmHealthIntegration({
  syncInterval: 60000,
  shareData: true,
  coordinateResponses: true
});

// Share Health Triage data
const healthData = {
  systemHealth: 95,
  components: [
    { name: 'PR Manager', status: 'healthy' },
    { name: 'Deployment', status: 'healthy' }
  ],
  alerts: []
};

integration.shareHealthDataToSwarm(healthData);

// Receive SWARM data
const swarmData = {
  status: 'healthy',
  healthScore: { score: 98, status: 'excellent' },
  issues: []
};

const enriched = integration.receiveSwarmData(swarmData);
console.log('Combined Health Score:', enriched.combined_health_score);
```

### Example 2: Coordinated Response

```javascript
// When an issue is detected by either system
const issue = {
  type: 'endpoint_failure',
  endpoint: 'Suite Landing',
  url: 'https://www.wiredchaos.xyz/suite',
  severity: 'critical'
};

// Coordinate response
const coordination = await integration.coordinateResponse(issue);
console.log('Handler:', coordination.handler); // 'swarm_bot'
console.log('Actions:', coordination.actions);
// [
//   { system: 'swarm_bot', action: 'auto_resolve' },
//   { system: 'health_triage_bot', action: 'monitor' }
// ]
```

### Example 3: Issue Correlation

```javascript
// Get correlated issues between both systems
const enriched = integration.enrichHealthData();

if (enriched && enriched.correlated_issues.length > 0) {
  console.log('Correlated Issues Found:');
  enriched.correlated_issues.forEach(ci => {
    console.log(`- ${ci.severity}: ${ci.health_triage_alert.component} / ${ci.swarm_issue.endpoint}`);
  });
}
```

## Coordination Logic

### Decision Matrix

| Issue Type | Severity | Handler | Health Triage Action | SWARM Bot Action |
|------------|----------|---------|---------------------|------------------|
| Endpoint Failure | Critical | SWARM Bot | Monitor | Auto-resolve |
| Endpoint Failure | Warning | SWARM Bot | Monitor | Auto-resolve |
| Build Failure | Any | SWARM Bot | Monitor | Auto-resolve |
| PR Conflict | Any | Health Triage | Triage | Monitor |
| Security Vuln | Critical | Both | Alert | Escalate |
| Performance | Warning | SWARM Bot | Monitor | Auto-resolve |

### Response Coordination

```javascript
// Pseudo-code for coordination logic
if (issue.type === 'endpoint_failure' || issue.type === 'build_failure') {
  // SWARM bot handles technical issues
  swarmBot.resolveIssue(issue);
  healthTriageBot.monitor(issue);
} else if (issue.severity === 'critical') {
  // Both systems coordinate on critical issues
  swarmBot.escalate(issue);
  healthTriageBot.sendEmergencyAlert(issue);
} else {
  // Health Triage bot handles general issues
  healthTriageBot.triage(issue);
}
```

## Combined Health Scoring

The integrated system calculates a combined health score:

```javascript
const combinedScore = integration.calculateCombinedHealthScore();

// Result:
{
  score: 96,  // Weighted average
  status: 'excellent',
  health_triage_contribution: 95,  // 50% weight
  swarm_contribution: 97            // 50% weight
}
```

**Weights:**
- Health Triage Bot: 50% (PR management, deployment tracking)
- SWARM Bot: 50% (endpoint/build/dependency health)

## API Integration

### Enhanced Health Endpoint

When integrated, the health endpoint provides combined data:

```javascript
// GET /api/health/triage
{
  "timestamp": "2024-10-01T16:00:00Z",
  "combined_health": {
    "score": 96,
    "status": "excellent"
  },
  "health_triage": {
    "system_health": 95,
    "pr_status": "all_green",
    "deployment_status": "stable"
  },
  "swarm_monitoring": {
    "health_score": 97,
    "current_issues": 1,
    "critical_issues": 0
  },
  "correlated_issues": [],
  "recommendations": []
}
```

## Monitoring Dashboard

Both systems contribute to a unified monitoring dashboard:

```javascript
async function generateUnifiedDashboard() {
  const healthDashboard = await healthBot.generateHealthDashboard();
  const swarmStatus = swarmBot.getStatus();
  const integration = new SwarmHealthIntegration();
  
  integration.shareHealthDataToSwarm(healthDashboard);
  integration.receiveSwarmData({
    status: swarmStatus,
    healthScore: swarmBot.getHealthScore(),
    issues: swarmBot.getIssues()
  });
  
  return {
    ...healthDashboard,
    swarm_monitoring: swarmStatus,
    combined_health: integration.calculateCombinedHealthScore(),
    correlated_issues: integration.correlateIssues()
  };
}
```

## Troubleshooting Integration

### Issue: Data Not Syncing

Check sync status:

```javascript
const syncStatus = integration.getSyncStatus();
console.log('Sync Active:', syncStatus.sync_active);
console.log('Last Health Update:', syncStatus.last_health_triage_update);
console.log('Last SWARM Update:', syncStatus.last_swarm_update);
```

### Issue: Coordination Conflicts

Review coordination history:

```javascript
const history = integration.getCoordinationHistory(10);
history.forEach(coord => {
  console.log(`${coord.timestamp}: ${coord.handler} handled ${coord.issue.type}`);
});
```

### Issue: Health Scores Don't Match

Verify both systems are reporting:

```javascript
const combined = integration.calculateCombinedHealthScore();
console.log('Health Triage:', combined.health_triage_contribution);
console.log('SWARM Bot:', combined.swarm_contribution);
console.log('Combined:', combined.score);
```

## Best Practices

1. **Keep Bots Synchronized**: Run sync every 60 seconds
2. **Monitor Both Systems**: Check logs from both bots
3. **Review Correlations**: Regularly check for correlated issues
4. **Test Coordination**: Verify response coordination works
5. **Update Together**: Keep both bots updated simultaneously

## GitHub Actions Integration

Both systems work together in the monitoring workflow:

```yaml
# .github/workflows/swarm-monitoring.yml
- name: Run SWARM Monitoring
  run: node swarm-bot/workflows/monitor.js

- name: Update Health Triage
  run: node swarm-bot/workflows/sync-health.js

- name: Generate Combined Report
  run: node health-triage/generate-report.js
```

## Advanced Topics

### Custom Coordination Rules

You can customize coordination logic:

```javascript
integration.addCoordinationRule({
  condition: (issue) => issue.type === 'custom_issue',
  handler: 'swarm_bot',
  actions: [
    { system: 'swarm_bot', action: 'custom_action' },
    { system: 'health_triage_bot', action: 'monitor' }
  ]
});
```

### Issue Priority Escalation

Both systems can escalate based on priority:

```javascript
if (issue.severity === 'critical' && 
    correlatedInBothSystems(issue)) {
  // Immediate escalation
  await swarmBot.escalate(issue);
  await healthBot.sendEmergencyAlert(issue);
}
```

## Support

For integration issues:
1. Check logs from both systems
2. Verify environment variables
3. Review coordination history
4. Test data flow manually

## Next Steps

After integration:
1. Monitor combined health scores
2. Review coordinated responses
3. Adjust thresholds as needed
4. Add custom rules for your workflow
