# WIRED CHAOS - Pull Request Management Automation
# Comprehensive script to process all outstanding PRs

param(
    [switch]$DryRun = $false,
    [switch]$AutoMerge = $false,
    [int[]]$PRNumbers = @(),
    [string]$Action = "status"  # status, merge, close, review
)

Write-Host "🔄 WIRED CHAOS - Pull Request Management" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Get list of open PRs
Write-Host "`n📋 Fetching open pull requests..." -ForegroundColor Yellow

try {
    $prListJson = gh pr list --state open --json number,title,headRefName,mergeable,statusCheckRollup 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to fetch PR list. Make sure you're authenticated with GitHub CLI." -ForegroundColor Red
        exit 1
    }
    
    $openPRs = $prListJson | ConvertFrom-Json
    
    if ($openPRs.Count -eq 0) {
        Write-Host "✅ No open pull requests found!" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "Found $($openPRs.Count) open pull requests" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error fetching PRs: $_" -ForegroundColor Red
    exit 1
}

# Filter PRs if specific numbers provided
if ($PRNumbers.Count -gt 0) {
    $openPRs = $openPRs | Where-Object { $_.number -in $PRNumbers }
    Write-Host "🎯 Filtering to specific PRs: $($PRNumbers -join ', ')" -ForegroundColor Blue
}

# Process each PR
$results = @()

foreach ($pr in $openPRs) {
    Write-Host "`n" + "="*60 -ForegroundColor Gray
    Write-Host "🔍 PR #$($pr.number): $($pr.title)" -ForegroundColor White
    Write-Host "Branch: $($pr.headRefName)" -ForegroundColor Gray
    
    $prResult = @{
        Number = $pr.number
        Title = $pr.title
        Branch = $pr.headRefName
        Mergeable = $pr.mergeable
        Status = "Unknown"
        Action = "None"
        ChecksPassing = $false
        CanMerge = $false
    }
    
    # Check status
    $failedChecks = @()
    $passingChecks = @()
    
    if ($pr.statusCheckRollup -and $pr.statusCheckRollup.Count -gt 0) {
        foreach ($check in $pr.statusCheckRollup) {
            if ($check.conclusion -eq "FAILURE") {
                $failedChecks += $check.name
            } elseif ($check.conclusion -eq "SUCCESS") {
                $passingChecks += $check.name
            }
        }
    }
    
    $prResult.ChecksPassing = $failedChecks.Count -eq 0
    
    if ($failedChecks.Count -gt 0) {
        Write-Host "❌ Failed checks: $($failedChecks -join ', ')" -ForegroundColor Red
        $prResult.Status = "Checks Failed"
    } elseif ($passingChecks.Count -gt 0) {
        Write-Host "✅ All checks passing ($($passingChecks.Count) checks)" -ForegroundColor Green
        $prResult.Status = "Checks Passing"
    } else {
        Write-Host "⏳ No status checks found" -ForegroundColor Yellow
        $prResult.Status = "No Checks"
    }
    
    # Check if mergeable
    if ($pr.mergeable -eq "MERGEABLE") {
        Write-Host "✅ Mergeable: Yes" -ForegroundColor Green
        $prResult.CanMerge = $true
    } elseif ($pr.mergeable -eq "CONFLICTING") {
        Write-Host "❌ Mergeable: Conflicts detected" -ForegroundColor Red
        $prResult.CanMerge = $false
    } else {
        Write-Host "⚠️  Mergeable: Unknown" -ForegroundColor Yellow
        $prResult.CanMerge = $false
    }
    
    # Determine recommended action
    if ($prResult.ChecksPassing -and $prResult.CanMerge) {
        $prResult.Action = "Ready to Merge"
        Write-Host "🚀 Recommendation: Ready to merge!" -ForegroundColor Green
        
        if ($AutoMerge -and !$DryRun) {
            Write-Host "🔄 Auto-merging PR #$($pr.number)..." -ForegroundColor Blue
            try {
                gh pr merge $pr.number --merge --delete-branch 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Successfully merged PR #$($pr.number)" -ForegroundColor Green
                    $prResult.Action = "Merged"
                } else {
                    Write-Host "❌ Failed to merge PR #$($pr.number)" -ForegroundColor Red
                    $prResult.Action = "Merge Failed"
                }
            } catch {
                Write-Host "❌ Error merging PR #$($pr.number): $_" -ForegroundColor Red
                $prResult.Action = "Merge Error"
            }
        }
        
    } elseif (!$prResult.ChecksPassing) {
        $prResult.Action = "Fix Checks"
        Write-Host "🔧 Recommendation: Fix failing checks" -ForegroundColor Yellow
    } elseif (!$prResult.CanMerge) {
        $prResult.Action = "Resolve Conflicts"
        Write-Host "⚠️  Recommendation: Resolve merge conflicts" -ForegroundColor Yellow
    } else {
        $prResult.Action = "Review Required"
        Write-Host "👀 Recommendation: Manual review required" -ForegroundColor Blue
    }
    
    $results += $prResult
}

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "📊 PULL REQUEST SUMMARY" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

$readyToMerge = $results | Where-Object { $_.Action -eq "Ready to Merge" -or $_.Action -eq "Merged" }
$needsWork = $results | Where-Object { $_.Action -eq "Fix Checks" -or $_.Action -eq "Resolve Conflicts" }
$needsReview = $results | Where-Object { $_.Action -eq "Review Required" }

Write-Host "🚀 Ready to merge: $($readyToMerge.Count)" -ForegroundColor Green
Write-Host "🔧 Needs work: $($needsWork.Count)" -ForegroundColor Yellow  
Write-Host "👀 Needs review: $($needsReview.Count)" -ForegroundColor Blue

if ($readyToMerge.Count -gt 0) {
    Write-Host "`n✅ Ready to merge:" -ForegroundColor Green
    $readyToMerge | ForEach-Object { 
        Write-Host "   • PR #$($_.Number): $($_.Title)" -ForegroundColor White
    }
}

if ($needsWork.Count -gt 0) {
    Write-Host "`n🔧 Needs work:" -ForegroundColor Yellow
    $needsWork | ForEach-Object { 
        Write-Host "   • PR #$($_.Number): $($_.Action) - $($_.Title)" -ForegroundColor White
    }
}

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - No PRs were actually merged" -ForegroundColor Magenta
}

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Review PRs that need work and fix issues" -ForegroundColor White
Write-Host "2. Use -AutoMerge flag to automatically merge ready PRs" -ForegroundColor White
Write-Host "3. Use -PRNumbers @(11,15,16) to target specific PRs" -ForegroundColor White

Write-Host "`n✨ PR management complete!" -ForegroundColor Green