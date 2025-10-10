# WIRED CHAOS - Site Wipe & Fresh Build Automation
param([switch]$Force = $false, [switch]$SkipBackup = $false)

function Write-Info { param([string]$Message) Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param([string]$Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param([string]$Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Info "WIRED CHAOS - SITE WIPE & FRESH BUILD AUTOMATION"
Write-Info "==============================================="

if (-not $Force) {
    Write-Warning "This will completely wipe your existing site and rebuild from scratch!"
    $confirm = Read-Host "Type 'WIPE' to confirm"
    if ($confirm -ne "WIPE") {
        Write-Error "Operation cancelled"
        exit 1
    }
}

try {
    # Backup
    if (-not $SkipBackup) {
        Write-Info "Creating backup..."
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        git tag "backup-wipe-$timestamp" 2>$null
        Write-Success "Backup: backup-wipe-$timestamp"
    }

    # Clean cache
    Write-Info "Cleaning caches..."
    try { npm run cache:purge 2>$null; Write-Success "Cache purged" }
    catch { Write-Warning "Cache purge failed" }

    # Clean artifacts
    Write-Info "Cleaning build artifacts..."
    @("frontend\build", ".wrangler", "dist", "temp") | ForEach-Object {
        if (Test-Path $_) { Remove-Item -Recurse -Force $_; Write-Success "$_ cleaned" }
    }

    # Fresh dependencies
    Write-Info "Installing fresh dependencies..."
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
    npm install; Write-Success "Root deps installed"

    if (Test-Path "frontend") {
        Push-Location "frontend"
        if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
        if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
        npm install; Write-Success "Frontend deps installed"
        Pop-Location
    }

    # Build
    Write-Info "Building fresh..."
    if (Test-Path "frontend") {
        Push-Location "frontend"; npm run build; Pop-Location
        Write-Success "Frontend built"
    }

    # Deploy
    Write-Info "Deploying..."
    try {
        gh workflow run deploy-worker.yml
        Write-Success "Deployment triggered"
    } catch {
        Write-Warning "Workflow failed, trying direct"
        if (Test-Path "wrangler.toml") { npx wrangler deploy --env production }
    }

    # Validate
    Write-Info "Validating..."
    Start-Sleep 10
    try {
        Invoke-WebRequest "https://wired-chaos.pages.dev" -TimeoutSec 5 | Out-Null
        Write-Success "Site responding"
    } catch { Write-Warning "Site not ready yet" }

    # Commit
    Write-Info "Committing..."
    git add -A
    git commit -m "FRESH SITE BUILD - Complete wipe and rebuild"
    git push origin main
    Write-Success "Pushed to main"

    Write-Success "FRESH BUILD COMPLETE!"
    Write-Success "Site: https://wired-chaos.pages.dev"
    Write-Success "Domain: https://www.wiredchaos.xyz"

} catch {
    Write-Error "Failed: $($_.Exception.Message)"
    exit 1
}
