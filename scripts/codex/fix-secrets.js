#!/usr/bin/env node
/**
 * Secret exposure guardrail for WIRED CHAOS
 *
 * Usage:
 *   node scripts/codex/fix-secrets.js --check            # default mode
 *   node scripts/codex/fix-secrets.js --check --json     # structured output
 *   node scripts/codex/fix-secrets.js --check --report reports/secrets.json
 *
 * The script scans the repository for high-risk tokens (API keys, private keys, etc.)
 * and fails with a non-zero exit code if any issues are discovered.
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DEFAULT_MAX_FILE_SIZE = 1024 * 512; // 512 KiB

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  "public",
  ".next",
  ".cache",
  "logs",
  "tmp",
  "temp",
  "__pycache__",
  ".pytest_cache",
  ".venv",
]);

const SECRET_PATTERNS = [
  {
    id: "openai-api-key",
    name: "OpenAI API key",
    regex: /sk-[a-zA-Z0-9]{20,}/g,
  },
  {
    id: "github-token",
    name: "GitHub personal access token",
    regex: /gh[pousr]_[A-Za-z0-9]{36,}/g,
  },
  {
    id: "slack-token",
    name: "Slack token",
    regex: /(xox[baprs]-[A-Za-z0-9-]{10,})/g,
  },
  {
    id: "aws-access-key",
    name: "AWS access key ID",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: "aws-secret-key",
    name: "AWS secret access key",
    regex: /(?<![A-Za-z0-9\/+=])[A-Za-z0-9\/+=]{40}(?![A-Za-z0-9\/+=])/g,
    context: /(aws|secret|key|token|access)/i,
    validator: (value) => /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value),
  },
  {
    id: "google-api-key",
    name: "Google API key",
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
  },
  {
    id: "private-key-block",
    name: "Private key block",
    regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP|PRIVATE KEY)-----[\s\S]+?-----END (?:RSA|DSA|EC|OPENSSH|PGP|PRIVATE KEY)-----/g,
  },
  {
    id: "twilio-api-key",
    name: "Twilio API key",
    regex: /SK[0-9a-fA-F]{32}/g,
  },
  {
    id: "heroku-api-key",
    name: "Heroku API key",
    regex: /(HEROKU_API_(?:KEY|TOKEN)["'=:\s]{0,20})([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi,
    valueGroup: 2,
  },
  {
    id: "stripe-secret-key",
    name: "Stripe secret key",
    regex: /sk_live_[0-9a-zA-Z]{24}/g,
  },
];

const parsedArgs = parseArgs(process.argv.slice(2));
if (parsedArgs.errors.length > 0) {
  for (const error of parsedArgs.errors) {
    console.error(`[ERROR] ${error}`);
  }
  printHelp();
  process.exit(2);
}

const args = parsedArgs.options;

if (args.help) {
  printHelp();
  process.exit(0);
}

const report = runScan({
  root: ROOT_DIR,
  maxFileSize: args.maxFileSize || DEFAULT_MAX_FILE_SIZE,
  includeDotfiles: args.includeDotfiles || false,
});

const hasFindings = report.findings.length > 0;

if (args.format === "json") {
  const payload = {
    ok: !hasFindings,
    findings: report.findings,
    summary: report.summary,
    scannedFiles: report.scannedFiles,
    ignoredFiles: report.ignoredFiles,
  };

  const output = JSON.stringify(payload, null, 2);
  if (args.reportPath) {
    ensureDirectory(path.dirname(args.reportPath));
    fs.writeFileSync(args.reportPath, output, "utf8");
  }
  console.log(output);
} else {
  printHumanReport(report);
  if (args.reportPath) {
    ensureDirectory(path.dirname(args.reportPath));
    fs.writeFileSync(args.reportPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`\n[INFO] Saved JSON report to ${args.reportPath}`);
  }
}

if (hasFindings) {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const options = {
    format: "text",
    help: false,
    mode: "check",
  };
  const errors = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--check":
        options.mode = "check";
        break;
      case "--json":
        options.format = "json";
        break;
      case "--report":
        if (i + 1 >= argv.length) {
          errors.push("Missing path after --report");
        } else {
          options.reportPath = argv[++i];
        }
        break;
      case "--max-file-size":
        if (i + 1 >= argv.length) {
          errors.push("Missing value after --max-file-size");
        } else {
          const value = parseInt(argv[++i], 10);
          if (Number.isNaN(value) || value <= 0) {
            errors.push("--max-file-size must be a positive integer");
          } else {
            options.maxFileSize = value;
          }
        }
        break;
      case "--include-dotfiles":
        options.includeDotfiles = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        errors.push(`Unknown argument: ${arg}`);
    }
  }

  return { options, errors };
}

function runScan({ root, maxFileSize, includeDotfiles }) {
  const findings = [];
  let scannedFiles = 0;
  let ignoredFiles = 0;

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (!includeDotfiles && entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }
        walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const relativePath = path.relative(root, fullPath);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.size > maxFileSize) {
          ignoredFiles++;
          continue;
        }

        const buffer = fs.readFileSync(fullPath);
        if (isBinary(buffer)) {
          ignoredFiles++;
          continue;
        }

        scannedFiles++;
        const content = buffer.toString("utf8");
        const fileFindings = evaluateContent(relativePath, content);
        findings.push(...fileFindings);
      } catch (error) {
        console.warn(`[WARN] Unable to scan ${relativePath}: ${error.message}`);
      }
    }
  }

  walk(root);

  return {
    findings,
    scannedFiles,
    ignoredFiles,
    summary: buildSummary(findings),
  };
}

function evaluateContent(file, content) {
  const results = [];
  for (const pattern of SECRET_PATTERNS) {
    const matches = findMatches(content, pattern);
    for (const match of matches) {
      results.push({
        file,
        line: match.line,
        id: pattern.id,
        rule: pattern.name,
        evidence: maskValue(match.value),
        context: sanitizeSnippet(match.snippet),
      });
    }
  }
  return results;
}

function findMatches(content, pattern) {
  const matches = [];
  const regex = new RegExp(pattern.regex.source, pattern.regex.flags.includes("g") ? pattern.regex.flags : pattern.regex.flags + "g");
  let result;
  const maxIterations = 1000;
  let iterations = 0;
  while ((result = regex.exec(content)) !== null) {
    iterations++;
    if (iterations > maxIterations) {
      console.warn(`[WARN] Too many matches for pattern ${pattern.id}, aborting further checks.`);
      break;
    }

    const fullMatch = result[0];
    const extractedValue = pattern.valueGroup ? result[pattern.valueGroup] : fullMatch;
    if (!extractedValue) {
      continue;
    }
    const valueIndex = pattern.valueGroup
      ? result.index + fullMatch.indexOf(extractedValue)
      : result.index;

    if (pattern.validator && !pattern.validator(extractedValue)) {
      continue;
    }

    if (pattern.context) {
      const windowStart = Math.max(valueIndex - 80, 0);
      const windowEnd = Math.min(valueIndex + extractedValue.length + 80, content.length);
      const window = content.slice(windowStart, windowEnd);
      if (!pattern.context.test(window)) {
        continue;
      }
    }

    const line = computeLineNumber(content, valueIndex);
    const snippet = extractSnippet(content, valueIndex, extractedValue.length);
    matches.push({ line, value: extractedValue, snippet });

    if (result.index === regex.lastIndex) {
      regex.lastIndex++;
    }
  }
  return matches;
}

function computeLineNumber(content, index) {
  const lines = content.slice(0, index).split(/\r?\n/);
  return lines.length;
}

function extractSnippet(content, index, length) {
  const start = Math.max(index - 40, 0);
  const end = Math.min(index + length + 40, content.length);
  return content.slice(start, end);
}

function sanitizeSnippet(snippet) {
  return snippet.replace(/\s+/g, " ").trim().slice(0, 160);
}

function maskValue(value) {
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return "*".repeat(Math.min(trimmed.length, 8));
  }
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}…${suffix}`;
}

function isBinary(buffer) {
  const len = Math.min(buffer.length, 1024);
  for (let i = 0; i < len; i++) {
    const byte = buffer[i];
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

function buildSummary(findings) {
  const summary = {};
  for (const finding of findings) {
    summary[finding.id] = (summary[finding.id] || 0) + 1;
  }
  return summary;
}

function printHumanReport(report) {
  console.log(`[INFO] Secret scan completed.`);
  console.log(`[INFO] Files scanned: ${report.scannedFiles}`);
  console.log(`[INFO] Files skipped: ${report.ignoredFiles}`);
  if (report.findings.length === 0) {
    console.log("\n✅ No potential secrets found.");
    return;
  }

  console.log("\n⚠️  Potential secrets detected:");
  for (const finding of report.findings) {
    console.log(`- ${finding.file}:${finding.line} → ${finding.rule}`);
    console.log(`  Evidence: ${finding.evidence}`);
    if (finding.context) {
      console.log(`  Context: ${finding.context}`);
    }
  }

  console.log(`\n${report.findings.length} potential secret(s) detected. Review and rotate if confirmed.`);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function printHelp() {
  console.log(`Secret scanning utility for WIRED CHAOS\n\n` +
    `Usage: node scripts/codex/fix-secrets.js [options]\n\n` +
    `Options:\n` +
    `  --check               Run the scanner (default).\n` +
    `  --json                Output findings as JSON.\n` +
    `  --report <path>       Write JSON report to the given path.\n` +
    `  --max-file-size <n>   Max file size (bytes) to scan (default: ${DEFAULT_MAX_FILE_SIZE}).\n` +
    `  --include-dotfiles    Include dotfiles/directories in the scan.\n` +
    `  -h, --help            Show this help message.\n`);
}
