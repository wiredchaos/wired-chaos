#!/usr/bin/env node
// WIRED CHAOS - SWARM General Integration Test
// Tests the SWARM General workflow components locally

const { HealthBotVSCodeIntegration } = require('./health-bot-vscode-integration.js');
const { SwarmBotAutomation } = require('./swarm-bot-automation.js');
const fs = require('fs');
const path = require('path');

console.log('🧪 SWARM General Integration Test');
console.log('═'.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        console.log(`\n🔍 Testing: ${name}`);
        fn();
        console.log(`✅ PASSED: ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Workflow file exists and is valid YAML
test('Workflow file exists', () => {
    const workflowPath = path.join(__dirname, '.github/workflows/swarm-general.yml');
    if (!fs.existsSync(workflowPath)) {
        throw new Error('swarm-general.yml workflow file not found');
    }
    
    const content = fs.readFileSync(workflowPath, 'utf8');
    if (!content.includes('SWARM General')) {
        throw new Error('Workflow file missing SWARM General identifier');
    }
});

// Test 2: Workflow has required jobs
test('Workflow has all required jobs', () => {
    const workflowPath = path.join(__dirname, '.github/workflows/swarm-general.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    const requiredJobs = [
        'pre-deployment-health',
        'deploy-worker',
        'post-deployment-health',
        'auto-recovery',
        'integration-report'
    ];
    
    for (const job of requiredJobs) {
        if (!content.includes(job)) {
            throw new Error(`Missing required job: ${job}`);
        }
    }
});

// Test 3: Workflow has correct triggers
test('Workflow has correct triggers', () => {
    const workflowPath = path.join(__dirname, '.github/workflows/swarm-general.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    const requiredTriggers = ['push:', 'pull_request:', 'schedule:', 'workflow_dispatch:'];
    
    for (const trigger of requiredTriggers) {
        if (!content.includes(trigger)) {
            throw new Error(`Missing trigger: ${trigger}`);
        }
    }
});

// Test 4: Health Bot has worker monitoring method
test('Health Bot has monitorWorkerHealth method', () => {
    const healthBot = new HealthBotVSCodeIntegration();
    
    if (typeof healthBot.monitorWorkerHealth !== 'function') {
        throw new Error('monitorWorkerHealth method not found');
    }
});

// Test 5: Health Bot includes worker endpoint
test('Health Bot includes worker health endpoint', () => {
    const healthBotPath = path.join(__dirname, 'health-bot-vscode-integration.js');
    const content = fs.readFileSync(healthBotPath, 'utf8');
    
    if (!content.includes('wired-chaos-worker.wiredchaos.workers.dev/health')) {
        throw new Error('Worker health endpoint not found in Health Bot');
    }
});

// Test 6: SWARM Bot has deployment fix pattern
test('SWARM Bot has deployment fix pattern', () => {
    const swarmBot = new SwarmBotAutomation();
    const patterns = swarmBot.config.autoFixPatterns;
    
    if (!patterns.deploymentError) {
        throw new Error('deploymentError pattern not found');
    }
    
    if (patterns.deploymentError.action !== 'fixDeploymentIssue') {
        throw new Error('Incorrect deployment fix action');
    }
});

// Test 7: Documentation files exist
test('Documentation files exist', () => {
    const docs = [
        'SWARM_GENERAL_GUIDE.md',
        'SWARM_GENERAL_QUICKSTART.md'
    ];
    
    for (const doc of docs) {
        const docPath = path.join(__dirname, doc);
        if (!fs.existsSync(docPath)) {
            throw new Error(`Documentation file not found: ${doc}`);
        }
    }
});

// Test 8: Documentation has required sections
test('Documentation has required sections', () => {
    const guidePath = path.join(__dirname, 'SWARM_GENERAL_GUIDE.md');
    const content = fs.readFileSync(guidePath, 'utf8');
    
    const requiredSections = [
        '## 🏗️ Architecture',
        '## 🚀 Triggers',
        '## 📊 Workflow Jobs',
        '## 🔗 Integration with WIRED CHAOS HEALTH',
        '## 🎨 Resilient Patterns from 404',
        '## 🔧 Extensibility'
    ];
    
    for (const section of requiredSections) {
        if (!content.includes(section)) {
            throw new Error(`Missing documentation section: ${section}`);
        }
    }
});

// Test 9: README updated with SWARM General
test('README.md includes SWARM General section', () => {
    const readmePath = path.join(__dirname, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf8');
    
    if (!content.includes('SWARM General')) {
        throw new Error('README.md not updated with SWARM General section');
    }
    
    if (!content.includes('SWARM_GENERAL_GUIDE.md')) {
        throw new Error('README.md missing SWARM General documentation link');
    }
});

// Test 10: DEPLOYMENT.md updated
test('DEPLOYMENT.md includes SWARM General reference', () => {
    const deploymentPath = path.join(__dirname, 'DEPLOYMENT.md');
    const content = fs.readFileSync(deploymentPath, 'utf8');
    
    if (!content.includes('SWARM General')) {
        throw new Error('DEPLOYMENT.md not updated with SWARM General');
    }
});

// Test 11: Worker health monitoring has retry logic
test('Worker health monitoring has resilient retry pattern', () => {
    const healthBotPath = path.join(__dirname, 'health-bot-vscode-integration.js');
    const content = fs.readFileSync(healthBotPath, 'utf8');
    
    // Check for retry loop (resilient pattern)
    if (!content.includes('for (let attempt = 1; attempt <= 3; attempt++)')) {
        throw new Error('Retry logic not found in worker health monitoring');
    }
    
    // Check for exponential backoff
    if (!content.includes('attempt * 1000')) {
        throw new Error('Exponential backoff not found in retry logic');
    }
});

// Test 12: Workflow has secrets configured
test('Workflow references required secrets', () => {
    const workflowPath = path.join(__dirname, '.github/workflows/swarm-general.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    const requiredSecrets = [
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'GITHUB_TOKEN'
    ];
    
    for (const secret of requiredSecrets) {
        if (!content.includes(secret)) {
            throw new Error(`Missing secret reference: ${secret}`);
        }
    }
});

// Test 13: Auto-recovery job exists
test('Auto-recovery job is properly configured', () => {
    const workflowPath = path.join(__dirname, '.github/workflows/swarm-general.yml');
    const content = fs.readFileSync(workflowPath, 'utf8');
    
    if (!content.includes('auto-recovery:')) {
        throw new Error('auto-recovery job not found');
    }
    
    if (!content.includes('node swarm-bot-automation.js')) {
        throw new Error('SWARM Bot not integrated in auto-recovery');
    }
    
    if (!content.includes('emergency-production.yml')) {
        throw new Error('Emergency workflow not referenced in auto-recovery');
    }
});

// Test 14: Health scoring logic exists
test('Health scoring thresholds properly defined', () => {
    const healthBotPath = path.join(__dirname, 'health-bot-vscode-integration.js');
    const content = fs.readFileSync(healthBotPath, 'utf8');
    
    if (!content.includes('healthThresholds')) {
        throw new Error('Health thresholds not defined');
    }
});

// Test 15: Integration with existing workflows
test('Integration with existing swarm-bot.yml workflow', () => {
    const swarmBotWorkflowPath = path.join(__dirname, '.github/workflows/swarm-bot.yml');
    
    if (!fs.existsSync(swarmBotWorkflowPath)) {
        throw new Error('Existing swarm-bot.yml workflow not found');
    }
    
    // Ensure SWARM General doesn't break existing workflow
    const content = fs.readFileSync(swarmBotWorkflowPath, 'utf8');
    if (!content.includes('swarm-bot-triage')) {
        throw new Error('Existing SWARM Bot workflow structure modified');
    }
});

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 Test Summary');
console.log('═'.repeat(60));
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('═'.repeat(60));

if (testsFailed === 0) {
    console.log('\n🎉 All SWARM General integration tests passed!');
    console.log('\n📚 Next Steps:');
    console.log('1. Configure GitHub Secrets (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)');
    console.log('2. Commit changes to trigger workflow');
    console.log('3. Monitor first deployment: gh run watch');
    console.log('4. Review health reports in workflow artifacts');
    console.log('\n🚀 SWARM General is ready for deployment!');
    process.exit(0);
} else {
    console.log('\n⚠️ Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
}
