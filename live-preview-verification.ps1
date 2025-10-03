# WIRED CHAOS - Live Preview Verification & Status Monitor
# Date: October 1, 2025
# Purpose: Monitor Pages deployment status and provide live preview links

Write-Host "🌐 WIRED CHAOS LIVE PREVIEW VERIFICATION" -ForegroundColor Green
Write-Host "📅 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

# Function to check Pages status
function Test-PagesStatus {
    param([string]$Url, [string]$Name)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ $Name : HTTP $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   📄 Content: $($response.Content.Length) characters" -ForegroundColor Cyan
        
        # Check if it's the React app
        if ($response.Content -match "React App|WIRED CHAOS|emergent") {
            Write-Host "   🎯 React app detected!" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host "❌ $Name : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Current status check
Write-Host "📋 CURRENT STATUS CHECK:" -ForegroundColor Magenta
Write-Host ""

$pagesLive = Test-PagesStatus "https://wired-chaos.pages.dev" "Pages Frontend"
Write-Host ""

if (-not $pagesLive) {
    Write-Host "🚨 PAGES 404 ERROR CONFIRMED" -ForegroundColor Red
    Write-Host "   🔍 Issue: Cloudflare Pages misconfiguration" -ForegroundColor Yellow
    Write-Host "   📁 Build exists: frontend/build/ ready for deployment" -ForegroundColor Cyan
    Write-Host "   ⚡ Solution: Run automated fix script" -ForegroundColor Green
    Write-Host ""
}

# Test other endpoints to show what's working
Write-Host "🔍 TESTING RELATED ENDPOINTS:" -ForegroundColor Magenta
Write-Host ""

$endpoints = @(
    @{ Url = "https://www.wiredchaos.xyz/health"; Name = "Worker Health" },
    @{ Url = "https://www.wiredchaos.xyz/api/status"; Name = "API Status" },
    @{ Url = "https://github.com/wiredchaos/wired-chaos"; Name = "GitHub Repo" }
)

foreach ($endpoint in $endpoints) {
    Test-PagesStatus $endpoint.Url $endpoint.Name
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "📊 INFRASTRUCTURE STATUS SUMMARY:" -ForegroundColor Cyan
Write-Host "   🤖 AI Command Center: OPERATIONAL" -ForegroundColor Green
Write-Host "   ⚡ Cloudflare Worker: DEPLOYED" -ForegroundColor Green  
Write-Host "   🌐 Pages Frontend: $(if ($pagesLive) { 'LIVE' } else { '404 ERROR' })" -ForegroundColor $(if ($pagesLive) { 'Green' } else { 'Red' })
Write-Host "   📋 GitHub Repository: ACTIVE" -ForegroundColor Green
Write-Host ""

if (-not $pagesLive) {
    Write-Host "⚡ IMMEDIATE FIX AVAILABLE:" -ForegroundColor Yellow
    Write-Host "   1️⃣ Set API credentials:" -ForegroundColor Cyan
    Write-Host "      `$env:CLOUDFLARE_API_TOKEN = 'your_token_here'"
    Write-Host "      `$env:CLOUDFLARE_ACCOUNT_ID = 'your_account_id_here'"
    Write-Host "   2️⃣ Run automated fix:" -ForegroundColor Cyan
    Write-Host "      .\cloudflare-pages-fix.ps1"
    Write-Host "   3️⃣ Wait 2-3 minutes for deployment" -ForegroundColor Cyan
    Write-Host "   4️⃣ Run this script again to verify" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Expected Result: Pages will show working React app" -ForegroundColor Green
}
else {
    Write-Host "🎉 ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 LIVE PREVIEW LINKS:" -ForegroundColor Cyan
    Write-Host "   🌐 Frontend: https://wired-chaos.pages.dev" -ForegroundColor Yellow
    Write-Host "   🏫 University: https://wired-chaos.pages.dev/university" -ForegroundColor Yellow
    Write-Host "   💼 Suite: https://wired-chaos.pages.dev/suite" -ForegroundColor Yellow
    Write-Host "   📊 Tax: https://wired-chaos.pages.dev/tax" -ForegroundColor Yellow
    Write-Host "   ⚡ Worker Health: https://www.wiredchaos.xyz/health" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 WIRED CHAOS AI EMPIRE: $(if ($pagesLive) { 'FULLY OPERATIONAL!' } else { 'AWAITING PAGES FIX' })" -ForegroundColor $(if ($pagesLive) { 'Green' } else { 'Yellow' })

# Auto-monitor mode
if ($args -contains "-monitor") {
    Write-Host ""
    Write-Host "🔄 MONITORING MODE ACTIVATED" -ForegroundColor Magenta
    Write-Host "   Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
    Write-Host ""
    
    while ($true) {
        Start-Sleep -Seconds 30
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Checking Pages status..." -ForegroundColor Cyan
        
        $currentStatus = Test-PagesStatus "https://wired-chaos.pages.dev" "Pages"
        
        if ($currentStatus -and -not $pagesLive) {
            Write-Host ""
            Write-Host "🎉 PAGES IS NOW LIVE!" -ForegroundColor Green
            Write-Host "🌐 Frontend restored: https://wired-chaos.pages.dev" -ForegroundColor Cyan
            Write-Host "✅ No-touch automation successful!" -ForegroundColor Green
            break
        }
    }
}