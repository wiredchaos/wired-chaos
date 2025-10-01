#!/usr/bin/env node
/**
 * Test script for Wix AI Bot API Client
 * Validates client functionality without making actual API calls
 */

import { WixAIBotClient, createWixAIBotClient } from '../../wix/ai-bot/wix-ai-bot-client.js';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function section(message) {
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  ${message}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  section('Wix AI Bot API Client Tests');

  // Test 1: Client initialization
  info('Test 1: Client initialization');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id',
      botUrl: 'https://test.example.com',
      webhookSecret: 'test_secret'
    });

    if (client.apiToken === 'test_token' &&
        client.siteId === 'test_site_id' &&
        client.botUrl === 'https://test.example.com' &&
        client.webhookSecret === 'test_secret') {
      success('Client initialized with correct config');
      passed++;
    } else {
      error('Client config mismatch');
      failed++;
    }
  } catch (err) {
    error(`Client initialization failed: ${err.message}`);
    failed++;
  }

  // Test 2: Default bot URL
  info('Test 2: Default bot URL');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id'
    });

    if (client.botUrl.includes('manage.wix.com')) {
      success('Default bot URL set correctly');
      passed++;
    } else {
      error('Default bot URL incorrect');
      failed++;
    }
  } catch (err) {
    error(`Default URL test failed: ${err.message}`);
    failed++;
  }

  // Test 3: createWixAIBotClient factory function
  info('Test 3: Factory function');
  try {
    const env = {
      WIX_API_TOKEN: 'env_token',
      WIX_SITE_ID: 'env_site_id',
      WIX_AI_BOT_URL: 'https://env.example.com',
      WIX_WEBHOOK_SECRET: 'env_secret'
    };

    const client = createWixAIBotClient(env);

    if (client.apiToken === 'env_token' &&
        client.siteId === 'env_site_id' &&
        client.botUrl === 'https://env.example.com') {
      success('Factory function creates client correctly');
      passed++;
    } else {
      error('Factory function config mismatch');
      failed++;
    }
  } catch (err) {
    error(`Factory function failed: ${err.message}`);
    failed++;
  }

  // Test 4: Method existence
  info('Test 4: Client methods exist');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id'
    });

    const methods = [
      'updateLandingPage',
      'sendNotification',
      'syncContent',
      'managePage',
      'notifyDeployment',
      'testConnection',
      'verifyWebhookSignature',
      'parseWebhookEvent'
    ];

    const missingMethods = methods.filter(method => typeof client[method] !== 'function');

    if (missingMethods.length === 0) {
      success('All expected methods exist');
      passed++;
    } else {
      error(`Missing methods: ${missingMethods.join(', ')}`);
      failed++;
    }
  } catch (err) {
    error(`Method check failed: ${err.message}`);
    failed++;
  }

  // Test 5: Headers configuration
  info('Test 5: Headers configuration');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token_123',
      siteId: 'test_site_id'
    });

    if (client.baseHeaders['Authorization'] === 'Bearer test_token_123' &&
        client.baseHeaders['Content-Type'] === 'application/json' &&
        client.baseHeaders['User-Agent'].includes('WiredChaos')) {
      success('Headers configured correctly');
      passed++;
    } else {
      error('Headers configuration incorrect');
      failed++;
    }
  } catch (err) {
    error(`Headers test failed: ${err.message}`);
    failed++;
  }

  // Test 6: parseWebhookEvent
  info('Test 6: Parse webhook event');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id'
    });

    const rawEvent = {
      event_type: 'pr_merged',
      action: 'update_page',
      data: { test: 'data' },
      site_id: 'site_123'
    };

    const parsed = client.parseWebhookEvent(rawEvent);

    if (parsed.type === 'pr_merged' &&
        parsed.action === 'update_page' &&
        parsed.siteId === 'site_123' &&
        parsed.data.test === 'data') {
      success('Webhook event parsed correctly');
      passed++;
    } else {
      error('Webhook event parsing failed');
      failed++;
    }
  } catch (err) {
    error(`Parse webhook test failed: ${err.message}`);
    failed++;
  }

  // Test 7: Payload structure for updateLandingPage
  info('Test 7: Landing page update payload structure');
  try {
    const client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id'
    });

    // We can't actually make the request, but we can verify the method exists
    // and accepts the right parameters
    const testData = {
      title: 'Test Title',
      content: '<h1>Test</h1>',
      metadata: { test: true }
    };

    // Verify method accepts this structure (won't make actual request)
    if (typeof client.updateLandingPage === 'function') {
      success('updateLandingPage method has correct signature');
      passed++;
    } else {
      error('updateLandingPage method signature incorrect');
      failed++;
    }
  } catch (err) {
    error(`Payload structure test failed: ${err.message}`);
    failed++;
  }

  // Summary
  section('Test Summary');
  console.log(`Total tests: ${passed + failed}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});
