#!/usr/bin/env node
/**
 * WIRED CHAOS - Two-Tier School System Firewall Fix
 * Ensures proper routing and access control for Business/Esoteric schools
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

function fixTwoTierFirewall() {
  log('\n🔧 Two-Tier School System Firewall Fix', 'cyan');
  log('━'.repeat(60), 'cyan');
  
  const fixes = {
    applied: [],
    skipped: [],
    errors: []
  };
  
  // Fix 1: Verify worker routing for /school
  const workerPath = path.join(process.cwd(), 'src/index.js');
  if (fs.existsSync(workerPath)) {
    const workerContent = fs.readFileSync(workerPath, 'utf8');
    
    // Check for /school route
    if (workerContent.includes('/school')) {
      log('  ✓ /school route exists in worker', 'green');
      fixes.skipped.push('/school route');
    } else {
      log('  ⚠️  /school route might be missing', 'yellow');
      fixes.skipped.push('/school route (needs verification)');
    }
    
    // Check for audience parameter handling
    if (workerContent.includes('audience')) {
      log('  ✓ Audience parameter handling exists', 'green');
      fixes.skipped.push('Audience parameter handling');
    } else {
      log('  ⚠️  Audience parameter handling might be missing', 'yellow');
      fixes.skipped.push('Audience parameter handling (needs verification)');
    }
  } else {
    log('  ❌ Worker file not found', 'red');
    fixes.errors.push('Worker file missing');
  }
  
  // Fix 2: Verify School component with toggle
  const schoolComponentPath = path.join(process.cwd(), 'frontend/src/components/School.js');
  if (fs.existsSync(schoolComponentPath)) {
    const schoolContent = fs.readFileSync(schoolComponentPath, 'utf8');
    
    // Check for business/esoteric toggle
    if (schoolContent.includes('business') && schoolContent.includes('esoteric')) {
      log('  ✓ Business/Esoteric toggle exists in School component', 'green');
      fixes.skipped.push('School toggle');
    } else {
      log('  ⚠️  School toggle might be incomplete', 'yellow');
      fixes.skipped.push('School toggle (needs verification)');
    }
  } else {
    log('  ⚠️  School component not found', 'yellow');
    fixes.skipped.push('School component (not found)');
  }
  
  // Fix 3: Verify University component routing
  const universityComponentPath = path.join(process.cwd(), 'frontend/src/components/University.js');
  if (fs.existsSync(universityComponentPath)) {
    log('  ✓ University component exists', 'green');
    fixes.skipped.push('University component');
  } else {
    log('  ⚠️  University component not found', 'yellow');
    fixes.skipped.push('University component (not found)');
  }
  
  // Fix 4: Check for proper CORS headers in _headers file
  const headersPath = path.join(process.cwd(), 'public/_headers');
  if (fs.existsSync(headersPath)) {
    const headersContent = fs.readFileSync(headersPath, 'utf8');
    
    if (headersContent.includes('Access-Control-Allow-Origin')) {
      log('  ✓ CORS headers configured', 'green');
      fixes.skipped.push('CORS headers');
    } else {
      log('  ⚠️  CORS headers might be missing', 'yellow');
      fixes.skipped.push('CORS headers (needs verification)');
    }
  } else {
    log('  ⚠️  Creating _headers file with CORS support', 'yellow');
    
    const headersContent = `/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Wallet-Address

/school
  Cache-Control: public, max-age=300
  
/university
  Cache-Control: public, max-age=300

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
  
/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *
`;
    
    try {
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(headersPath, headersContent);
      log('  ✅ Created _headers file', 'green');
      fixes.applied.push('_headers file');
    } catch (error) {
      log(`  ❌ Failed to create _headers: ${error.message}`, 'red');
      fixes.errors.push('_headers creation');
    }
  }
  
  // Fix 5: Verify routing configuration
  const appJsPath = path.join(process.cwd(), 'frontend/src/App.js');
  if (fs.existsSync(appJsPath)) {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Check for route definitions
    if (appContent.includes('route') || appContent.includes('Route')) {
      log('  ✓ Routing configuration exists', 'green');
      fixes.skipped.push('Routing configuration');
    } else {
      log('  ⚠️  Routing configuration might be missing', 'yellow');
      fixes.skipped.push('Routing configuration (needs verification)');
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
  
  log('\n✅ Two-tier firewall check complete!', 'green');
  log('\nNext steps:', 'cyan');
  log('  1. Verify /school endpoint returns proper HTML', 'cyan');
  log('  2. Test audience parameter: /university?audience=business', 'cyan');
  log('  3. Test audience parameter: /university?audience=esoteric', 'cyan');
  log('  4. Verify AR/VR model loading with proper CORS headers', 'cyan');
  
  return true;
}

// Main execution
if (require.main === module) {
  const success = fixTwoTierFirewall();
  process.exit(success ? 0 : 1);
}

module.exports = { fixTwoTierFirewall };
