# WIRED CHAOS Mega Prompt Validation Script
# Validates that all mega prompt integration components are properly installed

$ErrorActionPreference = "Continue"

Write-Host @"
🔍 ====================================================
   WIRED CHAOS MEGA PROMPT VALIDATION
   Checking GIGA Integration Components
====================================================
"@ -ForegroundColor Cyan

$validationResults = @()
$allPassed = $true

# Function to check file
function Test-FileExists {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Write-Host "✅ $Description exists: $Path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description missing: $Path" -ForegroundColor Red
        $script:allPassed = $false
        return $false
    }
}

# Function to validate file content
function Test-FileContains {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        $content = Get-Content $Path -Raw
        if ($content -match $Pattern) {
            Write-Host "✅ $Description validated in $Path" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Description not found in $Path" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "❌ File not found: $Path" -ForegroundColor Red
        $script:allPassed = $false
        return $false
    }
}

Write-Host "`n📁 Checking Core Files..." -ForegroundColor Magenta

# Check 1: Copilot Context
$validationResults += Test-FileExists -Path ".copilot/wired-chaos-context.md" -Description "Copilot Context"

# Check 2: VS Code Settings
$validationResults += Test-FileExists -Path ".vscode/settings.json" -Description "VS Code Settings"

# Check 3: Auto-Fix Patterns
$validationResults += Test-FileExists -Path "AUTO_FIX_PATTERNS.md" -Description "Auto-Fix Patterns"

# Check 4: Sanity Check Script
$validationResults += Test-FileExists -Path "SANITY_CHECK.ps1" -Description "Sanity Check Script"

# Check 5: Integration Guide
$validationResults += Test-FileExists -Path "MEGA_PROMPT_INTEGRATION_GUIDE.md" -Description "Integration Guide"

# Check 6: Quick Reference
$validationResults += Test-FileExists -Path "QUICK_REFERENCE.md" -Description "Quick Reference"

Write-Host "`n🎨 Checking Content Validation..." -ForegroundColor Magenta

# Validate Copilot Context contains key sections
Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern "WIRED CHAOS Design System" -Description "Design System section"
Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern "#00FFFF" -Description "Color palette"
Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern "Security Patterns" -Description "Security patterns"
Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern "AR/VR" -Description "AR/VR integration"
Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern "Cloudflare" -Description "Cloudflare documentation"

# Validate VS Code Settings
Test-FileContains -Path ".vscode/settings.json" -Pattern "github.copilot.enable" -Description "Copilot enabled"
Test-FileContains -Path ".vscode/settings.json" -Pattern "workbench.colorCustomizations" -Description "WIRED CHAOS colors"

# Validate Auto-Fix Patterns
Test-FileContains -Path "AUTO_FIX_PATTERNS.md" -Pattern "JSX Nesting" -Description "JSX fix patterns"
Test-FileContains -Path "AUTO_FIX_PATTERNS.md" -Pattern "Environment Variable" -Description "Env var patterns"
Test-FileContains -Path "AUTO_FIX_PATTERNS.md" -Pattern "AR/VR CORS" -Description "CORS patterns"

Write-Host "`n🔧 Checking Enhanced Automation Scripts..." -ForegroundColor Magenta

# Check Master Automation enhancements
Test-FileContains -Path "RUN_MASTER_AUTOMATION.ps1" -Pattern "Mega Prompt|MEGA PROMPT" -Description "Mega Prompt integration in Master Automation"
Test-FileContains -Path "RUN_MASTER_AUTOMATION.ps1" -Pattern "Load-MegaPromptContext" -Description "Context loader function"
Test-FileContains -Path "RUN_MASTER_AUTOMATION.ps1" -Pattern "Validate-SecurityPatterns" -Description "Security validation"
Test-FileContains -Path "RUN_MASTER_AUTOMATION.ps1" -Pattern "Validate-ARVRIntegration" -Description "AR/VR validation"
Test-FileContains -Path "RUN_MASTER_AUTOMATION.ps1" -Pattern "Validate-CloudflareDeployment" -Description "Cloudflare validation"

# Check VS Studio Bot enhancements
Test-FileContains -Path "VS_STUDIO_BOT_AUTOMATION.ps1" -Pattern "MEGA PROMPT" -Description "Mega Prompt in VS Studio Bot"

Write-Host "`n🎯 Checking WIRED CHAOS Design System Integration..." -ForegroundColor Magenta

# Validate color palette is documented
$colorTests = @{
    "#000000" = "Black"
    "#00FFFF" = "Cyan"
    "#FF3131" = "Red"
    "#39FF14" = "Green"
    "#FF00FF" = "Pink"
}

foreach ($color in $colorTests.Keys) {
    $description = $colorTests[$color]
    Test-FileContains -Path ".copilot/wired-chaos-context.md" -Pattern [regex]::Escape($color) -Description "$description color ($color)"
}

Write-Host "`n📊 Summary" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Magenta

$passedCount = ($validationResults | Where-Object { $_ -eq $true }).Count
$totalCount = $validationResults.Count

Write-Host "Files Checked: $totalCount" -ForegroundColor Cyan
Write-Host "Passed: $passedCount" -ForegroundColor Green
Write-Host "Failed: $($totalCount - $passedCount)" -ForegroundColor Red

if ($allPassed) {
    Write-Host "`n✅ MEGA PROMPT INTEGRATION VALIDATION: PASSED" -ForegroundColor Green
    Write-Host "All GIGA Integration components are properly installed." -ForegroundColor Green
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open VS Code to see the new settings in action" -ForegroundColor Cyan
    Write-Host "  2. Run .\SANITY_CHECK.ps1 to validate your environment" -ForegroundColor Cyan
    Write-Host "  3. Review MEGA_PROMPT_INTEGRATION_GUIDE.md for usage" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "`n⚠️  MEGA PROMPT INTEGRATION VALIDATION: INCOMPLETE" -ForegroundColor Yellow
    Write-Host "Some components are missing. Please check the errors above." -ForegroundColor Yellow
    exit 1
}
