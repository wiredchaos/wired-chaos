# 🚀 PR Automation Quick Start

**One-command PR merge with automatic smoke tests** - No manual steps required!

## TL;DR - Get Started in 30 Seconds

### Option 1: Comment-Driven (Immediate)
```
Comment on any PR: /ready
Result: PR is automatically ready, merged, and tested ✅
```

### Option 2: Label-Driven (Scheduled)
```
Add label to PR: automerge
Result: PR will be auto-merged in next 6-hour cycle ✅
```

### Option 3: VS Code (One-Click)
```
Ctrl+Shift+P → Tasks: Run Task → PR: /ready
Enter PR number → Done! ✅
```

## What Happens Automatically

When you trigger the automation (via `/ready` comment or `automerge` label):

1. 📝 **Draft → Ready** - If PR is draft, it's marked ready for review
2. ⏳ **Wait for Checks** - Waits for CI/CD checks to pass
3. 🔀 **Merge** - Squash merges to main branch
4. 🗑️ **Clean Up** - Deletes the source branch
5. 🧪 **Test** - Triggers Edge Smoke Tests
6. ✅ **Done** - All in one automated flow!

## Authorization

Only these users can trigger automation:
- Repository owner (`wiredchaos`)
- Users with `admin` permission
- Users with `maintain` permission

## Setup (One-Time)

Install GitHub CLI and authenticate:
```bash
# Install (choose your OS)
# Windows: winget install --id GitHub.cli
# macOS: brew install gh
# Linux: See https://github.com/cli/cli#installation

# Authenticate
gh auth login
```

## Usage Examples

### Example 1: Quick Merge from Comment
```bash
# On GitHub PR page, add comment:
/ready

# That's it! Check Actions tab for progress
```

### Example 2: Quick Merge from CLI
```bash
gh pr comment 42 --body "/ready"
```

### Example 3: Schedule for Batch Processing
```bash
gh pr edit 42 --add-label automerge
```

### Example 4: VS Code One-Click
```
1. Press Ctrl+Shift+P (Cmd+Shift+P on macOS)
2. Type "Tasks: Run Task"
3. Select "PR: /ready (auto-ready & merge current PR)"
4. Enter PR number: 42
5. Done! ✅
```

### Example 5: Custom Options
```
1. Go to Actions → 🚀 Comment Ready & Merge
2. Click "Run workflow"
3. Enter PR number: 42
4. Choose merge method: squash/merge/rebase
5. Choose delete branch: yes/no
6. Run workflow
```

## Validation

Verify everything is set up correctly:

```bash
# Linux/macOS
./scripts/validate-pr-automation.sh

# Windows (PowerShell)
.\scripts\validate-pr-automation.ps1
```

## Workflows

Three workflows power the automation:

1. **🚀 Comment Ready & Merge** (`.github/workflows/comment-ready-merge.yml`)
   - Triggered by: `/ready` comments
   - Immediate processing
   
2. **🤖 Auto Ready & Merge** (`.github/workflows/auto-ready-merge.yml`)
   - Triggered by: `automerge` label
   - Scheduled: Every 6 hours
   
3. **🔥 Edge Smoke Tests** (`.github/workflows/edge-smoke.yml`)
   - Triggered after: Successful merge
   - Can also trigger manually

## VS Code Tasks

8 tasks available in VS Code (Ctrl+Shift+P → Tasks: Run Task):

1. 🚀 **PR: /ready** - Auto-ready & merge PR
2. 🏷️ **PR: Add automerge label** - Schedule for auto-merge
3. 🗑️ **PR: Remove automerge label** - Cancel auto-merge
4. 📊 **PR: View status** - Show PR details
5. 📋 **PR: List open PRs** - List all open PRs
6. 🔍 **PR: List PRs with automerge label** - Show scheduled PRs
7. 🧪 **PR: Trigger Edge Smoke Tests** - Run tests manually
8. ⚙️ **PR: Manual ready & merge** - Full control merge

## Troubleshooting

### Comment not working?
- Check authorization (owner/admin/maintainer only)
- Verify comment starts with `/ready` or `ready`
- Check Actions tab for workflow run
- Use manual fallback: Actions → Run workflow

### Merge failed?
- Check for merge conflicts - resolve first
- Verify checks passed
- Check logs in Actions tab
- Manual fallback: `gh pr merge 42 --squash`

### Tests not triggered?
- Trigger manually: `gh workflow run "Edge Smoke Tests"`
- Check workflow exists: `gh workflow list`

## Documentation

- **Quick Start** (you are here): `PR_AUTOMATION_QUICKSTART.md`
- **Full Guide**: `AUTOMATION.md`
- **Validation Guide**: `PR_AUTOMATION_VALIDATION.md`
- **Workflows**: `.github/workflows/`
- **VS Code Tasks**: `.vscode/tasks.json`

## Success Indicators

✅ Single `/ready` comment merges PR without other action  
✅ PRs with `automerge` label process every 6 hours  
✅ VS Code tasks work from editor  
✅ Edge Smoke Tests run after every merge  
✅ Branches automatically cleaned up  
✅ No manual steps needed for routine PRs  

## Status

**✅ COMPLETE AND OPERATIONAL**

All acceptance criteria met:
- ✅ Single comment/label triggers full automation
- ✅ PR marked ready, merged, tested automatically
- ✅ VS Code and web UI instructions provided
- ✅ No manual steps required

---

**Reference Issue:** [#9](https://github.com/wiredchaos/wired-chaos/issues/9)
