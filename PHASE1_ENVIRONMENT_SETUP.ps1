# 🛡️ WIRED CHAOS Phase 1 Environment Setup
# This script sets up the development environment needed to complete security vulnerability remediation

Write-Host "🛡️ WIRED CHAOS Phase 1 Environment Setup" -ForegroundColor Cyan
Write-Host "Setting up development environment for security vulnerability remediation..." -ForegroundColor Yellow

# Check current status
Write-Host "`n📋 Current Environment Status:" -ForegroundColor Yellow

# Node.js Check
Write-Host "Node.js/npm..." -NoNewline
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
} else {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    Write-Host "   📥 Download from: https://nodejs.org/" -ForegroundColor Cyan
}

# Yarn Check  
Write-Host "Yarn..." -NoNewline
if (Get-Command yarn -ErrorAction SilentlyContinue) {
    $yarnVersion = yarn --version
    Write-Host " ✅ $yarnVersion" -ForegroundColor Green
} else {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    Write-Host "   📥 Install with: npm install -g yarn" -ForegroundColor Cyan
}

# Python Check
Write-Host "Python/pip..." -NoNewline
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host " ✅ $pythonVersion" -ForegroundColor Green
} else {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    Write-Host "   📥 Download from: https://python.org/" -ForegroundColor Cyan
}

# GitHub CLI Check
Write-Host "GitHub CLI..." -NoNewline
if (Get-Command gh -ErrorAction SilentlyContinue) {
    try {
        $ghStatus = gh auth status 2>&1
        if ($ghStatus -match "Logged in") {
            Write-Host " ✅ Authenticated" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ Not authenticated" -ForegroundColor Yellow
            Write-Host "   🔑 Run: gh auth login" -ForegroundColor Cyan
        }
    } catch {
        Write-Host " ⚠️ Not authenticated" -ForegroundColor Yellow
        Write-Host "   🔑 Run: gh auth login" -ForegroundColor Cyan
    }
} else {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    Write-Host "   📥 Download from: https://cli.github.com/" -ForegroundColor Cyan
}

Write-Host "`n🎯 Phase 1 Security Vulnerabilities Confirmed:" -ForegroundColor Red
Write-Host "GitHub has detected 4 vulnerabilities (2 high, 2 moderate)" -ForegroundColor Red
Write-Host "URL: https://github.com/wiredchaos/wired-chaos/security/dependabot" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps After Environment Setup:" -ForegroundColor Yellow
Write-Host "1. Run frontend audit: cd frontend && yarn audit" -ForegroundColor White
Write-Host "2. Run backend audit: cd backend && pip-audit" -ForegroundColor White
Write-Host "3. Apply security patches (patch/minor only)" -ForegroundColor White
Write-Host "4. Test comprehensive functionality" -ForegroundColor White
Write-Host "5. Create security update PR" -ForegroundColor White

Write-Host "`n🔧 Quick Install Commands:" -ForegroundColor Yellow
Write-Host "# Install Chocolatey (Windows package manager)" -ForegroundColor Gray
Write-Host "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Gray
Write-Host "`n# Install all dependencies via Chocolatey" -ForegroundColor Gray  
Write-Host "choco install nodejs python github-cli -y" -ForegroundColor Gray
Write-Host "`n# Install Yarn globally" -ForegroundColor Gray
Write-Host "npm install -g yarn" -ForegroundColor Gray
Write-Host "`n# Install pip-audit for Python security scanning" -ForegroundColor Gray
Write-Host "pip install pip-audit" -ForegroundColor Gray

$envSetup = Read-Host "`nDo you want to install missing dependencies now? (y/N)"
if ($envSetup -eq 'y' -or $envSetup -eq 'Y') {
    Write-Host "`n🚀 Starting automatic installation..." -ForegroundColor Green
    
    # Check if Chocolatey is installed
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Chocolatey..." -ForegroundColor Cyan
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    # Install dependencies
    Write-Host "Installing Node.js, Python, and GitHub CLI..." -ForegroundColor Cyan
    choco install nodejs python github-cli -y
    
    Write-Host "Installing Yarn..." -ForegroundColor Cyan
    npm install -g yarn
    
    Write-Host "Installing pip-audit..." -ForegroundColor Cyan
    pip install pip-audit
    
    Write-Host "`n✅ Installation complete! Please restart PowerShell and re-run this script to verify." -ForegroundColor Green
} else {
    Write-Host "`n⏭️ Skipping automatic installation. Please install manually and re-run this script." -ForegroundColor Yellow
}

Write-Host "`n📍 Current Repository: $(Get-Location)" -ForegroundColor Cyan
Write-Host "📊 Security Analysis: SECURITY_ANALYSIS.md" -ForegroundColor Cyan
Write-Host "📋 Test Results: test_result.md" -ForegroundColor Cyan

Read-Host "`nPress Enter to exit"