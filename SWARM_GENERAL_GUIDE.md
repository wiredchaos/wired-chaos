# 🤖 SWARM General - Infrastructure Health & Deployment Guide

## 📋 Overview

The **SWARM General** workflow is a comprehensive no-touch infrastructure automation system designed to automate Cloudflare Workers deployment with integrated health triage. It provides self-healing deployment patterns, automated recovery, and extensible architecture for future swarm bots.

## 🎯 Purpose

This workflow integrates into the **WIRED CHAOS HEALTH** triage swarm to:

1. **Automate Cloudflare Workers deployment** with zero manual intervention
2. **Monitor deployment health** in real-time with multi-endpoint verification
3. **Auto-recover from failures** using resilient patterns inspired by the 404 auto-redirect system
4. **Triage and escalate issues** automatically through the SWARM Bot system
5. **Provide extensibility** for other infrastructure health checks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SWARM General Workflow                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ Pre-Deployment  │ ───> │     Deploy      │              │
│  │  Health Check   │      │ Cloudflare      │              │
│  └─────────────────┘      │    Worker       │              │
│          │                 └─────────────────┘              │
│          │                         │                         │
│          v                         v                         │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ Post-Deployment │ ───> │ Auto-Recovery   │              │
│  │   Verification  │      │   & Triage      │              │
│  └─────────────────┘      └─────────────────┘              │
│          │                         │                         │
│          └────────────┬────────────┘                         │
│                       v                                      │
│              ┌─────────────────┐                            │
│              │   Integration   │                            │
│              │  Health Report  │                            │
│              └─────────────────┘                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Triggers

The workflow automatically triggers on:

### 1. Code Changes (Push/PR)
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'workers/**'
      - 'wrangler.toml'
      - 'backend/**'
```

### 2. Scheduled Health Checks
```yaml
schedule:
  - cron: '*/30 * * * *'  # Every 30 minutes
```

### 3. Manual Dispatch
```bash
gh workflow run swarm-general.yml \
  -f deployment_type=auto \
  -f environment=production
```

## 📊 Workflow Jobs

### Job 1: Pre-Deployment Health Check 🏥

**Purpose:** Validate system health before deployment

**Actions:**
- Run Health Bot comprehensive diagnostics
- Check current worker endpoints
- Verify Cloudflare Edge status
- Determine deployment readiness

**Outputs:**
- `health_status`: Current system health
- `health_score`: Numerical health score (0-100)
- `should_deploy`: Boolean deployment decision

**Health Criteria:**
- ✅ HTTP 200: Healthy, proceed
- ⚠️ HTTP 4xx/5xx: Degraded but deployable
- ❌ Critical failure: Block deployment

### Job 2: Deploy Cloudflare Worker 🚀

**Purpose:** Deploy worker to Cloudflare Edge

**Actions:**
1. Validate worker configuration (wrangler.toml)
2. Deploy using cloudflare/wrangler-action@v3
3. Wait for edge propagation (10s)
4. Log deployment metadata

**Configuration:**
```yaml
uses: cloudflare/wrangler-action@v3
with:
  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  command: deploy --env production
```

**Secrets Required:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Job 3: Post-Deployment Health Verification 🔍

**Purpose:** Verify deployment success with resilient patterns

**Key Features:**

#### Multi-Endpoint Testing
Tests multiple worker endpoints to ensure deployment success:
- `https://www.wiredchaos.xyz/health`
- `https://wired-chaos-worker.wiredchaos.workers.dev/health`

#### Resilient Pattern (Inspired by 404.html)
Implements retry logic with exponential backoff:
```javascript
for (let attempt = 1; attempt <= 3; attempt++) {
  // Try endpoint
  if (success) break;
  
  // Wait with exponential backoff
  sleep(attempt * 2);
}
```

This pattern mirrors the auto-redirect resilience in `public/404.html` which provides self-healing navigation.

#### Health Scoring
```
Health Score = (Passed Endpoints / Total Endpoints) * 100

✅ 80-100%: Healthy
⚠️ 50-79%: Degraded
❌ 0-49%: Critical
```

### Job 4: Auto-Recovery & Triage 🔧

**Purpose:** Automatically recover from deployment failures

**Triggers When:**
- Post-deployment health score < 80%

**Actions:**

1. **SWARM Bot Triage**
   ```bash
   node swarm-bot-automation.js
   ```
   - Analyzes deployment issues
   - Identifies fix patterns
   - Logs triage results

2. **Auto-Fix Attempts**
   - Health score < 50%: Trigger emergency redeploy
   - Health score 50-79%: Monitor and alert

3. **Emergency Workflow Trigger**
   ```bash
   gh workflow run emergency-production.yml \
     -f reason="Auto-recovery: Worker health failed"
   ```

4. **Issue Creation**
   - Creates GitHub issue with health status
   - Tags: `swarm-bot`, `deployment-health`, `auto-recovery`, `critical`
   - Includes auto-close condition

### Job 5: Integration Health Report 📊

**Purpose:** Provide comprehensive health summary

**Outputs:**
- Pre-deployment health status
- Deployment success/failure
- Post-deployment verification
- Auto-recovery status
- Overall system health

## 🔗 Integration with WIRED CHAOS HEALTH Triage Swarm

### SWARM Bot Integration

The workflow integrates with existing SWARM Bot automation:

```javascript
// swarm-bot-automation.js
async autoFixDeployment(issue) {
  const deploymentHealth = await this.healthBot.monitorDeploymentHealth();
  
  if (deploymentHealth.overallScore < 80) {
    // Alert and triage
  }
  
  if (deploymentHealth.overallScore < 70) {
    // Trigger emergency response
    await this.healthBot.triggerEmergencyResponse('LEVEL_3_CRITICAL');
  }
}
```

### Health Bot Integration

Enhanced `health-bot-vscode-integration.js` with worker-specific monitoring:

```javascript
// New method: monitorWorkerHealth()
async monitorWorkerHealth() {
  // Test worker endpoints with retry logic
  // Calculate resilience score
  // Return health status
}
```

### Existing Workflows

Integrates with:
- `swarm-bot.yml` - Main SWARM Bot triage system
- `deploy-worker.yml` - Standard worker deployment
- `emergency-production.yml` - Emergency recovery
- `deployment-orchestration.yml` - Full deployment orchestration

## 🎨 Resilient Patterns from 404 Documentation

The workflow implements resilient patterns inspired by `public/404.html`:

### 1. Auto-Redirect Pattern
404.html redirects users automatically after 5 seconds:
```javascript
setTimeout(() => {
  window.location.href = '/';
}, 5000);
```

**SWARM General Implementation:**
```javascript
// Retry with exponential backoff
for (attempt = 1; attempt <= 3; attempt++) {
  if (success) break;
  sleep(attempt * 2); // 2s, 4s, 6s
}
```

### 2. Self-Healing Navigation
404 page provides fallback navigation even on errors.

**SWARM General Implementation:**
- Multiple health check endpoints
- Auto-recovery workflows
- Emergency deployment fallback

### 3. User-Friendly Error Handling
404 page shows clear status with next steps.

**SWARM General Implementation:**
- Detailed health reports
- GitHub issue with recovery steps
- Automatic escalation

## 🔧 Extensibility

### Adding New Swarm Bots

The architecture supports adding new infrastructure health checks:

```yaml
# Example: Add database health check
db-health-check:
  name: 🗄️ Database Health Check
  runs-on: ubuntu-latest
  steps:
    - name: Check Database
      run: |
        # Your database health check logic
        node automation/db-health-bot.js
```

### Adding New Health Endpoints

Update `health-bot-vscode-integration.js`:

```javascript
async monitorWorkerHealth() {
  const workerEndpoints = [
    // Existing endpoints...
    { url: 'https://api.example.com/health', name: 'New Endpoint' }
  ];
  // Rest of monitoring logic...
}
```

### Adding New Auto-Recovery Patterns

Update `swarm-bot-automation.js`:

```javascript
initAutoFixPatterns() {
  return {
    // Existing patterns...
    newPattern: {
      pattern: /your-error-pattern/i,
      action: 'yourFixAction',
      autoFixable: true
    }
  };
}
```

## 📚 Usage Examples

### Example 1: Manual Deployment with Health Check Only

```bash
gh workflow run swarm-general.yml \
  -f deployment_type=health-check-only \
  -f environment=production
```

### Example 2: Force Deployment (Skip Health Checks)

```bash
gh workflow run swarm-general.yml \
  -f deployment_type=force \
  -f environment=production
```

### Example 3: Monitor Workflow from CLI

```bash
# Trigger workflow
gh workflow run swarm-general.yml

# Watch status
gh run watch

# View logs
gh run view --log
```

### Example 4: Check Health Locally

```bash
# Run Health Bot
npm run health-bot

# Run SWARM Bot
npm run swarm-bot

# Run with monitoring
npm run swarm-bot:monitor
```

## 🔍 Monitoring & Alerts

### GitHub Actions Summary

Each workflow run provides a comprehensive summary:

```
📊 SWARM General - Infrastructure Health Report

| Stage            | Status    | Score |
|------------------|-----------|-------|
| Pre-Deployment   | healthy   | 100%  |
| Deployment       | ✅ Success | 100%  |
| Post-Deployment  | ✅ Healthy | 95%   |

Overall Health: ✅ Healthy
Auto-Recovery: ⏭️ Not Needed
No-Touch Infra: ✅ Active
```

### Artifacts

Each run generates artifacts:
- `pre-deployment-health-report-{id}` - Pre-deployment diagnostics
- `auto-recovery-log-{id}` - Recovery attempt logs

### GitHub Issues

Auto-created for critical failures:
- Title: "🚨 Worker Deployment Health Failure - Auto-Recovery Initiated"
- Labels: `swarm-bot`, `deployment-health`, `auto-recovery`, `critical`
- Auto-closes when health restored

## 🚨 Emergency Response Levels

Inherited from Health Bot emergency protocols:

### Level 1: WARNING
- **Trigger:** Single component failure
- **Action:** Auto-retry with backoff
- **Notification:** Status log

### Level 2: ALERT
- **Trigger:** Multiple failures
- **Action:** Component restart, alternative paths
- **Notification:** VSCode + Discord

### Level 3: CRITICAL
- **Trigger:** System-wide failure
- **Action:** Emergency deployment, manual intervention
- **Notification:** Urgent alert + team notification + GitHub issue

## 📖 Configuration

### Workflow Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `deployment_type` | choice | `auto` | Deployment strategy |
| `environment` | choice | `production` | Target environment |

### Environment Variables

Configure in GitHub Secrets:
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `GITHUB_TOKEN` - Provided automatically

### Health Thresholds

Configurable in `health-bot-vscode-integration.js`:

```javascript
healthThresholds: {
  critical: 70,  // Below this: emergency
  warning: 85,   // Below this: alert
  good: 95       // Above this: healthy
}
```

## 🎯 Success Metrics

### Key Performance Indicators

- **Deployment Success Rate:** Target 98%+
- **Health Check Pass Rate:** Target 95%+
- **Auto-Recovery Success:** Target 90%+
- **Mean Time to Recovery (MTTR):** Target < 5 minutes

### Health Scoring

```
Overall Health = Average of:
- Pre-deployment health (0-100)
- Deployment success (0 or 100)
- Post-deployment health (0-100)
- Resilience rate (0-100)
```

## 🔗 Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Main deployment guide
- [SWARM_BOT_AUTOMATION.md](./SWARM_BOT_AUTOMATION.md) - SWARM Bot details
- [HEALTH_BOT_INTEGRATION_SUMMARY.md](./HEALTH_BOT_INTEGRATION_SUMMARY.md) - Health Bot integration
- [DEPLOYMENT_PHASES.md](./DEPLOYMENT_PHASES.md) - Full deployment plan
- [NO_TOUCH_AUTOMATION_SUMMARY.md](./NO_TOUCH_AUTOMATION_SUMMARY.md) - No-touch philosophy

## 🚀 Quick Start

### 1. Enable Workflow

Ensure GitHub Actions is enabled for your repository.

### 2. Configure Secrets

Add required secrets in repository settings:
```bash
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### 3. First Deployment

```bash
# Manual trigger
gh workflow run swarm-general.yml

# Or commit changes to trigger automatically
git commit -m "Update worker"
git push origin main
```

### 4. Monitor Health

```bash
# Check workflow status
gh run list --workflow=swarm-general.yml

# View latest run
gh run view
```

## 🛠️ Troubleshooting

### Issue: Workflow Not Triggering

**Solution:**
1. Check workflow file syntax: `gh workflow view swarm-general.yml`
2. Verify file paths in trigger conditions
3. Check branch name matches trigger

### Issue: Health Checks Failing

**Solution:**
1. Run local health check: `npm run health-bot`
2. Check endpoint accessibility
3. Review health bot logs in workflow artifacts

### Issue: Deployment Failed

**Solution:**
1. Check Cloudflare credentials
2. Verify wrangler.toml configuration
3. Review deployment logs
4. Auto-recovery should trigger automatically

### Issue: Auto-Recovery Not Working

**Solution:**
1. Check SWARM Bot integration
2. Verify emergency workflow exists
3. Review auto-recovery logs in artifacts
4. Check GitHub token permissions

## 🔮 Future Enhancements

Planned expansions for the SWARM General system:

1. **Multi-Cloud Support**
   - AWS Lambda health checks
   - Azure Functions integration
   - Google Cloud Functions monitoring

2. **Advanced Analytics**
   - Historical health trending
   - Predictive failure detection
   - Performance optimization suggestions

3. **Enhanced Auto-Recovery**
   - ML-based pattern recognition
   - Intelligent rollback strategies
   - Cross-workflow coordination

4. **Additional Swarm Bots**
   - Database health bot
   - CDN health bot
   - API gateway health bot
   - Frontend deployment bot

---

**WIRED CHAOS** - No-Touch Infrastructure Automation 🤖⚡
