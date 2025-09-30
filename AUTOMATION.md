# 🤖 WIRED CHAOS PR Automation Guide

This document describes the comment-driven and automated PR workflows for the WIRED CHAOS repository.

## 📋 Table of Contents

- [Comment-Driven PR Ready & Merge](#comment-driven-pr-ready--merge)
- [Auto Ready & Merge](#auto-ready--merge)
- [Manual Workflow Dispatch](#manual-workflow-dispatch)
- [Troubleshooting](#troubleshooting)
- [Edge Smoke Tests](#edge-smoke-tests)

## 🚀 Comment-Driven PR Ready & Merge

The `comment-ready-merge.yml` workflow allows authorized users to mark PRs as ready and merge them using comments.

### Usage

Comment on any Pull Request with one of these formats:

#### Basic Commands (Case-Insensitive)
- `/ready` - Mark the current PR ready and merge it
- `ready` - Same as above
- `/READY` - Same as above (case doesn't matter)
- ` /ready ` - Leading/trailing whitespace is trimmed

#### With PR Number (Optional)
If you want to specify a different PR number in your comment:
- `/ready 6` - Mark PR #6 ready and merge
- `ready 6` - Same as above
- `/ready pr 6` - Same as above
- `ready PR 6` - Same as above

The workflow will extract the first number from your comment.

### Authorization

**Only these users can trigger the workflow:**
- Repository owner (`wiredchaos`)
- Users with `admin` permission
- Users with `maintain` permission

Comments from other users will be ignored.

### What Happens

When you comment `/ready` on a PR, the workflow will:

1. ✅ **Validate** - Check that you have permission
2. 📝 **Mark Ready** - If the PR is a draft, convert it to ready (tries CLI, falls back to REST API)
3. ⏳ **Wait for Checks** - Waits up to 10 minutes for required checks (won't fail if no checks exist)
4. 🔀 **Merge** - Merges the PR using squash method by default
5. 🧪 **Trigger Tests** - Attempts to trigger Edge Smoke Tests workflow
6. 🗑️ **Clean Up** - Deletes the branch after successful merge

### Example

```
# Comment on PR #6
/ready

# The workflow will:
# - Mark PR #6 as ready for review
# - Wait for required checks to pass
# - Merge PR #6 to main using squash merge
# - Delete the branch
# - Trigger Edge Smoke Tests
```

## 🤖 Auto Ready & Merge

The `auto-ready-merge.yml` workflow automatically processes PRs with specific labels.

### Automatic Execution

The workflow runs automatically:
- **Every 6 hours** via scheduled cron job
- Looks for PRs with the `automerge` label
- Only processes PRs from `Copilot` or `wiredchaos` authors
- Skips external fork PRs for safety

### What It Does

For each matching PR:
1. ✅ **Check Safety** - Skips PRs from external forks
2. 📝 **Mark Ready** - Converts draft PRs to ready (CLI + REST API fallback)
3. ⏳ **Wait for Checks** - Waits up to 5 minutes for checks
4. 🔀 **Merge** - Squash merges the PR
5. 🧪 **Trigger Tests** - Triggers Edge Smoke Tests
6. 🗑️ **Clean Up** - Deletes the branch

### Manual Trigger

You can customize the behavior via workflow dispatch (see below).

## 🎮 Manual Workflow Dispatch

Both workflows support manual execution from GitHub Actions.

### Comment Ready & Merge (Manual)

**Use this when:**
- Comment event is blocked by permissions
- You want to specify custom merge options
- You need to retry a failed merge

**Steps:**
1. Go to **Actions** → **🚀 Comment Ready & Merge**
2. Click **Run workflow**
3. Fill in the inputs:
   - **pr_number** (required): The PR number to merge (e.g., `6`)
   - **merge_method** (optional): Choose `squash`, `merge`, or `rebase` (default: `squash`)
   - **delete_branch** (optional): Check to delete branch after merge (default: `true`)
4. Click **Run workflow**

### Auto Ready & Merge (Manual)

**Use this when:**
- You want to process PRs immediately instead of waiting for schedule
- You want to use a different label or author filter

**Steps:**
1. Go to **Actions** → **🤖 Auto Ready & Merge**
2. Click **Run workflow**
3. Fill in the inputs:
   - **label** (optional): PR label to filter on (default: `automerge`)
   - **author_filter** (optional): Regex to filter authors (default: `Copilot|wiredchaos`)
4. Click **Run workflow**

## 🔧 Troubleshooting

### Comment Not Triggering Workflow

**Problem:** You commented `/ready` but nothing happened.

**Solutions:**
1. **Check Permissions** - Only the repo owner or admins can trigger the workflow
   - Verify your GitHub username matches `wiredchaos` or has admin rights
   
2. **Check PR Status** - The comment must be on a Pull Request, not an Issue
   - Look for the "Pull Request" badge on the conversation page
   
3. **Check Comment Format** - Make sure your comment starts with `/ready` or `ready`
   - Valid: `/ready`, `ready`, `/READY`, `ready 6`
   - Invalid: `Please /ready`, `make it ready`

4. **Use Manual Fallback** - If comments don't work, use workflow dispatch
   - Go to Actions → 🚀 Comment Ready & Merge → Run workflow
   - Enter the PR number manually

### How to View Workflow Logs

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Find the workflow run (🚀 Comment Ready & Merge or 🤖 Auto Ready & Merge)
4. Click on the run to see detailed logs
5. Expand each step to see what happened

**What to look for:**
- ✅ Green checkmarks = Success
- ❌ Red X = Failure (check error message)
- ⚠️ Yellow warning = Partial success or fallback used

### Merge Failed

**Problem:** The workflow ran but the PR didn't merge.

**Common Causes:**
1. **Required Checks Failed** - The workflow waits for checks, but won't merge if they fail
   - Check the PR's "Checks" tab
   - Fix any failing tests or checks
   
2. **Conflicts** - The PR has merge conflicts
   - Resolve conflicts in the PR branch
   - Push the resolution
   - Re-run the workflow

3. **Branch Protection** - Repository has strict branch protection rules
   - The workflow tries `--admin` flag as fallback
   - Contact repository admin if issues persist

4. **Missing Permissions** - The GITHUB_TOKEN lacks necessary permissions
   - The workflow is configured with: `contents: write`, `pull-requests: write`, `actions: write`
   - If issues persist, check repository settings

### Draft Not Converted to Ready

**Problem:** The PR stays in draft mode.

**Solutions:**
1. **Check Logs** - The workflow tries two methods:
   - First: `gh pr ready` (GitHub CLI)
   - Fallback: REST API `PATCH` request
   
2. **Manual Conversion** - Convert manually if workflow fails:
   ```bash
   gh pr ready <PR_NUMBER>
   ```
   Or click "Ready for review" in the GitHub UI

3. **API Fallback** - The workflow uses this if CLI fails:
   ```bash
   gh api --method PATCH /repos/wiredchaos/wired-chaos/pulls/<PR_NUMBER> -f draft=false
   ```

## 🧪 Edge Smoke Tests

### What Are Edge Smoke Tests?

Edge Smoke Tests verify that the deployment is working correctly after a merge.

### Automatic Triggering

The workflow automatically attempts to trigger Edge Smoke Tests after successful merge by trying:
1. Workflow named "Edge Smoke Tests"
2. Workflow file "edge-smoke-tests.yml"
3. Workflow file "smoke-tests.yml"
4. Workflow file "edge-tests.yml"

If none are found, the workflow logs a message but continues (it's not considered a failure).

### Manual Triggering

If automatic triggering doesn't work or you want to run tests manually:

#### Via GitHub UI
1. Go to **Actions** tab
2. Find the **Edge Smoke Tests** workflow (or similar name)
3. Click **Run workflow**
4. Select the branch (usually `main`)
5. Click **Run workflow**

#### Via GitHub CLI
```bash
# Trigger by workflow name
gh workflow run "Edge Smoke Tests"

# Or trigger by filename
gh workflow run edge-smoke-tests.yml
```

#### Via REST API
```bash
gh api \
  --method POST \
  /repos/wiredchaos/wired-chaos/actions/workflows/edge-smoke-tests.yml/dispatches \
  -f ref=main
```

### Creating Edge Smoke Tests

If the Edge Smoke Tests workflow doesn't exist yet, create `.github/workflows/edge-smoke-tests.yml`:

```yaml
name: Edge Smoke Tests

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Run smoke tests
        run: |
          echo "🧪 Running Edge Smoke Tests..."
          # Add your smoke test commands here
```

## 🔐 Security & Permissions

### Workflow Permissions

Both workflows are configured with these permissions:
- `contents: write` - Required to merge PRs and delete branches
- `pull-requests: write` - Required to update PR state (draft → ready)
- `actions: write` - Required to trigger other workflows
- `issues: read` - Required to read issue comments

### Concurrency Control

Each PR is processed with concurrency control:
- **Group:** `ready-merge-<PR_NUMBER>`
- **Behavior:** Won't cancel in-progress runs
- **Purpose:** Prevents multiple simultaneous merge attempts on the same PR

### Author Filtering (Auto Ready & Merge)

The auto-merge workflow only processes PRs from trusted authors:
- Default filter: `Copilot|wiredchaos`
- Only processes non-fork PRs (safety measure)
- Can be customized via workflow dispatch input

## 📊 Workflow Summary Output

Each workflow run generates a summary visible in the Actions tab:

### Comment Ready & Merge Summary
- PR Number
- Whether it was a draft
- Merge method used
- Success/failure status
- Trigger source (comment or manual)

### Auto Ready & Merge Summary
- Number of PRs processed
- Label filter used
- Author filter used
- Trigger source (schedule or manual)

## 🎯 Quick Reference

| Task | Method | Location |
|------|--------|----------|
| Merge PR via comment | Comment `/ready` on PR | Any PR you own/admin |
| Merge specific PR | Comment `/ready <number>` | Any PR |
| Manual merge | Actions → Comment Ready & Merge → Run workflow | Actions tab |
| Auto-merge labeled PRs | Add `automerge` label | PR labels |
| Immediate auto-merge | Actions → Auto Ready & Merge → Run workflow | Actions tab |
| View logs | Actions → Workflow run → Expand steps | Actions tab |
| Trigger smoke tests | Actions → Edge Smoke Tests → Run workflow | Actions tab |

## 📝 Notes

- All commands are **case-insensitive** (`/ready`, `/READY`, `ready` all work)
- **Whitespace is trimmed** (` /ready ` works fine)
- **Default merge method** is squash (customizable via workflow dispatch)
- **Branches are deleted** after merge by default (customizable)
- Workflows **log all actions** for transparency
- **REST API fallback** ensures reliability even if CLI fails
- **Admin override** available for protected branches (if authorized)

---

**Generated for WIRED CHAOS Repository**  
**Last Updated:** 2024  
**Maintainer:** wiredchaos
