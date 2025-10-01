#!/bin/bash
# WIRED CHAOS Environment Setup Automation
# Sets up all required environment variables and secrets for deployment

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🤖 WIRED CHAOS Environment Setup Automation${NC}"
echo "=============================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to set GitHub secret
set_github_secret() {
    local secret_name=$1
    local secret_value=$2
    local is_optional=${3:-false}
    
    if [ -z "$secret_value" ] && [ "$is_optional" = true ]; then
        echo -e "${YELLOW}⚠️  Skipping optional secret: $secret_name${NC}"
        return 0
    fi
    
    if [ -z "$secret_value" ]; then
        echo -e "${RED}❌ Missing required secret: $secret_name${NC}"
        return 1
    fi
    
    echo "$secret_value" | gh secret set "$secret_name" --body "$secret_value"
    echo -e "${GREEN}✅ Set secret: $secret_name${NC}"
}

# Check for GitHub CLI
if ! command_exists gh; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check GitHub authentication
if ! gh auth status >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Authenticating..."
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Define required secrets
echo -e "${CYAN}📋 Setting up required secrets...${NC}"
echo ""

# Cloudflare secrets (required)
echo -e "${YELLOW}🔐 Cloudflare Configuration${NC}"
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    read -sp "Enter Cloudflare API Token: " CLOUDFLARE_API_TOKEN
    echo ""
fi
set_github_secret "CLOUDFLARE_API_TOKEN" "$CLOUDFLARE_API_TOKEN"

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    read -p "Enter Cloudflare Account ID: " CLOUDFLARE_ACCOUNT_ID
fi
set_github_secret "CLOUDFLARE_ACCOUNT_ID" "$CLOUDFLARE_ACCOUNT_ID"

if [ -z "$CLOUDFLARE_PROJECT_NAME" ]; then
    CLOUDFLARE_PROJECT_NAME="wired-chaos"
    echo -e "${CYAN}Using default project name: $CLOUDFLARE_PROJECT_NAME${NC}"
fi
set_github_secret "CLOUDFLARE_PROJECT_NAME" "$CLOUDFLARE_PROJECT_NAME"

# Notion secrets (optional)
echo ""
echo -e "${YELLOW}📝 Notion API Configuration (optional)${NC}"
if [ -z "$NOTION_API_KEY" ]; then
    read -p "Enter Notion API Key (or press Enter to skip): " NOTION_API_KEY
fi
set_github_secret "NOTION_API_KEY" "$NOTION_API_KEY" true

if [ -z "$NOTION_DATABASE_ID" ]; then
    read -p "Enter Notion Database ID (or press Enter to skip): " NOTION_DATABASE_ID
fi
set_github_secret "NOTION_DATABASE_ID" "$NOTION_DATABASE_ID" true

# Wix secrets (optional)
echo ""
echo -e "${YELLOW}🎨 Wix Integration Configuration (optional)${NC}"
if [ -z "$WIX_API_TOKEN" ]; then
    read -sp "Enter Wix API Token (or press Enter to skip): " WIX_API_TOKEN
    echo ""
fi
set_github_secret "WIX_API_TOKEN" "$WIX_API_TOKEN" true

if [ -z "$WIX_SITE_ID" ]; then
    read -p "Enter Wix Site ID (or press Enter to skip): " WIX_SITE_ID
fi
set_github_secret "WIX_SITE_ID" "$WIX_SITE_ID" true

if [ -z "$WIX_WEBHOOK_SECRET" ]; then
    WIX_WEBHOOK_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "")
    if [ -n "$WIX_WEBHOOK_SECRET" ]; then
        echo -e "${CYAN}Generated webhook secret${NC}"
    fi
fi
set_github_secret "WIX_WEBHOOK_SECRET" "$WIX_WEBHOOK_SECRET" true

# GAMMA API secrets (optional)
echo ""
echo -e "${YELLOW}🎨 GAMMA API Configuration (optional)${NC}"
if [ -z "$GAMMA_API_TOKEN" ]; then
    read -sp "Enter GAMMA API Token (or press Enter to skip): " GAMMA_API_TOKEN
    echo ""
fi
set_github_secret "GAMMA_API_TOKEN" "$GAMMA_API_TOKEN" true

# Discord webhook (optional)
echo ""
echo -e "${YELLOW}💬 Discord Notification Configuration (optional)${NC}"
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    read -p "Enter Discord Webhook URL (or press Enter to skip): " DISCORD_WEBHOOK_URL
fi
set_github_secret "DISCORD_WEBHOOK_URL" "$DISCORD_WEBHOOK_URL" true

# Telegram configuration (optional)
echo ""
echo -e "${YELLOW}📱 Telegram Notification Configuration (optional)${NC}"
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    read -sp "Enter Telegram Bot Token (or press Enter to skip): " TELEGRAM_BOT_TOKEN
    echo ""
fi
set_github_secret "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN" true

if [ -z "$TELEGRAM_CHAT_ID" ]; then
    read -p "Enter Telegram Chat ID (or press Enter to skip): " TELEGRAM_CHAT_ID
fi
set_github_secret "TELEGRAM_CHAT_ID" "$TELEGRAM_CHAT_ID" true

# Email configuration (optional)
echo ""
echo -e "${YELLOW}📧 Email Notification Configuration (optional)${NC}"
if [ -z "$SMTP_HOST" ]; then
    read -p "Enter SMTP Host (or press Enter to skip): " SMTP_HOST
fi
set_github_secret "SMTP_HOST" "$SMTP_HOST" true

if [ -z "$SMTP_PORT" ]; then
    read -p "Enter SMTP Port (or press Enter to skip): " SMTP_PORT
fi
set_github_secret "SMTP_PORT" "$SMTP_PORT" true

if [ -z "$SMTP_USER" ]; then
    read -p "Enter SMTP User (or press Enter to skip): " SMTP_USER
fi
set_github_secret "SMTP_USER" "$SMTP_USER" true

if [ -z "$SMTP_PASSWORD" ]; then
    read -sp "Enter SMTP Password (or press Enter to skip): " SMTP_PASSWORD
    echo ""
fi
set_github_secret "SMTP_PASSWORD" "$SMTP_PASSWORD" true

# Worker secrets (optional)
echo ""
echo -e "${YELLOW}⚙️  Worker Configuration (optional)${NC}"
if [ -z "$WORKER_ADMIN_URL" ]; then
    read -p "Enter Worker Admin URL (or press Enter to skip): " WORKER_ADMIN_URL
fi
set_github_secret "WORKER_ADMIN_URL" "$WORKER_ADMIN_URL" true

if [ -z "$CLOUDFLARE_ADMIN_TOKEN" ]; then
    read -sp "Enter Cloudflare Admin Token (or press Enter to skip): " CLOUDFLARE_ADMIN_TOKEN
    echo ""
fi
set_github_secret "CLOUDFLARE_ADMIN_TOKEN" "$CLOUDFLARE_ADMIN_TOKEN" true

echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo -e "${CYAN}📊 Summary:${NC}"
gh secret list
echo ""
echo -e "${CYAN}🚀 Next steps:${NC}"
echo "1. Deploy webhook processor: npm run deploy:webhook"
echo "2. Run end-to-end tests: npm run test:e2e"
echo "3. Activate GAMMA templates: npm run gamma:activate"
echo "4. Start monitoring: npm run monitor:start"
