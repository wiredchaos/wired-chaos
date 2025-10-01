#!/usr/bin/env node

/**
 * 🧠 WIRED CHAOS Notion AI Bot - Quick Setup & Test Script
 * Validates integration and tests live command execution
 */

const https = require('https');
const { promisify } = require('util');

// WIRED CHAOS API Endpoints
const ENDPOINTS = {
  HEALTH: 'https://www.wiredchaos.xyz/health',
  FRONTEND: 'https://wired-chaos.pages.dev/api/health',
  VSP: 'https://www.wiredchaos.xyz/vsp',
  SUITE: 'https://www.wiredchaos.xyz/suite',
  TAX: 'https://www.wiredchaos.xyz/tax'
};

// Console colors for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test individual endpoint
async function testEndpoint(name, url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const request = https.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'WIRED-CHAOS-Bot/1.0'
      }
    }, (response) => {
      const responseTime = Date.now() - startTime;
      const status = response.statusCode;
      
      resolve({
        name,
        url,
        status,
        responseTime,
        healthy: status >= 200 && status < 400
      });
    });
    
    request.on('error', (error) => {
      resolve({
        name,
        url,
        status: 0,
        responseTime: Date.now() - startTime,
        healthy: false,
        error: error.message
      });
    });
    
    request.on('timeout', () => {
      resolve({
        name,
        url,
        status: 0,
        responseTime: 5000,
        healthy: false,
        error: 'Timeout'
      });
    });
  });
}

// Main setup validation
async function validateSetup() {
  colorLog('cyan', '\n🧠 WIRED CHAOS Notion AI Bot - Setup Validation\n');
  
  // Check environment variables
  colorLog('yellow', '📋 Environment Variables Check:');
  const requiredVars = ['GITHUB_TOKEN', 'NOTION_TOKEN'];
  const optionalVars = ['GAMMA_API_KEY', 'WIRED_CHAOS_API_KEY', 'DISCORD_WEBHOOK_URL'];
  
  let envScore = 0;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      colorLog('green', `✅ ${varName}: SET`);
      envScore += 2;
    } else {
      colorLog('red', `❌ ${varName}: MISSING (Required)`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      colorLog('green', `✅ ${varName}: SET`);
      envScore += 1;
    } else {
      colorLog('yellow', `⚠️ ${varName}: MISSING (Optional)`);
    }
  });
  
  colorLog('cyan', `\n🎯 Environment Score: ${envScore}/7\n`);
  
  // Test all endpoints
  colorLog('yellow', '🌐 Testing WIRED CHAOS Infrastructure:');
  
  const tests = await Promise.all(
    Object.entries(ENDPOINTS).map(([name, url]) => testEndpoint(name, url))
  );
  
  let healthyCount = 0;
  let totalResponseTime = 0;
  
  tests.forEach(test => {
    const statusIcon = test.healthy ? '✅' : '❌';
    const timeColor = test.responseTime < 200 ? 'green' : test.responseTime < 500 ? 'yellow' : 'red';
    
    console.log(`${statusIcon} ${test.name}: ${test.status} (${test.responseTime}ms)`);
    
    if (test.healthy) {
      healthyCount++;
      totalResponseTime += test.responseTime;
    } else if (test.error) {
      colorLog('red', `   Error: ${test.error}`);
    }
  });
  
  const avgResponseTime = healthyCount > 0 ? Math.round(totalResponseTime / healthyCount) : 0;
  const healthPercentage = Math.round((healthyCount / tests.length) * 100);
  
  colorLog('cyan', `\n📊 Infrastructure Health: ${healthyCount}/${tests.length} services (${healthPercentage}%)`);
  colorLog('cyan', `⚡ Average Response Time: ${avgResponseTime}ms\n`);
  
  // Overall status
  const overallHealthy = healthyCount >= Math.ceil(tests.length * 0.8); // 80% threshold
  const envReady = envScore >= 4; // Minimum viable environment
  
  if (overallHealthy && envReady) {
    colorLog('green', '🎉 READY TO LAUNCH!');
    colorLog('green', '✅ Infrastructure is healthy');
    colorLog('green', '✅ Environment configured');
    colorLog('cyan', '\n🚀 Your Notion AI Bot can now execute live WIRED CHAOS commands!');
    colorLog('cyan', '   Try: /status system or /help');
  } else {
    colorLog('red', '⚠️ SETUP INCOMPLETE');
    if (!overallHealthy) {
      colorLog('red', '❌ Infrastructure health below threshold');
    }
    if (!envReady) {
      colorLog('red', '❌ Environment variables missing');
      colorLog('yellow', '   Set GITHUB_TOKEN and NOTION_TOKEN at minimum');
    }
  }
  
  return {
    envScore,
    healthyServices: healthyCount,
    totalServices: tests.length,
    avgResponseTime,
    ready: overallHealthy && envReady
  };
}

// Demo command execution
async function demoCommands() {
  colorLog('cyan', '\n🎮 Demo Command Execution:\n');
  
  // Import the command parser
  try {
    const { parseNotionCommand } = require('./wired-chaos-command-center.js');
    
    colorLog('yellow', '🧪 Testing command parser...');
    
    // Test /help command
    const helpResult = await parseNotionCommand('/help');
    colorLog('green', '✅ /help command: Working');
    console.log(helpResult.substring(0, 200) + '...\n');
    
    // Test /status system command
    const statusResult = await parseNotionCommand('/status system');
    colorLog('green', '✅ /status system command: Working');
    console.log(statusResult.substring(0, 300) + '...\n');
    
    colorLog('cyan', '🎯 Command parser is functional!');
    
  } catch (error) {
    colorLog('red', '❌ Command parser test failed:');
    colorLog('red', `   ${error.message}`);
    colorLog('yellow', '   Make sure wired-chaos-command-center.js is present');
  }
}

// Main execution
async function main() {
  try {
    const results = await validateSetup();
    
    if (results.ready) {
      await demoCommands();
      
      colorLog('cyan', '\n📚 Next Steps:');
      colorLog('cyan', '1. Add command library to your Notion AI Bot');
      colorLog('cyan', '2. Configure webhook worker on Cloudflare');
      colorLog('cyan', '3. Test live operations with /deploy suite');
      colorLog('cyan', '4. Monitor everything with /status system');
      
      colorLog('green', '\n🧠 Welcome to the WIRED CHAOS Command Center! ⛓️‍💥');
    } else {
      colorLog('yellow', '\n🔧 Complete setup requirements above, then run this script again.');
    }
    
  } catch (error) {
    colorLog('red', `\n💥 Setup validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateSetup, testEndpoint };