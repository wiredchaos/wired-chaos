#!/usr/bin/env node
/**
 * WIRED CHAOS - Suite Landing Component Validation
 * Simple validation script to check component structure
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_DIR = __dirname;

console.log('🔍 Validating Suite Landing Component...\n');

// Check required files exist
const requiredFiles = [
  'SuiteLanding.js',
  'SuiteLanding.module.css',
  'index.js',
  'README.md'
];

let allFilesPresent = true;

requiredFiles.forEach(file => {
  const filePath = path.join(COMPONENT_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesPresent = false;
  }
});

if (!allFilesPresent) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check file contents
console.log('\n📋 Checking file contents...\n');

// Check SuiteLanding.js
const componentContent = fs.readFileSync(
  path.join(COMPONENT_DIR, 'SuiteLanding.js'),
  'utf8'
);

const componentChecks = [
  { name: 'React import', pattern: /import React/ },
  { name: 'useNavigate import', pattern: /import.*useNavigate.*from.*react-router-dom/ },
  { name: 'FEATURES import', pattern: /import.*FEATURES.*from.*featureFlags/ },
  { name: 'getSuiteUrl import', pattern: /import.*getSuiteUrl/ },
  { name: 'CSS module import', pattern: /import.*styles.*from.*\.module\.css/ },
  { name: 'Feature flag check', pattern: /FEATURES\.enableSuiteLanding/ },
  { name: 'Feature modes array', pattern: /stub|partial|full/ },
  { name: 'Accessibility labels', pattern: /aria-label/ },
  { name: 'Keyboard support', pattern: /onKeyPress/ },
  { name: 'Export default', pattern: /export default SuiteLanding/ }
];

componentChecks.forEach(check => {
  if (check.pattern.test(componentContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`⚠️  ${check.name} - not found or may need review`);
  }
});

// Check CSS module
console.log('\n🎨 Checking CSS module...\n');

const cssContent = fs.readFileSync(
  path.join(COMPONENT_DIR, 'SuiteLanding.module.css'),
  'utf8'
);

const cssChecks = [
  { name: 'Vault color variables', pattern: /--vault-/ },
  { name: 'Container class', pattern: /\.container/ },
  { name: 'Header class', pattern: /\.header/ },
  { name: 'Features grid', pattern: /\.featuresGrid/ },
  { name: 'Feature card', pattern: /\.featureCard/ },
  { name: 'Responsive breakpoint (768px)', pattern: /@media.*max-width.*768px/ },
  { name: 'Responsive breakpoint (480px)', pattern: /@media.*max-width.*480px/ },
  { name: 'Accessibility focus', pattern: /\.featureCard:focus/ },
  { name: 'Reduced motion support', pattern: /@media.*prefers-reduced-motion/ },
  { name: 'High contrast support', pattern: /@media.*prefers-contrast/ }
];

cssChecks.forEach(check => {
  if (check.pattern.test(cssContent)) {
    console.log(`✅ ${check.name}`);
  } else {
    console.log(`⚠️  ${check.name} - not found`);
  }
});

// Check index.js export
console.log('\n📦 Checking exports...\n');

const indexContent = fs.readFileSync(
  path.join(COMPONENT_DIR, 'index.js'),
  'utf8'
);

if (indexContent.includes('export') && indexContent.includes('SuiteLanding')) {
  console.log('✅ Component properly exported');
} else {
  console.log('❌ Component export may be incorrect');
}

// File size checks
console.log('\n📊 File sizes:\n');

requiredFiles.forEach(file => {
  const filePath = path.join(COMPONENT_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   ${file}: ${sizeKB} KB`);
  }
});

console.log('\n✅ Validation complete!\n');
console.log('Next steps:');
console.log('1. Install dependencies: npm install (in frontend/)');
console.log('2. Start dev server: npm start (in frontend/)');
console.log('3. Visit http://localhost:3000/suite');
console.log('4. Test feature flags: /suite?mode=stub, /suite?mode=partial, /suite?mode=full\n');
