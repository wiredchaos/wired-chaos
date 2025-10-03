# WIRED CHAOS - No-Touch Cloudflare Pages Fix (PowerShell)
# Date: October 1, 2025
# Purpose: Automatically fix Pages 404 error and deploy frontend

Write-Host "🚀 WIRED CHAOS NO-TOUCH PAGES DEPLOYMENT FIX" -ForegroundColor Green
Write-Host "📅 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

Write-Host "🎯 TARGET: Fix https://wired-chaos.pages.dev 404 Error" -ForegroundColor Cyan
Write-Host "🔍 ISSUE: Pages misconfigured - not pointing to frontend/build/" -ForegroundColor Yellow
Write-Host ""

# Step 1: Verify build exists
Write-Host "📋 STEP 1: VERIFYING FRONTEND BUILD" -ForegroundColor Magenta
Write-Host ""

if (Test-Path "frontend/build/index.html") {
    $buildInfo = Get-Item "frontend/build/index.html"
    Write-Host "✅ Build verified: frontend/build/index.html ($($buildInfo.Length) bytes)" -ForegroundColor Green
    Write-Host "📅 Build date: $($buildInfo.LastWriteTime)" -ForegroundColor Cyan
}
else {
    Write-Host "❌ Build not found - creating new build..." -ForegroundColor Red
    
    if (Test-Path "frontend/package.json") {
        Write-Host "🏗️ Building React frontend..." -ForegroundColor Cyan
        Set-Location frontend
        
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            npm install --silent
            npm run build
            Write-Host "✅ Frontend build completed" -ForegroundColor Green
        }
        else {
            Write-Host "❌ npm not available - cannot build" -ForegroundColor Red
            Set-Location ..
            exit 1
        }
        
        Set-Location ..
    }
    else {
        Write-Host "❌ No frontend/package.json found" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Generate Cloudflare API script
Write-Host ""
Write-Host "📋 STEP 2: GENERATING CLOUDFLARE API FIX" -ForegroundColor Magenta
Write-Host ""

# Create Cloudflare API PowerShell script
$apiScript = @'
# WIRED CHAOS - Cloudflare Pages API Fix (PowerShell)
# Automatically updates Pages build configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiToken = $env:CLOUDFLARE_API_TOKEN,
    
    [Parameter(Mandatory=$false)]
    [string]$AccountId = $env:CLOUDFLARE_ACCOUNT_ID
)

$ProjectName = 'wired-chaos'

if (-not $ApiToken -or -not $AccountId) {
    Write-Host "❌ Missing environment variables:" -ForegroundColor Red
    Write-Host "   CLOUDFLARE_API_TOKEN=your_token" -ForegroundColor Yellow
    Write-Host "   CLOUDFLARE_ACCOUNT_ID=your_account_id" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Get these from: Cloudflare Dashboard → My Profile → API Tokens" -ForegroundColor Cyan
    exit 1
}

Write-Host "🤖 WIRED CHAOS Cloudflare Pages Auto-Fix" -ForegroundColor Green
Write-Host "📋 Project: $ProjectName" -ForegroundColor Cyan
Write-Host "🏗️ Build Command: cd frontend && npm install && npm run build" -ForegroundColor Cyan
Write-Host "📁 Output Directory: frontend/build" -ForegroundColor Cyan
Write-Host ""

# Update Pages configuration
$updateBody = @{
    build_config = @{
        build_command = 'cd frontend && npm install && npm run build'
        destination_dir = 'frontend/build'
        root_dir = '/'
        web_analytics_tag = $null
        web_analytics_token = $null
    }
} | ConvertTo-Json -Depth 3

$updateHeaders = @{
    'Authorization' = "Bearer $ApiToken"
    'Content-Type' = 'application/json'
}

try {
    Write-Host "🔧 Updating Pages configuration..." -ForegroundColor Yellow
    $updateResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName" -Method PATCH -Body $updateBody -Headers $updateHeaders
    
    if ($updateResponse.success) {
        Write-Host "✅ Pages configuration updated successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Configuration update failed: $($updateResponse.errors)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Trigger new deployment
try {
    Write-Host "🚀 Triggering new deployment..." -ForegroundColor Yellow
    $deployResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/pages/projects/$ProjectName/deployments" -Method POST -Headers $updateHeaders
    
    if ($deployResponse.success) {
        Write-Host "✅ New deployment triggered" -ForegroundColor Green
        Write-Host "🌐 Deployment URL: $($deployResponse.result.url)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Deployment trigger failed: $($deployResponse.errors)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Deployment Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 PAGES DEPLOYMENT FIX COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Check: https://wired-chaos.pages.dev" -ForegroundColor Cyan
Write-Host "⏱️ Allow 2-3 minutes for deployment to complete" -ForegroundColor Yellow
'@

$apiScript | Out-File -FilePath "cloudflare-pages-fix.ps1" -Encoding UTF8
Write-Host "✅ Cloudflare API fix script generated: cloudflare-pages-fix.ps1" -ForegroundColor Green

# Step 3: Provide execution options
Write-Host ""
Write-Host "📋 STEP 3: EXECUTION OPTIONS" -ForegroundColor Magenta
Write-Host ""

Write-Host "🤖 OPTION 1: Automated API Fix (Recommended)" -ForegroundColor Cyan
Write-Host "Requirements:" -ForegroundColor Yellow
Write-Host "   • CLOUDFLARE_API_TOKEN environment variable"
Write-Host "   • CLOUDFLARE_ACCOUNT_ID environment variable"
Write-Host ""
Write-Host "Setup:" -ForegroundColor Yellow
Write-Host "   `$env:CLOUDFLARE_API_TOKEN = 'your_token_here'"
Write-Host "   `$env:CLOUDFLARE_ACCOUNT_ID = 'your_account_id_here'"
Write-Host ""
Write-Host "Execute:" -ForegroundColor Yellow
Write-Host "   .\cloudflare-pages-fix.ps1"
Write-Host ""

Write-Host "🔧 OPTION 2: Manual Dashboard Fix" -ForegroundColor Cyan
Write-Host "1. Go to: https://dash.cloudflare.com/pages"
Write-Host "2. Select: wired-chaos project"
Write-Host "3. Settings → Build & deployments"
Write-Host "4. Update Build output directory: frontend/build"
Write-Host "5. Update Build command: cd frontend && npm install && npm run build"
Write-Host "6. Click 'Save and Deploy'"
Write-Host ""

Write-Host "🧪 OPTION 3: Local Testing" -ForegroundColor Cyan
Write-Host "   cd frontend; npm run build; npx serve build"
Write-Host ""

# Step 4: Health check script
Write-Host "📋 STEP 4: HEALTH CHECK SCRIPT" -ForegroundColor Magenta
Write-Host ""

$healthScript = @'
# WIRED CHAOS Pages Health Check
Write-Host "🔍 Checking Pages health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://wired-chaos.pages.dev" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Pages is live: https://wired-chaos.pages.dev" -ForegroundColor Green
        Write-Host "📄 Content length: $($response.Content.Length) characters" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Pages returned: HTTP $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Pages is down: $($_.Exception.Message)" -ForegroundColor Red
}
'@

$healthScript | Out-File -FilePath "check-pages-health.ps1" -Encoding UTF8
Write-Host "✅ Health check script generated: check-pages-health.ps1" -ForegroundColor Green

# Final summary
Write-Host ""
Write-Host "🎉 NO-TOUCH PAGES FIX READY!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Set Cloudflare API credentials (if using automated fix)"
Write-Host "2. Run: .\cloudflare-pages-fix.ps1"
Write-Host "3. Wait 2-3 minutes for deployment"
Write-Host "4. Run: .\check-pages-health.ps1 to verify"
Write-Host ""
Write-Host "🎯 Expected Result: https://wired-chaos.pages.dev → Working React app" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ This will restore the WIRED CHAOS frontend immediately!" -ForegroundColor Yellow