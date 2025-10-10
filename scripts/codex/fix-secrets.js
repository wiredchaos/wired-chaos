#!/usr/bin/env node
/**
 * WIRED CHAOS :: Secret hygiene utility
 *
 * Scans the repository for patterns that look like hard-coded secrets.
 * Supports a "check" mode (default) that fails when potential issues are found
 * and an optional "--rewrite" mode that redacts detected values in-place.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
const inCheckMode = args.includes('--check') || !args.length;
const inRewriteMode = args.includes('--rewrite') || args.includes('--fix');

if (!inCheckMode && !inRewriteMode) {
  console.error('Usage: node scripts/codex/fix-secrets.js [--check] [--rewrite]');
  console.error('  --check    : scan repository (default)');
  console.error('  --rewrite  : redact detected secrets in-place');
  process.exit(1);
}

/**
 * Directories that should never be scanned to keep execution fast
 * and avoid false positives inside dependencies or build artefacts.
 */
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.github',
  '.next',
  '.turbo',
  '.vercel',
  'dist',
  'build',
  'coverage',
  'logs',
  'node_modules',
  'tmp',
  'vendor',
]);

/**
 * File extensions that can be safely treated as binary. These files are
 * skipped to avoid modifying binary assets or producing unreadable output.
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.icns',
  '.zip', '.gz', '.bz2', '.xz', '.rar', '.7z', '.tar',
  '.mp4', '.mp3', '.mov', '.pdf', '.woff', '.woff2', '.ttf', '.eot',
]);

/**
 * File extensions that are meaningful to scan. This avoids flagging
 * documentation snippets (e.g. Markdown) while still covering source code
 * and configuration files where secrets are most likely to appear.
 */
const SCANNED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.json5', '.jsonc',
  '.yml', '.yaml', '.toml', '.ini', '.conf',
  '.env', '.sh', '.bash', '.zsh',
  '.py', '.rb', '.go', '.rs', '.java', '.cs', '.php',
  '.ps1', '.psm1', '.cmd', '.bat',
  '.tsv', '.csv',
]);

/**
 * Patterns derived from leaked-secret signatures used by GitHub / Trufflehog.
 * Each entry describes what we are looking for and how to fix it.
 */
const SECRET_PATTERNS = [
  {
    id: 'openai-key',
    description: 'OpenAI API key',
    recommendation: 'Move the key to an environment variable (e.g. OPENAI_API_KEY) and read it at runtime.',
    regex: /sk-[A-Za-z0-9]{32,48}/g,
  },
  {
    id: 'stripe-live-key',
    description: 'Stripe live secret key',
    recommendation: 'Use Stripe CLI or environment variables. Never commit live keys.',
    regex: /sk_live_[0-9a-zA-Z]{24,}/g,
  },
  {
    id: 'github-pat',
    description: 'GitHub personal access token',
    recommendation: 'Rotate the token immediately and store it as a GitHub Action secret instead.',
    regex: /ghp_[A-Za-z0-9]{36}/g,
  },
  {
    id: 'aws-access-key-id',
    description: 'AWS access key id',
    recommendation: 'Use IAM roles or environment variables for AWS credentials.',
    regex: /(AKIA|ASIA|AIDA|AGPA|AROA|AIPA)[A-Z0-9]{16}/g,
  },
  {
    id: 'aws-secret-access-key',
    description: 'AWS secret access key',
    recommendation: 'Never commit AWS secret keys. Rotate them immediately.',
    regex: /(?:aws|AWS)?[_-]?SECRET[_-]?ACCESS[_-]?KEY[^A-Za-z0-9]+([A-Za-z0-9\/+]{40})/g,
  },
  {
    id: 'google-api-key',
    description: 'Google API key',
    recommendation: 'Store the key in Secret Manager or environment variables.',
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
  },
  {
    id: 'slack-token',
    description: 'Slack token',
    recommendation: 'Use Slack app configurations and environment variables.',
    regex: /xox[abprs]-[0-9A-Za-z-]{10,48}/g,
  },
  {
    id: 'private-key-block',
    description: 'PEM encoded private key',
    recommendation: 'Private keys must not be committed. Remove and rotate immediately.',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: 'cloudflare-api-token',
    description: 'Cloudflare API token',
    recommendation: 'Store Cloudflare tokens as GitHub secrets (CLOUDFLARE_API_TOKEN).',
    regex: /CLOUDFLARE_API_TOKEN\s*=\s*['\"]?[A-Za-z0-9_\-]{30,}['\"]?/g,
  },
  {
    id: 'generic-secret',
    description: 'Potential generic secret assignment',
    recommendation: 'Double-check that secrets are loaded from environment variables.',
    regex: /(SECRET|TOKEN|PASSWORD|API_KEY)\s*=\s*['\"][A-Za-z0-9._-]{12,}['\"]/gi,
    shouldFlag: (text) => {
      const lower = text.toLowerCase();
      if (lower.includes('${') || lower.includes('$(')) {
        return false;
      }
      const placeholderTokens = [
        'your_', 'your-', 'your ', 'example', 'sample', 'dummy',
        'changeme', 'template', 'placeholder', 'test_', 'fake_', 'demo',
      ];
      return !placeholderTokens.some((token) => lower.includes(token));
    },
  },
];

const findings = [];

function isBinaryPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }
  return false;
}

function isProbablyBinary(buffer) {
  const length = Math.min(buffer.length, 1024);
  for (let i = 0; i < length; i += 1) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

function readFileIfText(filePath) {
  try {
    const baseName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    if (!SCANNED_EXTENSIONS.has(ext)) {
      // Special case for .env style files which may not have an extension
      const lowerBase = baseName.toLowerCase();
      const isEnvFile = lowerBase === '.env' || lowerBase.startsWith('.env.');
      const isConfigFile = ['dockerfile', 'makefile', 'procfile'].includes(lowerBase);
      if (!isEnvFile && !isConfigFile) {
        return null;
      }
    }
    if (isBinaryPath(filePath)) {
      return null;
    }
    const buffer = fs.readFileSync(filePath);
    if (isProbablyBinary(buffer)) {
      return null;
    }
    return buffer.toString('utf8');
  } catch (error) {
    console.error(`⚠️  Unable to read ${filePath}: ${error.message}`);
    return null;
  }
}

function relative(filePath) {
  return path.relative(repoRoot, filePath) || path.basename(filePath);
}

function scanFile(filePath) {
  const content = readFileIfText(filePath);
  if (!content) {
    return;
  }

  SECRET_PATTERNS.forEach((pattern) => {
    const { regex } = pattern;
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchText = match[0];
      if (typeof pattern.shouldFlag === 'function' && !pattern.shouldFlag(matchText)) {
        continue;
      }
      const index = match.index;
      const prefix = content.slice(0, index);
      const lineNumber = prefix.split(/\r?\n/).length;
      const lineStart = content.lastIndexOf('\n', index) + 1;
      const lineEnd = content.indexOf('\n', index);
      const lineSnippet = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();

      findings.push({
        filePath,
        lineNumber,
        snippet: lineSnippet.slice(0, 200),
        match: matchText,
        pattern,
      });
    }
  });
}

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name.startsWith('.idea')) {
      return;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        return;
      }
      walkDirectory(fullPath);
    } else if (entry.isFile()) {
      scanFile(fullPath);
    }
  });
}

console.log('🔍  WIRED CHAOS :: Secret hygiene scan');
console.log('     Root:', repoRoot);
console.log('');
walkDirectory(repoRoot);

if (!findings.length) {
  console.log('✅  No potential secrets detected.');
  process.exit(0);
}

console.log('❌  Potential secrets detected!');
console.log('');
findings.forEach((finding, index) => {
  const relPath = relative(finding.filePath);
  console.log(`${index + 1}. ${relPath}:${finding.lineNumber}`);
  console.log(`   Pattern : ${finding.pattern.description}`);
  console.log(`   Snippet : ${finding.snippet}`);
  console.log(`   Advice  : ${finding.pattern.recommendation}`);
  console.log('');
});

if (!inRewriteMode) {
  console.log('💡  Run with --rewrite to redact detected values automatically.');
  process.exit(1);
}

console.log('✏️  Applying redactions...');
const filesToUpdate = new Map();
findings.forEach((finding) => {
  const relPath = relative(finding.filePath);
  if (!filesToUpdate.has(relPath)) {
    filesToUpdate.set(relPath, fs.readFileSync(finding.filePath, 'utf8'));
  }
});

filesToUpdate.forEach((content, relPath) => {
  let updated = content;
  SECRET_PATTERNS.forEach((pattern) => {
    updated = updated.replace(pattern.regex, '[REDACTED_SECRET]');
    // Reset lastIndex in case regex is stateful
    pattern.regex.lastIndex = 0;
  });
  const targetPath = path.join(repoRoot, relPath);
  fs.writeFileSync(targetPath, updated, 'utf8');
  console.log(`   • Redacted secrets in ${relPath}`);
});

console.log('✅  Redaction complete. Review the changes and replace values with environment variables.');
process.exit(1);
