# 🤖 PR Automation System

**One-command PR merge with automatic smoke tests** - Complete implementation for issue #9

## 🎯 What This Is

A fully automated PR merge system that eliminates manual steps for routine pull requests. Comment `/ready` or add the `automerge` label, and the entire PR lifecycle is handled automatically.

## 🚀 Quick Start

### Option 1: Immediate Merge (Comment)
```bash
# On GitHub PR page or via CLI
/ready
```

### Option 2: Scheduled Merge (Label)
```bash
# Add label to PR
gh pr edit <PR> --add-label automerge
```

### Option 3: VS Code One-Click
```
Ctrl+Shift+P → Tasks: Run Task → PR: /ready
```

## 📚 Documentation Index

All documentation is organized by use case:

### Getting Started
- **[PR_AUTOMATION_QUICKSTART.md](./PR_AUTOMATION_QUICKSTART.md)** ⭐ START HERE
  - 30-second setup
  - Basic usage examples
  - Common use cases

### Complete Guide
- **[AUTOMATION.md](./AUTOMATION.md)** 📖 FULL DOCUMENTATION
  - Complete feature documentation
  - All workflows explained
  - Troubleshooting guide

### Visual Documentation
- **[PR_AUTOMATION_FLOW.md](./PR_AUTOMATION_FLOW.md)** 📊 FLOW DIAGRAMS
  - Visual workflow diagrams
  - Flow relationships
  - Error handling

### Testing & Validation
- **[PR_AUTOMATION_VALIDATION.md](./PR_AUTOMATION_VALIDATION.md)** 🧪 TEST GUIDE
  - Test cases
  - Validation procedures
  - Success indicators

### Acceptance Criteria
- **[PR_AUTOMATION_ACCEPTANCE.md](./PR_AUTOMATION_ACCEPTANCE.md)** ✅ VERIFICATION
  - Issue #9 requirements
  - Acceptance criteria checklist
  - Implementation evidence

## 🔧 Components

### Workflows (`.github/workflows/`)
- **comment-ready-merge.yml** - Comment-driven automation (immediate)
- **auto-ready-merge.yml** - Label-driven automation (scheduled, 6h)
- **edge-smoke.yml** - Edge endpoint smoke tests

### VS Code Integration (`.vscode/tasks.json`)
- 8 PR automation tasks
- One-click operations
- Full GitHub CLI integration

### Validation Scripts (`scripts/`)
- **validate-pr-automation.sh** - Bash/Linux/macOS
- **validate-pr-automation.ps1** - PowerShell/Windows

## ✅ What It Does Automatically

When you trigger automation (comment or label):

1. 📝 **Mark Ready** - Converts draft to ready (if needed)
2. ⏳ **Wait for Checks** - Waits for CI/CD to pass
3. 🔀 **Merge** - Squash merges to main
4. 🗑️ **Cleanup** - Deletes source branch
5. 🧪 **Test** - Triggers Edge Smoke Tests
6. ✅ **Done** - All automatic, no manual steps

## 🎮 How to Use

### Command Line
```bash
# Immediate merge
gh pr comment 42 --body "/ready"

# Scheduled merge
gh pr edit 42 --add-label automerge

# Manual trigger with options
gh workflow run "Comment Ready & Merge" -f pr_number=42
```

### VS Code
```
Ctrl+Shift+P → Tasks: Run Task → Select task:
  • PR: /ready (auto-ready & merge)
  • PR: Add automerge label
  • PR: Remove automerge label
  • PR: View status
  • PR: List open PRs
  • PR: List PRs with automerge label
  • PR: Trigger Edge Smoke Tests
  • PR: Manual ready & merge
```

### GitHub Web UI
```
Method 1: Comment on PR
  /ready

Method 2: Add label
  Labels → automerge

Method 3: Manual workflow
  Actions → Comment Ready & Merge → Run workflow
```

## 🧪 Validation

Verify everything is set up correctly:

```bash
# Linux/macOS
./scripts/validate-pr-automation.sh

# Windows (PowerShell)
.\scripts\validate-pr-automation.ps1

# Expected: ✅ All PR automation components are in place!
```

## 📋 System Requirements

### Prerequisites
- **GitHub CLI** (`gh`) installed and authenticated
- **Git** configured
- **VS Code** (optional, for VS Code tasks)

### Installation (One-Time)
```bash
# Install GitHub CLI
# Windows: winget install --id GitHub.cli
# macOS: brew install gh
# Linux: See https://github.com/cli/cli#installation

# Authenticate
gh auth login
```

## 🔐 Authorization

Only these users can trigger automation:
- Repository owner (`wiredchaos`)
- Users with `admin` permission
- Users with `maintain` permission

## 📊 Status

**✅ COMPLETE AND OPERATIONAL**

All acceptance criteria from issue #9 met:
- ✅ Single-trigger automation (comment or label)
- ✅ Complete PR lifecycle (ready → merge → cleanup → test)
- ✅ VS Code and web UI documentation
- ✅ No manual steps required

## 🔍 Troubleshooting

### Comment Not Working?
1. Check authorization (owner/admin/maintainer only)
2. Verify comment starts with `/ready` or `ready`
3. Check Actions tab for workflow run
4. Use manual fallback: Actions → Run workflow

### Need Help?
- See **[AUTOMATION.md](./AUTOMATION.md)** for complete troubleshooting guide
- See **[PR_AUTOMATION_VALIDATION.md](./PR_AUTOMATION_VALIDATION.md)** for test procedures

## 🎯 Use Cases

### Use Case 1: Quick PR Merge
```
Scenario: You need to merge a ready PR immediately
Solution: Comment "/ready" on the PR
Result: Merged in ~2-5 minutes
```

### Use Case 2: Batch Processing
```
Scenario: You have multiple PRs to merge but want to review first
Solution: Add "automerge" label to each PR
Result: All processed in next 6-hour cycle
```

### Use Case 3: Editor Integration
```
Scenario: You work primarily in VS Code
Solution: Use Ctrl+Shift+P → PR: /ready task
Result: One-click automation without leaving editor
```

### Use Case 4: Custom Options
```
Scenario: You need rebase merge instead of squash
Solution: Actions → Comment Ready & Merge → Run workflow (select options)
Result: Merge with your specified method
```

## 📈 Success Metrics

System working correctly when:
- ✅ Single comment/label triggers entire flow
- ✅ No manual intervention required
- ✅ PRs merge successfully with automation
- ✅ Branches automatically deleted
- ✅ Smoke tests run after every merge

## 🔗 Related Documentation

- **Issue Reference:** [#9](https://github.com/wiredchaos/wired-chaos/issues/9)
- **Workflows:** `.github/workflows/`
- **VS Code Tasks:** `.vscode/tasks.json`
- **Scripts:** `scripts/validate-pr-automation.*`

## 🎉 Implementation Complete

The PR automation system is fully implemented, documented, validated, and operational. No additional work required.

---

**Quick Links:**
- [Quick Start](./PR_AUTOMATION_QUICKSTART.md)
- [Complete Guide](./AUTOMATION.md)
- [Flow Diagrams](./PR_AUTOMATION_FLOW.md)
- [Validation](./PR_AUTOMATION_VALIDATION.md)
- [Acceptance](./PR_AUTOMATION_ACCEPTANCE.md)

**Need Help?** See [AUTOMATION.md](./AUTOMATION.md) for complete documentation.
