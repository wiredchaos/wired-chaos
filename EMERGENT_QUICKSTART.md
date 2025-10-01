# EMERGENT Deployment - Quick Reference

## 🚀 Quick Start Commands

### Full Deployment (All Steps)
```bash
# Option 1: Shell script
./wired-chaos-emergent/scripts/emergent-deploy.sh

# Option 2: VSCode Command Palette
Ctrl+Shift+P → "EMERGENT: Deploy All"

# Option 3: VSCode Task
Ctrl+Shift+B → "EMERGENT: Full Deployment"
```

### Individual Components

```bash
# Resolve conflicts for PR #22
node wired-chaos-emergent/scripts/conflict-resolution.js 22

# Run smoke tests
node wired-chaos-emergent/scripts/smoke-tests.js

# Fix tax suite integration
node wired-chaos-emergent/scripts/tax-suite-fix.js

# Fix two-tier firewall
node wired-chaos-emergent/scripts/firewall-fix.js
```

## 🔑 Required Environment Variables

```bash
export GITHUB_TOKEN="ghp_..."                    # GitHub API access
export CLOUDFLARE_API_TOKEN="..."               # Cloudflare deployment
export CLOUDFLARE_ACCOUNT_ID="..."              # Cloudflare account
export CLOUDFLARE_PROJECT_NAME="wired-chaos"    # Pages project
export DISCORD_WEBHOOK_URL="..."                # (Optional) Notifications
```

## 📋 PR Merge Order

PRs are merged in this dependency order:

1. **PR #23**: SWARM Orchestrator Pipeline
2. **PR #22**: Video System (after rebase)
3. **PR #24**: System Patches
4. **PR #25**: Student Union VR/AR

## 🔧 Conflict Resolution Strategies

| File Type | Strategy | Why |
|-----------|----------|-----|
| `.gitignore` | Use main | Latest ignore rules |
| `package-lock.json` | Use main | Lockfile consistency |
| `README.md` | Use main | Comprehensive docs |
| Other `.md` | Use PR | Feature docs |
| `.yml`/`.yaml` | Use main | Workflow stability |
| `.js`/`.ts` | Manual | Code review needed |

## ✅ Smoke Test Endpoints

All endpoints tested after deployment:

- `/health` - Health check
- `/school` - School page
- `/university?audience=business` - WCU
- `/university?audience=esoteric` - 589
- `/vsp` - Video Sales Page
- `/api/vsp/contract/generate` - Contracts
- `/tax` → `/suite` - Tax redirect
- `/bus/status` - BUS status
- `/bus/poll?since=0` - BUS polling
- `/gamma/tour` - GAMMA tour
- `/gamma/journal` - GAMMA journal
- `/gamma/workbook` - GAMMA workbook
- `/wl/xp/increment` - XP system

## 🛠️ Troubleshooting

### GitHub Authentication
```bash
gh auth login
gh auth status
```

### Cloudflare Authentication
```bash
wrangler login
wrangler whoami
```

### Check PR Status
```bash
gh pr list --json number,title,state,mergeable
```

### Manual Conflict Resolution
```bash
gh pr checkout 22
git merge main
# Fix conflicts
git add .
git commit -m "resolve: manual conflict resolution"
git push origin HEAD
git checkout main
```

### Test Individual Endpoint
```bash
curl -s https://www.wiredchaos.xyz/health | jq
```

### View Deployment Logs
```bash
wrangler tail --env production
```

## 📊 Success Criteria

- ✅ All PRs merged without manual intervention
- ✅ Cloudflare Edge deployment completed
- ✅ All smoke tests passing
- ✅ Tax suite integration functional
- ✅ Two-tier school firewall operational
- ✅ SWARM automation systems online
- ✅ Video system with avatar support deployed
- ✅ Student Union VR/AR system feature-flagged

## 🔗 Resources

- Full Setup Guide: `EMERGENT_SETUP.md`
- Extension README: `wired-chaos-emergent/README.md`
- GitHub Actions: `.github/workflows/emergent-deploy.yml`
- VSCode Tasks: `.vscode/tasks.json`

---

**Estimated Time**: 10-15 minutes for full deployment

**Last Updated**: 2025-10-01
