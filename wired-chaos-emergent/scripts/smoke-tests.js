#!/usr/bin/env node
/**
 * WIRED CHAOS - Comprehensive Smoke Tests
 * Tests all critical endpoints after deployment
 */

const https = require('https');
const http = require('http');

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Base URL configuration
const BASE_URL = process.env.BASE_URL || 'https://www.wiredchaos.xyz';

// Smoke test endpoints
const smokeTests = [
  {
    name: 'Health Check',
    url: '/health',
    method: 'GET',
    expect: { status: 200, contains: 'ok' }
  },
  {
    name: 'Root Redirect',
    url: '/',
    method: 'GET',
    expect: { status: [200, 301, 302] }
  },
  {
    name: 'School Page',
    url: '/school',
    method: 'GET',
    expect: { status: 200, contains: 'html' }
  },
  {
    name: 'University (Business)',
    url: '/university?audience=business',
    method: 'GET',
    expect: { status: 200, contains: 'WCU' }
  },
  {
    name: 'University (Esoteric)',
    url: '/university?audience=esoteric',
    method: 'GET',
    expect: { status: 200, contains: '589' }
  },
  {
    name: 'Video Sales Page',
    url: '/vsp',
    method: 'GET',
    expect: { status: 200 }
  },
  {
    name: 'VSP Contract Generate',
    url: '/api/vsp/contract/generate',
    method: 'POST',
    body: {
      fullName: 'Test User',
      email: 'test@example.com',
      package: 'professional',
      projectDescription: 'Smoke test'
    },
    expect: { status: 200, contains: 'contract' }
  },
  {
    name: 'BUS Status',
    url: '/bus/status',
    method: 'GET',
    expect: { status: 200, contains: 'ok' }
  },
  {
    name: 'BUS Poll',
    url: '/bus/poll?since=0',
    method: 'GET',
    expect: { status: 200, contains: 'events' }
  },
  {
    name: 'Tax Suite Redirect',
    url: '/tax',
    method: 'GET',
    expect: { status: [301, 302], headers: { location: /suite/ } }
  },
  {
    name: 'Suite Endpoint',
    url: '/suite',
    method: 'GET',
    expect: { status: 200, contains: 'html' }
  },
  {
    name: 'GAMMA Tour',
    url: '/gamma/tour',
    method: 'GET',
    expect: { status: 200 }
  },
  {
    name: 'GAMMA Journal',
    url: '/gamma/journal',
    method: 'GET',
    expect: { status: 200 }
  },
  {
    name: 'GAMMA Workbook',
    url: '/gamma/workbook',
    method: 'GET',
    expect: { status: 200 }
  }
];

function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'User-Agent': 'WIRED-CHAOS-SmokeTest/1.0',
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTest(test) {
  const url = BASE_URL + test.url;
  
  try {
    const response = await makeRequest(url, test.method, test.body);
    
    // Check status code
    const expectedStatus = Array.isArray(test.expect.status) 
      ? test.expect.status 
      : [test.expect.status];
    
    if (!expectedStatus.includes(response.status)) {
      log(`  ❌ ${test.name}: Expected status ${test.expect.status}, got ${response.status}`, 'red');
      return false;
    }
    
    // Check body contains
    if (test.expect.contains) {
      const bodyLower = response.body.toLowerCase();
      const searchTerm = test.expect.contains.toLowerCase();
      
      if (!bodyLower.includes(searchTerm)) {
        log(`  ❌ ${test.name}: Response doesn't contain '${test.expect.contains}'`, 'red');
        return false;
      }
    }
    
    // Check headers
    if (test.expect.headers) {
      for (const [key, value] of Object.entries(test.expect.headers)) {
        const headerValue = response.headers[key.toLowerCase()];
        if (!headerValue || (value instanceof RegExp && !value.test(headerValue))) {
          log(`  ❌ ${test.name}: Header '${key}' validation failed`, 'red');
          return false;
        }
      }
    }
    
    log(`  ✅ ${test.name}`, 'green');
    return true;
    
  } catch (error) {
    log(`  ❌ ${test.name}: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🔥 WIRED CHAOS - Smoke Tests', 'cyan');
  log('━'.repeat(60), 'cyan');
  log(`Base URL: ${BASE_URL}\n`, 'cyan');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of smokeTests) {
    const result = await runTest(test);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log('\n' + '━'.repeat(60), 'cyan');
  log(`📊 Results: ${passed} passed, ${failed} failed`, failed === 0 ? 'green' : 'yellow');
  
  if (failed === 0) {
    log('✅ All smoke tests passed!', 'green');
    return 0;
  } else {
    log(`⚠️  ${failed} tests failed`, 'red');
    return 1;
  }
}

// Main execution
if (require.main === module) {
  runAllTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`❌ Smoke tests failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runAllTests, runTest };
