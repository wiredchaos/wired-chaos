#!/bin/bash
# WIRED CHAOS - Automation System Test Script
# Tests all components of the deployment automation ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}  ❌ $1${NC}"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "  ℹ️  $1"
}

run_test() {
    ((TOTAL_TESTS++))
    print_test "$1"
}

# Test 1: Check directory structure
print_header "Test 1: Directory Structure"

run_test "Checking automation directory exists"
if [ -d "automation" ]; then
    print_success "automation/ directory exists"
else
    print_fail "automation/ directory missing"
fi

run_test "Checking subdirectories"
REQUIRED_DIRS=(
    "automation/zapier-webhook-processor"
    "automation/pipeline"
    "automation/monitoring"
    "automation/ab-testing"
    "automation/optimization"
    "automation/scaling"
    "automation/lead-scoring"
    "automation/i18n"
    "automation/analytics"
    "automation/enterprise"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_success "$dir exists"
    else
        print_fail "$dir missing"
    fi
    ((TOTAL_TESTS++))
done

# Test 2: Check workflow files
print_header "Test 2: Workflow Files"

run_test "Checking deployment orchestration workflow"
if [ -f ".github/workflows/deployment-orchestration.yml" ]; then
    print_success "deployment-orchestration.yml exists"
else
    print_fail "deployment-orchestration.yml missing"
fi

run_test "Checking swarm orchestration trigger workflow"
if [ -f ".github/workflows/swarm-orchestration-trigger.yml" ]; then
    print_success "swarm-orchestration-trigger.yml exists"
else
    print_fail "swarm-orchestration-trigger.yml missing"
fi

# Test 3: Validate JSON configuration files
print_header "Test 3: JSON Configuration Files"

CONFIG_FILES=(
    "automation/pipeline/config.json"
    "automation/monitoring/config.json"
    "automation/ab-testing/gamma-templates-test.json"
    "automation/optimization/performance.json"
    "automation/scaling/rules.json"
    "automation/lead-scoring/model.json"
    "automation/i18n/config.json"
    "automation/analytics/dashboard.json"
    "automation/enterprise/features.json"
)

for config in "${CONFIG_FILES[@]}"; do
    run_test "Validating $config"
    if [ -f "$config" ]; then
        if python3 -m json.tool "$config" > /dev/null 2>&1; then
            print_success "$config is valid JSON"
        else
            print_fail "$config has invalid JSON syntax"
        fi
    else
        print_fail "$config missing"
    fi
done

# Test 4: Check worker files
print_header "Test 4: Cloudflare Worker Files"

run_test "Checking Zapier webhook worker"
if [ -f "automation/zapier-webhook-processor/worker.js" ]; then
    print_success "worker.js exists"
else
    print_fail "worker.js missing"
fi

run_test "Checking wrangler.toml"
if [ -f "automation/zapier-webhook-processor/wrangler.toml" ]; then
    print_success "wrangler.toml exists"
else
    print_fail "wrangler.toml missing"
fi

# Test 5: Check documentation
print_header "Test 5: Documentation Files"

run_test "Checking automation README"
if [ -f "automation/README.md" ]; then
    print_success "automation/README.md exists"
else
    print_fail "automation/README.md missing"
fi

run_test "Checking deployment phases guide"
if [ -f "DEPLOYMENT_PHASES.md" ]; then
    print_success "DEPLOYMENT_PHASES.md exists"
else
    print_fail "DEPLOYMENT_PHASES.md missing"
fi

run_test "Checking integration setup guide"
if [ -f "INTEGRATION_SETUP.md" ]; then
    print_success "INTEGRATION_SETUP.md exists"
else
    print_fail "INTEGRATION_SETUP.md missing"
fi

# Test 6: Check swarm orchestrator
print_header "Test 6: Swarm Bot Integration"

run_test "Checking swarm orchestrator script"
if [ -f "automation/swarm-orchestrator.js" ]; then
    print_success "swarm-orchestrator.js exists"
    
    # Check if it's valid JavaScript
    run_test "Validating JavaScript syntax"
    if node -c "automation/swarm-orchestrator.js" 2>/dev/null; then
        print_success "JavaScript syntax is valid"
    else
        print_fail "JavaScript syntax errors"
    fi
else
    print_fail "swarm-orchestrator.js missing"
fi

# Test 7: Check Node.js dependencies
print_header "Test 7: Node.js Dependencies"

run_test "Checking package.json"
if [ -f "package.json" ]; then
    print_success "package.json exists"
    
    run_test "Checking @octokit/rest dependency"
    if grep -q "@octokit/rest" package.json; then
        print_success "@octokit/rest is listed in package.json"
    else
        print_fail "@octokit/rest not found in package.json"
    fi
else
    print_fail "package.json missing"
fi

# Test 8: Configuration validation
print_header "Test 8: Configuration Validation"

run_test "Checking pipeline configuration structure"
if [ -f "automation/pipeline/config.json" ]; then
    if python3 -c "import json; config=json.load(open('automation/pipeline/config.json')); assert 'pipeline' in config; assert 'stages' in config; print('Valid')" > /dev/null 2>&1; then
        print_success "Pipeline configuration structure is valid"
    else
        print_fail "Pipeline configuration structure is invalid"
    fi
fi

run_test "Checking monitoring configuration structure"
if [ -f "automation/monitoring/config.json" ]; then
    if python3 -c "import json; config=json.load(open('automation/monitoring/config.json')); assert 'monitoring' in config; assert 'metrics' in config['monitoring']; print('Valid')" > /dev/null 2>&1; then
        print_success "Monitoring configuration structure is valid"
    else
        print_fail "Monitoring configuration structure is invalid"
    fi
fi

run_test "Checking lead scoring configuration structure"
if [ -f "automation/lead-scoring/model.json" ]; then
    if python3 -c "import json; config=json.load(open('automation/lead-scoring/model.json')); assert 'lead_scoring' in config; assert 'features' in config['lead_scoring']; print('Valid')" > /dev/null 2>&1; then
        print_success "Lead scoring configuration structure is valid"
    else
        print_fail "Lead scoring configuration structure is invalid"
    fi
fi

# Test 9: Workflow syntax validation
print_header "Test 9: GitHub Actions Workflow Syntax"

run_test "Validating deployment-orchestration.yml"
if command -v yamllint &> /dev/null; then
    if yamllint -d relaxed .github/workflows/deployment-orchestration.yml 2>&1 | grep -q "error"; then
        print_fail "deployment-orchestration.yml has YAML errors"
    else
        print_success "deployment-orchestration.yml syntax is valid"
    fi
else
    print_info "yamllint not available, skipping YAML validation"
    ((TOTAL_TESTS--))
fi

run_test "Validating swarm-orchestration-trigger.yml"
if command -v yamllint &> /dev/null; then
    if yamllint -d relaxed .github/workflows/swarm-orchestration-trigger.yml 2>&1 | grep -q "error"; then
        print_fail "swarm-orchestration-trigger.yml has YAML errors"
    else
        print_success "swarm-orchestration-trigger.yml syntax is valid"
    fi
else
    print_info "yamllint not available, skipping YAML validation"
    ((TOTAL_TESTS--))
fi

# Test 10: Check existing workflows
print_header "Test 10: Existing Workflows Integration"

CORE_WORKFLOWS=(
    ".github/workflows/frontend-deploy.yml"
    ".github/workflows/worker-deploy.yml"
    ".github/workflows/content-sync.yml"
    ".github/workflows/gamma-automation.yml"
    ".github/workflows/wix-ai-bot-automation.yml"
    ".github/workflows/deploy-wix-gamma.yml"
)

for workflow in "${CORE_WORKFLOWS[@]}"; do
    run_test "Checking $workflow"
    if [ -f "$workflow" ]; then
        print_success "$(basename $workflow) exists"
    else
        print_fail "$(basename $workflow) missing (will be referenced in Phase 2)"
    fi
done

# Summary
print_header "Test Summary"

echo ""
echo -e "Total Tests:  ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Passed:       ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:       ${RED}${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ All tests passed! Automation system is ready.${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    PASS_RATE=$(python3 -c "print(f'{($PASSED_TESTS/$TOTAL_TESTS)*100:.1f}')")
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ⚠️  ${FAILED_TESTS} test(s) failed (${PASS_RATE}% pass rate)${NC}"
    echo -e "${YELLOW}  Review failures above and fix before deployment.${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 1
fi
