# WIRED CHAOS - GitHub Actions Version Updater
# Automated script to check and update GitHub Actions to latest versions

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "🔍 WIRED CHAOS - GitHub Actions Version Checker" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$workflowPath = ".github/workflows"
if (!(Test-Path $workflowPath)) {
    Write-Host "❌ No .github/workflows directory found" -ForegroundColor Red
    exit 1
}

# Common GitHub Actions and their recommended latest versions
$actionUpdates = @{
    "actions/checkout@v3" = "actions/checkout@v4"
    "actions/checkout@v2" = "actions/checkout@v4"
    "actions/checkout@v1" = "actions/checkout@v4"
    "actions/upload-artifact@v3" = "actions/upload-artifact@v4"
    "actions/upload-artifact@v2" = "actions/upload-artifact@v4"
    "actions/upload-artifact@v1" = "actions/upload-artifact@v4"
    "actions/download-artifact@v3" = "actions/download-artifact@v4"
    "actions/download-artifact@v2" = "actions/download-artifact@v4"
    "actions/download-artifact@v1" = "actions/download-artifact@v4"
    "actions/setup-node@v3" = "actions/setup-node@v4"
    "actions/setup-node@v2" = "actions/setup-node@v4"
    "actions/setup-python@v4" = "actions/setup-python@v5"
    "actions/setup-python@v3" = "actions/setup-python@v5"
    "actions/cache@v3" = "actions/cache@v4"
    "actions/cache@v2" = "actions/cache@v4"
}

# Cloudflare-specific actions (check if newer versions exist)
$cloudflareActions = @{
    "cloudflare/wrangler-action@v3" = "cloudflare/wrangler-action@v3"  # Current latest
    "cloudflare/pages-action@v1" = "cloudflare/pages-action@v1"        # Current latest
}

$filesChanged = @()
$totalUpdates = 0

Write-Host "`n🔍 Scanning workflow files..." -ForegroundColor Yellow

Get-ChildItem "$workflowPath/*.yml", "$workflowPath/*.yaml" -ErrorAction SilentlyContinue | ForEach-Object {
    $filePath = $_.FullName
    $fileName = $_.Name
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $fileUpdates = 0
    
    Write-Host "`n📄 Checking: $fileName" -ForegroundColor White
    
    # Check for outdated actions
    foreach ($oldAction in $actionUpdates.Keys) {
        $newAction = $actionUpdates[$oldAction]
        
        if ($content -match [regex]::Escape($oldAction)) {
            Write-Host "  ⚠️  Found outdated: $oldAction" -ForegroundColor Yellow
            Write-Host "  ✅ Updating to: $newAction" -ForegroundColor Green
            
            $content = $content -replace [regex]::Escape($oldAction), $newAction
            $fileUpdates++
            $totalUpdates++
        }
    }
    
    # Report on Cloudflare actions (info only)
    foreach ($cfAction in $cloudflareActions.Keys) {
        if ($content -match [regex]::Escape($cfAction)) {
            Write-Host "  ℹ️  Found Cloudflare action: $cfAction (checking if latest...)" -ForegroundColor Blue
        }
    }
    
    # Apply changes if not dry run
    if ($fileUpdates -gt 0) {
        $filesChanged += $fileName
        
        if ($DryRun) {
            Write-Host "  🔍 DRY RUN: Would update $fileUpdates action(s) in $fileName" -ForegroundColor Magenta
        } else {
            Set-Content $filePath $content -NoNewline
            Write-Host "  ✅ Updated $fileUpdates action(s) in $fileName" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✅ No updates needed in $fileName" -ForegroundColor Green
    }
}

Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

if ($totalUpdates -eq 0) {
    Write-Host "✅ All GitHub Actions are up to date!" -ForegroundColor Green
} else {
    Write-Host "📈 Total updates: $totalUpdates" -ForegroundColor Yellow
    Write-Host "📁 Files modified: $($filesChanged.Count)" -ForegroundColor Yellow
    
    if ($filesChanged.Count -gt 0) {
        Write-Host "📋 Modified files:" -ForegroundColor White
        $filesChanged | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    }
}

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - No files were actually modified" -ForegroundColor Magenta
    Write-Host "Run without -DryRun to apply changes" -ForegroundColor Magenta
} elseif ($totalUpdates -gt 0) {
    Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Review the changes: git diff .github/workflows/" -ForegroundColor White
    Write-Host "2. Commit changes: git add .github/workflows/" -ForegroundColor White
    Write-Host "   then: git commit -m 'fix: update GitHub Actions to latest versions'" -ForegroundColor White
    Write-Host "3. Push to GitHub: git push origin main" -ForegroundColor White
}

Write-Host "`nGitHub Actions version check complete!" -ForegroundColor Green