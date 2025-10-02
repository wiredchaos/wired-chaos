# 🚀 SWARM General - Quick Start Guide

## What is SWARM General?

**SWARM General** is a no-touch infrastructure automation workflow that automatically deploys Cloudflare Workers with built-in health monitoring and auto-recovery. It's part of the **WIRED CHAOS HEALTH** triage swarm.

## 🎯 Key Features

- ✅ **Automatic deployment** on code changes
- ✅ **Health monitoring** before and after deployment
- ✅ **Auto-recovery** from failures
- ✅ **Resilient patterns** with retry logic
- ✅ **SWARM Bot integration** for triage
- ✅ **Extensible architecture** for future bots

## ⚡ Quick Start

### 1. Prerequisites

Ensure you have GitHub Secrets configured:

```bash
# Required secrets
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### 2. Automatic Deployment

The workflow triggers automatically when you:

```bash
# Push changes to worker files
git add src/index.js
git commit -m "Update worker"
git push origin main
```

**Monitored paths:**
- `src/**` - Worker source code
- `workers/**` - Worker configurations
- `wrangler.toml` - Worker manifest
- `backend/**` - Backend services

### 3. Manual Deployment

Trigger deployment manually:

```bash
# Using GitHub CLI
gh workflow run swarm-general.yml

# With options
gh workflow run swarm-general.yml \
  -f deployment_type=auto \
  -f environment=production
```

**Deployment Types:**
- `auto` - Standard deployment with health checks (default)
- `force` - Skip health checks and force deploy
- `health-check-only` - Only run health checks

### 4. Monitor Status

```bash
# Check workflow status
gh run list --workflow=swarm-general.yml

# View latest run
gh run view

# Watch live
gh run watch
```

## 📊 What Happens During Deployment?

```
┌─────────────────────────────────────────────┐
│  1. Pre-Deployment Health Check 🏥          │
│     └─ Check current worker status          │
│     └─ Validate system health               │
│     └─ Decide if deployment should proceed  │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  2. Deploy Cloudflare Worker 🚀             │
│     └─ Validate configuration                │
│     └─ Deploy to Cloudflare Edge            │
│     └─ Wait for propagation                 │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  3. Post-Deployment Verification 🔍         │
│     └─ Test multiple endpoints              │
│     └─ Retry with exponential backoff       │
│     └─ Calculate health score               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  4. Auto-Recovery (if needed) 🔧            │
│     └─ Run SWARM Bot triage                 │
│     └─ Attempt automatic fixes              │
│     └─ Trigger emergency workflows          │
│     └─ Create recovery issues               │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│  5. Integration Report 📊                   │
│     └─ Health summary                       │
│     └─ Deployment status                    │
│     └─ Next steps                           │
└─────────────────────────────────────────────┘
```

## 🏥 Health Monitoring

### Endpoints Tested

The workflow tests these endpoints with retry logic:

1. **Primary Health:** `https://www.wiredchaos.xyz/health`
2. **Worker Direct:** `https://wired-chaos-worker.wiredchaos.workers.dev/health`

### Retry Logic (Resilient Pattern)

Inspired by the 404 auto-redirect pattern:

```javascript
for (attempt = 1; attempt <= 3; attempt++) {
  // Try endpoint
  if (success) break;
  
  // Wait with exponential backoff
  sleep(attempt * 2); // 2s, 4s, 6s
}
```

### Health Scores

- **100% - 80%:** ✅ Healthy - No action needed
- **79% - 50%:** ⚠️ Degraded - Monitoring active
- **49% - 0%:** ❌ Critical - Auto-recovery triggered

## 🤖 Auto-Recovery

When health score drops below 80%, the workflow automatically:

1. **Runs SWARM Bot triage** to analyze issues
2. **Attempts automatic fixes** based on issue patterns
3. **Triggers emergency deployment** if critical (< 50%)
4. **Creates GitHub issue** with recovery status

### Emergency Response Levels

| Level | Score | Action |
|-------|-------|--------|
| **LEVEL 1** | 80-79% | Auto-retry with logging |
| **LEVEL 2** | 79-50% | Component restart + alert |
| **LEVEL 3** | < 50% | Emergency deploy + team alert |

## 📅 Scheduled Health Checks

The workflow runs health checks every 30 minutes:

```yaml
schedule:
  - cron: '*/30 * * * *'
```

This ensures:
- Continuous monitoring
- Early detection of issues
- Proactive health maintenance

## 🔗 Integration with Existing Systems

### SWARM Bot

The workflow integrates with `swarm-bot-automation.js`:

```bash
# Run SWARM Bot manually
npm run swarm-bot

# Run with monitoring
npm run swarm-bot:monitor
```

### Health Bot

Enhanced with worker-specific monitoring:

```bash
# Run Health Bot
npm run health-bot
```

### Emergency Workflows

Auto-triggers these workflows when needed:
- `emergency-production.yml` - Emergency redeploy
- `deploy-worker.yml` - Standard worker deployment

## 📊 Viewing Reports

### GitHub Actions Summary

Each workflow run shows:

```
📊 SWARM General - Infrastructure Health Report

Stage              Status      Score
─────────────────────────────────────
Pre-Deployment     healthy     100%
Deployment         ✅ Success   100%
Post-Deployment    ✅ Healthy   95%

Overall Health: ✅ Healthy
Auto-Recovery: ⏭️ Not Needed
No-Touch Infra: ✅ Active
```

### Artifacts

Download detailed reports:

1. Go to workflow run page
2. Scroll to "Artifacts" section
3. Download:
   - `pre-deployment-health-report-{id}`
   - `auto-recovery-log-{id}`

### GitHub Issues

Critical failures auto-create issues:

**Title:** 🚨 Worker Deployment Health Failure - Auto-Recovery Initiated

**Labels:** `swarm-bot`, `deployment-health`, `auto-recovery`, `critical`

**Auto-closes** when health is restored.

## 🛠️ Common Scenarios

### Scenario 1: First Time Setup

```bash
# 1. Configure secrets in GitHub
# Settings > Secrets > New repository secret

# 2. Commit worker code
git add src/index.js wrangler.toml
git commit -m "Initial worker"
git push

# 3. Monitor deployment
gh run watch
```

### Scenario 2: Update Worker

```bash
# 1. Make changes
vim src/index.js

# 2. Commit and push
git add src/index.js
git commit -m "Add new endpoint"
git push

# Workflow triggers automatically!
```

### Scenario 3: Health Check Failed

```bash
# 1. Check workflow logs
gh run view --log

# 2. Review auto-recovery issue
gh issue list --label "auto-recovery"

# 3. Monitor recovery
gh run watch

# Auto-recovery handles it!
```

### Scenario 4: Manual Health Check

```bash
# Trigger health check only
gh workflow run swarm-general.yml \
  -f deployment_type=health-check-only
```

### Scenario 5: Emergency Deployment

```bash
# Force deploy (skip health checks)
gh workflow run swarm-general.yml \
  -f deployment_type=force \
  -f environment=production
```

## 🔍 Troubleshooting

### Issue: Workflow not triggering

**Check:**
```bash
# Verify workflow exists
gh workflow list

# Check if enabled
gh workflow view swarm-general.yml
```

**Solution:**
- Ensure file is in `.github/workflows/`
- Check branch name matches trigger
- Verify paths in commit match trigger

### Issue: Deployment fails

**Check:**
```bash
# View logs
gh run view --log

# Check secrets
gh secret list
```

**Solution:**
- Verify Cloudflare credentials
- Check wrangler.toml syntax
- Auto-recovery should handle it

### Issue: Health checks fail

**Check:**
```bash
# Test locally
npm run health-bot

# Test endpoint manually
curl https://www.wiredchaos.xyz/health
```

**Solution:**
- Check endpoint accessibility
- Verify worker is deployed
- Review health bot configuration

## 📚 Learn More

- **[Full Documentation](./SWARM_GENERAL_GUIDE.md)** - Complete guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment overview
- **[SWARM_BOT_AUTOMATION.md](./SWARM_BOT_AUTOMATION.md)** - SWARM Bot details
- **[Health Bot Integration](./HEALTH_BOT_INTEGRATION_SUMMARY.md)** - Health monitoring

## 🎯 Quick Commands Reference

```bash
# View workflow status
gh run list --workflow=swarm-general.yml

# Trigger deployment
gh workflow run swarm-general.yml

# Watch deployment
gh run watch

# View logs
gh run view --log

# Check health locally
npm run health-bot

# Run SWARM Bot
npm run swarm-bot

# List recent deployments
gh run list --workflow=swarm-general.yml --limit 5
```

## 🎨 Extensibility

The architecture supports adding new infrastructure checks:

### Add New Health Endpoint

Edit `health-bot-vscode-integration.js`:

```javascript
async monitorWorkerHealth() {
  const workerEndpoints = [
    // Add your endpoint
    { url: 'https://api.example.com/health', name: 'My Service' }
  ];
}
```

### Add New Auto-Fix Pattern

Edit `swarm-bot-automation.js`:

```javascript
initAutoFixPatterns() {
  return {
    myPattern: {
      pattern: /my-error/i,
      action: 'myFixAction',
      autoFixable: true
    }
  };
}
```

### Add New Swarm Bot

Create new file `automation/my-bot.js` and add to workflow:

```yaml
my-health-check:
  name: 🔍 My Health Check
  runs-on: ubuntu-latest
  steps:
    - name: Run My Bot
      run: node automation/my-bot.js
```

## 💡 Best Practices

1. **Test locally first:** Run `npm run health-bot` before pushing
2. **Use staging:** Test in staging environment before production
3. **Monitor regularly:** Check workflow runs periodically
4. **Review artifacts:** Download and review health reports
5. **Keep docs updated:** Update documentation for custom changes

## 🚀 Next Steps

1. ✅ Configure GitHub secrets
2. ✅ Commit worker changes
3. ✅ Monitor first deployment
4. ✅ Review health reports
5. ✅ Customize for your needs

---

**WIRED CHAOS** - No-Touch Infrastructure Automation 🤖⚡

**Questions?** Check the [full documentation](./SWARM_GENERAL_GUIDE.md) or create an issue.
