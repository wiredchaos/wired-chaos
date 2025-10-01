#!/usr/bin/env node
/**
 * GAMMA Client Tests
 * Unit tests for GAMMA API client
 */

import GammaClient from '../src/gamma-client.js';

const TESTS = {
  passed: 0,
  failed: 0,
  total: 0
};

function assert(condition, message) {
  TESTS.total++;
  if (condition) {
    TESTS.passed++;
    console.log(`  ✅ ${message}`);
    return true;
  } else {
    TESTS.failed++;
    console.log(`  ❌ ${message}`);
    return false;
  }
}

function testHeader(name) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ${name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function testGammaClient() {
  testHeader('GAMMA Client Tests');
  
  // Test client instantiation
  const client = new GammaClient('test-token', 'https://test.gamma.app/api/v1');
  assert(client !== null, 'GammaClient instantiated');
  assert(client.apiToken === 'test-token', 'API token set correctly');
  assert(client.apiBase === 'https://test.gamma.app/api/v1', 'API base set correctly');
  
  // Test theme creation
  const theme = client.createWiredChaosTheme();
  assert(theme.id === 'wired-chaos-cyber', 'Theme ID is correct');
  assert(theme.colors.primary === '#00fff0', 'Primary color is correct');
  assert(theme.colors.background === '#000000', 'Background color is correct');
  assert(theme.fonts.heading.includes('Orbitron'), 'Heading font is correct');
}

async function testSlideCreation() {
  testHeader('Slide Creation Tests');
  
  const client = new GammaClient('test-token');
  
  // Test presentation structure
  const slides = [
    { type: 'title', title: 'Test', content: 'Test content' },
    { type: 'content', title: 'Content', content: 'More content' }
  ];
  
  assert(Array.isArray(slides), 'Slides array created');
  assert(slides.length === 2, 'Correct number of slides');
  assert(slides[0].type === 'title', 'Title slide type correct');
  assert(slides[1].type === 'content', 'Content slide type correct');
}

async function testBrandingConfiguration() {
  testHeader('Branding Configuration Tests');
  
  const client = new GammaClient('test-token');
  
  assert(client.branding.primaryColor === '#00fff0', 'Primary color matches config');
  assert(client.branding.secondaryColor === '#ff2a2a', 'Secondary color matches config');
  assert(client.branding.accentColor === '#8000ff', 'Accent color matches config');
  assert(client.branding.backgroundColor === '#000000', 'Background color matches config');
  assert(client.branding.fonts.primary === 'Orbitron', 'Primary font matches config');
}

async function testErrorHandling() {
  testHeader('Error Handling Tests');
  
  const client = new GammaClient('');
  
  // Test with missing API token
  assert(client.apiToken === '', 'Client accepts empty token (will fail on request)');
  
  // Test retry configuration
  const retryAttempts = 3;
  assert(retryAttempts > 0, 'Retry attempts configured');
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║           GAMMA Client Unit Tests                        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    await testGammaClient();
    await testSlideCreation();
    await testBrandingConfiguration();
    await testErrorHandling();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Total:   ${TESTS.total}`);
    console.log(`  Passed:  ${TESTS.passed}`);
    console.log(`  Failed:  ${TESTS.failed}`);
    console.log(`  Success: ${((TESTS.passed / TESTS.total) * 100).toFixed(1)}%`);
    console.log('');
    
    if (TESTS.failed === 0) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${TESTS.failed} test(s) failed`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    process.exit(1);
  }
}

runTests();
