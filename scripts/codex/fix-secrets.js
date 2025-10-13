#!/usr/bin/env node

/**
 * WIRED CHAOS Secret Scanner
 * --------------------------
 * Scans the repository for high-risk secrets (API tokens, private keys, etc.).
 *
 * Usage:
 *   node scripts/codex/fix-secrets.js --check   # scan only
 *   node scripts/codex/fix-secrets.js --fix     # attempt to redact detected secrets
 *
 * The scanner supports an optional allowlist file located at
 * `scripts/codex/secret-allowlist.json`. Each allowlist entry must include a
 * `path` (relative to repo root). Entries may optionally specify an exact
 * `value` to ignore or a `pattern` (regular expression string) to match.
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const allowlistFileRelPath = path.relative(repoRoot, path.join(__dirname, "secret-allowlist.json"));

const args = new Set(process.argv.slice(2));
const mode = args.has("--fix") ? "fix" : "check";
const isQuiet = args.has("--quiet");

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "out",
  "coverage",
  ".turbo",
  "tmp",
  "logs",
]);

const binaryExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
  ".pdf",
  ".mp4",
  ".mp3",
  ".zip",
  ".gz",
  ".tgz",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

const secretPatterns = [
  { name: "OpenAI API key", regex: /sk-[a-zA-Z0-9]{20,}/g, redactWith: "sk-[REDACTED]" },
  { name: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9]{36,}/g, redactWith: "ghp_[REDACTED]" },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g, redactWith: "AKIA[REDACTED]" },
  { name: "Google API key", regex: /AIza[0-9A-Za-z\-_]{35}/g, redactWith: "AIza[REDACTED]" },
  { name: "Slack token", regex: /xox[baprs]-[0-9A-Za-z-]{10,}/g, redactWith: "xoxb-[REDACTED]" },
  { name: "Private key header", regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----/g, redactWith: "-----BEGIN PRIVATE KEY-----" },
  {
    name: "Generic secret assignment",
    regex: /([A-Z0-9_-]*(?:SECRET|TOKEN|API_KEY|PASSWORD))\s*[:=]\s*['\"]?[A-Za-z0-9\-_]{8,}['\"]?/g,
    redactWith: "$1=[REDACTED]",
  },
];

function loadAllowlist() {
  const allowlistPath = path.join(__dirname, "secret-allowlist.json");
  if (!fs.existsSync(allowlistPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(allowlistPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Allowlist must be an array");
    }
    return parsed.map((entry) => ({
      path: entry.path,
      value: entry.value,
      pattern: entry.pattern ? new RegExp(entry.pattern) : null,
    }));
  } catch (error) {
    console.error("❌ Failed to parse secret allowlist:", error.message);
    process.exit(2);
  }
}

const allowlist = loadAllowlist();

function isBinaryFile(filePath) {
  return binaryExtensions.has(path.extname(filePath).toLowerCase());
}

function isAllowed(relPath, match) {
  return allowlist.some((entry) => {
    if (entry.path !== relPath) {
      return false;
    }
    if (entry.value && entry.value === match) {
      return true;
    }
    if (entry.pattern && entry.pattern.test(match)) {
      return true;
    }
    return false;
  });
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function redact(content, pattern, replacement) {
  return content.replace(pattern, replacement);
}

const findings = [];

function scanFile(fullPath) {
  const relPath = path.relative(repoRoot, fullPath);

  if (relPath === allowlistFileRelPath) {
    return;
  }

  if (isBinaryFile(fullPath)) {
    return;
  }

  let content;
  try {
    content = fs.readFileSync(fullPath, "utf8");
  } catch (error) {
    if (!isQuiet) {
      console.warn(`⚠️  Skipping unreadable file: ${relPath} (${error.message})`);
    }
    return;
  }

  let updatedContent = content;
  let fileModified = false;

  for (const pattern of secretPatterns) {
    const matches = [...updatedContent.matchAll(pattern.regex)];
    if (matches.length === 0) {
      continue;
    }

    for (const match of matches) {
      const matchValue = match[0];

      if (pattern.name === "Generic secret assignment") {
        const token = matchValue
          .split(/[:=]/)
          .slice(1)
          .join("")
          .replace(/['"\s]/g, "");
        if (!/[A-Za-z0-9]{16,}/.test(token)) {
          continue;
        }
      }
      if (isAllowed(relPath, matchValue)) {
        continue;
      }

      const line = getLineNumber(updatedContent, match.index || 0);
      findings.push({
        path: relPath,
        line,
        match: matchValue,
        pattern: pattern.name,
      });

      if (mode === "fix") {
        fileModified = true;
        const replacement = pattern.redactWith || "[REDACTED]";
        updatedContent = redact(updatedContent, pattern.regex, replacement);
      }
    }
  }

  if (mode === "fix" && fileModified && updatedContent !== content) {
    fs.writeFileSync(fullPath, updatedContent, "utf8");
  }
}

function walkDirectory(currentPath) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(currentPath, entry.name);
    const relPath = path.relative(repoRoot, entryPath);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }
      walkDirectory(entryPath);
    } else if (entry.isFile()) {
      scanFile(entryPath);
    }
  }
}

walkDirectory(repoRoot);

if (findings.length === 0) {
  if (!isQuiet) {
    console.log(mode === "fix" ? "✅ No secrets detected. Nothing to redact." : "✅ No secrets detected.");
  }
  process.exit(0);
}

if (mode === "check") {
  console.error("❌ Potential secrets detected:");
  for (const finding of findings) {
    console.error(`  - ${finding.path}:${finding.line} (${finding.pattern}) -> ${finding.match}`);
  }
  process.exit(1);
}

console.warn("⚠️ Secrets detected and redacted. Review the changes below:");
for (const finding of findings) {
  console.warn(`  - ${finding.path}:${finding.line} (${finding.pattern})`);
}
process.exit(0);
