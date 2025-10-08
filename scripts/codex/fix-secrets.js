#!/usr/bin/env node
/**
 * WIRED CHAOS Secret Scanner & Remediator
 * --------------------------------------
 * Utility script used by Codex automation to guard against accidentally
 * committed secrets. Supports two modes:
 *   --check  (default) : scan the repository and fail if secrets are found
 *   --apply            : attempt to mask the detected secrets in-place
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const mode = args.includes("--apply") ? "apply" : "check";

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".parcel-cache",
  ".cache",
  "coverage",
  "tmp",
  "logs"
]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".bmp",
  ".tiff",
  ".mp3",
  ".mp4",
  ".mov",
  ".avi",
  ".wav",
  ".flac",
  ".zip",
  ".gz",
  ".tgz",
  ".bz2",
  ".xz",
  ".7z",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".glb",
  ".usdz",
  ".bin"
]);

const SECRET_PATTERNS = [
  { name: "OpenAI API key", pattern: /sk-[a-zA-Z0-9]{20,}/g },
  { name: "GitHub personal access token", pattern: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}/g },
  { name: "GitHub fine-grained PAT", pattern: /github_pat_[0-9A-Za-z_]{82}/g },
  { name: "Slack token", pattern: /xox[baprs]-[A-Za-z0-9-]{10,48}/g },
  { name: "Stripe secret key", pattern: /(sk|rk)_live_[0-9a-zA-Z]{24,}/g },
  { name: "Stripe restricted key", pattern: /rk_test_[0-9a-zA-Z]{24,}/g },
  { name: "Google API key", pattern: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: "Google OAuth token", pattern: /ya29\.[0-9A-Za-z\-_]+/g },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/g },
  {
    name: "AWS secret access key",
    pattern: /(?<=AWS_SECRET_ACCESS_KEY=)[0-9A-Za-z/+=]{40}(?=$|\r|\n)/g
  },
  { name: "Cloudflare API token", pattern: /(?<=CLOUDFLARE_API_TOKEN=)[0-9A-Za-z-_]{40,}/g },
  { name: "Supabase service key", pattern: /sbp_[0-9A-Za-z]{50,}/g },
  { name: "JWT token", pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  {
    name: "Private key block",
    pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----/g
  }
];

const TRACKED_ENV_FILENAMES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.test",
  ".env.staging",
  ".envrc"
];

function isForbiddenEnvFile(name) {
  if (TRACKED_ENV_FILENAMES.includes(name)) {
    return true;
  }
  return /^\.env\.[^.]+\.local$/.test(name);
}

const findings = [];
let filesScanned = 0;
let filesModified = 0;

function maskSecret(match) {
  if (/^eyJ/.test(match)) {
    return "<REDACTED_JWT>";
  }
  if (/^-----BEGIN/.test(match)) {
    return "-----BEGIN PRIVATE KEY-----\n<REDACTED_PRIVATE_KEY>\n-----END PRIVATE KEY-----";
  }
  return "<REDACTED_SECRET>";
}

function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return;
  }

  const buffer = fs.readFileSync(filePath);
  if (buffer.includes(0)) {
    return;
  }

  const originalContent = buffer.toString("utf8");
  let updatedContent = originalContent;
  let hasFinding = false;

  SECRET_PATTERNS.forEach((patternConfig) => {
    const regex = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
    const matches = Array.from(originalContent.matchAll(regex));

    matches.forEach((match) => {
      if (!match[0] || match[0].includes("<REDACTED_")) {
        return;
      }
      hasFinding = true;
      const index = match.index ?? 0;
      const before = originalContent.slice(0, index);
      const lineNumber = before.split(/\r?\n/).length;
      const lineStart = before.lastIndexOf("\n") + 1;
      const lineEnd = originalContent.indexOf("\n", index);
      const line = originalContent.slice(
        lineStart,
        lineEnd === -1 ? originalContent.length : lineEnd
      );

      findings.push({
        filePath,
        lineNumber,
        pattern: patternConfig.name,
        value: match[0],
        line: line.trim()
      });
    });

    if (mode === "apply" && matches.length > 0) {
      updatedContent = updatedContent.replace(regex, (value) => maskSecret(value));
    }
  });

  if (mode === "apply" && hasFinding && updatedContent !== originalContent) {
    fs.writeFileSync(filePath, updatedContent, "utf8");
    filesModified += 1;
  }

  filesScanned += 1;
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name.startsWith(".")) {
      if (entry.name !== ".env" && IGNORED_DIRECTORIES.has(entry.name)) {
        return;
      }
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        return;
      }
      walk(fullPath);
    } else if (entry.isFile()) {
      if (mode === "check" && isForbiddenEnvFile(entry.name)) {
        findings.push({
          filePath: fullPath,
          lineNumber: 0,
          pattern: "Tracked .env file",
          value: entry.name,
          line: "Tracked environment file should be ignored"
        });
        return;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (BINARY_EXTENSIONS.has(ext)) {
        return;
      }

      processFile(fullPath);
    }
  });
}

walk(repoRoot);

if (findings.length > 0) {
  console.log("\n⚠️  Potential secrets detected:\n");
  findings.forEach((finding) => {
    const relative = path.relative(repoRoot, finding.filePath);
    const location = finding.lineNumber > 0 ? `:${finding.lineNumber}` : "";
    console.log(`- ${relative}${location}`);
    console.log(`  Pattern : ${finding.pattern}`);
    console.log(`  Context : ${finding.line}`);
    if (mode === "apply") {
      console.log("  Action  : redacted");
    }
    console.log("");
  });

  if (mode === "check") {
    console.error(
      `❌ Secret scan failed. ${findings.length} potential issue(s) detected across ${filesScanned} file(s).`
    );
    process.exit(1);
  }

  if (mode === "apply") {
    console.log(
      `✅ Remediation completed. ${filesModified} file(s) updated. Review changes before committing.`
    );
    process.exit(0);
  }
} else {
  console.log(
    `✅ No potential secrets detected after scanning ${filesScanned} file(s).`
  );
}

process.exit(0);
