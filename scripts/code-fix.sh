#!/bin/bash
# Code Quality Fix Script for WIRED CHAOS
# Runs language-specific linters and formatters with allowlist/denylist enforcement

set -e

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

log_warn() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

log_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Parse arguments
CHECK_ONLY=false
APPLY_FIXES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        --apply-fixes)
            APPLY_FIXES=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# If no mode specified, default to check-only
if [[ "$CHECK_ONLY" == "false" && "$APPLY_FIXES" == "false" ]]; then
    CHECK_ONLY=true
fi

log_info "Code Quality Fix Script"
echo "========================================"
if [[ "$APPLY_FIXES" == "true" ]]; then
    log_info "Mode: Apply Fixes"
else
    log_info "Mode: Check Only"
fi
echo ""

# Create .eslintignore, .prettierignore, etc. with denylist patterns
create_ignore_files() {
    log_info "Creating ignore pattern files..."
    
    # Common ignore patterns for all tools
    cat > /tmp/code-fix-ignore-patterns.txt << 'EOF'
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
EOF

    # Create .eslintignore
    if [[ ! -f .eslintignore ]]; then
        cp /tmp/code-fix-ignore-patterns.txt .eslintignore
        log_success "Created .eslintignore"
    fi
    
    # Create .prettierignore
    if [[ ! -f .prettierignore ]]; then
        cp /tmp/code-fix-ignore-patterns.txt .prettierignore
        log_success "Created .prettierignore"
    fi
}

# Check if Node.js is available
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 20 or later."
        return 1
    fi
    log_success "Node.js found: $(node --version)"
}

# Check if Python is available
check_python() {
    if ! command -v python3 &> /dev/null; then
        log_warn "Python 3 is not installed. Skipping Python checks."
        return 1
    fi
    log_success "Python found: $(python3 --version)"
}

# Check if PowerShell is available
check_powershell() {
    if ! command -v pwsh &> /dev/null; then
        log_warn "PowerShell Core is not installed. Skipping PowerShell checks."
        return 1
    fi
    log_success "PowerShell found: $(pwsh --version)"
}

# Find files matching allowlist and not in denylist
find_allowed_files() {
    local extension=$1
    find . -type f -name "*.$extension" \
        ! -path "./.github/*" \
        ! -path "./.devcontainer/*" \
        ! -path "*/Dockerfile" \
        ! -path "*/docker/*" \
        ! -path "*/infra/*" \
        ! -path "*/terraform/*" \
        ! -path "*/ansible/*" \
        ! -path "*/deploy/*" \
        ! -path "*/wrangler.toml" \
        ! -path "*/node_modules/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/.vscode/*" \
        ! -path "*/__pycache__/*" \
        2>/dev/null || true
}

# JavaScript/JSX linting and formatting
run_javascript_checks() {
    log_info "Running JavaScript/JSX checks..."
    
    local js_files=$(find_allowed_files "js")
    local jsx_files=$(find_allowed_files "jsx")
    local mjs_files=$(find_allowed_files "mjs")
    
    local file_count=$(echo "$js_files $jsx_files $mjs_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No JavaScript files found"
        return 0
    fi
    
    log_info "Found $file_count JavaScript/JSX/MJS files"
    
    # Run ESLint
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running ESLint with --fix..."
        npx eslint --ext .js,.jsx,.mjs . --fix --max-warnings=999999 || log_warn "ESLint found issues"
    else
        log_info "Running ESLint (check only)..."
        npx eslint --ext .js,.jsx,.mjs . --max-warnings=999999 || log_warn "ESLint found issues"
    fi
    
    # Run Prettier
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running Prettier with --write..."
        npx prettier --write "**/*.{js,jsx,mjs}" || log_warn "Prettier formatting issues"
    else
        log_info "Running Prettier (check only)..."
        npx prettier --check "**/*.{js,jsx,mjs}" || log_warn "Prettier found formatting issues"
    fi
    
    log_success "JavaScript checks complete"
}

# CSS linting and formatting
run_css_checks() {
    log_info "Running CSS checks..."
    
    local css_files=$(find_allowed_files "css")
    local file_count=$(echo "$css_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No CSS files found"
        return 0
    fi
    
    log_info "Found $file_count CSS files"
    
    # Run Stylelint
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running Stylelint with --fix..."
        npx stylelint "**/*.css" --fix --allow-empty-input || log_warn "Stylelint found issues"
    else
        log_info "Running Stylelint (check only)..."
        npx stylelint "**/*.css" --allow-empty-input || log_warn "Stylelint found issues"
    fi
    
    log_success "CSS checks complete"
}

# HTML linting and formatting
run_html_checks() {
    log_info "Running HTML checks..."
    
    local html_files=$(find_allowed_files "html")
    local file_count=$(echo "$html_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No HTML files found"
        return 0
    fi
    
    log_info "Found $file_count HTML files"
    
    # Run HTMLHint
    log_info "Running HTMLHint..."
    npx htmlhint "**/*.html" || log_warn "HTMLHint found issues"
    
    # Run Prettier for HTML
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running Prettier for HTML with --write..."
        npx prettier --write "**/*.html" || log_warn "Prettier formatting issues"
    else
        log_info "Running Prettier for HTML (check only)..."
        npx prettier --check "**/*.html" || log_warn "Prettier found formatting issues"
    fi
    
    log_success "HTML checks complete"
}

# Python formatting and linting
run_python_checks() {
    if ! check_python; then
        return 0
    fi
    
    log_info "Running Python checks..."
    
    local py_files=$(find_allowed_files "py")
    local file_count=$(echo "$py_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No Python files found"
        return 0
    fi
    
    log_info "Found $file_count Python files"
    
    # Install tools if needed
    if ! python3 -m pip show black &> /dev/null; then
        log_info "Installing Black formatter..."
        python3 -m pip install --user black || log_warn "Failed to install Black"
    fi
    
    if ! python3 -m pip show flake8 &> /dev/null; then
        log_info "Installing Flake8 linter..."
        python3 -m pip install --user flake8 || log_warn "Failed to install Flake8"
    fi
    
    # Run Black
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running Black formatter..."
        python3 -m black . --extend-exclude="(.github|.devcontainer|docker|infra|terraform|ansible|deploy|node_modules|dist|build|__pycache__|.vscode)" || log_warn "Black formatting issues"
    else
        log_info "Running Black (check only)..."
        python3 -m black . --check --extend-exclude="(.github|.devcontainer|docker|infra|terraform|ansible|deploy|node_modules|dist|build|__pycache__|.vscode)" || log_warn "Black found formatting issues"
    fi
    
    # Run Flake8
    log_info "Running Flake8 linter..."
    python3 -m flake8 . --exclude=.github,.devcontainer,docker,infra,terraform,ansible,deploy,node_modules,dist,build,__pycache__,.vscode --max-line-length=100 || log_warn "Flake8 found issues"
    
    log_success "Python checks complete"
}

# PowerShell linting
run_powershell_checks() {
    if ! check_powershell; then
        return 0
    fi
    
    log_info "Running PowerShell checks..."
    
    local ps1_files=$(find_allowed_files "ps1")
    local psm1_files=$(find_allowed_files "psm1")
    local file_count=$(echo "$ps1_files $psm1_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No PowerShell files found"
        return 0
    fi
    
    log_info "Found $file_count PowerShell files"
    
    # Run PSScriptAnalyzer
    log_info "Running PSScriptAnalyzer..."
    pwsh -Command "
        if (!(Get-Module -ListAvailable -Name PSScriptAnalyzer)) {
            Install-Module -Name PSScriptAnalyzer -Force -Scope CurrentUser
        }
        
        \$files = Get-ChildItem -Path . -Include *.ps1,*.psm1 -Recurse | 
            Where-Object { 
                \$_.FullName -notmatch '\.github' -and
                \$_.FullName -notmatch '\.devcontainer' -and
                \$_.FullName -notmatch 'docker' -and
                \$_.FullName -notmatch 'infra' -and
                \$_.FullName -notmatch 'terraform' -and
                \$_.FullName -notmatch 'ansible' -and
                \$_.FullName -notmatch 'deploy' -and
                \$_.FullName -notmatch 'node_modules' -and
                \$_.FullName -notmatch '\.vscode'
            }
        
        foreach (\$file in \$files) {
            Write-Host \"Analyzing: \$(\$file.Name)\"
            Invoke-ScriptAnalyzer -Path \$file.FullName
        }
    " || log_warn "PSScriptAnalyzer found issues"
    
    log_success "PowerShell checks complete"
}

# Solidity linting
run_solidity_checks() {
    log_info "Running Solidity checks..."
    
    local sol_files=$(find_allowed_files "sol")
    local file_count=$(echo "$sol_files" | wc -w)
    
    if [[ $file_count -eq 0 ]]; then
        log_warn "No Solidity files found"
        return 0
    fi
    
    log_info "Found $file_count Solidity files"
    
    # Run solhint
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_info "Running solhint with --fix..."
        npx solhint "**/*.sol" --fix || log_warn "solhint found issues"
    else
        log_info "Running solhint (check only)..."
        npx solhint "**/*.sol" || log_warn "solhint found issues"
    fi
    
    log_success "Solidity checks complete"
}

# Main execution
main() {
    log_info "Starting code quality checks..."
    echo ""
    
    # Check prerequisites
    if ! check_node; then
        log_error "Node.js is required. Please install Node.js 20 or later."
        exit 1
    fi
    
    # Create ignore files
    create_ignore_files
    
    echo ""
    log_info "Running checks for all languages..."
    echo ""
    
    # Run checks for each language
    run_javascript_checks
    echo ""
    
    run_css_checks
    echo ""
    
    run_html_checks
    echo ""
    
    run_python_checks
    echo ""
    
    run_powershell_checks
    echo ""
    
    run_solidity_checks
    echo ""
    
    echo "========================================"
    if [[ "$APPLY_FIXES" == "true" ]]; then
        log_success "Code quality fixes applied!"
        log_info "Review changes with: git diff"
    else
        log_success "Code quality check complete!"
        log_info "To apply fixes, run with --apply-fixes"
    fi
}

main
