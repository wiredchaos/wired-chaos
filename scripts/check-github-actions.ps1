# WIRED CHAOS - GitHub Actions Deprecation Fix
# Quick script to check and update deprecated GitHub Actions

Write-Host "GitHub Actions Deprecation Checker" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$workflowPath = ".github/workflows"
if (!(Test-Path $workflowPath)) {
    Write-Host "No .github/workflows directory found" -ForegroundColor Red
    exit 1
}

# Check for deprecated actions
Write-Host "`nScanning workflow files..." -ForegroundColor Yellow

$foundIssues = $false

Get-ChildItem "$workflowPath\*.yml" -ErrorAction SilentlyContinue | ForEach-Object {
    $fileName = $_.Name
    $content = Get-Content $_.FullName -Raw
    
    Write-Host "Checking: $fileName" -ForegroundColor White
    
    # Check for deprecated upload-artifact@v3
    if ($content -match "upload-artifact@v3") {
        Write-Host "  ❌ Found deprecated: upload-artifact@v3" -ForegroundColor Red
        $foundIssues = $true
    } elseif ($content -match "upload-artifact@v4") {
        Write-Host "  ✅ Using current: upload-artifact@v4" -ForegroundColor Green
    }
    
    # Check for other potentially outdated actions
    if ($content -match "checkout@v[12]") {
        Write-Host "  ⚠️  Found old checkout version (consider updating to v4)" -ForegroundColor Yellow
        $foundIssues = $true
    }
    
    if ($content -match "setup-node@v[123]") {
        Write-Host "  ⚠️  Found old setup-node version (consider updating to v4)" -ForegroundColor Yellow
        $foundIssues = $true
    }
}

Write-Host "`nScan complete!" -ForegroundColor Green

if (!$foundIssues) {
    Write-Host "✅ All GitHub Actions appear to be using current versions!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some actions may need updates. Check the output above." -ForegroundColor Yellow
}