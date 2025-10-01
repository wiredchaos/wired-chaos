# PR Automation Validation Script (PowerShell)
# Validates that all PR automation components are in place and configured correctly

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Validating PR Automation Implementation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Track overall status
$AllPassed = $true

# Function to check if a file exists
function Test-FileExists {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Write-Host "✅ $Description`: $Path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description`: $Path" -ForegroundColor Red
        $script:AllPassed = $false
        return $false
    }
}

# Function to check if a string exists in a file
function Test-ContentExists {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Description
    )
    
    if ((Test-Path $Path) -and (Select-String -Path $Path -Pattern $Pattern -Quiet)) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description" -ForegroundColor Red
        $script:AllPassed = $false
        return $false
    }
}

Write-Host "📋 Checking Workflow Files..." -ForegroundColor Yellow
Write-Host "------------------------------"

# Check comment-ready-merge workflow
$commentWorkflow = ".github/workflows/comment-ready-merge.yml"
if (Test-FileExists -Path $commentWorkflow -Description "Comment Ready & Merge workflow") {
    Test-ContentExists -Path $commentWorkflow -Pattern "issue_comment" -Description "  - Listens for issue comments"
    Test-ContentExists -Path $commentWorkflow -Pattern "/ready|ready" -Description "  - Checks for /ready command"
    Test-ContentExists -Path $commentWorkflow -Pattern "squash" -Description "  - Uses squash merge"
    Test-ContentExists -Path $commentWorkflow -Pattern "delete-branch" -Description "  - Deletes branch after merge"
    Test-ContentExists -Path $commentWorkflow -Pattern "Edge Smoke Tests" -Description "  - Triggers Edge Smoke Tests"
}

Write-Host ""

# Check auto-ready-merge workflow
$autoWorkflow = ".github/workflows/auto-ready-merge.yml"
if (Test-FileExists -Path $autoWorkflow -Description "Auto Ready & Merge workflow") {
    Test-ContentExists -Path $autoWorkflow -Pattern "schedule:" -Description "  - Has scheduled trigger"
    Test-ContentExists -Path $autoWorkflow -Pattern "automerge" -Description "  - Checks for automerge label"
    Test-ContentExists -Path $autoWorkflow -Pattern "squash" -Description "  - Uses squash merge"
    Test-ContentExists -Path $autoWorkflow -Pattern "delete-branch" -Description "  - Deletes branch after merge"
}

Write-Host ""

# Check edge-smoke workflow
$smokeWorkflow = ".github/workflows/edge-smoke.yml"
if (Test-FileExists -Path $smokeWorkflow -Description "Edge Smoke Tests workflow") {
    Test-ContentExists -Path $smokeWorkflow -Pattern "workflow_dispatch" -Description "  - Can be triggered manually"
}

Write-Host ""
Write-Host "📋 Checking VS Code Integration..." -ForegroundColor Yellow
Write-Host "----------------------------------"

# Check VS Code tasks
$tasksFile = ".vscode/tasks.json"
if (Test-FileExists -Path $tasksFile -Description "VS Code tasks configuration") {
    Test-ContentExists -Path $tasksFile -Pattern "PR: /ready" -Description "  - PR: /ready task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: Add automerge label" -Description "  - PR: Add automerge label task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: Remove automerge label" -Description "  - PR: Remove automerge label task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: View status" -Description "  - PR: View status task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: List open PRs" -Description "  - PR: List open PRs task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: Trigger Edge Smoke Tests" -Description "  - PR: Trigger Edge Smoke Tests task exists"
    Test-ContentExists -Path $tasksFile -Pattern "PR: Manual ready & merge" -Description "  - PR: Manual ready & merge task exists"
}

Write-Host ""
Write-Host "📋 Checking Documentation..." -ForegroundColor Yellow
Write-Host "----------------------------"

# Check documentation
$automationMd = "AUTOMATION.md"
if (Test-FileExists -Path $automationMd -Description "Main automation documentation") {
    Test-ContentExists -Path $automationMd -Pattern "Comment-Driven PR Ready & Merge" -Description "  - Documents comment-driven workflow"
    Test-ContentExists -Path $automationMd -Pattern "Auto Ready & Merge" -Description "  - Documents label-driven workflow"
    Test-ContentExists -Path $automationMd -Pattern "VS Code Integration" -Description "  - Documents VS Code integration"
    Test-ContentExists -Path $automationMd -Pattern "Edge Smoke Tests" -Description "  - Documents Edge Smoke Tests"
    Test-ContentExists -Path $automationMd -Pattern "/ready" -Description "  - Explains /ready command"
    Test-ContentExists -Path $automationMd -Pattern "automerge" -Description "  - Explains automerge label"
}

Test-FileExists -Path "PR_AUTOMATION_VALIDATION.md" -Description "Validation guide"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

if ($AllPassed) {
    Write-Host "✅ All PR automation components are in place!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 The PR automation system is fully implemented and operational." -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Start:" -ForegroundColor Cyan
    Write-Host "  • Comment '/ready' on any PR to trigger automation"
    Write-Host "  • Add 'automerge' label for scheduled processing"
    Write-Host "  • Use VS Code tasks (Ctrl+Shift+P → Tasks: Run Task)"
    Write-Host ""
    Write-Host "For more information, see AUTOMATION.md and PR_AUTOMATION_VALIDATION.md"
    exit 0
} else {
    Write-Host "❌ Some PR automation components are missing or misconfigured." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the errors above and ensure all required files are in place."
    exit 1
}
