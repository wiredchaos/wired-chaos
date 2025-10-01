#!/bin/bash
# WIRED CHAOS - Build Validation Script
# Validates that the project can build successfully

set +e  # Don't exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "======================================================"
echo "   WIRED CHAOS BUILD VALIDATION"
echo "   Testing Build Process"
echo "======================================================"
echo -e "${NC}"

BUILD_ERRORS=0
BUILD_WARNINGS=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ((BUILD_ERRORS++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((BUILD_WARNINGS++))
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check Node.js
echo ""
print_info "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed: $NODE_VERSION"
else
    print_status 1 "Node.js not found"
fi

# Check npm/yarn
print_info "Checking package manager installation..."
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    print_status 0 "yarn installed: $YARN_VERSION"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm installed: $NPM_VERSION"
else
    print_status 1 "npm/yarn not found"
fi

# Check Python
echo ""
print_info "Checking Python installation..."
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    print_status 0 "Python installed: $PYTHON_VERSION"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    print_status 0 "Python3 installed: $PYTHON_VERSION"
else
    print_status 1 "Python not found"
fi

# Check frontend dependencies
echo ""
print_info "Checking frontend dependencies..."
if [ -f "frontend/package.json" ]; then
    if [ -d "frontend/node_modules" ]; then
        print_status 0 "Frontend dependencies installed"
    else
        print_warning "Frontend dependencies not installed - Run: cd frontend && yarn install"
    fi
else
    print_warning "Frontend package.json not found"
fi

# Check backend dependencies
print_info "Checking backend dependencies..."
if [ -f "backend/requirements.txt" ]; then
    print_status 0 "Backend requirements.txt found"
else
    print_warning "Backend requirements.txt not found"
fi

# Test frontend build (if dependencies are installed)
echo ""
if [ -d "frontend/node_modules" ]; then
    print_info "Testing frontend build process..."
    cd frontend
    
    # Try to build (prefer yarn, fallback to npm)
    if command -v yarn &> /dev/null; then
        yarn build > /tmp/frontend-build.log 2>&1
    else
        npm run build > /tmp/frontend-build.log 2>&1
    fi
    BUILD_EXIT_CODE=$?
    
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        print_status 0 "Frontend build successful"
        
        # Check if build directory was created
        if [ -d "build" ] || [ -d "dist" ]; then
            print_status 0 "Build artifacts created"
        else
            print_warning "Build succeeded but no build artifacts found"
        fi
    else
        print_status 1 "Frontend build failed - check /tmp/frontend-build.log for details"
        echo ""
        echo -e "${YELLOW}Last 10 lines of build output:${NC}"
        tail -10 /tmp/frontend-build.log
    fi
    
    cd ..
else
    print_warning "Skipping frontend build test - dependencies not installed"
fi

# Test backend imports (basic validation)
echo ""
if command -v python &> /dev/null || command -v python3 &> /dev/null; then
    print_info "Testing backend imports..."
    PYTHON_CMD="python"
    if ! command -v python &> /dev/null; then
        PYTHON_CMD="python3"
    fi
    
    # Test FastAPI import
    $PYTHON_CMD -c "import fastapi" &> /dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "FastAPI is installed"
    else
        print_warning "FastAPI not installed - Run: pip install -r backend/requirements.txt"
    fi
    
    # Test other common imports
    $PYTHON_CMD -c "import pydantic" &> /dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "Pydantic is installed"
    else
        print_warning "Pydantic not installed"
    fi
fi

# Check for mega prompt files
echo ""
print_info "Checking Mega Prompt integration..."
MEGA_PROMPT_FILES=(
    ".copilot/wired-chaos-context.md"
    ".vscode/settings.json"
    "AUTO_FIX_PATTERNS.md"
    "SANITY_CHECK.ps1"
)

for file in "${MEGA_PROMPT_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Mega Prompt file present: $file"
    else
        print_warning "Mega Prompt file missing: $file"
    fi
done

# Summary
echo ""
echo -e "${CYAN}======================================================"
echo "   BUILD VALIDATION SUMMARY"
echo "======================================================${NC}"

echo -e "${CYAN}Errors: ${NC}${BUILD_ERRORS}"
echo -e "${CYAN}Warnings: ${NC}${BUILD_WARNINGS}"

if [ $BUILD_ERRORS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ BUILD VALIDATION PASSED${NC}"
    echo -e "${GREEN}The project appears to be in good shape for building.${NC}"
    
    if [ $BUILD_WARNINGS -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Some warnings were found - review above for details.${NC}"
    fi
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ BUILD VALIDATION FAILED${NC}"
    echo -e "${RED}Critical issues found - please fix errors above.${NC}"
    exit 1
fi
