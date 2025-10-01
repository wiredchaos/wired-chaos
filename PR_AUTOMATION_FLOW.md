# PR Automation Flow Diagrams

Visual representation of the PR automation workflows.

## Flow 1: Comment-Driven Automation (Immediate)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Comment-Driven Flow                          │
│                    (Immediate Processing)                        │
└─────────────────────────────────────────────────────────────────┘

User Action:
┌──────────────┐
│ Comment:     │
│   /ready     │
│ on PR #42    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ GitHub Actions: comment-ready-merge.yml                      │
│                                                               │
│  1. ✅ Validate Authorization                                │
│     └─ Check: owner/admin/maintainer                         │
│                                                               │
│  2. 📝 Mark PR Ready (if draft)                              │
│     ├─ Try: gh pr ready 42                                   │
│     └─ Fallback: REST API                                    │
│                                                               │
│  3. ⏳ Wait for Checks                                        │
│     └─ Timeout: 10 minutes                                   │
│                                                               │
│  4. 🔀 Merge PR                                               │
│     ├─ Method: Squash                                        │
│     ├─ Target: main                                          │
│     └─ Admin override if needed                              │
│                                                               │
│  5. 🗑️ Delete Branch                                          │
│     └─ Cleanup: Remove source branch                         │
│                                                               │
│  6. 🧪 Trigger Edge Smoke Tests                              │
│     └─ Workflow: edge-smoke.yml                              │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Edge Smoke Tests: edge-smoke.yml                             │
│                                                               │
│  • Test /health endpoint                                     │
│  • Test /tax redirect                                        │
│  • Test /suite endpoint                                      │
│  • Test /gamma/* endpoints                                   │
│  • Test /school endpoint                                     │
│  • Test /bus/* endpoints                                     │
│  • Test /wl/xp/* endpoints                                   │
│                                                               │
│  Result: ✅ All endpoints validated                          │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
   ✅ DONE!
   PR merged, branch deleted, tests passed
```

## Flow 2: Label-Driven Automation (Scheduled)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Label-Driven Flow                            │
│                    (Scheduled Every 6 Hours)                    │
└─────────────────────────────────────────────────────────────────┘

User Action:
┌──────────────┐
│ Add label:   │
│  automerge   │
│ to PR #42    │
└──────┬───────┘
       │
       ▼
     Wait...
┌──────────────┐
│ Cron runs    │
│ every 6 hrs  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ GitHub Actions: auto-ready-merge.yml                         │
│                                                               │
│  1. 🔍 Find Matching PRs                                     │
│     ├─ Filter: Label = "automerge"                           │
│     ├─ Filter: State = OPEN                                  │
│     ├─ Filter: Not from fork                                 │
│     └─ Filter: Author matches (Copilot|wiredchaos)           │
│                                                               │
│  2. 📝 Process Each PR                                       │
│     │                                                         │
│     ├─ Mark Ready (if draft)                                 │
│     │  ├─ Try: gh pr ready <PR>                              │
│     │  └─ Fallback: REST API                                 │
│     │                                                         │
│     ├─ ⏳ Wait for Checks                                     │
│     │  └─ Timeout: 5 minutes                                 │
│     │                                                         │
│     ├─ 🔀 Merge PR                                            │
│     │  ├─ Method: Squash                                     │
│     │  └─ Admin override if needed                           │
│     │                                                         │
│     ├─ 🗑️ Delete Branch                                       │
│     │  └─ Cleanup: Remove source branch                      │
│     │                                                         │
│     └─ 🧪 Trigger Edge Smoke Tests                           │
│        └─ Workflow: edge-smoke.yml                           │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
   ✅ DONE!
   All labeled PRs processed in batch
```

## Flow 3: VS Code Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code Integration                          │
│                    (One-Click Tasks)                            │
└─────────────────────────────────────────────────────────────────┘

User Action:
┌───────────────────────────────┐
│ VS Code                       │
│                               │
│ Ctrl+Shift+P                  │
│ → Tasks: Run Task             │
│ → PR: /ready                  │
│                               │
│ Enter PR #: 42                │
└────────────┬──────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ GitHub CLI Command             │
│                                │
│ gh pr comment 42 \             │
│   --body "/ready"              │
└────────────┬───────────────────┘
             │
             ▼
        (Triggers Flow 1)
     Comment-Driven Automation

Alternative Tasks:
┌─────────────────────────────────────────────┐
│ Available VS Code Tasks:                    │
│                                             │
│ 1. PR: /ready                 ─┐            │
│ 2. PR: Add automerge label    ├─ Quick     │
│ 3. PR: Remove automerge label─┘  Actions   │
│                                             │
│ 4. PR: View status            ─┐            │
│ 5. PR: List open PRs          ├─ Status    │
│ 6. PR: List automerge PRs     ─┘  Check    │
│                                             │
│ 7. PR: Trigger Edge Smoke Tests            │
│ 8. PR: Manual ready & merge (custom opts)  │
└─────────────────────────────────────────────┘
```

## Flow 4: Manual Workflow Dispatch

```
┌─────────────────────────────────────────────────────────────────┐
│                    Manual Workflow Dispatch                     │
│                    (Full Control)                               │
└─────────────────────────────────────────────────────────────────┘

User Action:
┌────────────────────────────────────┐
│ GitHub Actions UI                  │
│                                    │
│ 1. Go to Actions tab               │
│ 2. Select workflow:                │
│    "Comment Ready & Merge"         │
│ 3. Click "Run workflow"            │
│                                    │
│ 4. Enter inputs:                   │
│    • pr_number: 42                 │
│    • merge_method: squash          │
│    • delete_branch: true           │
│                                    │
│ 5. Click "Run workflow"            │
└────────────┬───────────────────────┘
             │
             ▼
        (Triggers Flow 1)
     With Custom Options
```

## Workflow Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    Workflow Ecosystem                           │
└─────────────────────────────────────────────────────────────────┘

comment-ready-merge.yml ─┐
                         │
auto-ready-merge.yml ────┼──→ edge-smoke.yml
                         │
workflow_dispatch ───────┘
     (manual)

Triggers:
├─ comment-ready-merge.yml
│  ├─ issue_comment (created)
│  └─ workflow_dispatch
│
├─ auto-ready-merge.yml
│  ├─ schedule (cron: 0 */6 * * *)
│  └─ workflow_dispatch
│
└─ edge-smoke.yml
   ├─ workflow_dispatch
   ├─ schedule (cron: */30 * * * *)
   └─ push (main branch)
```

## Authorization Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    Authorization Flow                           │
└─────────────────────────────────────────────────────────────────┘

User Comments: /ready
       │
       ▼
┌──────────────────────────┐
│ Check User Permission    │
│                          │
│ Is user repository       │
│ owner "wiredchaos"?      │
└────┬────────────┬────────┘
     │ Yes        │ No
     ▼            ▼
  ✅ Allow    ┌──────────────┐
              │ Check if     │
              │ admin or     │
              │ maintainer?  │
              └──┬────────┬──┘
                 │ Yes    │ No
                 ▼        ▼
              ✅ Allow  ❌ Deny
                        │
                        ▼
                    Skip workflow
                    (no action)
```

## Success Metrics

```
┌─────────────────────────────────────────────────────────────────┐
│                    Success Indicators                           │
└─────────────────────────────────────────────────────────────────┘

Input:
├─ Single comment: "/ready"
└─ OR Single label: "automerge"

Process: (Automated)
├─ Mark ready ────────────────────── ✅
├─ Wait for checks ───────────────── ✅
├─ Merge (squash) ────────────────── ✅
├─ Delete branch ─────────────────── ✅
└─ Run smoke tests ───────────────── ✅

Output:
└─ PR fully processed without manual intervention ✅

Time to Completion:
├─ Comment-driven: ~2-5 minutes (immediate)
├─ Label-driven: ~6 hours (next scheduled run)
└─ Manual dispatch: ~2-5 minutes (immediate)
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Recovery                               │
└─────────────────────────────────────────────────────────────────┘

Step Failed: Mark Ready
├─ Try: gh pr ready <PR>
├─ Fallback: REST API PATCH
└─ Success: Continue to next step

Step Failed: Merge PR
├─ Try: Normal merge
├─ Fallback: Admin override (--admin flag)
└─ Manual: User reviews logs and resolves conflicts

Step Failed: Trigger Smoke Tests
├─ Try: Workflow name "Edge Smoke Tests"
├─ Fallback: Try alternative names
├─ Log: Note if not found (continue-on-error)
└─ Manual: Trigger tests manually if needed
```

---

**All flows are operational and validated** ✅

See also:
- [PR_AUTOMATION_QUICKSTART.md](./PR_AUTOMATION_QUICKSTART.md) - Quick start guide
- [PR_AUTOMATION_VALIDATION.md](./PR_AUTOMATION_VALIDATION.md) - Full validation
- [AUTOMATION.md](./AUTOMATION.md) - Complete documentation
