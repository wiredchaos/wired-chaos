# WIRED CHAOS - Complete PR Resolution Automation
# Handles all 7 outstanding pull requests with intelligent conflict resolution

Write-Host "🚀 WIRED CHAOS - Complete PR Resolution System" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# List of PRs to process (in order of priority)
$PRList = @(
    @{ Number = 16; Title = "VS Code workspace configuration"; Status = "Ready" },
    @{ Number = 11; Title = "Code Quality Fix Automation"; Status = "Conflicts" },
    @{ Number = 15; Title = "BUS offline pill and Suite/Tax env helpers"; Status = "WIP" },
    @{ Number = 7; Title = "Suite URL integration"; Status = "Conflicts" },
    @{ Number = 6; Title = "Bundler-safe Suite URL resolver"; Status = "Conflicts" },
    @{ Number = 5; Title = "Edge-served /school route"; Status = "Conflicts" },
    @{ Number = 3; Title = "VS Studio Bot Setup"; Status = "Conflicts" }
)

Write-Host "Found $($PRList.Count) PRs to process" -ForegroundColor Green

$processedCount = 0
$mergedCount = 0
$errorCount = 0

foreach ($pr in $PRList) {
    Write-Host "`n" + "="*60 -ForegroundColor Gray
    Write-Host "🔄 Processing PR #$($pr.Number): $($pr.Title)" -ForegroundColor White
    Write-Host "Status: $($pr.Status)" -ForegroundColor Yellow
    
    try {
        # Check current PR status
        $prInfo = gh pr view $pr.Number --json mergeable,isDraft,statusCheckRollup 2>$null | ConvertFrom-Json
        
        if ($prInfo.mergeable -eq "MERGEABLE" -and !$prInfo.isDraft) {
            # Check if checks are passing
            $failedChecks = if ($prInfo.statusCheckRollup) { 
                ($prInfo.statusCheckRollup | Where-Object { $_.conclusion -eq "FAILURE" }).Count 
            } else { 0 }
            
            if ($failedChecks -eq 0) {
                Write-Host "✅ PR #$($pr.Number) is ready to merge!" -ForegroundColor Green
                
                # Attempt to merge
                $mergeResult = gh pr merge $pr.Number --merge --delete-branch 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "🎉 Successfully merged PR #$($pr.Number)" -ForegroundColor Green
                    $mergedCount++
                } else {
                    Write-Host "❌ Failed to merge PR #$($pr.Number)" -ForegroundColor Red
                    $errorCount++
                }
            } else {
                Write-Host "⏳ PR #$($pr.Number) has $failedChecks failed checks - waiting" -ForegroundColor Yellow
            }
        } elseif ($prInfo.mergeable -eq "CONFLICTING") {
            Write-Host "⚠️  PR #$($pr.Number) has merge conflicts - needs manual resolution" -ForegroundColor Yellow
            
            # Auto-resolve strategy for common conflicts
            Write-Host "🔧 Attempting auto-resolution..." -ForegroundColor Blue
            
            # Checkout the PR
            gh pr checkout $pr.Number 2>$null
            if ($LASTEXITCODE -eq 0) {
                # Try to merge main
                git merge main --no-edit 2>$null
                if ($LASTEXITCODE -eq 0) {
                    # Success! Push the resolution
                    git push origin HEAD 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "✅ Auto-resolved conflicts for PR #$($pr.Number)" -ForegroundColor Green
                    } else {
                        Write-Host "❌ Failed to push resolution for PR #$($pr.Number)" -ForegroundColor Red
                        $errorCount++
                    }
                } else {
                    Write-Host "🔧 Complex conflicts detected - using intelligent resolution" -ForegroundColor Yellow
                    
                    # For common conflict patterns, use strategic resolution
                    $conflictedFiles = git diff --name-only --diff-filter=U 2>$null
                    
                    foreach ($file in $conflictedFiles) {
                        if ($file -eq ".gitignore") {
                            # Always prefer main branch .gitignore (more recent)
                            git checkout --theirs .gitignore 2>$null
                            git add .gitignore 2>$null
                        } elseif ($file -match "README\.md") {
                            # Prefer main branch README (more comprehensive)
                            git checkout --theirs $file 2>$null
                            git add $file 2>$null
                        } elseif ($file -match "\.md$" -and $file -notmatch "README") {
                            # For other markdown files, prefer PR branch (new features)
                            git checkout --ours $file 2>$null
                            git add $file 2>$null
                        }
                    }
                    
                    # Commit the resolution
                    git commit -m "resolve: auto-resolve merge conflicts for PR #$($pr.Number)" 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        git push origin HEAD 2>$null
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "✅ Intelligent conflict resolution completed for PR #$($pr.Number)" -ForegroundColor Green
                        }
                    }
                }
            }
            
            # Return to main
            git checkout main 2>$null
            
        } elseif ($prInfo.isDraft) {
            Write-Host "📝 PR #$($pr.Number) is a draft - marking as ready" -ForegroundColor Blue
            gh pr ready $pr.Number 2>$null
        } else {
            Write-Host "❓ PR #$($pr.Number) status unclear - skipping for manual review" -ForegroundColor Gray
        }
        
        $processedCount++
        
    } catch {
        Write-Host "❌ Error processing PR #$($pr.Number): $_" -ForegroundColor Red
        $errorCount++
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Seconds 2
}

# Final summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "📊 PR RESOLUTION SUMMARY" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

Write-Host "📋 Total PRs processed: $processedCount" -ForegroundColor White
Write-Host "✅ Successfully merged: $mergedCount" -ForegroundColor Green
Write-Host "❌ Errors encountered: $errorCount" -ForegroundColor Red
Write-Host "⏳ Remaining PRs: $($PRList.Count - $mergedCount)" -ForegroundColor Yellow

if ($mergedCount -gt 0) {
    Write-Host "`n🎉 Progress made! $mergedCount PRs successfully integrated." -ForegroundColor Green
}

if ($errorCount -gt 0) {
    Write-Host "`n🔧 Some PRs need manual attention. Check the output above for details." -ForegroundColor Yellow
}

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Check remaining PR statuses: gh pr list" -ForegroundColor White
Write-Host "2. Monitor CI/CD builds for merged PRs" -ForegroundColor White
Write-Host "3. Review any failed auto-resolutions manually" -ForegroundColor White

Write-Host "`n✨ PR resolution automation complete!" -ForegroundColor Green