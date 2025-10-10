#!/usr/bin/env node

/**
 * Secret scanner & fixer utility for WIRED CHAOS.
 *
 * Usage:
 *   node scripts/codex/fix-secrets.js --check   # scan repo and report secrets
 *   node scripts/codex/fix-secrets.js --fix     # scan and redact detected secrets
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check') || !args.size;
const fixMode = args.has('--fix');

if (checkMode && fixMode) {
  console.error('Specify only one of --check or --fix.');
  process.exit(1);
}

const ignoreDirectories = new Set([
  '.git',
  '.github',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  '.wrangler',
  '.idea',
  '.vscode',
  'public',
  'frontend/node_modules',
  'gamma-wix-automation/node_modules',
  'wired-chaos-emergent/node_modules',
  'wix-gamma-integration/node_modules',
]);

const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg', '.webp', '.pdf',
  '.zip', '.gz', '.tar', '.tgz', '.mp4', '.mp3', '.wav', '.ogg', '.woff', '.woff2', '.ttf', '.eot',
  '.otf', '.wasm', '.bin', '.exe', '.dll', '.so', '.dylib', '.psd', '.ai', '.sketch', '.blend', '.usdz',
]);

const secretPatterns = [
  {
    name: 'Stripe live secret key',
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
    replace(match) {
      return 'sk_live_[REDACTED]';
    },
  },
  {
    name: 'Stripe test secret key',
    regex: /sk_test_[0-9a-zA-Z]{24,}/g,
    replace(match) {
      return 'sk_test_[REDACTED]';
    },
  },
  {
    name: 'Slack token',
    regex: /xox[baprs]-[0-9A-Za-z-]{10,}/g,
    replace(match) {
      return match.slice(0, 4) + '[REDACTED]';
    },
  },
  {
    name: 'GitHub personal access token',
    regex: /ghp_[0-9A-Za-z]{36,}/g,
    replace(match) {
      return 'ghp_[REDACTED]';
    },
  },
  {
    name: 'GitHub fine-grained personal access token',
    regex: /github_pat_[0-9A-Za-z_]{50,}/g,
    replace(match) {
      return 'github_pat_[REDACTED]';
    },
  },
  {
    name: 'Google API key',
    regex: /AIza[0-9A-Za-z\-_]{35,}/g,
    replace(match) {
      return 'AIza[REDACTED]';
    },
  },
  {
    name: 'AWS access key id',
    regex: /AKIA[0-9A-Z]{16}/g,
    replace(match) {
      return 'AKIA[REDACTED]';
    },
  },
  {
    name: 'AWS secret access key',
    regex: /(?<=aws_secret_access_key\s*[:=]\s*)([A-Za-z0-9\/+=]{40})/gi,
    replace(match) {
      return '[REDACTED_AWS_SECRET]';
    },
  },
  {
    name: 'SendGrid API key',
    regex: /SG\.[0-9A-Za-z\._-]{20,}/g,
    replace(match) {
      return 'SG.[REDACTED]';
    },
  },
  {
    name: 'Generic JWT token',
    regex: /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g,
    replace(match) {
      return '[REDACTED_JWT]';
    },
  },
];

const findings = [];

function shouldIgnoreDir(relativePath) {
  for (const dir of ignoreDirectories) {
    if (relativePath === dir || relativePath.startsWith(dir + path.sep)) {
      return true;
    }
  }
  return false;
}

function isBinaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (binaryExtensions.has(ext)) {
    return true;
  }
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    return false;
  }
  if (stats.size > 5 * 1024 * 1024) {
    // Treat very large files as binary to avoid loading huge artifacts.
    return true;
  }
  const buffer = fs.readFileSync(filePath);
  for (let i = 0; i < buffer.length; i += 1) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

function scanFile(filePath) {
  if (isBinaryFile(filePath)) {
    return;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  let updatedContent = originalContent;
  let fileHasChanges = false;
  let fileFindings = [];

  for (const pattern of secretPatterns) {
    const regex = new RegExp(pattern.regex);
    let match;
    while ((match = regex.exec(originalContent)) !== null) {
      const value = match[0];
      fileFindings.push({
        file: filePath,
        name: pattern.name,
        value,
        index: match.index,
      });
      if (fixMode) {
        const replacer = pattern.replace ? pattern.replace.bind(pattern) : () => '[REDACTED]';
        updatedContent = updatedContent.replace(value, replacer(value));
        fileHasChanges = true;
      }
    }
  }

  if (fileFindings.length) {
    findings.push(...fileFindings);
  }

  if (fixMode && fileHasChanges && updatedContent !== originalContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
  }
}

function walkDirectory(currentPath, relativePath = '') {
  if (shouldIgnoreDir(relativePath)) {
    return;
  }

  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name);
    const entryRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      walkDirectory(entryPath, entryRelativePath);
    } else if (entry.isFile()) {
      scanFile(entryPath);
    }
  }
}

walkDirectory(repoRoot);

if (!findings.length) {
  if (checkMode) {
    console.log('✅ No committed secrets detected.');
  } else if (fixMode) {
    console.log('✅ No secrets required redaction.');
  }
  process.exit(0);
}

const header = checkMode
  ? '❌ Potential secrets detected:'
  : '⚠️  Secrets detected and redacted:';

console.error(header);

for (const finding of findings) {
  console.error(`- ${finding.file}: ${finding.name}`);
}

if (checkMode) {
  console.error('\nRun with --fix to automatically redact the detected values or review manually.');
  process.exit(1);
}

console.log('\nSecrets redacted successfully. Please review the changes before committing.');
process.exit(0);
