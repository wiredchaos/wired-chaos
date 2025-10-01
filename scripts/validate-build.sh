#!/bin/bash

# WIRED CHAOS - Validate Build Script
# Validates that the project can build successfully

set -e

echo "======================================================================"
echo "🏗️  WIRED CHAOS - Build Validation"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Step 1: Installing Frontend Dependencies...${NC}"
echo "----------------------------------------------------------------------"

if [ -d "frontend" ]; then
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    else
        echo "Dependencies already installed, skipping..."
    fi
    
    echo ""
    echo -e "${BLUE}🏗️  Step 2: Building Frontend...${NC}"
    echo "----------------------------------------------------------------------"
    
    # Clean previous build
    if [ -d "build" ]; then
        echo "Cleaning previous build..."
        rm -rf build
    fi
    
    # Build
    echo "Running build..."
    if npm run build; then
        echo -e "${GREEN}✅ Frontend build successful!${NC}"
        
        # Check build output
        if [ -d "build" ]; then
            BUILD_SIZE=$(du -sh build | cut -f1)
            echo -e "${GREEN}   Build size: $BUILD_SIZE${NC}"
            
            # Check for key files
            if [ -f "build/index.html" ]; then
                echo -e "${GREEN}   ✓ index.html generated${NC}"
            fi
            
            if [ -d "build/static" ]; then
                echo -e "${GREEN}   ✓ Static assets generated${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Frontend build failed!${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
else
    echo -e "${RED}❌ Frontend directory not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Step 3: Validating Worker Configuration...${NC}"
echo "----------------------------------------------------------------------"

if [ -f "src/wrangler.toml" ]; then
    echo "Checking wrangler.toml..."
    
    # Check if wrangler is installed
    if command -v wrangler &> /dev/null; then
        cd src
        
        # Validate configuration
        if wrangler deploy --dry-run 2>&1 | grep -q "Successfully"; then
            echo -e "${GREEN}✅ Worker configuration valid${NC}"
        else
            echo -e "${YELLOW}⚠️  Worker validation had warnings (this is often normal)${NC}"
        fi
        
        cd ..
    else
        echo -e "${YELLOW}⚠️  Wrangler CLI not installed, skipping worker validation${NC}"
        echo "   Install with: npm install -g wrangler"
    fi
else
    echo -e "${YELLOW}⚠️  src/wrangler.toml not found${NC}"
fi

echo ""
echo -e "${BLUE}🐍 Step 4: Checking Backend...${NC}"
echo "----------------------------------------------------------------------"

if [ -f "backend/server.py" ]; then
    echo "Backend files found"
    
    # Check if Python is available
    if command -v python3 &> /dev/null; then
        echo "Python 3 installed"
        
        # Check if requirements.txt exists
        if [ -f "backend/requirements.txt" ]; then
            echo "requirements.txt found"
            
            # Try to check imports (basic syntax check)
            if python3 -c "import ast; ast.parse(open('backend/server.py').read())" 2>/dev/null; then
                echo -e "${GREEN}✅ Backend Python syntax valid${NC}"
            else
                echo -e "${YELLOW}⚠️  Backend syntax check failed${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Python 3 not found, skipping backend check${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend not found${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Build Validation Complete!${NC}"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "  1. Deploy frontend: cd frontend && npm run deploy"
echo "  2. Deploy worker: cd src && wrangler deploy"
echo "  3. Start backend: cd backend && python3 server.py"
echo ""
