// SWARM Bot Automation Tests
// Basic validation tests for the SWARM Bot

const { SwarmBotAutomation } = require('./swarm-bot-automation.js');

// Mock console to reduce noise during tests
const originalConsoleLog = console.log;
const testLogs = [];

function mockConsole() {
    console.log = (...args) => {
        testLogs.push(args.join(' '));
    };
}

function restoreConsole() {
    console.log = originalConsoleLog;
}

// Test Suite
async function runTests() {
    console.log('🧪 Starting SWARM Bot Automation Tests...\n');
    
    let passed = 0;
    let failed = 0;

    // Test 1: Initialization
    try {
        console.log('Test 1: SwarmBotAutomation initialization...');
        const swarmBot = new SwarmBotAutomation();
        
        if (swarmBot.config.owner === 'wiredchaos' && 
            swarmBot.config.repo === 'wired-chaos') {
            console.log('✅ PASSED: Default configuration loaded correctly');
            passed++;
        } else {
            console.log('❌ FAILED: Default configuration incorrect');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Initialization error -', error.message);
        failed++;
    }

    // Test 2: Custom Configuration
    try {
        console.log('\nTest 2: Custom configuration...');
        const swarmBot = new SwarmBotAutomation({
            owner: 'test-owner',
            repo: 'test-repo'
        });
        
        if (swarmBot.config.owner === 'test-owner' && 
            swarmBot.config.repo === 'test-repo') {
            console.log('✅ PASSED: Custom configuration applied correctly');
            passed++;
        } else {
            console.log('❌ FAILED: Custom configuration not applied');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Custom configuration error -', error.message);
        failed++;
    }

    // Test 3: Auto-fix Pattern Initialization
    try {
        console.log('\nTest 3: Auto-fix patterns...');
        const swarmBot = new SwarmBotAutomation();
        const patterns = swarmBot.config.autoFixPatterns;
        
        const requiredPatterns = [
            'dependencyUpdate',
            'configError',
            'buildFailure',
            'testFailure',
            'deploymentError',
            'mergeConflict'
        ];
        
        const hasAllPatterns = requiredPatterns.every(p => patterns[p]);
        
        if (hasAllPatterns) {
            console.log('✅ PASSED: All auto-fix patterns initialized');
            passed++;
        } else {
            console.log('❌ FAILED: Missing auto-fix patterns');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Auto-fix pattern error -', error.message);
        failed++;
    }

    // Test 4: Triage Rules Initialization
    try {
        console.log('\nTest 4: Triage rules...');
        const swarmBot = new SwarmBotAutomation();
        const rules = swarmBot.config.triageRules;
        
        const requiredRules = [
            'critical',
            'deploymentBlocker',
            'bugHigh',
            'stale'
        ];
        
        const hasAllRules = requiredRules.every(r => rules[r]);
        
        if (hasAllRules) {
            console.log('✅ PASSED: All triage rules initialized');
            passed++;
        } else {
            console.log('❌ FAILED: Missing triage rules');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Triage rules error -', error.message);
        failed++;
    }

    // Test 5: Pattern Matching
    try {
        console.log('\nTest 5: Pattern matching...');
        const swarmBot = new SwarmBotAutomation();
        
        const testIssues = [
            {
                title: 'npm audit found vulnerabilities',
                body: 'Need to update dependencies',
                expectedPattern: 'dependencyUpdate'
            },
            {
                title: 'Deployment failed on Cloudflare',
                body: 'Worker error during deployment',
                expectedPattern: 'deploymentError'
            },
            {
                title: 'Merge conflict in main branch',
                body: 'Cannot merge due to conflicts',
                expectedPattern: 'mergeConflict'
            }
        ];
        
        let patternTests = 0;
        for (const testIssue of testIssues) {
            mockConsole();
            const pattern = swarmBot.matchAutoFixPattern(testIssue);
            restoreConsole();
            
            if (pattern && pattern.action === swarmBot.config.autoFixPatterns[testIssue.expectedPattern].action) {
                patternTests++;
            }
        }
        
        if (patternTests === testIssues.length) {
            console.log('✅ PASSED: Pattern matching works correctly');
            passed++;
        } else {
            console.log(`❌ FAILED: Pattern matching (${patternTests}/${testIssues.length} matched)`);
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Pattern matching error -', error.message);
        failed++;
    }

    // Test 6: Health Bot Integration
    try {
        console.log('\nTest 6: Health Bot integration...');
        const swarmBot = new SwarmBotAutomation();
        
        if (swarmBot.healthBot && 
            typeof swarmBot.healthBot.generateHealthDashboard === 'function') {
            console.log('✅ PASSED: Health Bot integrated correctly');
            passed++;
        } else {
            console.log('❌ FAILED: Health Bot not integrated');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Health Bot integration error -', error.message);
        failed++;
    }

    // Test 7: Action Log
    try {
        console.log('\nTest 7: Action log tracking...');
        const swarmBot = new SwarmBotAutomation();
        
        if (Array.isArray(swarmBot.actionLog)) {
            console.log('✅ PASSED: Action log initialized correctly');
            passed++;
        } else {
            console.log('❌ FAILED: Action log not an array');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Action log error -', error.message);
        failed++;
    }

    // Test 8: Label Configuration
    try {
        console.log('\nTest 8: Label configuration...');
        const swarmBot = new SwarmBotAutomation();
        const labels = swarmBot.config.labels;
        
        const hasRequiredLabels = 
            Array.isArray(labels.blocking) &&
            labels.blocking.length > 0 &&
            labels.resolved &&
            labels.escalated &&
            labels.autofix;
        
        if (hasRequiredLabels) {
            console.log('✅ PASSED: Label configuration correct');
            passed++;
        } else {
            console.log('❌ FAILED: Label configuration incomplete');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Label configuration error -', error.message);
        failed++;
    }

    // Test 9: Triage Rule Conditions
    try {
        console.log('\nTest 9: Triage rule conditions...');
        const swarmBot = new SwarmBotAutomation();
        
        const mockIssue = {
            labels: [{ name: 'critical' }],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const criticalRule = swarmBot.config.triageRules.critical;
        const matches = criticalRule.condition(mockIssue);
        
        if (matches === true) {
            console.log('✅ PASSED: Triage rule conditions work');
            passed++;
        } else {
            console.log('❌ FAILED: Triage rule conditions not working');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Triage rule condition error -', error.message);
        failed++;
    }

    // Test 10: Module Export
    try {
        console.log('\nTest 10: Module export...');
        
        if (typeof SwarmBotAutomation === 'function') {
            console.log('✅ PASSED: Module exports correctly');
            passed++;
        } else {
            console.log('❌ FAILED: Module export incorrect');
            failed++;
        }
    } catch (error) {
        console.log('❌ FAILED: Module export error -', error.message);
        failed++;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🧪 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    return failed === 0;
}

// Run tests
if (require.main === module) {
    runTests()
        .then(success => {
            if (success) {
                console.log('\n✅ All tests passed!');
                process.exit(0);
            } else {
                console.log('\n❌ Some tests failed!');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n❌ Test suite error:', error.message);
            process.exit(1);
        });
}

module.exports = { runTests };
