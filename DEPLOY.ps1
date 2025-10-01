#!/usr/bin/env pwsh
# WIRED CHAOS - Deployment Automation Script
# Complete deployment for all WIRED CHAOS systems

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('production', 'staging', 'development')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$ForceRun = $false
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Yellow
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔹 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║                    WIRED CHAOS DEPLOYMENT                        ║
║                     Automated Deployment                         ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# STEP 1: Check Prerequisites
Write-Header "STEP 1: CHECKING PREREQUISITES"

Write-Step "Checking Git status..."
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning-Custom "Working directory has uncommitted changes"
        if (-not $ForceRun) {
            $response = Read-Host "Continue anyway? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                exit 1
            }
        }
    } else {
        Write-Success "Working directory is clean"
    }
} catch {
    Write-Warning-Custom "Git not available or not in a repository"
}

Write-Step "Checking GitHub CLI..."
try {
    $ghVersion = gh --version
    Write-Success "GitHub CLI available: $($ghVersion.Split("`n")[0])"
} catch {
    Write-Error-Custom "GitHub CLI not available. Please install: https://cli.github.com/"
    exit 1
}

# STEP 2: Commit and Push Changes
Write-Header "STEP 2: COMMITTING CHANGES"

Write-Step "Adding deployment files..."
try {
    git add .github/
    git add . -A
    
    $commitMessage = "🚀 DEPLOY: WIRED CHAOS Complete System - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMessage
    
    Write-Success "Changes committed"
} catch {
    Write-Warning-Custom "No changes to commit or commit failed"
}

Write-Step "Pushing to repository..."
try {
    git push origin HEAD
    Write-Success "Changes pushed to repository"
} catch {
    Write-Error-Custom "Failed to push changes: $($_.Exception.Message)"
    exit 1
}

# STEP 3: Trigger GitHub Actions
Write-Header "STEP 3: TRIGGERING DEPLOYMENT"

Write-Step "Triggering complete deployment workflow..."
try {
    if ($Environment -eq 'production') {
        gh workflow run "deploy-complete.yml"
    } else {
        gh workflow run "deploy-complete.yml" --ref $Environment
    }
    Write-Success "Deployment workflow triggered"
} catch {
    Write-Error-Custom "Failed to trigger workflow: $($_.Exception.Message)"
}

Write-Step "Triggering frontend deployment..."
try {
    gh workflow run "deploy-frontend.yml"
    Write-Success "Frontend deployment triggered"
} catch {
    Write-Warning-Custom "Frontend workflow trigger failed (may not be needed)"
}

Write-Step "Triggering worker deployment..."
try {
    gh workflow run "deploy-worker.yml"
    Write-Success "Worker deployment triggered"
} catch {
    Write-Warning-Custom "Worker workflow trigger failed (may not be needed)"
}

# STEP 4: Monitor Deployment
Write-Header "STEP 4: MONITORING DEPLOYMENT"

Write-Step "Opening GitHub Actions..."
try {
    $repoUrl = git remote get-url origin
    $repoUrl = $repoUrl -replace "\.git$", ""
    $repoUrl = $repoUrl -replace "git@github\.com:", "https://github.com/"
    $actionsUrl = "$repoUrl/actions"
    
    Write-Host "GitHub Actions URL: $actionsUrl" -ForegroundColor Cyan
    
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        Start-Process $actionsUrl
    } else {
        Write-Host "Open manually: $actionsUrl"
    }
} catch {
    Write-Warning-Custom "Could not determine repository URL"
}

Write-Step "Checking workflow status..."
Start-Sleep -Seconds 5

try {
    $workflows = gh run list --limit 3 --json status,conclusion,workflowName,url
    $workflowData = $workflows | ConvertFrom-Json
    
    foreach ($workflow in $workflowData) {
        $status = $workflow.status
        $conclusion = $workflow.conclusion
        $name = $workflow.workflowName
        $url = $workflow.url
        
        $statusColor = switch ($status) {
            "completed" { "Green" }
            "in_progress" { "Yellow" }
            "queued" { "Cyan" }
            default { "Gray" }
        }
        
        Write-Host "  $name : $status" -ForegroundColor $statusColor
        if ($conclusion) {
            Write-Host "    Conclusion: $conclusion" -ForegroundColor Gray
        }
        Write-Host "    URL: $url" -ForegroundColor Gray
    }
} catch {
    Write-Warning-Custom "Could not fetch workflow status"
}

# STEP 5: Expected URLs
Write-Header "STEP 5: DEPLOYMENT URLS"

Write-Host "🌐 Expected URLs (available after deployment completes):" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend (Production):" -ForegroundColor White
Write-Host "    https://wired-chaos.pages.dev" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend (Preview):" -ForegroundColor White  
Write-Host "    https://wired-chaos-preview.pages.dev" -ForegroundColor Green
Write-Host ""
Write-Host "  Worker API:" -ForegroundColor White
Write-Host "    https://wired-chaos-worker.wiredchaos.workers.dev" -ForegroundColor Green
Write-Host ""
Write-Host "  Health Check:" -ForegroundColor White
Write-Host "    https://wired-chaos-worker.wiredchaos.workers.dev/health" -ForegroundColor Green
Write-Host ""
Write-Host "  Brain Assistant API:" -ForegroundColor White
Write-Host "    https://wired-chaos-worker.wiredchaos.workers.dev/api/brain/query" -ForegroundColor Green

# STEP 6: Next Steps
Write-Header "STEP 6: NEXT STEPS"

Write-Host "🎯 Immediate Actions:" -ForegroundColor Yellow
Write-Host "  1. Monitor GitHub Actions for completion (5-10 minutes)"
Write-Host "  2. Test deployment URLs once workflows complete"
Write-Host "  3. Verify all systems are operational"
Write-Host ""
Write-Host "🔧 Configuration (if needed):" -ForegroundColor Yellow
Write-Host "  1. Set Cloudflare API Token: CLOUDFLARE_API_TOKEN"
Write-Host "  2. Set Cloudflare Account ID: CLOUDFLARE_ACCOUNT_ID"
Write-Host "  3. Configure custom domain (optional)"
Write-Host ""
Write-Host "🚀 Integration Setup:" -ForegroundColor Yellow
Write-Host "  1. WIX/GAMMA: Run ./wix-gamma-integration/deploy.ps1"
Write-Host "  2. Notion API: Configure database and webhooks"
Write-Host "  3. Zapier Workflows: Create automation chains"

# Final Summary
Write-Header "DEPLOYMENT COMPLETE"

Write-Host "✅ WIRED CHAOS Deployment Initiated Successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
Write-Host "  • GitHub Workflows: TRIGGERED ✅"
Write-Host "  • Frontend Deployment: IN PROGRESS ⏳"
Write-Host "  • Worker Deployment: IN PROGRESS ⏳"
Write-Host "  • Integration System: READY FOR CONFIGURATION 🔧"
Write-Host ""
Write-Host "🔗 Monitor Progress:" -ForegroundColor Cyan
Write-Host "  • GitHub Actions: $actionsUrl"
Write-Host "  • Expected completion: 5-10 minutes"
Write-Host ""
Write-Host "🎉 Your WIRED CHAOS system is being deployed!" -ForegroundColor Green
Write-Host "   Check the URLs above in a few minutes to see your live system."

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host " DEPLOYMENT AUTOMATION COMPLETE" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan