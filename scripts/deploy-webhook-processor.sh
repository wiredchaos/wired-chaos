#!/bin/bash
# WIRED CHAOS Webhook Processor Deployment Automation
# Deploys webhook processor to Cloudflare Workers

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 WIRED CHAOS Webhook Processor Deployment${NC}"
echo "=============================================="
echo ""

# Check for wrangler CLI
if ! command -v wrangler >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Installing Wrangler CLI...${NC}"
    npm install -g wrangler
fi

echo -e "${GREEN}✅ Wrangler CLI available${NC}"

# Check for required environment variables
if [ -z "$CLOUDFLARE_API_TOKEN" ] && [ -z "$(gh secret list | grep CLOUDFLARE_API_TOKEN)" ]; then
    echo -e "${RED}❌ CLOUDFLARE_API_TOKEN not set${NC}"
    echo "Run: ./scripts/setup-environment.sh"
    exit 1
fi

# Deploy webhook processor worker
echo ""
echo -e "${CYAN}📦 Deploying webhook processor...${NC}"

cd wix-gamma-integration/cloudflare/workers

# Set secrets in worker
echo ""
echo -e "${YELLOW}🔐 Setting worker secrets...${NC}"

# Get secrets from GitHub if not in environment
if [ -z "$WIX_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  WIX_API_TOKEN not set, skipping...${NC}"
else
    echo "$WIX_API_TOKEN" | wrangler secret put WIX_API_TOKEN
    echo -e "${GREEN}✅ Set WIX_API_TOKEN${NC}"
fi

if [ -z "$WIX_SITE_ID" ]; then
    echo -e "${YELLOW}⚠️  WIX_SITE_ID not set, skipping...${NC}"
else
    echo "$WIX_SITE_ID" | wrangler secret put WIX_SITE_ID
    echo -e "${GREEN}✅ Set WIX_SITE_ID${NC}"
fi

if [ -z "$WIX_WEBHOOK_SECRET" ]; then
    WIX_WEBHOOK_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "default-webhook-secret")
    echo -e "${CYAN}Generated webhook secret${NC}"
fi
echo "$WIX_WEBHOOK_SECRET" | wrangler secret put WIX_WEBHOOK_SECRET
echo -e "${GREEN}✅ Set WIX_WEBHOOK_SECRET${NC}"

if [ -z "$NOTION_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  NOTION_API_KEY not set, skipping...${NC}"
else
    echo "$NOTION_API_KEY" | wrangler secret put NOTION_API_KEY
    echo -e "${GREEN}✅ Set NOTION_API_KEY${NC}"
fi

if [ -z "$GAMMA_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  GAMMA_API_TOKEN not set, skipping...${NC}"
else
    echo "$GAMMA_API_TOKEN" | wrangler secret put GAMMA_API_TOKEN
    echo -e "${GREEN}✅ Set GAMMA_API_TOKEN${NC}"
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo -e "${YELLOW}⚠️  DISCORD_WEBHOOK_URL not set, skipping...${NC}"
else
    echo "$DISCORD_WEBHOOK_URL" | wrangler secret put DISCORD_WEBHOOK_URL
    echo -e "${GREEN}✅ Set DISCORD_WEBHOOK_URL${NC}"
fi

# Deploy the worker
echo ""
echo -e "${CYAN}🚀 Deploying to Cloudflare Workers...${NC}"
wrangler deploy

echo ""
echo -e "${GREEN}✅ Webhook processor deployed successfully!${NC}"
echo ""
echo -e "${CYAN}📋 Deployment Info:${NC}"
echo "Worker URL: https://wired-chaos-webhook.[account].workers.dev"
echo "Health Check: curl https://wired-chaos-webhook.[account].workers.dev/health"
echo ""
echo -e "${CYAN}🔗 Webhook Endpoints:${NC}"
echo "- POST /webhook/wix       - Wix webhook handler"
echo "- POST /webhook/notion    - Notion webhook handler"
echo "- POST /webhook/github    - GitHub webhook handler"
echo "- GET  /health            - Health check"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Configure Wix webhook to point to worker URL"
echo "2. Test webhook: curl -X POST [worker-url]/webhook/wix -d '{\"test\":true}'"
echo "3. Monitor logs: wrangler tail"
