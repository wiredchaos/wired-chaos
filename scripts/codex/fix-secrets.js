#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log(`Usage: node scripts/codex/fix-secrets.js [--check|--fix] [--root <path>]

Options:
  --check       Scan the repository for potential secrets (default)
  --fix         Attempt to redact secrets in supported files (\`.env*\` files)
  --root <dir>  Override the repository root directory
  --help        Show this help message
`);
  process.exit(0);
}

const mode = args.includes("--fix") ? "fix" : "check";
let rootDir = path.resolve(__dirname, "..", "..");
const rootIndex = args.indexOf("--root");
if (rootIndex !== -1 && args[rootIndex + 1]) {
  rootDir = path.resolve(args[rootIndex + 1]);
}

const configPath = path.join(__dirname, "fix-secrets.config.json");
const ignoreConfig = {
  valueRegexes: [],
  fileRegexes: [],
  lineRegexes: [],
};

if (fs.existsSync(configPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (Array.isArray(raw.ignoreValues)) {
      ignoreConfig.valueRegexes = raw.ignoreValues
        .map((pattern) => {
          try {
            return new RegExp(pattern);
          } catch (error) {
            console.warn(`⚠️  Invalid ignoreValues pattern '${pattern}': ${error.message}`);
            return null;
          }
        })
        .filter(Boolean);
    }
    if (Array.isArray(raw.ignoreFiles)) {
      ignoreConfig.fileRegexes = raw.ignoreFiles
        .map((pattern) => {
          try {
            return new RegExp(pattern);
          } catch (error) {
            console.warn(`⚠️  Invalid ignoreFiles pattern '${pattern}': ${error.message}`);
            return null;
          }
        })
        .filter(Boolean);
    }
    if (Array.isArray(raw.ignoreLinePatterns)) {
      ignoreConfig.lineRegexes = raw.ignoreLinePatterns
        .map((pattern) => {
          try {
            return new RegExp(pattern);
          } catch (error) {
            console.warn(`⚠️  Invalid ignoreLinePatterns pattern '${pattern}': ${error.message}`);
            return null;
          }
        })
        .filter(Boolean);
    }
  } catch (error) {
    console.warn(`⚠️  Unable to parse config at ${configPath}: ${error.message}`);
  }
}

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
  "tmp",
  "temp",
  "__pycache__",
]);

const secretContextPattern =
  /(token|secret|password|passphrase|auth|bearer|credential|api[_-]?key|client[_-]?secret|private[_-]?key|webhook[_-]?secret)/i;

const placeholderPattern = /(REPLACE|CHANGE|YOUR|EXAMPLE|SAMPLE|DUMMY|FAKE|TBD|PLACEHOLDER|<.*?>)/i;

const secretPatterns = [
  {
    id: "AWS Access Key",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: "AWS Secret Key",
    regex: /\b(?:(?:aws|secret)[^\n]*['\"]?[A-Za-z0-9\/+=]{40}['\"]?)\b/gi,
  },
  {
    id: "Google API Key",
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
  },
  {
    id: "Slack Token",
    regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g,
  },
  {
    id: "Stripe Live Secret",
    regex: /\bsk_live_[0-9A-Za-z]{24,}\b/g,
  },
  {
    id: "Stripe Restricted Key",
    regex: /\brk_live_[0-9A-Za-z]{24,}\b/g,
  },
  {
    id: "GitHub Token",
    regex: /\bgh[pousr]_[0-9A-Za-z]{36}\b/g,
  },
  {
    id: "Private Key Block",
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  },
  {
    id: "Generic Assignment",
    regex:
      /(api[_-]?key|token|secret|password|passphrase|private[_-]?key|client[_-]?secret|webhook[_-]?secret|auth[_-]?token)\s*[:=]\s*(["']?)([A-Za-z0-9_\-\/+=]{12,})(\2)/gi,
    evaluator: (match, key, quote, value) => ({ key, value, quote }),
  },
  {
    id: "JWT",
    regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  },
  {
    id: "High Entropy Literal",
    regex: /["']([A-Za-z0-9_\-\/+=]{32,})["']/g,
    evaluator: (match, value) => ({ value }),
  },
];

function isBinaryBuffer(buffer) {
  const sample = buffer.slice(0, 512);
  for (const byte of sample) {
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

function shouldIgnore(filePath) {
  const segments = filePath.split(path.sep);
  return segments.some((segment) => ignoredDirs.has(segment));
}

function isEnvFile(filePath) {
  const base = path.basename(filePath);
  if (base.startsWith(".env")) {
    return true;
  }
  return false;
}

function getLineNumber(content, index) {
  const slice = content.slice(0, index);
  return slice.split(/\n/).length;
}

function scanFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (isBinaryBuffer(buffer)) {
    return [];
  }
  const content = buffer.toString("utf8");
  const relativePath = path.relative(rootDir, filePath);
  if (ignoreConfig.fileRegexes.some((regex) => regex.test(relativePath))) {
    return [];
  }
  const ext = path.extname(filePath).toLowerCase();

  const findings = [];
  for (const pattern of secretPatterns) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const valueInfo = pattern.evaluator ? pattern.evaluator(...match) : { value: match[0] };
      const value = valueInfo && valueInfo.value ? valueInfo.value : match[0];
      if (!value || placeholderPattern.test(value)) {
        continue;
      }
      if (value.includes("${") || value.includes("<%")) {
        continue;
      }
      if (/^[A-Z0-9_]+$/.test(value)) {
        continue;
      }
      const lowerValue = value.toLowerCase();
      if (/(test|example|sample|dummy|placeholder)/.test(lowerValue)) {
        continue;
      }
      const lineNumber = getLineNumber(content, match.index);
      const contextLine = content.split(/\n/)[lineNumber - 1] || "";
      if (
        pattern.id === "High Entropy Literal" &&
        !secretContextPattern.test(contextLine)
      ) {
        continue;
      }
      if (ignoreConfig.valueRegexes.some((regex) => regex.test(value))) {
        continue;
      }
      if (ignoreConfig.lineRegexes.some((regex) => regex.test(contextLine))) {
        continue;
      }
      const allowUnquoted =
        isEnvFile(filePath) || [".yml", ".yaml", ".json", ".toml", ".ini"].includes(ext);
      if (
        pattern.id === "Generic Assignment" &&
        (!valueInfo || typeof valueInfo.quote !== "string" || valueInfo.quote.length === 0) &&
        !allowUnquoted
      ) {
        continue;
      }
      findings.push({
        id: pattern.id,
        filePath,
        lineNumber,
        value,
        line: contextLine.trim(),
        match,
        evaluatorResult: valueInfo,
      });
    }
  }
  return findings;
}

function walk(dir, accumulator) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(fullPath, accumulator);
    } else if (entry.isFile()) {
      try {
        const findings = scanFile(fullPath);
        findings.forEach((finding) => accumulator.push(finding));
      } catch (error) {
        console.warn(`⚠️  Skipping ${fullPath}: ${error.message}`);
      }
    }
  }
}

function maskEnvValue(line) {
  const assignment = line.match(/^(\s*[A-Za-z0-9_]+\s*=\s*)(.*)$/);
  if (!assignment) {
    return line;
  }
  const prefix = assignment[1];
  let value = assignment[2];
  const commentIndex = value.indexOf("#");
  let suffix = "";
  if (commentIndex !== -1) {
    suffix = value.slice(commentIndex);
    value = value.slice(0, commentIndex);
  }
  const trimmed = value.trim();
  if (!trimmed || placeholderPattern.test(trimmed) || trimmed === "REDACTED") {
    return line;
  }
  return `${prefix}REDACTED${suffix ? ` ${suffix}` : ""}`.trimEnd();
}

function applyFixes(findings) {
  const grouped = findings.reduce((acc, finding) => {
    if (!acc[finding.filePath]) {
      acc[finding.filePath] = [];
    }
    acc[finding.filePath].push(finding);
    return acc;
  }, {});

  const fixed = [];
  const unfixed = [];

  for (const [filePath, fileFindings] of Object.entries(grouped)) {
    if (!isEnvFile(filePath)) {
      unfixed.push(...fileFindings);
      continue;
    }
    const original = fs.readFileSync(filePath, "utf8");
    const lines = original.split(/\n/);
    let modified = false;
    const processedLines = new Set();

    for (const finding of fileFindings) {
      const idx = finding.lineNumber - 1;
      if (idx < 0 || idx >= lines.length) {
        unfixed.push(finding);
        continue;
      }
      const lineKey = `${filePath}:${idx}`;
      if (processedLines.has(lineKey)) {
        continue;
      }
      const newLine = maskEnvValue(lines[idx]);
      if (newLine !== lines[idx]) {
        lines[idx] = newLine;
        modified = true;
        fixed.push(finding);
        processedLines.add(lineKey);
      } else {
        unfixed.push(finding);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }
  }

  return { fixed, unfixed };
}

function printFindings(findings) {
  if (!findings.length) {
    console.log("✅ No potential secrets detected.");
    return;
  }
  console.log("❌ Potential secrets detected:\n");
  for (const finding of findings) {
    const relativePath = path.relative(rootDir, finding.filePath);
    console.log(`• [${finding.id}] ${relativePath}:${finding.lineNumber}`);
    console.log(`  ↳ ${finding.line}`);
  }
}

const findings = [];
walk(rootDir, findings);

if (mode === "check") {
  printFindings(findings);
  process.exit(findings.length ? 1 : 0);
}

if (!findings.length) {
  console.log("✅ No potential secrets detected. Nothing to fix.");
  process.exit(0);
}

const { fixed, unfixed } = applyFixes(findings);
if (fixed.length) {
  console.log(`✅ Redacted ${fixed.length} entries across ${new Set(fixed.map((f) => f.filePath)).size} file(s).`);
}
if (unfixed.length) {
  console.log("⚠️  Manual review required for the following entries:\n");
  printFindings(unfixed);
  process.exit(1);
}

console.log("✅ All detected secrets were redacted.");
process.exit(0);
