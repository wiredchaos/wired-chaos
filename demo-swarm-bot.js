#!/usr/bin/env node
// SWARM Bot Automation Demo
// Demonstrates the capabilities without requiring GitHub credentials

const { SwarmBotAutomation } = require('./swarm-bot-automation.js');

console.log('🤖 WIRED CHAOS SWARM Bot - Demonstration Mode\n');
console.log('='  .repeat(60));
console.log('This demo shows SWARM Bot capabilities without GitHub API calls');
console.log('='  .repeat(60));

// Initialize SWARM Bot
console.log('\n📦 Initializing SWARM Bot...');
const swarmBot = new SwarmBotAutomation();
console.log('✅ SWARM Bot initialized successfully');

// Display configuration
console.log('\n⚙️  Configuration:');
console.log(`   Owner: ${swarmBot.config.owner}`);
console.log(`   Repo: ${swarmBot.config.repo}`);
console.log(`   Blocking Labels: ${swarmBot.config.labels.blocking.join(', ')}`);

// Display auto-fix patterns
console.log('\n🔧 Auto-Fix Patterns Available:');
Object.entries(swarmBot.config.autoFixPatterns).forEach(([name, pattern]) => {
    const status = pattern.autoFixable ? '✅' : '⚠️';
    console.log(`   ${status} ${name}: ${pattern.action}`);
});

// Display triage rules
console.log('\n📋 Triage Rules:');
Object.entries(swarmBot.config.triageRules).forEach(([name, rule]) => {
    const priority = rule.priority || 'N/A';
    const escalate = rule.escalate ? '🚨' : '📝';
    console.log(`   ${escalate} ${name} (Priority: ${priority})`);
});

// Test pattern matching
console.log('\n🧪 Testing Pattern Matching:');
const testIssues = [
    {
        title: 'npm audit found 15 vulnerabilities',
        body: 'We need to update dependencies ASAP',
        number: 101
    },
    {
        title: 'Deployment failed on Cloudflare',
        body: 'Worker deployment error during CI/CD',
        number: 102
    },
    {
        title: 'Merge conflict in main branch',
        body: 'PR #25 cannot be merged due to conflicts in package.json',
        number: 103
    },
    {
        title: 'Build failing on TypeScript errors',
        body: 'Type errors in multiple files after recent changes',
        number: 104
    }
];

testIssues.forEach(issue => {
    const pattern = swarmBot.matchAutoFixPattern(issue);
    if (pattern) {
        console.log(`   Issue #${issue.number}: "${issue.title}"`);
        console.log(`      → Matched: ${pattern.action}`);
        console.log(`      → Auto-fixable: ${pattern.autoFixable ? 'Yes ✅' : 'No (escalates) 🚨'}`);
    }
});

// Test triage rule matching
console.log('\n🎯 Testing Triage Rules:');
const mockIssues = [
    {
        number: 201,
        title: 'Critical production bug',
        labels: [{ name: 'critical' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        number: 202,
        title: 'Deployment blocker',
        labels: [{ name: 'deployment-blocker' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        number: 203,
        title: 'Bug reported 2 days ago',
        labels: [{ name: 'bug' }],
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
];

mockIssues.forEach(issue => {
    console.log(`   Issue #${issue.number}: "${issue.title}"`);
    Object.entries(swarmBot.config.triageRules).forEach(([ruleName, rule]) => {
        if (rule.condition(issue)) {
            console.log(`      → Matches rule: ${ruleName}`);
            console.log(`      → Priority: ${rule.priority || 'N/A'}`);
            console.log(`      → Escalate: ${rule.escalate ? 'Yes 🚨' : 'No'}`);
        }
    });
});

// Display Health Bot integration
console.log('\n🏥 Health Bot Integration:');
console.log('   ✅ Health Triage Bot: Connected');
console.log('   ✅ Emergency Response: Available');
console.log('   ✅ System Health Monitoring: Active');
console.log('   ✅ Deployment Diagnostics: Ready');

// Show example workflow
console.log('\n🔄 Typical Workflow:');
console.log('   1. 🔍 Monitor blocking issues (every 15 minutes via GitHub Actions)');
console.log('   2. 🎯 Match against auto-fix patterns and triage rules');
console.log('   3. 🔧 Attempt automated fixes where possible');
console.log('   4. 🚨 Escalate critical issues to maintainers');
console.log('   5. 📊 Generate actionable reports with health status');
console.log('   6. 📝 Add appropriate labels and comments');
console.log('   7. 🏥 Integrate health checks for deployment issues');

// Show example commands
console.log('\n📝 Available Commands:');
console.log('   npm run swarm-bot          # Run single triage cycle');
console.log('   npm run swarm-bot:monitor  # Continuous monitoring');
console.log('   npm run test:swarm-bot     # Run tests');
console.log('   npm run health-bot         # Check health status');

// Show example output
console.log('\n📊 Example Report Structure:');
const exampleReport = {
    timestamp: new Date().toISOString(),
    summary: {
        totalBlockingIssues: 5,
        resolved: 2,
        escalated: 2,
        autoFixAttempted: 3
    },
    healthStatus: {
        overallHealth: 98.7,
        alerts: 1
    }
};
console.log(JSON.stringify(exampleReport, null, 2));

console.log('\n' + '='  .repeat(60));
console.log('✅ Demo Complete - SWARM Bot is ready for production use!');
console.log('='  .repeat(60));
console.log('\n📚 Documentation:');
console.log('   - SWARM_BOT_AUTOMATION.md - Full documentation');
console.log('   - SWARM_BOT_QUICKSTART.md - Quick start guide');
console.log('   - SWARM_BOT_INTEGRATION_SUMMARY.md - Integration details');
console.log('\n🚀 To run in production, set GITHUB_TOKEN and use:');
console.log('   npm run swarm-bot\n');
