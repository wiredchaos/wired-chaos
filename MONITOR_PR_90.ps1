#!/usr/bin/env powershell

# 🚀 ONE-CLICK PR #90 MONITORING AND FIX DASHBOARD
# Real-time monitoring for contractor marketplace deployment

Write-Host "🚀 PR #90 DEPLOYMENT MONITOR" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "=" * 50 -ForegroundColor Yellow
Write-Host ""

function Show-Status {
    param($message, $status, $color = "White")
    $prefix = switch ($status) {
        "SUCCESS" { "✅" }
        "FAILURE" { "❌" }
        "RUNNING" { "⏳" }
        "PENDING" { "🔄" }
        default { "ℹ️" }
    }
    Write-Host "$prefix $message" -ForegroundColor $color
}

# 1. Check PR #90 Status
Write-Host "1️⃣ PR #90 Current Status" -ForegroundColor Cyan
$prStatus = gh pr view 90 --json state,mergeable,statusCheckRollup,url 2>$null
if ($prStatus) {
    $pr = $prStatus | ConvertFrom-Json
    Show-Status "PR State: $($pr.state)" "INFO" "Yellow"
    Show-Status "Mergeable: $($pr.mergeable)" "INFO" "Yellow"
    Write-Host "   URL: $($pr.url)" -ForegroundColor Gray

    # Count check status
    $checks = $pr.statusCheckRollup
    $success = ($checks | Where-Object { $_.conclusion -eq "SUCCESS" }).Count
    $failed = ($checks | Where-Object { $_.conclusion -eq "FAILURE" }).Count
    $total = $checks.Count

    Write-Host ""
    Show-Status "Checks: $success/$total passing" $(if ($failed -eq 0) { "SUCCESS" } else { "FAILURE" }) $(if ($failed -eq 0) { "Green" } else { "Red" })

    if ($failed -gt 0) {
        Write-Host "   Failed checks:" -ForegroundColor Yellow
        $checks | Where-Object { $_.conclusion -eq "FAILURE" } | Select-Object -First 5 | ForEach-Object {
            Write-Host "     ❌ $($_.name)" -ForegroundColor Red
        }
    }
} else {
    Show-Status "Could not fetch PR status" "FAILURE" "Red"
}

Write-Host ""

# 2. Recent Workflow Runs
Write-Host "2️⃣ Recent Workflow Runs" -ForegroundColor Cyan
$runs = gh run list --limit 8 --json status,conclusion,workflowName,createdAt 2>$null
if ($runs) {
    $runsData = $runs | ConvertFrom-Json
    foreach ($run in $runsData) {
        $status = if ($run.status -eq "completed") { $run.conclusion.ToUpper() } else { "RUNNING" }
        $color = switch ($status) {
            "SUCCESS" { "Green" }
            "FAILURE" { "Red" }
            "RUNNING" { "Yellow" }
            default { "Gray" }
        }
        $workflow = $run.workflowName -replace '.github/workflows/', '' -replace '.yml', ''
        Show-Status "$workflow" $status $color
    }
} else {
    Show-Status "Could not fetch workflow runs" "FAILURE" "Red"
}

Write-Host ""

# 3. Critical Fixes Applied
Write-Host "3️⃣ Emergency Fixes Applied" -ForegroundColor Cyan
$fixes = @(
    @{ Name = "Worker name (chaoswired → wired-chaos-meta)"; File = "src/wrangler.toml"; Applied = $true },
    @{ Name = "Frontend yarn.lock cache dependency"; File = "frontend/yarn.lock"; Applied = $true },
    @{ Name = "Emergency fix automation script"; File = "EMERGENCY_FIX_PR_90.ps1"; Applied = $true }
)

foreach ($fix in $fixes) {
    $exists = Test-Path $fix.File
    if ($exists -and $fix.Applied) {
        Show-Status "$($fix.Name)" "SUCCESS" "Green"
    } else {
        Show-Status "$($fix.Name)" "FAILURE" "Red"
    }
}

Write-Host ""

# 4. Next Actions
Write-Host "4️⃣ Recommended Actions" -ForegroundColor Cyan

# Check if main issues are resolved
$wranglerContent = Get-Content "src/wrangler.toml" -Raw 2>$null
$hasCorrectWorkerName = $wranglerContent -match 'name = "wired-chaos-meta"'
$hasYarnLock = Test-Path "frontend/yarn.lock"

if ($hasCorrectWorkerName -and $hasYarnLock) {
    Show-Status "Core configuration fixes are in place" "SUCCESS" "Green"
    Write-Host ""
    Write-Host "🎯 IMMEDIATE ACTIONS:" -ForegroundColor Magenta
    Write-Host "1. Monitor new workflow runs: gh run list --limit 5" -ForegroundColor White
    Write-Host "2. Check specific workflow: gh run view [RUN_ID] --log" -ForegroundColor White
    Write-Host "3. If still failing, check Cloudflare dashboard" -ForegroundColor White
    Write-Host "4. Consider manual Wrangler deployment: cd src && wrangler deploy" -ForegroundColor White
} else {
    Show-Status "Configuration issues remain" "FAILURE" "Red"
    Write-Host ""
    Write-Host "⚠️ MANUAL FIXES NEEDED:" -ForegroundColor Red
    if (-not $hasCorrectWorkerName) {
        Write-Host "- Fix worker name in src/wrangler.toml" -ForegroundColor Yellow
    }
    if (-not $hasYarnLock) {
        Write-Host "- Create frontend/yarn.lock file" -ForegroundColor Yellow
    }
}

Write-Host ""

# 5. Real-time Commands
Write-Host "5️⃣ Quick Commands" -ForegroundColor Cyan
Write-Host "gh pr view 90                    # Check PR status" -ForegroundColor Gray
Write-Host "gh run list --limit 5           # Recent workflows" -ForegroundColor Gray
Write-Host "gh run view [ID] --log          # View specific run" -ForegroundColor Gray
Write-Host "git status                      # Check local changes" -ForegroundColor Gray
Write-Host "git push origin feature/...     # Push any fixes" -ForegroundColor Gray

Write-Host ""
Write-Host "🔄 MONITORING LOOP" -ForegroundColor Green -BackgroundColor Black
Write-Host "Run this script periodically to track deployment progress" -ForegroundColor White
Write-Host "Press Ctrl+C to exit monitoring" -ForegroundColor Gray

# Auto-refresh option
$refresh = Read-Host "`nAuto-refresh in 30 seconds? (y/n)"
if ($refresh -eq 'y') {
    Start-Sleep 30
    & $MyInvocation.MyCommand.Path
}
