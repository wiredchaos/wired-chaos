#!/bin/bash

# WIRED CHAOS - No-Touch Cloudflare Pages Fix
# Date: October 1, 2025
# Purpose: Automatically fix Pages 404 error and deploy frontend

set -e

echo "🚀 WIRED CHAOS NO-TOUCH PAGES DEPLOYMENT FIX"
echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}🎯 TARGET: Fix https://wired-chaos.pages.dev 404 Error${NC}"
echo -e "${YELLOW}🔍 ISSUE: Pages misconfigured - not pointing to frontend/build/${NC}"
echo ""

# Step 1: Verify build exists
echo -e "${MAGENTA}📋 STEP 1: VERIFYING FRONTEND BUILD${NC}"
echo ""

if [ -f "frontend/build/index.html" ]; then
    BUILD_SIZE=$(stat -f%z "frontend/build/index.html" 2>/dev/null || stat -c%s "frontend/build/index.html" 2>/dev/null || echo "unknown")
    echo -e "${GREEN}✅ Build verified: frontend/build/index.html (${BUILD_SIZE} bytes)${NC}"
else
    echo -e "${RED}❌ Build not found - creating new build...${NC}"
    
    if [ -f "frontend/package.json" ]; then
        echo -e "${CYAN}🏗️ Building React frontend...${NC}"
        cd frontend
        
        if command -v npm &> /dev/null; then
            npm install --silent
            npm run build
            echo -e "${GREEN}✅ Frontend build completed${NC}"
        else
            echo -e "${RED}❌ npm not available - cannot build${NC}"
            exit 1
        fi
        
        cd ..
    else
        echo -e "${RED}❌ No frontend/package.json found${NC}"
        exit 1
    fi
fi

# Step 2: Generate Cloudflare API script
echo ""
echo -e "${MAGENTA}📋 STEP 2: GENERATING CLOUDFLARE API FIX${NC}"
echo ""

# Create Cloudflare API script for Pages configuration
cat > "cloudflare-pages-fix.js" << 'EOF'
#!/usr/bin/env node

// WIRED CHAOS - Cloudflare Pages API Fix
// Automatically updates Pages build configuration

const https = require('https');

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = 'wired-chaos';

if (!CLOUDFLARE_API_TOKEN || !ACCOUNT_ID) {
    console.log('❌ Missing environment variables:');
    console.log('   CLOUDFLARE_API_TOKEN=your_token');
    console.log('   CLOUDFLARE_ACCOUNT_ID=your_account_id');
    console.log('');
    console.log('🔧 Get these from: Cloudflare Dashboard → My Profile → API Tokens');
    process.exit(1);
}

const updatePagesConfig = async () => {
    const data = JSON.stringify({
        build_config: {
            build_command: 'cd frontend && npm install && npm run build',
            destination_dir: 'frontend/build',
            root_dir: '/',
            web_analytics_tag: null,
            web_analytics_token: null
        }
    });

    const options = {
        hostname: 'api.cloudflare.com',
        port: 443,
        path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        console.log('✅ Pages configuration updated successfully');
                        resolve(response);
                    } else {
                        console.log('❌ API Error:', response.errors);
                        reject(new Error(JSON.stringify(response.errors)));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
};

const triggerDeployment = async () => {
    const options = {
        hostname: 'api.cloudflare.com',
        port: 443,
        path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        console.log('✅ New deployment triggered');
                        console.log(`🌐 Deployment URL: ${response.result.url}`);
                        resolve(response);
                    } else {
                        console.log('❌ Deployment Error:', response.errors);
                        reject(new Error(JSON.stringify(response.errors)));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
};

console.log('🤖 WIRED CHAOS Cloudflare Pages Auto-Fix');
console.log('📋 Project:', PROJECT_NAME);
console.log('🏗️ Build Command: cd frontend && npm install && npm run build');
console.log('📁 Output Directory: frontend/build');
console.log('');

updatePagesConfig()
    .then(() => {
        console.log('🚀 Triggering new deployment...');
        return triggerDeployment();
    })
    .then(() => {
        console.log('');
        console.log('🎉 PAGES DEPLOYMENT FIX COMPLETE!');
        console.log('🌐 Check: https://wired-chaos.pages.dev');
        console.log('⏱️ Allow 2-3 minutes for deployment to complete');
    })
    .catch((error) => {
        console.log('');
        console.log('❌ Fix failed:', error.message);
        console.log('');
        console.log('🔧 Manual steps required:');
        console.log('1. Go to Cloudflare Pages Dashboard');
        console.log('2. Select wired-chaos project');
        console.log('3. Settings → Build & deployments');
        console.log('4. Update Build output directory to: frontend/build');
        console.log('5. Update Build command to: cd frontend && npm install && npm run build');
        console.log('6. Trigger new deployment');
    });
EOF

chmod +x cloudflare-pages-fix.js

echo -e "${GREEN}✅ Cloudflare API fix script generated: cloudflare-pages-fix.js${NC}"

# Step 3: Provide execution options
echo ""
echo -e "${MAGENTA}📋 STEP 3: EXECUTION OPTIONS${NC}"
echo ""

echo -e "${CYAN}🤖 OPTION 1: Automated API Fix (Recommended)${NC}"
echo -e "${YELLOW}Requirements:${NC}"
echo "   • CLOUDFLARE_API_TOKEN environment variable"
echo "   • CLOUDFLARE_ACCOUNT_ID environment variable"
echo ""
echo -e "${YELLOW}Setup:${NC}"
echo "   export CLOUDFLARE_API_TOKEN='your_token_here'"
echo "   export CLOUDFLARE_ACCOUNT_ID='your_account_id_here'"
echo ""
echo -e "${YELLOW}Execute:${NC}"
echo "   node cloudflare-pages-fix.js"
echo ""

echo -e "${CYAN}🔧 OPTION 2: Manual Dashboard Fix${NC}"
echo "1. Go to: https://dash.cloudflare.com/pages"
echo "2. Select: wired-chaos project"
echo "3. Settings → Build & deployments"
echo "4. Update Build output directory: frontend/build"
echo "5. Update Build command: cd frontend && npm install && npm run build"
echo "6. Click 'Save and Deploy'"
echo ""

echo -e "${CYAN}🧪 OPTION 3: Local Testing${NC}"
echo "   cd frontend && npm run build && npx serve build"
echo ""

# Step 4: Health check script
echo -e "${MAGENTA}📋 STEP 4: HEALTH CHECK SCRIPT${NC}"
echo ""

cat > "check-pages-health.sh" << 'EOF'
#!/bin/bash
echo "🔍 Checking Pages health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://wired-chaos.pages.dev" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Pages is live: https://wired-chaos.pages.dev"
else
    echo "❌ Pages still down: HTTP $HTTP_STATUS"
fi
EOF

chmod +x check-pages-health.sh

echo -e "${GREEN}✅ Health check script generated: check-pages-health.sh${NC}"

# Final summary
echo ""
echo -e "${GREEN}🎉 NO-TOUCH PAGES FIX READY!${NC}"
echo ""
echo -e "${MAGENTA}📋 NEXT STEPS:${NC}"
echo "1. Set Cloudflare API credentials (if using automated fix)"
echo "2. Run: node cloudflare-pages-fix.js"
echo "3. Wait 2-3 minutes for deployment"
echo "4. Run: ./check-pages-health.sh to verify"
echo ""
echo -e "${CYAN}🎯 Expected Result: https://wired-chaos.pages.dev → Working React app${NC}"
echo ""
echo -e "${YELLOW}⚡ This will restore the WIRED CHAOS frontend immediately!${NC}"