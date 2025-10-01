# WIRED CHAOS - Automated Sanity Check Script
# Validates development environment and configuration

param(
    [switch]$Fix,
    [switch]$Verbose,
    [switch]$QuietMode
)

# WIRED CHAOS Colors
$script:Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
}

function Write-Check {
    param(
        [string]$Message,
        [string]$Status = "Info"
    )
    if (-not $QuietMode) {
        $color = $script:Colors[$Status]
        $icon = switch ($Status) {
            "Success" { "✅" }
            "Warning" { "⚠️ " }
            "Error" { "❌" }
            default { "ℹ️ " }
        }
        Write-Host "$icon $Message" -ForegroundColor $color
    }
}

function Test-Command {
    param([string]$CommandName)
    return $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

# Header
if (-not $QuietMode) {
    Write-Host @"
🔍 ====================================================
   WIRED CHAOS SANITY CHECK
   Automated Environment Validation
====================================================
"@ -ForegroundColor Cyan
}

$issues = @()
$warnings = @()

# Check 1: Git
Write-Check "Checking Git installation..." "Info"
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Check "Git installed: $gitVersion" "Success"
} else {
    $issues += "Git not installed"
    Write-Check "Git not found - Install from https://git-scm.com" "Error"
}

# Check 2: Node.js
Write-Check "Checking Node.js installation..." "Info"
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Check "Node.js installed: $nodeVersion" "Success"
    
    # Check version (should be 18+)
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -lt 18) {
            $warnings += "Node.js version should be 18 or higher (found: v$majorVersion)"
            Write-Check "Node.js version should be 18+ (current: $nodeVersion)" "Warning"
        }
    }
} else {
    $issues += "Node.js not installed"
    Write-Check "Node.js not found - Install LTS from https://nodejs.org" "Error"
}

# Check 3: npm
Write-Check "Checking npm installation..." "Info"
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Check "npm installed: $npmVersion" "Success"
} else {
    $issues += "npm not installed"
    Write-Check "npm not found (should come with Node.js)" "Error"
}

# Check 4: Python
Write-Check "Checking Python installation..." "Info"
if (Test-Command "python") {
    $pythonVersion = python --version
    Write-Check "Python installed: $pythonVersion" "Success"
} elseif (Test-Command "python3") {
    $pythonVersion = python3 --version
    Write-Check "Python3 installed: $pythonVersion" "Success"
} else {
    $issues += "Python not installed"
    Write-Check "Python not found - Install from https://www.python.org" "Error"
}

# Check 5: GitHub CLI (optional but recommended)
Write-Check "Checking GitHub CLI (gh)..." "Info"
if (Test-Command "gh") {
    $ghVersion = gh --version | Select-Object -First 1
    Write-Check "GitHub CLI installed: $ghVersion" "Success"
} else {
    $warnings += "GitHub CLI not installed (recommended for automation)"
    Write-Check "GitHub CLI not found (optional but recommended)" "Warning"
}

# Check 6: Frontend dependencies
Write-Check "Checking frontend dependencies..." "Info"
if (Test-Path "frontend/node_modules") {
    Write-Check "Frontend node_modules exists" "Success"
} else {
    $warnings += "Frontend dependencies not installed"
    Write-Check "Frontend dependencies missing - Run: cd frontend && npm install" "Warning"
    
    if ($Fix) {
        Write-Check "Attempting to install frontend dependencies..." "Info"
        Push-Location "frontend"
        npm install
        Pop-Location
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Frontend dependencies installed successfully" "Success"
        } else {
            Write-Check "Failed to install frontend dependencies" "Error"
        }
    }
}

# Check 7: Backend requirements
Write-Check "Checking backend requirements..." "Info"
if (Test-Path "backend/requirements.txt") {
    Write-Check "Backend requirements.txt exists" "Success"
    
    # Try to check if dependencies are installed
    if (Test-Command "python") {
        $pipCheck = python -c "import fastapi" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Backend dependencies appear to be installed" "Success"
        } else {
            $warnings += "Backend dependencies may not be installed"
            Write-Check "Backend dependencies may be missing - Run: pip install -r backend/requirements.txt" "Warning"
            
            if ($Fix) {
                Write-Check "Attempting to install backend dependencies..." "Info"
                python -m pip install -r backend/requirements.txt
                if ($LASTEXITCODE -eq 0) {
                    Write-Check "Backend dependencies installed successfully" "Success"
                } else {
                    Write-Check "Failed to install backend dependencies" "Error"
                }
            }
        }
    }
} else {
    $warnings += "Backend requirements.txt not found"
    Write-Check "Backend requirements.txt not found" "Warning"
}

# Check 8: Mega Prompt Context Files
Write-Check "Checking Mega Prompt context files..." "Info"
$contextFiles = @{
    ".copilot/wired-chaos-context.md" = "Copilot Context"
    ".vscode/settings.json" = "VS Code Settings"
    "AUTO_FIX_PATTERNS.md" = "Auto-Fix Patterns"
}

$allContextExists = $true
foreach ($file in $contextFiles.Keys) {
    if (Test-Path $file) {
        Write-Check "$($contextFiles[$file]) exists" "Success"
    } else {
        $warnings += "$($contextFiles[$file]) missing: $file"
        Write-Check "$($contextFiles[$file]) missing: $file" "Warning"
        $allContextExists = $false
    }
}

if ($allContextExists) {
    Write-Check "All Mega Prompt context files present" "Success"
}

# Check 9: AR/VR Configuration
Write-Check "Checking AR/VR configuration..." "Info"
if (Test-Path "public/_headers") {
    $headersContent = Get-Content "public/_headers" -Raw -ErrorAction SilentlyContinue
    if ($headersContent -match "model/gltf-binary|model/vnd.usdz") {
        Write-Check "AR/VR MIME types configured in _headers" "Success"
    } else {
        $warnings += "_headers file missing AR/VR MIME types"
        Write-Check "_headers exists but missing AR/VR MIME types" "Warning"
        
        if ($Fix) {
            Write-Check "Adding AR/VR MIME types to _headers..." "Info"
            $arvrHeaders = @"

/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *
"@
            Add-Content -Path "public/_headers" -Value $arvrHeaders
            Write-Check "AR/VR MIME types added to _headers" "Success"
        }
    }
} else {
    $warnings += "public/_headers file missing (needed for AR/VR CORS)"
    Write-Check "public/_headers missing - AR/VR models may not load correctly" "Warning"
    
    if ($Fix) {
        Write-Check "Creating _headers file with AR/VR support..." "Info"
        $headersContent = @"
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD
  Access-Control-Allow-Headers: Content-Type, Authorization

/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *
"@
        New-Item -Path "public" -ItemType Directory -Force | Out-Null
        $headersContent | Out-File -FilePath "public/_headers" -Encoding UTF8
        Write-Check "Created _headers file with AR/VR support" "Success"
    }
}

# Check 10: .gitignore protection
Write-Check "Checking .gitignore security..." "Info"
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    $protectedFiles = @(".env", ".env.local", "node_modules")
    $allProtected = $true
    
    foreach ($file in $protectedFiles) {
        if ($gitignoreContent -notmatch [regex]::Escape($file)) {
            $warnings += "$file not in .gitignore"
            Write-Check "$file should be in .gitignore" "Warning"
            $allProtected = $false
        }
    }
    
    if ($allProtected) {
        Write-Check "Critical files protected in .gitignore" "Success"
    }
} else {
    $warnings += ".gitignore file missing"
    Write-Check ".gitignore file missing" "Warning"
}

# Check 11: Environment variables template
Write-Check "Checking environment variable setup..." "Info"
$envExample = Test-Path "frontend/.env.example"
$envLocal = Test-Path "frontend/.env.local"
$envDev = Test-Path "frontend/.env"

if ($envExample -or $envLocal -or $envDev) {
    Write-Check "Environment variable files found" "Success"
} else {
    $warnings += "No environment variable files found"
    Write-Check "No .env files found - may need to configure" "Warning"
}

# Check 12: Build directories clean
Write-Check "Checking for stale build artifacts..." "Info"
$buildDirs = @("frontend/build", "frontend/dist", "frontend/.next")
$staleBuild = $false
foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        $warnings += "Stale build directory: $dir"
        Write-Check "Found stale build directory: $dir" "Warning"
        $staleBuild = $true
    }
}

if (-not $staleBuild) {
    Write-Check "No stale build artifacts found" "Success"
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=====================================================" -ForegroundColor Magenta
Write-Host "   SANITY CHECK SUMMARY" -ForegroundColor Magenta
Write-Host "=====================================================" -ForegroundColor Magenta

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED! Environment is ready." -ForegroundColor Green
    exit 0
} else {
    if ($issues.Count -gt 0) {
        Write-Host "`n❌ CRITICAL ISSUES ($($issues.Count)):" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  WARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Host "`n❌ Please fix critical issues before proceeding." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "`n⚠️  Warnings present but not critical. You may proceed." -ForegroundColor Yellow
        exit 0
    }
}
