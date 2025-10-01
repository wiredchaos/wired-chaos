# Scripts Directory

This directory contains automation scripts for code quality and repository maintenance.

## Code Quality Fix Automation

### Scripts

- **`code-fix.sh`** - Bash script for running code quality checks and fixes (Linux/macOS)
- **`code-fix.ps1`** - PowerShell script for running code quality checks and fixes (Windows)
- **`generate-code-fix-changelog.sh`** - Bash script to generate changelog from git diff
- **`generate-code-fix-changelog.ps1`** - PowerShell script to generate changelog from git diff

### Documentation

- **`MEGAPROMPT.md`** - Original megaprompt instructions for the code quality automation

## Usage

### Quick Start

**Check Only (no modifications):**
```bash
# Linux/macOS
./scripts/code-fix.sh --check-only

# Windows
.\scripts\code-fix.ps1 -CheckOnly
```

**Apply Fixes:**
```bash
# Linux/macOS
./scripts/code-fix.sh --apply-fixes

# Windows
.\scripts\code-fix.ps1 -ApplyFixes
```

**Generate Changelog:**
```bash
# Linux/macOS
./scripts/generate-code-fix-changelog.sh

# Windows
.\scripts\generate-code-fix-changelog.ps1
```

### From VS Code

Use the built-in tasks:
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
2. Select "Tasks: Run Task"
3. Choose from:
   - Code Fix: Check Only
   - Code Fix: Apply & Prepare PR
   - Code Fix: Generate Changelog

### From GitHub Actions

1. Go to the **Actions** tab
2. Select **"Code Quality Fix"** workflow
3. Click **"Run workflow"**
4. Configure options and run

## More Information

See the main [AUTOMATION.md](../AUTOMATION.md) file for complete documentation.

---

## 🤖 NO TOUCH INFRA AUTOMATION Scripts

### Environment Setup

**Script:** `setup-environment.sh`  
**Purpose:** Automated environment variable and secrets configuration

```bash
./scripts/setup-environment.sh
```

**Features:**
- Interactive prompts for all required secrets
- GitHub CLI integration for secure secret storage
- Auto-generates webhook secrets
- Comprehensive configuration summary

---

### Webhook Processor Deployment

**Script:** `deploy-webhook-processor.sh`  
**Purpose:** Deploy webhook processor to Cloudflare Workers

```bash
./scripts/deploy-webhook-processor.sh
```

**Features:**
- Automatic Wrangler CLI installation
- Sets all required worker secrets
- Deploys to Cloudflare Workers edge network

---

### GAMMA Template Activation

**Script:** `activate-gamma-templates.sh`  
**Purpose:** Activate all 6 GAMMA presentation templates

```bash
./scripts/activate-gamma-templates.sh
```

**Templates:** Component, Feature, Milestone, Release, Tutorial, Update

---

### Performance Monitoring

**Script:** `monitor-performance.sh`  
**Purpose:** Monitor and report on system performance

```bash
./scripts/monitor-performance.sh
```

**Features:**
- Checks all core endpoints
- Measures response times
- Calculates system health score
- Generates comprehensive reports

---

### NPM Scripts

All automation scripts are available via npm:

```bash
npm run setup:env          # Setup environment
npm run deploy:webhook     # Deploy webhook processor
npm run gamma:activate     # Activate GAMMA templates
npm run monitor:performance # Run performance check
npm run test:e2e          # Run E2E test (dry run)
```

---

### Complete Documentation

See **[NOTION_AI_BOT_COMPLETE_GUIDE.md](../NOTION_AI_BOT_COMPLETE_GUIDE.md)** for:
- Complete automation guide
- API reference
- Troubleshooting
- Best practices
- Success metrics
