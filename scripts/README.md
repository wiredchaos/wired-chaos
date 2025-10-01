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
