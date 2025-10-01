# Code Quality Fix Script for WIRED CHAOS
# Runs language-specific linters and formatters with allowlist/denylist enforcement

param(
    [switch]$CheckOnly,
    [switch]$ApplyFixes
)

$ErrorActionPreference = "Continue"

# Color output helpers
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Determine mode
if (-not $CheckOnly -and -not $ApplyFixes) {
    $CheckOnly = $true
}

Write-Info "Code Quality Fix Script"
Write-Host "========================================"
if ($ApplyFixes) {
    Write-Info "Mode: Apply Fixes"
} else {
    Write-Info "Mode: Check Only"
}
Write-Host ""

# Create ignore files
function Create-IgnoreFiles {
    Write-Info "Creating ignore pattern files..."
    
    $ignorePatterns = @"
.github/**
.devcontainer/**
**/Dockerfile
**/docker/**
**/infra/**
**/terraform/**
**/ansible/**
**/deploy/**
**/wrangler.toml
**/cloudflare*.toml
**/cloudflare*.yml
**/cloudflare*.yaml
**/pages*.yml
**/pages*.yaml
**/.vscode/**
**/node_modules/**
**/dist/**
**/build/**
**/coverage/**
**/__pycache__/**
**/.git/**
"@
    
    if (-not (Test-Path .eslintignore)) {
        $ignorePatterns | Out-File -FilePath .eslintignore -Encoding UTF8
        Write-Success "Created .eslintignore"
    }
    
    if (-not (Test-Path .prettierignore)) {
        $ignorePatterns | Out-File -FilePath .prettierignore -Encoding UTF8
        Write-Success "Created .prettierignore"
    }
}

# Check if Node.js is available
function Test-Node {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Success "Node.js found: $nodeVersion"
            return $true
        }
    } catch {
        Write-Error-Custom "Node.js is not installed. Please install Node.js 20 or later."
        return $false
    }
    return $false
}

# Check if Python is available
function Test-Python {
    try {
        $pythonVersion = python --version 2>$null
        if (-not $pythonVersion) {
            $pythonVersion = python3 --version 2>$null
        }
        if ($pythonVersion) {
            Write-Success "Python found: $pythonVersion"
            return $true
        }
    } catch {
        Write-Warn "Python is not installed. Skipping Python checks."
        return $false
    }
    return $false
}

# Check if PowerShell Core is available
function Test-PowerShellCore {
    try {
        $pwshVersion = pwsh --version 2>$null
        if ($pwshVersion) {
            Write-Success "PowerShell Core found: $pwshVersion"
            return $true
        }
    } catch {
        # Running in Windows PowerShell, not PowerShell Core
        Write-Warn "PowerShell Core not found, using Windows PowerShell"
        return $true  # Still allow running on Windows PowerShell
    }
    return $true
}

# Find allowed files
function Find-AllowedFiles {
    param([string]$Extension)
    
    $excludePaths = @(
        "*\.github\*",
        "*\.devcontainer\*",
        "*\docker\*",
        "*\infra\*",
        "*\terraform\*",
        "*\ansible\*",
        "*\deploy\*",
        "*\node_modules\*",
        "*\dist\*",
        "*\build\*",
        "*\.vscode\*",
        "*\__pycache__\*"
    )
    
    Get-ChildItem -Path . -Filter "*.$Extension" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { 
            $path = $_.FullName
            $excluded = $false
            foreach ($excludePath in $excludePaths) {
                if ($path -like $excludePath) {
                    $excluded = $true
                    break
                }
            }
            -not $excluded
        }
}

# JavaScript/JSX checks
function Invoke-JavaScriptChecks {
    Write-Info "Running JavaScript/JSX checks..."
    
    $jsFiles = @()
    $jsFiles += Find-AllowedFiles -Extension "js"
    $jsFiles += Find-AllowedFiles -Extension "jsx"
    $jsFiles += Find-AllowedFiles -Extension "mjs"
    
    if ($jsFiles.Count -eq 0) {
        Write-Warn "No JavaScript files found"
        return
    }
    
    Write-Info "Found $($jsFiles.Count) JavaScript/JSX/MJS files"
    
    # Run ESLint
    if ($ApplyFixes) {
        Write-Info "Running ESLint with --fix..."
        npx eslint --ext .js,.jsx,.mjs . --fix --max-warnings=999999 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "ESLint found issues" }
    } else {
        Write-Info "Running ESLint (check only)..."
        npx eslint --ext .js,.jsx,.mjs . --max-warnings=999999 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "ESLint found issues" }
    }
    
    # Run Prettier
    if ($ApplyFixes) {
        Write-Info "Running Prettier with --write..."
        npx prettier --write "**/*.{js,jsx,mjs}" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Prettier formatting issues" }
    } else {
        Write-Info "Running Prettier (check only)..."
        npx prettier --check "**/*.{js,jsx,mjs}" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Prettier found formatting issues" }
    }
    
    Write-Success "JavaScript checks complete"
}

# CSS checks
function Invoke-CSSChecks {
    Write-Info "Running CSS checks..."
    
    $cssFiles = Find-AllowedFiles -Extension "css"
    
    if ($cssFiles.Count -eq 0) {
        Write-Warn "No CSS files found"
        return
    }
    
    Write-Info "Found $($cssFiles.Count) CSS files"
    
    # Run Stylelint
    if ($ApplyFixes) {
        Write-Info "Running Stylelint with --fix..."
        npx stylelint "**/*.css" --fix --allow-empty-input 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Stylelint found issues" }
    } else {
        Write-Info "Running Stylelint (check only)..."
        npx stylelint "**/*.css" --allow-empty-input 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Stylelint found issues" }
    }
    
    Write-Success "CSS checks complete"
}

# HTML checks
function Invoke-HTMLChecks {
    Write-Info "Running HTML checks..."
    
    $htmlFiles = Find-AllowedFiles -Extension "html"
    
    if ($htmlFiles.Count -eq 0) {
        Write-Warn "No HTML files found"
        return
    }
    
    Write-Info "Found $($htmlFiles.Count) HTML files"
    
    # Run HTMLHint
    Write-Info "Running HTMLHint..."
    npx htmlhint "**/*.html" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warn "HTMLHint found issues" }
    
    # Run Prettier for HTML
    if ($ApplyFixes) {
        Write-Info "Running Prettier for HTML with --write..."
        npx prettier --write "**/*.html" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Prettier formatting issues" }
    } else {
        Write-Info "Running Prettier for HTML (check only)..."
        npx prettier --check "**/*.html" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Prettier found formatting issues" }
    }
    
    Write-Success "HTML checks complete"
}

# Python checks
function Invoke-PythonChecks {
    if (-not (Test-Python)) {
        return
    }
    
    Write-Info "Running Python checks..."
    
    $pyFiles = Find-AllowedFiles -Extension "py"
    
    if ($pyFiles.Count -eq 0) {
        Write-Warn "No Python files found"
        return
    }
    
    Write-Info "Found $($pyFiles.Count) Python files"
    
    # Determine python command
    $pythonCmd = "python"
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        $pythonCmd = "python3"
    }
    
    # Install tools if needed
    $blackInstalled = & $pythonCmd -m pip show black 2>$null
    if (-not $blackInstalled) {
        Write-Info "Installing Black formatter..."
        & $pythonCmd -m pip install --user black 2>&1 | Out-Null
    }
    
    $flake8Installed = & $pythonCmd -m pip show flake8 2>$null
    if (-not $flake8Installed) {
        Write-Info "Installing Flake8 linter..."
        & $pythonCmd -m pip install --user flake8 2>&1 | Out-Null
    }
    
    # Run Black
    if ($ApplyFixes) {
        Write-Info "Running Black formatter..."
        & $pythonCmd -m black . --extend-exclude="(.github|.devcontainer|docker|infra|terraform|ansible|deploy|node_modules|dist|build|__pycache__|.vscode)" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Black formatting issues" }
    } else {
        Write-Info "Running Black (check only)..."
        & $pythonCmd -m black . --check --extend-exclude="(.github|.devcontainer|docker|infra|terraform|ansible|deploy|node_modules|dist|build|__pycache__|.vscode)" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "Black found formatting issues" }
    }
    
    # Run Flake8
    Write-Info "Running Flake8 linter..."
    & $pythonCmd -m flake8 . --exclude=.github,.devcontainer,docker,infra,terraform,ansible,deploy,node_modules,dist,build,__pycache__,.vscode --max-line-length=100 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Warn "Flake8 found issues" }
    
    Write-Success "Python checks complete"
}

# PowerShell checks
function Invoke-PowerShellChecks {
    Write-Info "Running PowerShell checks..."
    
    $ps1Files = @()
    $ps1Files += Find-AllowedFiles -Extension "ps1"
    $ps1Files += Find-AllowedFiles -Extension "psm1"
    
    if ($ps1Files.Count -eq 0) {
        Write-Warn "No PowerShell files found"
        return
    }
    
    Write-Info "Found $($ps1Files.Count) PowerShell files"
    
    # Check if PSScriptAnalyzer is installed
    if (-not (Get-Module -ListAvailable -Name PSScriptAnalyzer)) {
        Write-Info "Installing PSScriptAnalyzer..."
        Install-Module -Name PSScriptAnalyzer -Force -Scope CurrentUser -SkipPublisherCheck 2>&1 | Out-Null
    }
    
    # Run PSScriptAnalyzer
    Write-Info "Running PSScriptAnalyzer..."
    foreach ($file in $ps1Files) {
        Write-Verbose "Analyzing: $($file.Name)"
        $results = Invoke-ScriptAnalyzer -Path $file.FullName -ErrorAction SilentlyContinue
        if ($results) {
            Write-Warn "PSScriptAnalyzer found $($results.Count) issue(s) in $($file.Name)"
        }
    }
    
    Write-Success "PowerShell checks complete"
}

# Solidity checks
function Invoke-SolidityChecks {
    Write-Info "Running Solidity checks..."
    
    $solFiles = Find-AllowedFiles -Extension "sol"
    
    if ($solFiles.Count -eq 0) {
        Write-Warn "No Solidity files found"
        return
    }
    
    Write-Info "Found $($solFiles.Count) Solidity files"
    
    # Run solhint
    if ($ApplyFixes) {
        Write-Info "Running solhint with --fix..."
        npx solhint "**/*.sol" --fix 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "solhint found issues" }
    } else {
        Write-Info "Running solhint (check only)..."
        npx solhint "**/*.sol" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warn "solhint found issues" }
    }
    
    Write-Success "Solidity checks complete"
}

# Main execution
function Main {
    Write-Info "Starting code quality checks..."
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Node)) {
        Write-Error-Custom "Node.js is required. Please install Node.js 20 or later."
        exit 1
    }
    
    # Create ignore files
    Create-IgnoreFiles
    
    Write-Host ""
    Write-Info "Running checks for all languages..."
    Write-Host ""
    
    # Run checks for each language
    Invoke-JavaScriptChecks
    Write-Host ""
    
    Invoke-CSSChecks
    Write-Host ""
    
    Invoke-HTMLChecks
    Write-Host ""
    
    Invoke-PythonChecks
    Write-Host ""
    
    Invoke-PowerShellChecks
    Write-Host ""
    
    Invoke-SolidityChecks
    Write-Host ""
    
    Write-Host "========================================"
    if ($ApplyFixes) {
        Write-Success "Code quality fixes applied!"
        Write-Info "Review changes with: git diff"
    } else {
        Write-Success "Code quality check complete!"
        Write-Info "To apply fixes, run with -ApplyFixes"
    }
}

Main
