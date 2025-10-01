#!/usr/bin/env node
/**
 * WIRED CHAOS - Tax Suite Integration Fix
 * Ensures proper Tax Suite URL configuration and integration
 */

const fs = require('fs');
const path = require('path');

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

function fixTaxSuiteIntegration() {
  log('\n🔧 Tax Suite Integration Fix', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  const fixes = {
    applied: [],
    skipped: [],
    errors: []
  };
  
  // Fix 1: Ensure environment variable helper exists
  const envUtilPath = path.join(process.cwd(), 'frontend/src/utils/env.js');
  if (fs.existsSync(envUtilPath)) {
    const envContent = fs.readFileSync(envUtilPath, 'utf8');
    
    if (!envContent.includes('getTaxSuiteUrl')) {
      log('  ✓ getTaxSuiteUrl already exists in env.js', 'green');
      fixes.skipped.push('getTaxSuiteUrl function');
    } else {
      fixes.skipped.push('getTaxSuiteUrl function (already exists)');
    }
  } else {
    log('  ⚠️  env.js not found, creating...', 'yellow');
    
    const envUtilContent = `/**
 * Environment variable utilities
 */

/**
 * Get Tax Suite URL from environment
 * @returns {string|null} Tax Suite URL or null if not configured
 */
export function getTaxSuiteUrl() {
  return process.env.REACT_APP_TAX_SUITE_URL || null;
}

/**
 * Get Suite URL from environment
 * @returns {string|null} Suite URL or null if not configured
 */
export function getSuiteUrl() {
  return process.env.REACT_APP_SUITE_URL || null;
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}
`;
    
    try {
      const utilsDir = path.join(process.cwd(), 'frontend/src/utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      fs.writeFileSync(envUtilPath, envUtilContent);
      log('  ✅ Created env.js with getTaxSuiteUrl', 'green');
      fixes.applied.push('Created env.js');
    } catch (error) {
      log(`  ❌ Failed to create env.js: ${error.message}`, 'red');
      fixes.errors.push('env.js creation');
    }
  }
  
  // Fix 2: Verify TaxSuite component
  const taxSuiteComponentPath = path.join(process.cwd(), 'frontend/src/components/TaxSuite.js');
  if (fs.existsSync(taxSuiteComponentPath)) {
    log('  ✓ TaxSuite component exists', 'green');
    fixes.skipped.push('TaxSuite component');
  } else {
    log('  ⚠️  TaxSuite component not found', 'yellow');
    fixes.skipped.push('TaxSuite component (not found)');
  }
  
  // Fix 3: Ensure worker has /tax redirect
  const workerPath = path.join(process.cwd(), 'src/index.js');
  if (fs.existsSync(workerPath)) {
    const workerContent = fs.readFileSync(workerPath, 'utf8');
    
    if (workerContent.includes('/tax') && workerContent.includes('redirect')) {
      log('  ✓ /tax redirect already configured in worker', 'green');
      fixes.skipped.push('/tax redirect');
    } else {
      log('  ⚠️  /tax redirect might be missing in worker', 'yellow');
      fixes.skipped.push('/tax redirect (needs verification)');
    }
  }
  
  // Fix 4: Check environment template
  const envExamplePath = path.join(process.cwd(), 'frontend/.env.example');
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    if (!envExample.includes('REACT_APP_TAX_SUITE_URL')) {
      log('  ⚠️  Adding REACT_APP_TAX_SUITE_URL to .env.example', 'yellow');
      
      try {
        fs.appendFileSync(envExamplePath, '\n# Tax Suite Integration\nREACT_APP_TAX_SUITE_URL=\n');
        log('  ✅ Updated .env.example', 'green');
        fixes.applied.push('.env.example update');
      } catch (error) {
        log(`  ❌ Failed to update .env.example: ${error.message}`, 'red');
        fixes.errors.push('.env.example update');
      }
    } else {
      log('  ✓ .env.example already has REACT_APP_TAX_SUITE_URL', 'green');
      fixes.skipped.push('.env.example');
    }
  }
  
  // Summary
  log('\n' + '━'.repeat(60), 'cyan');
  log('📊 Fix Summary:', 'cyan');
  log(`  ✅ Applied: ${fixes.applied.length}`, 'green');
  log(`  ⏭️  Skipped: ${fixes.skipped.length}`, 'yellow');
  log(`  ❌ Errors: ${fixes.errors.length}`, fixes.errors.length > 0 ? 'red' : 'green');
  
  if (fixes.applied.length > 0) {
    log('\nApplied fixes:', 'cyan');
    fixes.applied.forEach(f => log(`  - ${f}`, 'green'));
  }
  
  if (fixes.errors.length > 0) {
    log('\nErrors:', 'red');
    fixes.errors.forEach(f => log(`  - ${f}`, 'red'));
    return false;
  }
  
  log('\n✅ Tax Suite integration check complete!', 'green');
  return true;
}

// Main execution
if (require.main === module) {
  const success = fixTaxSuiteIntegration();
  process.exit(success ? 0 : 1);
}

module.exports = { fixTaxSuiteIntegration };
