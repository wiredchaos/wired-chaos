#!/bin/bash

# WIRED CHAOS Sanity Check Script
# Validates system configuration and dependencies

set -e

echo "======================================================================"
echo "🔍 WIRED CHAOS - System Sanity Check"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
PASSED=0
FAILED=0
WARNINGS=0

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "📋 Checking System Requirements..."
echo "----------------------------------------------------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js installed: $NODE_VERSION"
else
    error "Node.js not found. Please install Node.js LTS from https://nodejs.org"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm installed: v$NPM_VERSION"
else
    error "npm not found"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    success "$PYTHON_VERSION installed"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    success "$PYTHON_VERSION installed"
else
    warning "Python not found. Backend features may not work."
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    success "$GIT_VERSION installed"
else
    error "Git not found. Please install Git."
fi

echo ""
echo "📁 Checking Project Files..."
echo "----------------------------------------------------------------------"

# Check key files
files=(
    "package.json"
    "frontend/package.json"
    "frontend/src/App.js"
    "backend/server.py"
    "src/index.js"
    "src/wrangler.toml"
    ".vscode/settings.json"
    ".copilot/context.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        success "$file exists"
    else
        error "$file missing"
    fi
done

echo ""
echo "📦 Checking Dependencies..."
echo "----------------------------------------------------------------------"

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    success "Frontend dependencies installed"
else
    warning "Frontend dependencies not installed. Run: cd frontend && npm install"
fi

# Check if package-lock.json exists
if [ -f "frontend/package-lock.json" ]; then
    success "Frontend package-lock.json exists"
else
    warning "Frontend package-lock.json missing"
fi

# Check Python dependencies
if [ -f "backend/requirements.txt" ]; then
    success "Backend requirements.txt exists"
    
    # Try to check if packages are installed
    if command -v pip3 &> /dev/null; then
        if pip3 freeze | grep -q fastapi; then
            success "FastAPI installed"
        else
            warning "FastAPI not found. Run: pip3 install -r backend/requirements.txt"
        fi
    fi
else
    warning "Backend requirements.txt missing"
fi

echo ""
echo "🔧 Checking Configuration..."
echo "----------------------------------------------------------------------"

# Check wrangler.toml
if [ -f "src/wrangler.toml" ]; then
    success "Cloudflare Worker configuration exists"
    
    # Validate basic structure
    if grep -q "name" src/wrangler.toml && grep -q "main" src/wrangler.toml; then
        success "wrangler.toml has required fields"
    else
        error "wrangler.toml missing required fields (name, main)"
    fi
else
    error "src/wrangler.toml missing"
fi

# Check VS Code configuration
if [ -f ".vscode/settings.json" ]; then
    success "VS Code configuration exists"
else
    warning ".vscode/settings.json missing"
fi

# Check Copilot configuration
if [ -d ".copilot" ]; then
    success "Copilot configuration directory exists"
    
    copilot_files=(
        ".copilot/context.md"
        ".copilot/autofix-patterns.md"
        ".copilot/color-palette.md"
        ".copilot/ar-vr-config.md"
        ".copilot/security-patterns.md"
        ".copilot/infrastructure.md"
    )
    
    for file in "${copilot_files[@]}"; do
        if [ -f "$file" ]; then
            success "$file exists"
        else
            warning "$file missing"
        fi
    done
else
    error ".copilot directory missing"
fi

echo ""
echo "🔍 Checking Build Tools..."
echo "----------------------------------------------------------------------"

# Check if wrangler is installed
if command -v wrangler &> /dev/null; then
    WRANGLER_VERSION=$(wrangler --version)
    success "Wrangler CLI installed: $WRANGLER_VERSION"
else
    warning "Wrangler CLI not found. Install with: npm install -g wrangler"
fi

# Check GitHub CLI
if command -v gh &> /dev/null; then
    GH_VERSION=$(gh --version | head -n 1)
    success "$GH_VERSION installed"
else
    warning "GitHub CLI not found. Install from: https://cli.github.com"
fi

echo ""
echo "🧪 Running Quick Tests..."
echo "----------------------------------------------------------------------"

# Test Node.js module resolution
if cd frontend 2>/dev/null && node -e "require('react')" 2>/dev/null; then
    success "React module can be loaded"
    cd ..
else
    warning "React module cannot be loaded. Run: cd frontend && npm install"
    cd .. 2>/dev/null || true
fi

# Test Python imports
if command -v python3 &> /dev/null; then
    if python3 -c "import fastapi" 2>/dev/null; then
        success "FastAPI can be imported"
    else
        warning "FastAPI cannot be imported"
    fi
fi

echo ""
echo "======================================================================"
echo "📊 Sanity Check Results"
echo "======================================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 All checks passed! System is ready.${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  System is mostly ready, but there are some warnings.${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Some critical checks failed. Please fix the errors above.${NC}"
    exit 1
fi
