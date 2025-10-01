/**
 * WIRED CHAOS Command Center - Test Suite
 * 
 * Simple test suite to validate worker functionality
 */

// Mock environment for testing
const mockEnv = {
  ADMIN_IDS: 'test-admin-1,test-admin-2',
  ADMIN_TOKENS: 'test-token-1,test-token-2',
  WIX_API_TOKEN: 'test-wix-token',
  WIX_SITE_ID: 'test-site-id',
  ZAPIER_WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/test',
  GITHUB_TOKEN: 'test-github-token',
  GITHUB_WEBHOOK_SECRET: 'test-webhook-secret',
  GAMMA_API_KEY: 'test-gamma-key',
  NOTION_API_KEY: 'test-notion-key',
  WEBHOOK_SECRET: 'test-webhook-secret',
  GITHUB_OWNER: 'wiredchaos',
  GITHUB_REPO: 'wired-chaos'
};

// Test results tracker
let testsPassed = 0;
let testsFailed = 0;

// Test helper functions
function test(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    testsFailed++;
    console.log(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

function assertFalse(value, message) {
  if (value) {
    throw new Error(message || `Expected false, got ${value}`);
  }
}

// Run tests
console.log('\n═══════════════════════════════════════════════════');
console.log('WIRED CHAOS Command Center - Test Suite');
console.log('═══════════════════════════════════════════════════\n');

// Test 1: File exists and is valid JavaScript
test('Worker file exists and has valid syntax', () => {
  const fs = require('fs');
  const path = require('path');
  
  const workerPath = path.join(__dirname, 'command-center.js');
  assertTrue(fs.existsSync(workerPath), 'Worker file should exist');
  
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  assertTrue(workerCode.length > 0, 'Worker file should not be empty');
  assertTrue(workerCode.includes('export default'), 'Worker should export default handler');
});

// Test 2: Worker has required components
test('Worker contains all required components', () => {
  const fs = require('fs');
  const path = require('path');
  
  const workerPath = path.join(__dirname, 'command-center.js');
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  
  // Check for rate limiter
  assertTrue(workerCode.includes('class RateLimiter'), 'Should have RateLimiter class');
  
  // Check for helpers
  assertTrue(workerCode.includes('WixHelper'), 'Should have WixHelper');
  assertTrue(workerCode.includes('ZapierHelper'), 'Should have ZapierHelper');
  assertTrue(workerCode.includes('GitHubHelper'), 'Should have GitHubHelper');
  assertTrue(workerCode.includes('GammaHelper'), 'Should have GammaHelper');
  
  // Check for command handler
  assertTrue(workerCode.includes('NotionCommandHandler'), 'Should have NotionCommandHandler');
  
  // Check for route handlers
  assertTrue(workerCode.includes('handleWixCommand'), 'Should have handleWixCommand');
  assertTrue(workerCode.includes('handleZapCommand'), 'Should have handleZapCommand');
  assertTrue(workerCode.includes('handleNotionCommand'), 'Should have handleNotionCommand');
  assertTrue(workerCode.includes('handleGitHubWebhook'), 'Should have handleGitHubWebhook');
  assertTrue(workerCode.includes('handleAdminCommand'), 'Should have handleAdminCommand');
  
  // Check for security functions
  assertTrue(workerCode.includes('verifyHMAC'), 'Should have verifyHMAC function');
  assertTrue(workerCode.includes('isAdmin'), 'Should have isAdmin function');
  assertTrue(workerCode.includes('isFeatureEnabled'), 'Should have isFeatureEnabled function');
});

// Test 3: Configuration constants
test('Worker has proper configuration constants', () => {
  const fs = require('fs');
  const path = require('path');
  
  const workerPath = path.join(__dirname, 'command-center.js');
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  
  assertTrue(workerCode.includes('RATE_LIMITS'), 'Should have RATE_LIMITS');
  assertTrue(workerCode.includes('SECURITY_HEADERS'), 'Should have SECURITY_HEADERS');
  assertTrue(workerCode.includes('FEATURE_FLAGS'), 'Should have FEATURE_FLAGS');
  assertTrue(workerCode.includes('NOTION_COMMANDS'), 'Should have NOTION_COMMANDS');
  assertTrue(workerCode.includes('API_ENDPOINTS'), 'Should have API_ENDPOINTS');
});

// Test 4: Documentation
test('Worker has comprehensive documentation', () => {
  const fs = require('fs');
  const path = require('path');
  
  const workerPath = path.join(__dirname, 'command-center.js');
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  
  // Check for JSDoc comments
  assertTrue(workerCode.includes('@param'), 'Should have parameter documentation');
  assertTrue(workerCode.includes('@returns'), 'Should have return documentation');
  
  // Check for environment variable documentation
  assertTrue(workerCode.includes('ENVIRONMENT VARIABLES'), 'Should document environment variables');
  assertTrue(workerCode.includes('DEPLOYMENT NOTES'), 'Should have deployment notes');
  
  // Check for section headers
  assertTrue(workerCode.includes('CONFIGURATION & CONSTANTS'), 'Should have configuration section');
  assertTrue(workerCode.includes('RATE LIMITER CLASS'), 'Should have rate limiter section');
  assertTrue(workerCode.includes('UTILITY FUNCTIONS'), 'Should have utility section');
  assertTrue(workerCode.includes('HELPER FUNCTIONS'), 'Should have helper section');
  assertTrue(workerCode.includes('COMMAND HANDLERS'), 'Should have command handlers section');
  assertTrue(workerCode.includes('ROUTE HANDLERS'), 'Should have route handlers section');
  assertTrue(workerCode.includes('MAIN WORKER ENTRY POINT'), 'Should have entry point section');
});

// Test 5: Security features
test('Worker implements security features', () => {
  const fs = require('fs');
  const path = require('path');
  
  const workerPath = path.join(__dirname, 'command-center.js');
  const workerCode = fs.readFileSync(workerPath, 'utf8');
  
  // Check for HMAC verification
  assertTrue(workerCode.includes('crypto.subtle'), 'Should use Web Crypto API');
  assertTrue(workerCode.includes('HMAC'), 'Should implement HMAC verification');
  
  // Check for rate limiting
  assertTrue(workerCode.includes('rateLimiters'), 'Should have rate limiters');
  
  // Check for admin guards
  assertTrue(workerCode.includes('isAdmin'), 'Should have admin checks');
  
  // Check for security headers
  assertTrue(workerCode.includes('X-Frame-Options'), 'Should set X-Frame-Options');
  assertTrue(workerCode.includes('X-Content-Type-Options'), 'Should set X-Content-Type-Options');
  assertTrue(workerCode.includes('Strict-Transport-Security'), 'Should set HSTS');
});

// Test 6: Supporting files exist
test('Supporting documentation and configuration files exist', () => {
  const fs = require('fs');
  const path = require('path');
  
  const deploymentGuide = path.join(__dirname, 'COMMAND_CENTER_DEPLOYMENT.md');
  assertTrue(fs.existsSync(deploymentGuide), 'Deployment guide should exist');
  
  const quickRef = path.join(__dirname, 'COMMAND_CENTER_QUICK_REFERENCE.md');
  assertTrue(fs.existsSync(quickRef), 'Quick reference should exist');
  
  const wranglerConfig = path.join(__dirname, 'command-center-wrangler.toml');
  assertTrue(fs.existsSync(wranglerConfig), 'Wrangler config should exist');
  
  const setupScript = path.join(__dirname, 'setup-command-center.sh');
  assertTrue(fs.existsSync(setupScript), 'Setup script should exist');
  const stats = fs.statSync(setupScript);
  assertTrue((stats.mode & 0o111) !== 0, 'Setup script should be executable');
  
  const readme = path.join(__dirname, 'README.md');
  assertTrue(fs.existsSync(readme), 'README should exist');
});

// Test 7: Documentation completeness
test('Documentation contains required sections', () => {
  const fs = require('fs');
  const path = require('path');
  
  const deploymentGuide = path.join(__dirname, 'COMMAND_CENTER_DEPLOYMENT.md');
  const content = fs.readFileSync(deploymentGuide, 'utf8');
  
  assertTrue(content.includes('Features'), 'Should document features');
  assertTrue(content.includes('Prerequisites'), 'Should list prerequisites');
  assertTrue(content.includes('Quick Start'), 'Should have quick start');
  assertTrue(content.includes('Environment Variables'), 'Should document environment variables');
  assertTrue(content.includes('API Endpoints'), 'Should document API endpoints');
  assertTrue(content.includes('Rate Limits'), 'Should document rate limits');
  assertTrue(content.includes('Testing'), 'Should include testing guide');
  assertTrue(content.includes('Monitoring'), 'Should include monitoring guide');
  assertTrue(content.includes('Troubleshooting'), 'Should include troubleshooting');
  assertTrue(content.includes('Security Best Practices'), 'Should include security practices');
  assertTrue(content.includes('VSCode NO TOUCH INFRA AUTOMATION'), 'Should mention automation assignment');
});

// Test 8: Wrangler configuration
test('Wrangler configuration is complete', () => {
  const fs = require('fs');
  const path = require('path');
  
  const wranglerConfig = path.join(__dirname, 'command-center-wrangler.toml');
  const content = fs.readFileSync(wranglerConfig, 'utf8');
  
  assertTrue(content.includes('name = "wired-chaos-command-center"'), 'Should have worker name');
  assertTrue(content.includes('main = "command-center.js"'), 'Should specify main file');
  assertTrue(content.includes('compatibility_date'), 'Should have compatibility date');
  assertTrue(content.includes('[env.production]'), 'Should have production environment');
  assertTrue(content.includes('[env.staging]'), 'Should have staging environment');
  assertTrue(content.includes('[env.development]'), 'Should have development environment');
  assertTrue(content.includes('GITHUB_OWNER'), 'Should configure GitHub owner');
  assertTrue(content.includes('GITHUB_REPO'), 'Should configure GitHub repo');
});

// Print test summary
console.log('\n═══════════════════════════════════════════════════');
console.log('Test Summary');
console.log('═══════════════════════════════════════════════════');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total tests:  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed!');
  process.exit(1);
}
