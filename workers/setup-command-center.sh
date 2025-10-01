#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# WIRED CHAOS Command Center - Setup Script
# ═══════════════════════════════════════════════════════════════════════════
#
# This script helps you configure and deploy the Command Center worker.
#
# Usage:
#   ./setup-command-center.sh [environment]
#
# Environments:
#   production  - Deploy to production (default)
#   staging     - Deploy to staging
#   development - Deploy to development
#
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment (default to production)
ENV="${1:-production}"

# Helper functions
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"
}

# Check if wrangler is installed
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        error "Wrangler CLI not found. Install with: npm install -g wrangler"
    fi
    success "Wrangler CLI found"
}

# Verify authentication
check_auth() {
    if ! wrangler whoami &> /dev/null; then
        warning "Not authenticated with Cloudflare"
        info "Running: wrangler login"
        wrangler login
        success "Authentication complete"
    else
        success "Already authenticated with Cloudflare"
    fi
}

# Set secret helper
set_secret() {
    local name=$1
    local description=$2
    local required=$3
    
    info "$description"
    echo -n "Enter value (or press Enter to skip): "
    read -s value
    echo
    
    if [ -n "$value" ]; then
        echo "$value" | wrangler secret put "$name" --env "$ENV" 2>/dev/null
        if [ $? -eq 0 ]; then
            success "$name set successfully"
        else
            error "Failed to set $name"
        fi
    elif [ "$required" = "true" ]; then
        warning "$name skipped (required for functionality)"
    else
        info "$name skipped (optional)"
    fi
}

# Main setup
main() {
    header "WIRED CHAOS Command Center Setup"
    
    info "Environment: $ENV"
    echo
    
    # Check prerequisites
    header "Step 1: Prerequisites"
    check_wrangler
    check_auth
    
    # Configure wrangler.toml
    header "Step 2: Configure wrangler.toml"
    
    if [ ! -f "wrangler.toml" ]; then
        if [ -f "command-center-wrangler.toml" ]; then
            info "Copying command-center-wrangler.toml to wrangler.toml"
            cp command-center-wrangler.toml wrangler.toml
            success "wrangler.toml created"
            warning "Please edit wrangler.toml and update:"
            warning "  - account_id: Your Cloudflare account ID"
            warning "  - routes: Your domain routes (if using custom domain)"
            echo
            echo -n "Press Enter when ready to continue..."
            read
        else
            error "command-center-wrangler.toml not found"
        fi
    else
        success "wrangler.toml already exists"
    fi
    
    # Set secrets
    header "Step 3: Configure Secrets"
    
    warning "You will be prompted for sensitive values."
    warning "Press Enter to skip optional secrets."
    echo
    
    # Core secrets
    info "Core Configuration"
    set_secret "ADMIN_IDS" "Admin user IDs (comma-separated)" "true"
    set_secret "ADMIN_TOKENS" "Admin API tokens (comma-separated)" "true"
    echo
    
    # Wix secrets
    info "Wix Integration"
    set_secret "WIX_API_TOKEN" "Wix API token" "false"
    set_secret "WIX_SITE_ID" "Wix site ID" "false"
    echo
    
    # Zapier secrets
    info "Zapier Integration"
    set_secret "ZAPIER_WEBHOOK_URL" "Zapier webhook URL" "false"
    echo
    
    # GitHub secrets
    info "GitHub Integration"
    set_secret "GITHUB_TOKEN" "GitHub access token" "false"
    set_secret "GITHUB_WEBHOOK_SECRET" "GitHub webhook secret" "false"
    echo
    
    # Gamma secrets
    info "Gamma Integration"
    set_secret "GAMMA_API_KEY" "Gamma API key" "false"
    echo
    
    # Notion secrets
    info "Notion Integration"
    set_secret "NOTION_API_KEY" "Notion API key" "false"
    echo
    
    # Webhook secret
    info "Security"
    set_secret "WEBHOOK_SECRET" "General webhook secret" "false"
    echo
    
    # Deploy
    header "Step 4: Deploy Worker"
    
    info "Deploying to $ENV environment..."
    
    if wrangler deploy --env "$ENV"; then
        success "Deployment successful!"
        echo
        
        # Get worker URL
        if [ "$ENV" = "production" ]; then
            WORKER_URL="https://command-center-prod.your-subdomain.workers.dev"
        elif [ "$ENV" = "staging" ]; then
            WORKER_URL="https://command-center-staging.your-subdomain.workers.dev"
        else
            WORKER_URL="https://command-center-dev.your-subdomain.workers.dev"
        fi
        
        info "Worker URL: $WORKER_URL"
        info "Update this URL based on your actual subdomain"
        echo
        
        # Test health endpoint
        header "Step 5: Test Deployment"
        
        info "Testing health endpoint..."
        echo "curl $WORKER_URL/health"
        echo
        warning "Replace the URL with your actual worker URL to test"
        
    else
        error "Deployment failed"
    fi
    
    # Summary
    header "Setup Complete!"
    
    success "Command Center worker is configured and deployed"
    echo
    info "Next steps:"
    echo "  1. Test the health endpoint: curl \$WORKER_URL/health"
    echo "  2. Configure webhooks in GitHub, Wix, etc."
    echo "  3. Test integrations"
    echo "  4. Monitor logs: wrangler tail --env $ENV"
    echo
    info "Documentation:"
    echo "  - Deployment Guide: COMMAND_CENTER_DEPLOYMENT.md"
    echo "  - Quick Reference: COMMAND_CENTER_QUICK_REFERENCE.md"
    echo
    success "Happy automating! ⚡"
}

# Run main setup
main
