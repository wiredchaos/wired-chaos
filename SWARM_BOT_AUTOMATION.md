# 🤖 SWARM Bot Automation - Deployment Blocker Management

> Intelligent automation for monitoring, triaging, and resolving deployment blocking issues

## 🎯 Overview

The SWARM Bot Automation system provides automated monitoring and resolution of deployment blocking issues. It integrates seamlessly with the Health Triage Bot to provide comprehensive visibility into system health and outstanding issues.

## ✨ Features

### 1. **Automated Issue Monitoring**
- Monitors GitHub issues with blocking labels (`deployment-blocker`, `critical`, `bug`)
- Real-time detection of new blocking issues
- Configurable polling intervals

### 2. **Intelligent Triage**
- Rule-based issue classification
- Priority assignment (1-3 scale)
- Automatic labeling system
- Stale issue detection and closure

### 3. **Automated Fix Patterns**
- **Dependency Updates**: Auto-creates PRs for `npm audit` fixes
- **Configuration Errors**: Provides guided resolution steps
- **Deployment Issues**: Integrates with Health Bot for diagnostics
- **Merge Conflicts**: Links to conflict resolution tools

### 4. **Escalation System**
- Critical issues automatically escalated to maintainers
- Detailed escalation reports with context
- Integration with emergency response protocols

### 5. **Health Bot Integration**
- Real-time system health monitoring
- Deployment health checks
- Emergency response triggering
- Comprehensive health dashboard

### 6. **Actionable Reporting**
- Detailed triage summaries
- Auto-fix success/failure tracking
- Health status integration
- Historical action logs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- GitHub Personal Access Token with repo permissions
- Environment variables configured

### Installation

```bash
# Install dependencies (if not already installed)
npm install @octokit/rest axios

# Set environment variables
export GITHUB_TOKEN="your_github_token_here"
```

### Basic Usage

```bash
# Run a single triage cycle
node swarm-bot-automation.js

# Enable continuous monitoring (15-minute intervals)
node swarm-bot-automation.js --monitor

# Custom monitoring interval (30 minutes)
node swarm-bot-automation.js --monitor --interval=30
```

### Integration with Scripts

```javascript
const { SwarmBotAutomation } = require('./swarm-bot-automation.js');

const swarmBot = new SwarmBotAutomation();

// Run once
const report = await swarmBot.run();

// Start continuous monitoring
await swarmBot.startMonitoring(15); // 15-minute intervals
```

## 📋 Configuration

### Default Configuration

```javascript
{
    owner: 'wiredchaos',
    repo: 'wired-chaos',
    labels: {
        blocking: ['deployment-blocker', 'critical', 'bug'],
        resolved: 'swarm-resolved',
        escalated: 'swarm-escalated',
        autofix: 'swarm-autofix'
    }
}
```

### Custom Configuration

```javascript
const swarmBot = new SwarmBotAutomation({
    owner: 'your-org',
    repo: 'your-repo',
    labels: {
        blocking: ['blocker', 'urgent'],
        resolved: 'bot-resolved',
        escalated: 'needs-review',
        autofix: 'auto-fixed'
    }
});
```

## 🔧 Auto-Fix Patterns

### 1. Dependency Updates

**Pattern:** `dependency.*outdated|update.*dependency|npm.*audit`

**Action:**
- Creates a new branch: `swarm-bot/fix-dependencies-{issue-number}`
- Prepares PR with `npm audit fix` changes
- Links to original issue

**Auto-fixable:** ✅ Yes

### 2. Configuration Errors

**Pattern:** `config.*error|configuration.*invalid|env.*missing`

**Action:**
- Posts diagnostic comment with suggested fixes
- Links to configuration documentation
- Provides validation commands

**Auto-fixable:** ⚠️ Requires manual intervention

### 3. Deployment Errors

**Pattern:** `deploy.*fail|cloudflare.*error|worker.*error`

**Action:**
- Runs Health Bot deployment diagnostics
- Posts health check results
- Triggers emergency response if critical

**Auto-fixable:** ✅ Partial (diagnostics)

### 4. Merge Conflicts

**Pattern:** `merge.*conflict|conflict.*resolution|rebase.*error`

**Action:**
- Links to VSCode EMERGENT conflict resolver
- Provides conflict resolution script command
- Suggests manual resolution if complex

**Auto-fixable:** ✅ With tools

### 5. Build Failures

**Pattern:** `build.*fail|compilation.*error|typescript.*error`

**Action:**
- Escalates to maintainers immediately
- Logs issue details
- No auto-fix (requires code changes)

**Auto-fixable:** ❌ No (escalates)

### 6. Test Failures

**Pattern:** `test.*fail|spec.*fail|assertion.*error`

**Action:**
- Escalates to maintainers
- Requires code review
- No auto-fix

**Auto-fixable:** ❌ No (escalates)

## 📊 Triage Rules

### Critical Priority (Level 1)

**Condition:** Issue has `critical` label

**Actions:**
- Immediate escalation
- Assigns to @maintainers
- Creates escalation comment
- Adds `swarm-escalated` label

### Deployment Blocker (Level 1)

**Condition:** Issue has `deployment-blocker` label

**Actions:**
- Immediate escalation
- Assigns to @deployment-team
- High priority handling
- Emergency response trigger if needed

### High Priority Bug (Level 2)

**Condition:** Issue has `bug` label and is >24 hours old

**Actions:**
- Escalation to @bug-squad
- Adds priority labels
- Attempts auto-fix if pattern matches

### Stale Issues (Level 3)

**Condition:** Issue hasn't been updated in 30+ days

**Actions:**
- Posts closure notice
- Closes issue automatically
- Adds `swarm-resolved` label

## 🔗 Health Bot Integration

The SWARM Bot seamlessly integrates with the Health Triage Bot for comprehensive monitoring:

### Health Metrics

```javascript
{
    overallHealth: 98.7,        // System health percentage
    alerts: 2,                  // Active alerts
    recommendations: [...]      // Actionable recommendations
}
```

### Emergency Response

When deployment health drops below 80%:
- Triggers Health Bot emergency response
- Posts health diagnostics to issue
- Escalates to Level 3 Critical if <70%

### Dashboard Access

```javascript
const healthDashboard = await swarmBot.healthBot.generateHealthDashboard();
```

## 📈 Reporting

### Report Structure

```javascript
{
    timestamp: "2024-01-01T00:00:00Z",
    summary: {
        totalBlockingIssues: 5,
        resolved: 2,
        escalated: 2,
        autoFixAttempted: 3
    },
    issues: [
        {
            issueNumber: 123,
            title: "Deployment failed...",
            priority: 1,
            actions: ["Auto-fix pattern: fixDeploymentIssue"],
            autoFixAttempted: true,
            escalated: true,
            resolved: false
        }
    ],
    healthStatus: {
        overallHealth: 98.7,
        alerts: 2,
        recommendations: [...]
    },
    actionLog: [...]
}
```

### Console Output

```
🤖 [SWARM-BOT] Starting deployment blocker automation...
============================================================
📊 Found 5 blocking issues

🔍 [SWARM-BOT] Triaging issue #123: Deployment failed
  ✅ Matched rule: deploymentBlocker
  🔧 Auto-fix pattern matched: fixDeploymentIssue
  🚨 [SWARM-BOT] Escalating issue #123

============================================================
📊 SWARM BOT REPORT SUMMARY
============================================================
Total Blocking Issues: 5
Resolved: 2
Escalated: 2
Auto-fix Attempted: 3

Overall System Health: 98.7%
Active Alerts: 2
============================================================
```

## 🔄 Workflow Integration

### GitHub Actions

Create `.github/workflows/swarm-bot.yml`:

```yaml
name: SWARM Bot - Deployment Blocker Automation

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  swarm-bot-triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run SWARM Bot
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node swarm-bot-automation.js
```

### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run swarm-bot.yml

# Via GitHub Actions UI
# Navigate to Actions → SWARM Bot → Run workflow
```

## 🛠️ Development

### Extending Auto-Fix Patterns

Add new patterns to `initAutoFixPatterns()`:

```javascript
customPattern: {
    pattern: /your.*regex|pattern/i,
    action: 'yourCustomAction',
    autoFixable: true
}
```

Then implement the handler in `attemptAutoFix()`:

```javascript
case 'yourCustomAction':
    return await this.yourCustomFixMethod(issue);
```

### Custom Triage Rules

Add rules to `initTriageRules()`:

```javascript
customRule: {
    condition: (issue) => {
        // Your condition logic
        return issue.labels.some(l => l.name === 'custom-label');
    },
    priority: 2,
    assignee: '@custom-team',
    escalate: true
}
```

### Testing

```javascript
// Test with specific issue
const swarmBot = new SwarmBotAutomation();
const issue = await swarmBot.octokit.issues.get({
    owner: 'wiredchaos',
    repo: 'wired-chaos',
    issue_number: 123
});
const result = await swarmBot.triageIssue(issue.data);
console.log(result);
```

## 📚 API Reference

### SwarmBotAutomation

**Constructor:**
```javascript
new SwarmBotAutomation(config?)
```

**Methods:**

- `monitorBlockingIssues()` - Fetch all blocking issues
- `triageIssue(issue)` - Triage a single issue
- `attemptAutoFix(issue, pattern)` - Attempt automated fix
- `escalateIssue(issue, triageResult)` - Escalate to maintainers
- `generateReport()` - Generate actionable report
- `run()` - Execute single triage cycle
- `startMonitoring(intervalMinutes)` - Start continuous monitoring

## 🔐 Security

### GitHub Token Permissions

Required permissions:
- `repo` - Full repository access
- `issues` - Read/write issues
- `pull_requests` - Create PRs

### Environment Variables

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optional)
```

### Best Practices

- Use GitHub App tokens for production
- Rotate tokens regularly
- Limit token scope to specific repositories
- Store tokens in GitHub Secrets, never in code

## 🤝 Integration with Existing Tools

### VSCode EMERGENT Extension

SWARM Bot links to EMERGENT commands:
- Conflict resolution
- Deployment management
- Smoke tests

### Health Triage Bot

Shares monitoring infrastructure:
- System health metrics
- Emergency response protocols
- Alert management

### GitHub Actions

Triggered by or triggers:
- Auto-merge workflows
- Deployment pipelines
- Emergency response actions

## 📖 Examples

### Example 1: Monitor and Report

```javascript
const { SwarmBotAutomation } = require('./swarm-bot-automation.js');

const swarmBot = new SwarmBotAutomation();
const report = await swarmBot.run();

console.log(`Resolved ${report.summary.resolved} of ${report.summary.totalBlockingIssues} issues`);
```

### Example 2: Custom Configuration

```javascript
const swarmBot = new SwarmBotAutomation({
    labels: {
        blocking: ['p0', 'blocker', 'regression'],
        resolved: 'auto-resolved',
        escalated: 'needs-attention',
        autofix: 'bot-fixed'
    }
});
```

### Example 3: Continuous Monitoring

```javascript
// Monitor every 10 minutes
await swarmBot.startMonitoring(10);
```

## 🐛 Troubleshooting

### Common Issues

**Error: `GITHUB_TOKEN not set`**
```bash
export GITHUB_TOKEN="your_token_here"
```

**Error: `403 Forbidden`**
- Check token permissions
- Verify repository access
- Check rate limits

**No issues found**
- Verify label names match configuration
- Check repository name and owner
- Ensure issues exist with blocking labels

### Debug Mode

Enable verbose logging:

```javascript
const swarmBot = new SwarmBotAutomation({ debug: true });
```

## 📝 Changelog

### v1.0.0 (Initial Release)
- ✅ Automated issue monitoring
- ✅ Intelligent triage system
- ✅ Auto-fix patterns (6 types)
- ✅ Health Bot integration
- ✅ Actionable reporting
- ✅ Escalation system
- ✅ Continuous monitoring mode

## 🛣️ Roadmap

- [ ] PR auto-creation for all fix types
- [ ] Machine learning for pattern detection
- [ ] Slack integration
- [ ] Custom webhook notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-repository support
- [ ] Team assignment automation

## 🤝 Contributing

Contributions welcome! Areas to improve:
- Additional auto-fix patterns
- Enhanced triage rules
- Better reporting formats
- Integration with more tools

## 📄 License

Part of the WIRED CHAOS ecosystem - MIT License

---

**Built with** ❤️ **by the WIRED CHAOS team**

**Powered by**: GitHub Octokit • Health Triage Bot • Node.js

**Related Documentation:**
- [Health Bot Integration](./HEALTH_BOT_INTEGRATION_SUMMARY.md)
- [VSCode EMERGENT](./EMERGENT_QUICKSTART.md)
- [Automation README](./AUTOMATION_README.md)
