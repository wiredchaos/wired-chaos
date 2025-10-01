#!/usr/bin/env node
/**
 * WIRED CHAOS - Automated Conflict Resolution for PRs
 * Intelligently resolves merge conflicts based on file patterns
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return output;
  } catch (error) {
    if (!silent) throw error;
    return null;
  }
}

// Conflict resolution strategies
const resolutionStrategies = {
  '.gitignore': 'theirs',           // Always use main branch .gitignore
  'package-lock.json': 'theirs',    // Use main branch lock file
  'README.md': 'theirs',            // Use main branch README
  '.md': 'ours',                    // For other markdown files, prefer PR changes
  '.json': 'manual',                // JSON files need manual review
  '.js': 'manual',                  // JavaScript files need manual review
  '.ts': 'manual',                  // TypeScript files need manual review
  '.yml': 'theirs',                 // Workflow files prefer main branch
  '.yaml': 'theirs',                // Workflow files prefer main branch
};

function getResolutionStrategy(filename) {
  // Check exact match first
  if (resolutionStrategies[filename]) {
    return resolutionStrategies[filename];
  }
  
  // Check extension match
  const ext = filename.substring(filename.lastIndexOf('.'));
  return resolutionStrategies[ext] || 'manual';
}

function resolveConflict(prNumber) {
  log(`\n🔧 Starting conflict resolution for PR #${prNumber}`, 'cyan');
  
  try {
    // Checkout the PR branch
    log(`📥 Checking out PR #${prNumber}...`, 'blue');
    exec(`gh pr checkout ${prNumber}`, true);
    
    // Get current branch name
    const currentBranch = exec('git rev-parse --abbrev-ref HEAD', true).trim();
    log(`✓ Checked out branch: ${currentBranch}`, 'green');
    
    // Try to merge main
    log('🔄 Attempting to merge main branch...', 'blue');
    const mergeResult = exec('git merge main --no-edit', true);
    
    if (mergeResult !== null) {
      // Merge successful without conflicts
      log('✅ Merge completed without conflicts!', 'green');
      exec('git push origin HEAD');
      log('✅ Changes pushed successfully', 'green');
      return true;
    }
    
    // Conflicts detected, get list of conflicted files
    log('⚠️  Conflicts detected, analyzing...', 'yellow');
    const conflictedFiles = exec('git diff --name-only --diff-filter=U', true)
      .trim()
      .split('\n')
      .filter(f => f);
    
    log(`Found ${conflictedFiles.length} conflicted files:`, 'yellow');
    conflictedFiles.forEach(f => log(`  - ${f}`, 'yellow'));
    
    let resolvedCount = 0;
    let manualCount = 0;
    
    // Apply resolution strategies
    for (const file of conflictedFiles) {
      const strategy = getResolutionStrategy(file);
      
      if (strategy === 'theirs') {
        log(`  Resolving ${file} -> using main branch version`, 'cyan');
        exec(`git checkout --theirs "${file}"`, true);
        exec(`git add "${file}"`, true);
        resolvedCount++;
      } else if (strategy === 'ours') {
        log(`  Resolving ${file} -> using PR branch version`, 'cyan');
        exec(`git checkout --ours "${file}"`, true);
        exec(`git add "${file}"`, true);
        resolvedCount++;
      } else {
        log(`  ${file} requires manual resolution`, 'yellow');
        manualCount++;
      }
    }
    
    if (manualCount > 0) {
      log(`\n⚠️  ${manualCount} files require manual resolution`, 'yellow');
      log('Please resolve these conflicts manually:', 'yellow');
      conflictedFiles.forEach(f => {
        if (getResolutionStrategy(f) === 'manual') {
          log(`  - ${f}`, 'yellow');
        }
      });
      return false;
    }
    
    // Commit the resolution
    log('\n💾 Committing conflict resolution...', 'blue');
    exec(`git commit -m "resolve: auto-resolve merge conflicts for PR #${prNumber}"`);
    
    // Push changes
    log('📤 Pushing resolution...', 'blue');
    exec('git push origin HEAD');
    
    log(`\n✅ Successfully resolved ${resolvedCount} conflicts for PR #${prNumber}`, 'green');
    return true;
    
  } catch (error) {
    log(`\n❌ Error resolving conflicts: ${error.message}`, 'red');
    return false;
  } finally {
    // Return to main branch
    exec('git checkout main', true);
  }
}

// Main execution
if (require.main === module) {
  const prNumber = process.argv[2];
  
  if (!prNumber) {
    log('❌ Usage: node conflict-resolution.js <PR_NUMBER>', 'red');
    process.exit(1);
  }
  
  const success = resolveConflict(prNumber);
  process.exit(success ? 0 : 1);
}

module.exports = { resolveConflict };
