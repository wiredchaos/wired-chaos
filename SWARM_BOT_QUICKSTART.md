# 🤖 SWARM Bot Quick Start Guide

> Get started with SWARM Bot automation in under 5 minutes

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

```bash
export GITHUB_TOKEN="your_github_token_here"
```

Or create a `.env` file:

```bash
echo "GITHUB_TOKEN=your_token_here" > .env
```

### 3. Run SWARM Bot

#### Single Run (One-time triage)
```bash
npm run swarm-bot
```

#### Continuous Monitoring
```bash
npm run swarm-bot:monitor
```

#### Test Mode
```bash
npm test
# or
npm run test:swarm-bot
```

## 📊 What It Does

### Automatically Monitors Issues With:
- 🚨 `deployment-blocker` label
- ⚠️ `critical` label  
- 🐛 `bug` label

### Auto-Fixes:
- ✅ Dependency updates (creates PRs)
- ✅ Configuration errors (provides guidance)
- ✅ Deployment diagnostics (runs health checks)
- ✅ Merge conflict resolution (links to tools)

### Escalates:
- 🚨 Critical issues to maintainers
- ⏰ Issues open >24 hours
- ❌ Failed auto-fix attempts

### Closes:
- 📦 Stale issues (>30 days inactive)

## 🎯 Example Output

```bash
🤖 [SWARM-BOT] Starting deployment blocker automation...
============================================================
📊 Found 3 blocking issues

🔍 [SWARM-BOT] Triaging issue #123: npm audit vulnerabilities
  ✅ Matched rule: deploymentBlocker
  🔧 Auto-fix pattern matched: updateDependencies
  📦 Creating PR for dependency updates...

============================================================
📊 SWARM BOT REPORT SUMMARY
============================================================
Total Blocking Issues: 3
Resolved: 1
Escalated: 1
Auto-fix Attempted: 2

Overall System Health: 98.7%
Active Alerts: 1
============================================================
```

## 🔗 Integration Examples

### With GitHub Actions

Automatically triggered every 15 minutes:

```yaml
# .github/workflows/swarm-bot.yml already configured!
# Just push and it works 🎉
```

### With VSCode EMERGENT Extension

```javascript
// Use SWARM Bot alongside EMERGENT automation
const { SwarmBotAutomation } = require('./swarm-bot-automation.js');

const swarmBot = new SwarmBotAutomation();
await swarmBot.run();
```

### With Health Triage Bot

```javascript
// Automatic integration - no setup needed!
// SWARM Bot uses Health Bot for diagnostics
```

## 📚 Next Steps

1. **Read Full Documentation**: [SWARM_BOT_AUTOMATION.md](./SWARM_BOT_AUTOMATION.md)
2. **Configure Workflows**: [.github/workflows/swarm-bot.yml](./.github/workflows/swarm-bot.yml)
3. **Health Bot Integration**: [HEALTH_BOT_INTEGRATION_SUMMARY.md](./HEALTH_BOT_INTEGRATION_SUMMARY.md)

## 🛠️ Troubleshooting

### Issue: "GITHUB_TOKEN not set"

**Solution:**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

### Issue: "Cannot find module @octokit/rest"

**Solution:**
```bash
npm install
```

### Issue: "403 Forbidden"

**Solution:**
- Check token has `repo` permissions
- Verify repository access
- Check rate limits

## 🎨 Customization

### Add Custom Auto-Fix Pattern

Edit `swarm-bot-automation.js`:

```javascript
// In initAutoFixPatterns()
myCustomPattern: {
    pattern: /my.*pattern/i,
    action: 'myCustomAction',
    autoFixable: true
}

// In attemptAutoFix()
case 'myCustomAction':
    return await this.myCustomFix(issue);
```

### Add Custom Triage Rule

```javascript
// In initTriageRules()
myCustomRule: {
    condition: (issue) => {
        return issue.title.includes('urgent');
    },
    priority: 1,
    escalate: true
}
```

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/wiredchaos/wired-chaos/issues)
- **Docs**: [Full Documentation](./SWARM_BOT_AUTOMATION.md)
- **Health Bot**: [Health Integration](./HEALTH_BOT_INTEGRATION_SUMMARY.md)

---

**Built with** ❤️ **by the WIRED CHAOS team**

**Get up and running in 5 minutes!** 🚀
