#!/bin/bash
# WIRED CHAOS - EMERGENT Deployment Automation Script
# Comprehensive automation for PR management, conflict resolution, and deployment

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="${GITHUB_REPO_OWNER:-wiredchaos}"
REPO_NAME="${GITHUB_REPO_NAME:-wired-chaos}"
BASE_BRANCH="main"

# Function to print colored output
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${CYAN}🔹 $1${NC}"; }

# Banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🚀 WIRED CHAOS - EMERGENT DEPLOYMENT 🚀            ║"
echo "║    Automated PR Management & Cloudflare Deployment        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check required tools
log_step "Checking required tools..."
for tool in gh git node npm; do
    if ! command -v $tool &> /dev/null; then
        log_error "$tool is not installed. Please install it first."
        exit 1
    fi
done
log_success "All required tools found"

# Verify GitHub authentication
log_step "Verifying GitHub authentication..."
if ! gh auth status &> /dev/null; then
    log_error "GitHub CLI is not authenticated. Run: gh auth login"
    exit 1
fi
log_success "GitHub CLI authenticated"

# Step 1: Fetch latest changes
log_step "Step 1/7: Fetching latest changes..."
git fetch origin
git checkout $BASE_BRANCH
git pull origin $BASE_BRANCH
log_success "Repository updated"

# Step 2: Process draft PRs
log_step "Step 2/7: Converting draft PRs to ready..."
DRAFT_PRS=$(gh pr list --draft --json number --jq '.[].number')
if [ -z "$DRAFT_PRS" ]; then
    log_info "No draft PRs found"
else
    for pr_num in $DRAFT_PRS; do
        log_info "Converting PR #$pr_num to ready..."
        gh pr ready $pr_num || log_warning "Failed to convert PR #$pr_num"
    done
    log_success "Draft PRs processed"
fi

# Step 3: Resolve conflicts
log_step "Step 3/7: Resolving PR conflicts..."
CONFLICTED_PRS=$(gh pr list --json number,mergeable --jq '.[] | select(.mergeable=="CONFLICTING") | .number')
if [ -z "$CONFLICTED_PRS" ]; then
    log_info "No conflicted PRs found"
else
    for pr_num in $CONFLICTED_PRS; do
        log_info "Attempting to resolve conflicts for PR #$pr_num..."
        
        # Run conflict resolution script
        if [ -f "./wired-chaos-emergent/scripts/conflict-resolution.js" ]; then
            node ./wired-chaos-emergent/scripts/conflict-resolution.js $pr_num || log_warning "Auto-resolution failed for PR #$pr_num"
        else
            log_warning "Conflict resolution script not found, skipping..."
        fi
    done
    log_success "Conflict resolution attempted"
fi

# Step 4: Merge ready PRs in order
log_step "Step 4/7: Merging ready PRs..."
# Define PR merge order based on dependencies
PR_ORDER=(23 22 24 25)  # SWARM Orchestrator, Video System, System Patches, Student Union

for pr_num in "${PR_ORDER[@]}"; do
    log_info "Checking PR #$pr_num..."
    
    # Check if PR exists and is mergeable
    PR_INFO=$(gh pr view $pr_num --json mergeable,state,statusCheckRollup 2>/dev/null || echo "")
    
    if [ -z "$PR_INFO" ]; then
        log_warning "PR #$pr_num not found, skipping..."
        continue
    fi
    
    MERGEABLE=$(echo "$PR_INFO" | jq -r '.mergeable')
    STATE=$(echo "$PR_INFO" | jq -r '.state')
    
    if [ "$STATE" != "OPEN" ]; then
        log_info "PR #$pr_num is $STATE, skipping..."
        continue
    fi
    
    if [ "$MERGEABLE" = "MERGEABLE" ]; then
        log_info "Merging PR #$pr_num..."
        if gh pr merge $pr_num --merge --auto; then
            log_success "PR #$pr_num merged successfully"
            sleep 5  # Wait for merge to complete
        else
            log_error "Failed to merge PR #$pr_num"
        fi
    else
        log_warning "PR #$pr_num is not mergeable (status: $MERGEABLE)"
    fi
done

# Step 5: Deploy to Cloudflare
log_step "Step 5/7: Deploying to Cloudflare Edge..."

if [ -f "wrangler.toml" ] || [ -f "src/wrangler.toml" ]; then
    log_info "Building frontend..."
    cd frontend && npm install && npm run build && cd ..
    
    log_info "Deploying worker to Cloudflare..."
    if [ -f "src/wrangler.toml" ]; then
        cd src && npx wrangler deploy --env production && cd ..
    else
        npx wrangler deploy --env production
    fi
    
    log_success "Deployment completed"
else
    log_warning "Wrangler config not found, skipping deployment"
fi

# Step 6: Run smoke tests
log_step "Step 6/7: Running smoke tests..."
if [ -f "./wired-chaos-emergent/scripts/smoke-tests.js" ]; then
    node ./wired-chaos-emergent/scripts/smoke-tests.js || log_warning "Some smoke tests failed"
else
    log_warning "Smoke tests script not found"
fi

# Step 7: Fix specific issues
log_step "Step 7/7: Applying system fixes..."

# Fix tax suite integration
if [ -f "./wired-chaos-emergent/scripts/tax-suite-fix.js" ]; then
    log_info "Fixing tax suite integration..."
    node ./wired-chaos-emergent/scripts/tax-suite-fix.js || log_warning "Tax suite fix encountered issues"
fi

# Fix two-tier firewall
if [ -f "./wired-chaos-emergent/scripts/firewall-fix.js" ]; then
    log_info "Fixing two-tier school system..."
    node ./wired-chaos-emergent/scripts/firewall-fix.js || log_warning "Firewall fix encountered issues"
fi

# Final summary
echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              📊 DEPLOYMENT SUMMARY                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"

log_success "EMERGENT deployment sequence completed!"
log_info "Timestamp: $(date '+%Y-%m-%d %H:%M:%S UTC')"
log_info "Check Cloudflare dashboard for deployment status"
log_info "Monitor smoke tests in GitHub Actions"

# Send notification (if Discord webhook is configured)
if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
    curl -H "Content-Type: application/json" \
        -d "{\"content\":\"✅ EMERGENT Deployment Complete - WIRED CHAOS\\n⏰ $(date '+%Y-%m-%d %H:%M:%S')\"}" \
        "$DISCORD_WEBHOOK_URL" &> /dev/null || true
fi

echo ""
log_success "All done! 🎉"
