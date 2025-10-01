# EMERGENT Deployment System - Setup Guide

## Overview

The EMERGENT (Enhanced Merging, Execution, Rollout, Governance, Escalation, Notification, and Testing) deployment system provides comprehensive automation for:

- Pull Request management (auto-conversion from draft to ready)
- Intelligent conflict resolution
- Automated PR merging in dependency order
- Cloudflare Edge deployment
- Comprehensive smoke testing
- System-specific fixes (Tax Suite, Two-Tier Firewall)

## Quick Start

### 1. Prerequisites

Ensure you have the following tools installed:

```bash
# Check Node.js (v18+)
node --version

# Check npm
npm --version

# Check GitHub CLI
gh --version

# Check Wrangler (Cloudflare CLI)
wrangler --version

# Check Git
git --version
```

Install missing tools:

```bash
# Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# GitHub CLI
# macOS
brew install gh

# Linux
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

# Wrangler
npm install -g wrangler
```

### 2. Authentication

#### GitHub CLI

```bash
# Login to GitHub
gh auth login

# Verify authentication
gh auth status
```

#### Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN="your-api-token"

# Verify
wrangler whoami
```

### 3. Environment Variables

Create a `.env` file in the repository root:

```bash
# GitHub
export GITHUB_TOKEN="ghp_..."

# Cloudflare
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_PROJECT_NAME="wired-chaos"

# Optional: Notifications
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Optional: SWARM Integration
export NOTION_TOKEN="..."
```

Load the environment:

```bash
source .env
```

### 4. Install VSCode Extension (Option 1: Recommended)

```bash
cd wired-chaos-emergent
npm install
npm run compile

# Package extension
npm install -g vsce
vsce package

# Install in VSCode
# Extensions → ... → Install from VSIX → select wired-chaos-emergent-1.0.0.vsix
```

Configure in VSCode settings:

```json
{
  "wiredChaos.githubToken": "ghp_...",
  "wiredChaos.cloudflareToken": "...",
  "wiredChaos.cloudflareAccountId": "...",
  "wiredChaos.cloudflareProjectName": "wired-chaos",
  "wiredChaos.discordWebhook": "https://discord.com/api/webhooks/..."
}
```

### 5. Use Shell Script (Option 2: CLI)

```bash
# Run full deployment
./wired-chaos-emergent/scripts/emergent-deploy.sh

# Or individual components
node ./wired-chaos-emergent/scripts/conflict-resolution.js 22
node ./wired-chaos-emergent/scripts/smoke-tests.js
node ./wired-chaos-emergent/scripts/tax-suite-fix.js
node ./wired-chaos-emergent/scripts/firewall-fix.js
```

### 6. Use VSCode Tasks (Option 3: Integrated)

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select "EMERGENT: Full Deployment"

Or press `Ctrl+Shift+B` and select the EMERGENT task.

## Deployment Workflow

### Automated Sequence

The EMERGENT deployment follows this sequence:

```
1. Pull Request Management
   ├─ Convert draft PRs to ready
   └─ Display PR status

2. Conflict Resolution
   ├─ Detect conflicting PRs
   ├─ Auto-resolve using strategies
   └─ Flag manual interventions

3. PR Merging (Dependency Order)
   ├─ PR #23: SWARM Orchestrator Pipeline
   ├─ PR #22: Video System (after rebase)
   ├─ PR #24: System Patches
   └─ PR #25: Student Union VR/AR

4. Cloudflare Deployment
   ├─ Build frontend (npm run build)
   ├─ Deploy worker (wrangler deploy)
   └─ Verify health endpoint

5. Smoke Testing
   ├─ Test 14+ critical endpoints
   ├─ Validate responses
   └─ Generate test report

6. System Fixes
   ├─ Tax Suite integration
   └─ Two-Tier Firewall
```

### Manual Steps (When Needed)

If automatic resolution fails:

```bash
# 1. Check PR conflicts
gh pr list --json number,mergeable

# 2. Checkout problematic PR
gh pr checkout 22

# 3. Manually merge main
git merge main

# 4. Resolve conflicts
# Edit files manually, then:
git add .
git commit -m "resolve: manual conflict resolution"
git push origin HEAD

# 5. Return to main
git checkout main
```

## Conflict Resolution Strategies

The system uses intelligent strategies:

| File Pattern | Strategy | Description |
|-------------|----------|-------------|
| `.gitignore` | `theirs` | Use main branch (latest ignore rules) |
| `package-lock.json` | `theirs` | Use main branch (lockfile consistency) |
| `README.md` | `theirs` | Use main branch (comprehensive docs) |
| `*.md` (others) | `ours` | Use PR branch (feature docs) |
| `*.yml`, `*.yaml` | `theirs` | Use main branch (workflow stability) |
| `*.js`, `*.ts` | `manual` | Requires code review |
| `*.json` (configs) | `manual` | Requires validation |

## Smoke Test Endpoints

All critical endpoints are validated:

### Core Services
- ✅ `GET /health` → `{ ok: true }`
- ✅ `GET /` → Redirect to `/school`

### School System
- ✅ `GET /school` → HTML with Business/Esoteric toggle
- ✅ `GET /university?audience=business` → WCU content
- ✅ `GET /university?audience=esoteric` → 589 content

### Video Sales Page
- ✅ `GET /vsp` → Video Sales Page
- ✅ `POST /api/vsp/contract/generate` → Contract generation
- ✅ `POST /api/vsp/contract/sign` → E-signature integration

### Tax Suite
- ✅ `GET /tax` → Redirect to `/suite`
- ✅ `GET /suite` → Tax Suite HTML

### BUS Event System
- ✅ `GET /bus/status` → `{ ok: true }`
- ✅ `GET /bus/poll?since=0` → `{ ok: true, events: [] }`
- ✅ `POST /bus/publish` → Event publishing (wallet-gated)

### GAMMA Integration
- ✅ `GET /gamma/tour` → GAMMA tour page
- ✅ `GET /gamma/journal` → GAMMA journal
- ✅ `GET /gamma/workbook` → GAMMA workbook

### Whitelist XP System
- ✅ `POST /wl/xp/increment` → XP increment (wallet-gated)
- ✅ `GET /wl/xp/` → XP status

## GitHub Actions Integration

The workflow `.github/workflows/emergent-deploy.yml` runs automatically:

### Triggers
- On push to `main` branch
- Manual dispatch via Actions tab

### Secrets Required
- `CLOUDFLARE_API_TOKEN` - Cloudflare deployment
- `DISCORD_WEBHOOK_URL` - (Optional) Notifications

### Artifacts
- `deployment-report.md` - Full deployment report

## Troubleshooting

### Issue: GitHub CLI Authentication Failed

```bash
# Re-authenticate
gh auth logout
gh auth login

# Verify
gh auth status
```

### Issue: Cloudflare Deployment Failed

```bash
# Check authentication
wrangler whoami

# Verify wrangler.toml
cat src/wrangler.toml

# Test deployment
cd src && wrangler deploy --dry-run
```

### Issue: Smoke Tests Failing

```bash
# Test individual endpoint
curl -s https://www.wiredchaos.xyz/health | jq

# Check DNS
nslookup www.wiredchaos.xyz

# Verify deployment
wrangler tail
```

### Issue: PR Conflicts Not Resolved

```bash
# List conflicted files
git diff --name-only --diff-filter=U

# Manual resolution
git checkout --theirs file.txt  # Use main branch
git checkout --ours file.txt    # Use PR branch
git add .
git commit -m "resolve: manual conflict resolution"
```

### Issue: Extension Not Loading

```bash
# Rebuild extension
cd wired-chaos-emergent
rm -rf out node_modules
npm install
npm run compile

# Check VSCode console
# Help → Toggle Developer Tools → Console
```

## Best Practices

### 1. Pre-Deployment Checklist

```bash
# Verify authentication
gh auth status
wrangler whoami

# Check repository state
git status
git log --oneline -5

# Review open PRs
gh pr list

# Test build locally
cd frontend && npm run build
```

### 2. Post-Deployment Verification

```bash
# Run smoke tests
node wired-chaos-emergent/scripts/smoke-tests.js

# Check logs
wrangler tail --env production

# Monitor analytics
# Visit Cloudflare dashboard
```

### 3. Rollback Procedure

If deployment fails:

```bash
# Revert to previous deployment
cd src
wrangler rollback

# Or redeploy previous commit
git revert HEAD
git push origin main
```

## Advanced Usage

### Custom PR Merge Order

Edit `emergent-deploy.sh`:

```bash
# Define custom order
PR_ORDER=(24 23 22 25 26)
```

### Custom Conflict Strategies

Edit `conflict-resolution.js`:

```javascript
const resolutionStrategies = {
  'custom-file.json': 'ours',
  '.customrc': 'theirs',
  // Add custom patterns
};
```

### Environment-Specific Deployments

```bash
# Deploy to staging
cd src
wrangler deploy --env staging

# Deploy to development
wrangler deploy --env development
```

## Support

### Documentation
- Extension README: `wired-chaos-emergent/README.md`
- Repository README: `README.md`

### Getting Help
- GitHub Issues: Create issue with `[EMERGENT]` tag
- Discord: Use webhook for team notifications

### Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

---

**WIRED CHAOS EMERGENT** - Automated deployment for the future 🚀

Last Updated: 2025-10-01
