# 🤖 SWARM Bot - Deployment Blocker Automation

## Overview

SWARM Bot is an intelligent automation system that continuously monitors deployment health, detects common failure patterns, and automatically attempts resolution where safe to do so. It integrates seamlessly with the existing Health Triage Bot for comprehensive monitoring.

## Features

### 🔍 Automated Monitoring
- **Endpoint Health**: Monitors all critical endpoints for availability and performance
- **Build Status**: Tracks GitHub Actions workflow failures
- **Dependency Health**: Detects version conflicts and security vulnerabilities  
- **Performance Metrics**: Monitors response times and system performance

### 🔧 Auto-Resolution
- **Endpoint Fixes**: Redeployment, cache clearing, routing fixes
- **Build Repairs**: Retry failed builds, clear build caches
- **Safe Operations**: Only attempts non-breaking fixes automatically
- **Verification**: Confirms fixes work before marking as resolved

### 📢 Escalation & Reporting
- **GitHub Issues**: Creates detailed issue reports for unresolved problems
- **Alert System**: Notifications via Discord, GitHub, and email
- **Detailed Reports**: Comprehensive diagnostics and logs
- **Recovery Tracking**: Monitors and reports on resolution success rates

### 🤝 Health Triage Integration
- **Shared Monitoring**: Data exchange between SWARM and Health Triage bots
- **Coordinated Responses**: Avoids conflicts between systems
- **Unified Alerting**: Single source of truth for system health
- **Cross-System Health Checks**: Combined health scoring

## Architecture

```
swarm-bot/
├── src/
│   ├── monitors/              # Health monitoring modules
│   │   ├── endpoint-monitor.js
│   │   ├── build-monitor.js
│   │   ├── dependency-monitor.js
│   │   └── performance-monitor.js
│   ├── resolvers/             # Auto-resolution modules
│   │   ├── endpoint-resolver.js
│   │   └── build-resolver.js
│   ├── escalation/            # Escalation & alerting
│   │   ├── issue-creator.js
│   │   └── alert-system.js
│   └── swarm-bot.js          # Main orchestrator
├── config/                    # Configuration
│   ├── monitoring-config.js
│   └── resolution-rules.js
├── workflows/                 # GitHub Actions scripts
│   └── monitor.js
└── docs/                      # Documentation
    └── SWARM_BOT_README.md
```

## Quick Start

### Installation

```bash
# Install dependencies (from project root)
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Key environment variables:

```bash
# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=wiredchaos
GITHUB_REPO=wired-chaos

# Discord (optional)
DISCORD_WEBHOOK_URL=your_discord_webhook

# SWARM Settings
SWARM_DRY_RUN=false
SWARM_LOG_LEVEL=info
```

### Usage

#### Standalone Monitoring

```javascript
const SwarmBot = require('./swarm-bot/src/swarm-bot');
const config = require('./swarm-bot/config/monitoring-config');

const bot = new SwarmBot(config);
await bot.start();
```

#### One-Time Check

```bash
node swarm-bot/workflows/monitor.js
```

#### GitHub Actions

The SWARM bot runs automatically via GitHub Actions:
- Every 5 minutes via cron schedule
- On push to main branch
- Manual trigger via workflow_dispatch

## API Reference

### SwarmBot Class

#### `constructor(config)`
Initialize SWARM bot with configuration.

#### `start()`
Start continuous monitoring.

#### `stop()`
Stop monitoring.

#### `monitoringCycle()`
Execute one monitoring cycle.

#### `getStatus()`
Get current system status.

#### `getIssues()`
Get all current issues.

#### `getHealthScore()`
Get overall health score (0-100).

#### `triggerResolution(issueType, issueData)`
Manually trigger resolution for an issue.

### Monitor Classes

Each monitor provides:
- `checkAll()` / `checkBuilds()` / `checkDependencies()` / `checkPerformance()`
- `getIssues()` - Returns array of detected issues
- `getHistory(limit)` - Returns recent monitoring history

### Resolver Classes

Each resolver provides:
- `resolve(issue)` - Attempts to resolve an issue
- `getHistory(limit)` - Returns resolution history
- `getSuccessRate()` - Returns success rate statistics

## Health Scoring

SWARM bot calculates an overall health score (0-100) based on:

- **Endpoint Health (40%)**: Percentage of healthy endpoints
- **Build Health (30%)**: Build success rate
- **Dependency Health (20%)**: Absence of vulnerabilities
- **Performance Health (10%)**: Response time metrics

**Score Ranges:**
- 95-100: Excellent 🟢
- 85-94: Good 🟡
- 70-84: Degraded 🟠
- 0-69: Critical 🔴

## Resolution Rules

### Safe Auto-Resolution

SWARM bot only auto-resolves issues that are safe and non-breaking:

✅ **Safe Operations:**
- Clear CDN/build cache
- Retry failed builds
- Verify DNS/SSL
- Fetch and analyze logs
- Trigger redeployment

❌ **Requires Manual Approval:**
- Dependency updates
- Code modifications
- Configuration changes
- Database migrations
- Production rollbacks

### Guardrails

- Maximum 10 resolutions per hour
- Minimum 5 minutes between same-endpoint resolutions
- Auto-disable after 5 consecutive failures
- Critical systems require human approval
- Maximum 3 simultaneous resolutions

## Integration with Health Triage Bot

The SWARM bot integrates with the existing Health Triage Bot:

```javascript
const SwarmHealthIntegration = require('./health-triage/sync-swarm');

const integration = new SwarmHealthIntegration();

// Share data from Health Triage to SWARM
integration.shareHealthDataToSwarm(healthData);

// Receive data from SWARM
integration.receiveSwarmData(swarmData);

// Get combined health score
const combined = integration.calculateCombinedHealthScore();

// Coordinate response to an issue
const coordination = await integration.coordinateResponse(issue);
```

### Coordination Logic

- **Endpoint/Build Failures**: SWARM bot handles with Health Triage monitoring
- **Critical Issues**: Both systems coordinate on escalation
- **General Issues**: Health Triage bot handles triage

## Monitoring Endpoints

When integrated with an API server, SWARM bot exposes:

- `GET /api/swarm/status` - Overall SWARM bot health
- `GET /api/swarm/issues` - Current detected issues
- `GET /api/swarm/resolutions` - Recent auto-fixes applied
- `POST /api/swarm/trigger` - Manual issue resolution trigger
- `GET /api/health/triage` - Enhanced health triage with SWARM data

## Security

### Audit Logging
All automated actions are logged with:
- Timestamp
- Action taken
- Result
- Duration
- Context

### Permission Management
- GitHub token requires `repo` and `actions:read` scope
- Discord webhook URL should be kept secret
- Read-only access for monitoring
- Write access only for safe operations

### Safe Mode
Enable dry-run mode for testing:

```bash
SWARM_DRY_RUN=true node swarm-bot/workflows/monitor.js
```

## Troubleshooting

### High False Positive Rate

Adjust thresholds in `config/monitoring-config.js`:

```javascript
thresholds: {
  critical: 60,  // Lower = more sensitive
  warning: 80,
  good: 95
}
```

### Resolution Not Working

Check guardrails:

```javascript
guardrails: {
  maxResolutionsPerHour: 10,
  minTimeBetweenResolutions: 300000
}
```

### Integration Issues

Verify Health Triage integration:

```bash
# Check sync status
node -e "const i = require('./health-triage/sync-swarm'); console.log(new i().getSyncStatus())"
```

## Examples

### Monitor and Auto-Resolve

```javascript
const SwarmBot = require('./swarm-bot/src/swarm-bot');
const config = require('./swarm-bot/config/monitoring-config');

async function run() {
  const bot = new SwarmBot({
    ...config,
    autoResolve: true
  });

  // Run one cycle
  await bot.monitoringCycle();

  // Get results
  const status = bot.getStatus();
  const health = bot.getHealthScore();

  console.log(`Health: ${health.score}% (${health.status})`);
  console.log(`Issues: ${status.currentIssues}`);
  console.log(`Resolutions: ${status.resolutions.successful}/${status.resolutions.total}`);
}

run();
```

### Manual Resolution Trigger

```javascript
const result = await bot.triggerResolution('endpoint_failure', {
  endpoint: 'Suite Landing',
  url: 'https://www.wiredchaos.xyz/suite',
  status: 404,
  critical: true
});

console.log(`Resolution ${result.success ? 'succeeded' : 'failed'}`);
```

## Contributing

To add new monitors or resolvers:

1. Create module in appropriate directory
2. Follow existing module patterns
3. Add tests
4. Update configuration
5. Document in this README

## Support

For issues or questions:
- Check existing GitHub issues
- Review logs in GitHub Actions
- Consult Health Triage Bot integration logs

## License

MIT - See LICENSE file
