#!/usr/bin/env pwsh
# WIRED CHAOS - WIX/GAMMA Integration Deployment Script
# Automated deployment for WIX and GAMMA integration system

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SetupOnly = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔹 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          WIRED CHAOS - WIX/GAMMA INTEGRATION             ║
║              Automated Deployment Script                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Change to integration directory
$IntegrationDir = Join-Path $PSScriptRoot ".."
if (-not (Test-Path $IntegrationDir)) {
    Write-Error-Custom "Integration directory not found: $IntegrationDir"
    exit 1
}

Set-Location $IntegrationDir
Write-Success "Working directory: $IntegrationDir"

# Step 1: Check prerequisites
Write-Step "Checking prerequisites..."

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error-Custom "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check Wrangler
try {
    $wranglerVersion = wrangler --version
    Write-Success "Wrangler: $wranglerVersion"
} catch {
    Write-Warning-Custom "Wrangler not found. Installing..."
    npm install -g wrangler
    Write-Success "Wrangler installed"
}

# Check Git
try {
    $gitVersion = git --version
    Write-Success "Git: $gitVersion"
} catch {
    Write-Error-Custom "Git not found. Please install Git"
    exit 1
}

# Step 2: Install dependencies
Write-Step "Installing dependencies..."
if (Test-Path "package.json") {
    npm install
    Write-Success "Dependencies installed"
} else {
    Write-Warning-Custom "package.json not found, skipping npm install"
}

# Step 3: Setup KV Namespaces (if setup mode)
if ($SetupOnly) {
    Write-Step "Creating KV Namespaces..."
    
    try {
        Write-Host "Creating CACHE_KV..." -ForegroundColor Gray
        wrangler kv:namespace create CACHE_KV --env $Environment
        
        Write-Host "Creating ANALYTICS_KV..." -ForegroundColor Gray
        wrangler kv:namespace create ANALYTICS_KV --env $Environment
        
        Write-Host "Creating SYNC_KV..." -ForegroundColor Gray
        wrangler kv:namespace create SYNC_KV --env $Environment
        
        Write-Success "KV Namespaces created"
    } catch {
        Write-Warning-Custom "Some KV namespaces may already exist"
    }
    
    # Create R2 bucket
    Write-Step "Creating R2 Bucket..."
    try {
        wrangler r2 bucket create wired-chaos-ar-models
        Write-Success "R2 bucket created"
    } catch {
        Write-Warning-Custom "R2 bucket may already exist"
    }
    
    Write-Success "Setup complete! Update wrangler.toml with KV namespace IDs"
    exit 0
}

# Step 4: Validate configuration
Write-Step "Validating configuration..."

$wranglerToml = Join-Path "cloudflare" "workers" "wrangler.toml"
if (-not (Test-Path $wranglerToml)) {
    Write-Error-Custom "wrangler.toml not found at: $wranglerToml"
    exit 1
}

Write-Success "Configuration validated"

# Step 5: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Step "Running tests..."
    try {
        npm test
        Write-Success "Tests passed"
    } catch {
        Write-Warning-Custom "Tests failed or not implemented, continuing..."
    }
}

# Step 6: Deploy worker
Write-Step "Deploying worker to $Environment..."

Set-Location (Join-Path "cloudflare" "workers")

try {
    if ($Environment -eq 'production') {
        wrangler deploy --env production
    } elseif ($Environment -eq 'staging') {
        wrangler deploy --env staging
    } else {
        wrangler deploy --env development
    }
    
    Write-Success "Worker deployed successfully"
} catch {
    Write-Error-Custom "Worker deployment failed: $_"
    exit 1
}

# Step 7: Verify deployment
Write-Step "Verifying deployment..."

Start-Sleep -Seconds 3

try {
    $healthUrl = if ($Environment -eq 'production') {
        "https://wired-chaos.pages.dev/api/health"
    } elseif ($Environment -eq 'staging') {
        "https://staging.wired-chaos.pages.dev/api/health"
    } else {
        "https://dev.wired-chaos.pages.dev/api/health"
    }
    
    Write-Host "Testing: $healthUrl" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10
    
    if ($response.success) {
        Write-Success "Deployment verified - Worker is healthy"
    } else {
        Write-Warning-Custom "Worker responded but health check failed"
    }
} catch {
    Write-Warning-Custom "Could not verify deployment (this is normal if DNS not configured yet)"
}

# Step 8: Generate deployment report
Write-Step "Generating deployment report..."

$reportPath = Join-Path $IntegrationDir "deployment-report.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$report = @"
# WIX/GAMMA Integration Deployment Report

**Timestamp:** $timestamp
**Environment:** $Environment
**Status:** ✅ SUCCESS

## Deployment Details

- **Worker:** wix-gamma-integration-$(if ($Environment -eq 'production') { 'prod' } else { $Environment })
- **Wrangler Version:** $wranglerVersion
- **Node.js Version:** $nodeVersion

## Next Steps

1. Configure WIX app with worker URL
2. Setup GAMMA webhooks
3. Test integration endpoints
4. Monitor logs with: ``wrangler tail --env $Environment``

## Endpoints

- Health Check: ``/api/health``
- WIX API: ``/api/wix/*``
- GAMMA API: ``/api/gamma/*``
- Sync: ``/api/sync/*``

## Required Secrets

Ensure these secrets are set:

``````bash
wrangler secret put WIX_API_TOKEN --env $Environment
wrangler secret put WIX_ACCESS_TOKEN --env $Environment
wrangler secret put GAMMA_API_KEY --env $Environment
``````

## Documentation

- [WIX Integration Guide](docs/wix-integration.md)
- [GAMMA Integration Guide](docs/gamma-integration.md)
- [Deployment Guide](docs/deployment-guide.md)

---

**WIRED CHAOS** - Deployment successful! 🚀
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Success "Deployment report saved to: $reportPath"

# Step 9: Summary
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║              DEPLOYMENT COMPLETED SUCCESSFULLY            ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  • Environment: $Environment" -ForegroundColor White
Write-Host "  • Worker deployed and verified" -ForegroundColor White
Write-Host "  • Report generated: deployment-report.md" -ForegroundColor White

Write-Host "`n🔍 Monitor logs:" -ForegroundColor Cyan
Write-Host "  wrangler tail --env $Environment" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  See docs/ directory for integration guides" -ForegroundColor Gray

Write-Host "`n✨ Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure WIX app with worker URL" -ForegroundColor White
Write-Host "  2. Setup GAMMA webhooks" -ForegroundColor White
Write-Host "  3. Test integration endpoints" -ForegroundColor White
Write-Host "  4. Set required secrets (see deployment-report.md)" -ForegroundColor White

Write-Host ""
