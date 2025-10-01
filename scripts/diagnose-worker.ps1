# WIRED CHAOS - Cloudflare Worker Deployment Diagnostics
# Script to diagnose and fix common Cloudflare Worker deployment issues

Write-Host "🔧 WIRED CHAOS - Worker Deployment Diagnostics" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$srcPath = "src"
$errors = @()
$warnings = @()

# Check if src directory exists
if (!(Test-Path $srcPath)) {
    $errors += "❌ Source directory 'src' not found"
} else {
    Write-Host "✅ Source directory found" -ForegroundColor Green
}

# Check wrangler.toml
$wranglerPath = "$srcPath/wrangler.toml"
if (!(Test-Path $wranglerPath)) {
    $errors += "❌ wrangler.toml not found in src directory"
} else {
    Write-Host "✅ wrangler.toml found" -ForegroundColor Green
    
    $wranglerContent = Get-Content $wranglerPath -Raw
    
    # Check for required fields
    if ($wranglerContent -notmatch 'name\s*=') {
        $errors += "❌ Missing 'name' field in wrangler.toml"
    }
    
    if ($wranglerContent -notmatch 'main\s*=') {
        $errors += "❌ Missing 'main' field in wrangler.toml"
    }
    
    if ($wranglerContent -notmatch 'compatibility_date\s*=') {
        $warnings += "⚠️  Missing 'compatibility_date' field in wrangler.toml"
    }
}

# Check worker source file
$workerPath = "$srcPath/index.js"
if (!(Test-Path $workerPath)) {
    $errors += "❌ Worker source file 'src/index.js' not found"
} else {
    Write-Host "✅ Worker source file found" -ForegroundColor Green
    
    $workerContent = Get-Content $workerPath -Raw
    
    if ($workerContent -notmatch 'export\s+default') {
        $errors += "❌ Worker must export a default object with fetch handler"
    }
    
    if ($workerContent -notmatch 'async\s+fetch\s*\(') {
        $errors += "❌ Worker must have an async fetch function"
    }
}

# Check package.json for wrangler dependency
$packagePath = "package.json"
if (Test-Path $packagePath) {
    $packageContent = Get-Content $packagePath -Raw | ConvertFrom-Json
    
    $hasWrangler = $false
    if ($packageContent.dependencies -and $packageContent.dependencies.wrangler) {
        $hasWrangler = $true
    }
    if ($packageContent.devDependencies -and $packageContent.devDependencies.wrangler) {
        $hasWrangler = $true
    }
    
    if ($hasWrangler) {
        Write-Host "✅ Wrangler dependency found" -ForegroundColor Green
    } else {
        $warnings += "⚠️  Wrangler not found in package.json dependencies"
    }
} else {
    $warnings += "⚠️  package.json not found"
}

# Check GitHub workflow
$workflowPath = ".github/workflows/worker-deploy.yml"
if (Test-Path $workflowPath) {
    Write-Host "✅ Worker deployment workflow found" -ForegroundColor Green
    
    $workflowContent = Get-Content $workflowPath -Raw
    
    if ($workflowContent -notmatch 'CLOUDFLARE_API_TOKEN') {
        $warnings += "⚠️  Missing CLOUDFLARE_API_TOKEN secret reference in workflow"
    }
    
    if ($workflowContent -notmatch 'CLOUDFLARE_ACCOUNT_ID') {
        $warnings += "⚠️  Missing CLOUDFLARE_ACCOUNT_ID secret reference in workflow"
    }
} else {
    $warnings += "⚠️  Worker deployment workflow not found"
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📊 DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! Worker should deploy successfully." -ForegroundColor Green
} else {
    if ($errors.Count -gt 0) {
        Write-Host "`n❌ ERRORS (must fix):" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  WARNINGS (recommended to fix):" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    }
}

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Fix any errors shown above" -ForegroundColor White
Write-Host "2. Ensure GitHub secrets are configured:" -ForegroundColor White
Write-Host "   - CLOUDFLARE_API_TOKEN" -ForegroundColor Gray
Write-Host "   - CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Gray
Write-Host "3. Commit and push changes to trigger deployment" -ForegroundColor White
Write-Host "4. Monitor deployment at: https://dash.cloudflare.com/workers" -ForegroundColor White

Write-Host "`n✨ Worker diagnostics complete!" -ForegroundColor Green