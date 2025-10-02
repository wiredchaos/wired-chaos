#!/usr/bin/env node
/**
 * InsightX Integration Smoke Tests
 * Tests all WIRED CHAOS Platform endpoints
 */

const API_BASE = process.env.EDGE_API_URL || 'http://localhost:8787';
const TIMEOUT = 10000; // 10 seconds

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`Testing: ${name}`, 'cyan');
    log(`  URL: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok || (options.expectedStatus && response.status === options.expectedStatus)) {
      log(`  ✅ PASS (${response.status})`, 'green');
      return { name, status: 'PASS', code: response.status };
    } else {
      log(`  ❌ FAIL (${response.status})`, 'red');
      return { name, status: 'FAIL', code: response.status };
    }
  } catch (error) {
    log(`  ❌ ERROR: ${error.message}`, 'red');
    return { name, status: 'ERROR', error: error.message };
  }
}

async function testSSE(name, url) {
  return new Promise((resolve) => {
    log(`Testing: ${name}`, 'cyan');
    log(`  URL: ${url}`);
    
    const eventSource = new (await import('eventsource')).default(url);
    let connected = false;
    let eventReceived = false;
    
    const timeout = setTimeout(() => {
      eventSource.close();
      if (!connected) {
        log(`  ❌ FAIL (Connection timeout)`, 'red');
        resolve({ name, status: 'FAIL', error: 'Connection timeout' });
      } else if (!eventReceived) {
        log(`  ⚠️  WARNING (Connected but no events)`, 'yellow');
        resolve({ name, status: 'WARNING', note: 'Connected but no events received' });
      }
    }, TIMEOUT);
    
    eventSource.addEventListener('connected', () => {
      connected = true;
    });
    
    eventSource.addEventListener('price', () => {
      eventReceived = true;
      clearTimeout(timeout);
      eventSource.close();
      log(`  ✅ PASS (SSE working)`, 'green');
      resolve({ name, status: 'PASS' });
    });
    
    eventSource.onerror = (error) => {
      clearTimeout(timeout);
      eventSource.close();
      log(`  ❌ ERROR: ${error.message || 'Connection failed'}`, 'red');
      resolve({ name, status: 'ERROR', error: error.message || 'Connection failed' });
    };
  });
}

async function testHeatMapData(name, url) {
  try {
    log(`Testing: ${name}`, 'cyan');
    log(`  URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      log(`  ❌ FAIL (${response.status})`, 'red');
      return { name, status: 'FAIL', code: response.status };
    }
    
    const data = await response.json();
    
    // Validate structure
    if (!data.grid || !data.grid.rows || !data.grid.cols || !data.grid.cells) {
      log(`  ❌ FAIL (Invalid structure)`, 'red');
      return { name, status: 'FAIL', error: 'Invalid response structure' };
    }
    
    // Validate grid dimensions
    if (data.grid.rows !== 8 || data.grid.cols !== 8) {
      log(`  ❌ FAIL (Wrong dimensions: ${data.grid.rows}x${data.grid.cols})`, 'red');
      return { name, status: 'FAIL', error: 'Expected 8x8 grid' };
    }
    
    // Validate cell count
    if (data.grid.cells.length !== 64) {
      log(`  ❌ FAIL (Expected 64 cells, got ${data.grid.cells.length})`, 'red');
      return { name, status: 'FAIL', error: 'Expected 64 cells' };
    }
    
    // Validate intensity values
    const invalidCells = data.grid.cells.filter(cell => 
      cell.intensity < 0 || cell.intensity > 1
    );
    
    if (invalidCells.length > 0) {
      log(`  ❌ FAIL (${invalidCells.length} cells with invalid intensity)`, 'red');
      return { name, status: 'FAIL', error: 'Invalid intensity values' };
    }
    
    log(`  ✅ PASS (Valid 8x8 grid with ${data.grid.cells.length} cells)`, 'green');
    log(`  Mode: ${data.mode}`, 'cyan');
    return { name, status: 'PASS', mode: data.mode };
    
  } catch (error) {
    log(`  ❌ ERROR: ${error.message}`, 'red');
    return { name, status: 'ERROR', error: error.message };
  }
}

async function runTests() {
  log('\n========================================', 'cyan');
  log('WIRED CHAOS Platform Smoke Tests', 'cyan');
  log('========================================\n', 'cyan');
  
  const results = [];
  
  // Test 1: Health check
  results.push(await testEndpoint(
    'Health Check',
    `${API_BASE}/api/health`
  ));
  
  // Test 2: Heat map API
  results.push(await testHeatMapData(
    'Heat Map API',
    `${API_BASE}/api/heatmap`
  ));
  
  // Test 3: Providers catalog
  results.push(await testEndpoint(
    'Providers Catalog',
    `${API_BASE}/api/providers?category=all`
  ));
  
  // Test 4: Profile endpoint (should return 401 without auth)
  results.push(await testEndpoint(
    'Profile Endpoint (Unauthenticated)',
    `${API_BASE}/api/profile`,
    { expectedStatus: 401 }
  ));
  
  // Test 5: Vault endpoint (should return 401 without auth)
  results.push(await testEndpoint(
    'Vault Endpoint (Unauthenticated)',
    `${API_BASE}/api/vault`,
    { expectedStatus: 401 }
  ));
  
  // Test 6: Ticker SSE (requires eventsource package)
  try {
    results.push(await testSSE(
      'Ticker SSE Stream',
      `${API_BASE}/api/ticker`
    ));
  } catch (error) {
    log(`  ⚠️  Skipping SSE test (eventsource package not available)`, 'yellow');
    results.push({ name: 'Ticker SSE Stream', status: 'SKIPPED', note: 'eventsource package required' });
  }
  
  // Summary
  log('\n========================================', 'cyan');
  log('Test Summary', 'cyan');
  log('========================================\n', 'cyan');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  
  log(`Total Tests: ${results.length}`);
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`⚠️  Warnings: ${warnings}`, 'yellow');
  log(`❌ Errors: ${errors}`, 'red');
  log(`⏭️  Skipped: ${skipped}`, 'cyan');
  
  log('\nDetailed Results:', 'cyan');
  results.forEach(result => {
    const statusColor = result.status === 'PASS' ? 'green' : 
                       result.status === 'FAIL' ? 'red' :
                       result.status === 'ERROR' ? 'red' :
                       result.status === 'WARNING' ? 'yellow' : 'cyan';
    log(`  ${result.name}: ${result.status}`, statusColor);
    if (result.error) log(`    Error: ${result.error}`, 'red');
    if (result.note) log(`    Note: ${result.note}`, 'yellow');
  });
  
  log('\n');
  
  // Exit with appropriate code
  if (failed > 0 || errors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
