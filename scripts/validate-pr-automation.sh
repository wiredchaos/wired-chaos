#!/bin/bash

# PR Automation Validation Script
# Validates that all PR automation components are in place and configured correctly

set -e

echo "🔍 Validating PR Automation Implementation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_PASSED=true

# Function to check if a file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description: $file"
        return 0
    else
        echo -e "${RED}❌${NC} $description: $file"
        ALL_PASSED=false
        return 1
    fi
}

# Function to check if a string exists in a file
check_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description"
        ALL_PASSED=false
        return 1
    fi
}

echo "📋 Checking Workflow Files..."
echo "------------------------------"

# Check comment-ready-merge workflow
check_file ".github/workflows/comment-ready-merge.yml" "Comment Ready & Merge workflow"
if [ -f ".github/workflows/comment-ready-merge.yml" ]; then
    check_content ".github/workflows/comment-ready-merge.yml" "issue_comment" "  - Listens for issue comments"
    check_content ".github/workflows/comment-ready-merge.yml" "/ready\|ready" "  - Checks for /ready command"
    check_content ".github/workflows/comment-ready-merge.yml" "squash" "  - Uses squash merge"
    check_content ".github/workflows/comment-ready-merge.yml" "delete-branch" "  - Deletes branch after merge"
    check_content ".github/workflows/comment-ready-merge.yml" "Edge Smoke Tests" "  - Triggers Edge Smoke Tests"
fi

echo ""

# Check auto-ready-merge workflow
check_file ".github/workflows/auto-ready-merge.yml" "Auto Ready & Merge workflow"
if [ -f ".github/workflows/auto-ready-merge.yml" ]; then
    check_content ".github/workflows/auto-ready-merge.yml" "schedule:" "  - Has scheduled trigger"
    check_content ".github/workflows/auto-ready-merge.yml" "automerge" "  - Checks for automerge label"
    check_content ".github/workflows/auto-ready-merge.yml" "squash" "  - Uses squash merge"
    check_content ".github/workflows/auto-ready-merge.yml" "delete-branch" "  - Deletes branch after merge"
fi

echo ""

# Check edge-smoke workflow
check_file ".github/workflows/edge-smoke.yml" "Edge Smoke Tests workflow"
if [ -f ".github/workflows/edge-smoke.yml" ]; then
    check_content ".github/workflows/edge-smoke.yml" "workflow_dispatch" "  - Can be triggered manually"
fi

echo ""
echo "📋 Checking VS Code Integration..."
echo "----------------------------------"

# Check VS Code tasks
check_file ".vscode/tasks.json" "VS Code tasks configuration"
if [ -f ".vscode/tasks.json" ]; then
    check_content ".vscode/tasks.json" "PR: /ready" "  - PR: /ready task exists"
    check_content ".vscode/tasks.json" "PR: Add automerge label" "  - PR: Add automerge label task exists"
    check_content ".vscode/tasks.json" "PR: Remove automerge label" "  - PR: Remove automerge label task exists"
    check_content ".vscode/tasks.json" "PR: View status" "  - PR: View status task exists"
    check_content ".vscode/tasks.json" "PR: List open PRs" "  - PR: List open PRs task exists"
    check_content ".vscode/tasks.json" "PR: Trigger Edge Smoke Tests" "  - PR: Trigger Edge Smoke Tests task exists"
    check_content ".vscode/tasks.json" "PR: Manual ready & merge" "  - PR: Manual ready & merge task exists"
fi

echo ""
echo "📋 Checking Documentation..."
echo "----------------------------"

# Check documentation
check_file "AUTOMATION.md" "Main automation documentation"
if [ -f "AUTOMATION.md" ]; then
    check_content "AUTOMATION.md" "Comment-Driven PR Ready & Merge" "  - Documents comment-driven workflow"
    check_content "AUTOMATION.md" "Auto Ready & Merge" "  - Documents label-driven workflow"
    check_content "AUTOMATION.md" "VS Code Integration" "  - Documents VS Code integration"
    check_content "AUTOMATION.md" "Edge Smoke Tests" "  - Documents Edge Smoke Tests"
    check_content "AUTOMATION.md" "/ready" "  - Explains /ready command"
    check_content "AUTOMATION.md" "automerge" "  - Explains automerge label"
fi

check_file "PR_AUTOMATION_VALIDATION.md" "Validation guide"

echo ""
echo "=========================================="

if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}✅ All PR automation components are in place!${NC}"
    echo ""
    echo "🎉 The PR automation system is fully implemented and operational."
    echo ""
    echo "Quick Start:"
    echo "  • Comment '/ready' on any PR to trigger automation"
    echo "  • Add 'automerge' label for scheduled processing"
    echo "  • Use VS Code tasks (Ctrl+Shift+P → Tasks: Run Task)"
    echo ""
    echo "For more information, see AUTOMATION.md and PR_AUTOMATION_VALIDATION.md"
    exit 0
else
    echo -e "${RED}❌ Some PR automation components are missing or misconfigured.${NC}"
    echo ""
    echo "Please check the errors above and ensure all required files are in place."
    exit 1
fi
