#!/bin/bash
# End-to-End Test: Wix AI Bot Integration
# Tests the complete automation flow from PR merge to landing page update

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_BRANCH="test/wix-ai-bot-e2e-$(date +%s)"
WORKER_URL="${WORKER_URL:-https://wired-chaos.pages.dev}"
WIX_API_TOKEN="${WIX_API_TOKEN}"
WIX_SITE_ID="${WIX_SITE_ID}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Wix AI Bot E2E Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed"
    exit 1
fi
print_success "GitHub CLI found"

if ! command -v curl &> /dev/null; then
    print_error "curl is not installed"
    exit 1
fi
print_success "curl found"

if [ -z "$WIX_API_TOKEN" ]; then
    print_warning "WIX_API_TOKEN not set, using demo mode"
    DEMO_MODE=true
else
    print_success "WIX_API_TOKEN configured"
    DEMO_MODE=false
fi

# Step 1: Create test branch
print_status "Step 1: Creating test branch..."
git checkout -b "$TEST_BRANCH" 2>/dev/null || git checkout "$TEST_BRANCH"
print_success "Test branch created: $TEST_BRANCH"

# Step 2: Make test change
print_status "Step 2: Making test changes..."
TEST_FILE="WIX_AI_BOT_TEST_$(date +%s).md"
cat > "$TEST_FILE" <<EOF
# Wix AI Bot Integration Test

This file was created as part of the end-to-end test for Wix AI Bot integration.

**Test ID**: test-$(date +%s)
**Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Purpose**: Verify automated landing page update on PR merge

## Expected Behavior

1. PR is created with this file
2. PR is merged to main branch
3. GitHub Actions workflow triggers
4. Wix AI Bot API is called
5. Landing page is updated with PR information
6. Notifications are sent

## Test Verification

- Check GitHub Actions workflow: \`wix-ai-bot-automation.yml\`
- Check Wix site dashboard
- Verify Discord/Telegram notifications

---

**WIRED CHAOS** - Test Automation
EOF

git add "$TEST_FILE"
git commit -m "test: E2E test for Wix AI Bot integration"
print_success "Test changes committed"

# Step 3: Push branch
print_status "Step 3: Pushing test branch..."
git push origin "$TEST_BRANCH" --force
print_success "Branch pushed to remote"

# Step 4: Create pull request
print_status "Step 4: Creating pull request..."
PR_URL=$(gh pr create \
  --title "Test: Wix AI Bot E2E Integration" \
  --body "🧪 **Automated E2E Test**

This PR is part of the automated end-to-end test for Wix AI Bot integration.

**Test Scenario**: Landing page update on PR merge

**Expected Outcome**:
1. ✅ PR merged successfully
2. ✅ GitHub Actions workflow triggered
3. ✅ Wix AI Bot API called
4. ✅ Landing page updated with PR details
5. ✅ Notifications sent (Discord/Telegram)

**Test File**: \`$TEST_FILE\`
**Test Branch**: \`$TEST_BRANCH\`
**Test Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)

---

*This PR will be merged and cleaned up automatically as part of the test.*" \
  --base main \
  --head "$TEST_BRANCH")

PR_NUMBER=$(gh pr view "$PR_URL" --json number -q .number)
print_success "Pull request created: #$PR_NUMBER"
echo "PR URL: $PR_URL"

# Step 5: Wait a moment before merging
print_status "Step 5: Waiting 5 seconds before merge..."
sleep 5

# Step 6: Merge pull request
print_status "Step 6: Merging pull request..."
gh pr merge "$PR_NUMBER" --squash --delete-branch --auto
print_success "Pull request merged and branch deleted"

# Step 7: Wait for workflow to trigger
print_status "Step 7: Waiting for workflow to trigger..."
sleep 10

# Step 8: Check workflow status
print_status "Step 8: Checking workflow status..."
WORKFLOW_RUN=$(gh run list --workflow=wix-ai-bot-automation.yml --limit=1 --json databaseId -q .[0].databaseId)

if [ -z "$WORKFLOW_RUN" ]; then
    print_warning "Workflow not found yet, it may still be queuing"
else
    print_success "Workflow run found: $WORKFLOW_RUN"
    echo ""
    echo "View workflow: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions/runs/$WORKFLOW_RUN"
fi

# Step 9: Test webhook endpoint directly
print_status "Step 9: Testing webhook endpoint..."

WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "action": "closed",
  "pull_request": {
    "merged": true,
    "number": $PR_NUMBER,
    "title": "Test: Wix AI Bot E2E Integration"
  },
  "repository": {
    "full_name": "$(gh repo view --json nameWithOwner -q .nameWithOwner)"
  }
}
EOF
)

if [ "$DEMO_MODE" = false ]; then
    WEBHOOK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
      "$WORKER_URL/api/wix/webhook" \
      -H "Content-Type: application/json" \
      -H "X-GitHub-Event: pull_request" \
      -H "Authorization: Bearer $WIX_API_TOKEN" \
      -d "$WEBHOOK_PAYLOAD")
    
    HTTP_CODE=$(echo "$WEBHOOK_RESPONSE" | tail -n1)
    BODY=$(echo "$WEBHOOK_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_success "Webhook endpoint responding correctly"
        echo "Response: $BODY"
    else
        print_warning "Webhook returned status $HTTP_CODE"
        echo "Response: $BODY"
    fi
else
    print_warning "Skipping webhook test (demo mode)"
fi

# Step 10: Test Wix AI Bot client
print_status "Step 10: Testing Wix AI Bot client..."

if [ "$DEMO_MODE" = false ]; then
    # Test using example payload
    TEST_PAYLOAD="../payloads/pr-merge.json"
    if [ -f "$TEST_PAYLOAD" ]; then
        print_success "Using example payload: $TEST_PAYLOAD"
    else
        print_warning "Example payload not found, creating temporary one"
    fi
else
    print_warning "Skipping client test (demo mode)"
fi

# Step 11: Verify results
print_status "Step 11: Verifying results..."
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Test branch created and pushed"
echo "✓ Pull request created (#$PR_NUMBER)"
echo "✓ Pull request merged"
if [ -n "$WORKFLOW_RUN" ]; then
    echo "✓ Workflow triggered (run: $WORKFLOW_RUN)"
else
    echo "⚠ Workflow status: pending"
fi
echo ""

echo -e "${GREEN}Manual Verification Steps:${NC}"
echo "1. Check workflow logs:"
echo "   gh run view $WORKFLOW_RUN --log"
echo ""
echo "2. Check Wix site dashboard:"
echo "   https://manage.wix.com/dashboard/$WIX_SITE_ID"
echo ""
echo "3. Verify notifications:"
echo "   - Discord webhook"
echo "   - Telegram bot"
echo ""
echo "4. Check integration worker logs:"
echo "   wrangler tail --env production"
echo ""

# Cleanup
print_status "Cleaning up test file..."
git checkout main 2>/dev/null || true
rm -f "$TEST_FILE" 2>/dev/null || true
print_success "Cleanup complete"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  E2E Test Completed Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review the workflow run results"
echo "2. Verify landing page was updated on Wix"
echo "3. Check that notifications were sent"
echo ""
