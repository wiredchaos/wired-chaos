# WIRED CHAOS Full Automation Script

$ErrorActionPreference = "Stop"

function Say([string]$msg) { Write-Host ">> $msg" -ForegroundColor Cyan }
function MakeDir([string]$p) { if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }

# 0) Preflight
Say "Preflight checks (git/node/gh)..."
}

# 3) Commit and push setup changes

# === setup-wired-chaos.ps1 ===
# WIRED CHAOS — Full Automation Setup Script
# Usage: Run from repo root: .\setup-wired-chaos.ps1

$ErrorActionPreference = "Stop"

function Say([string]$msg) { Write-Host ">> $msg" -ForegroundColor Cyan }
function MakeDir([string]$p) { if (!(Test-Path $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null } }
function Touch([string]$f) { if (!(Test-Path $f)) { "" | Set-Content $f -Encoding UTF8 } }

# 0) Preflight
Say "Preflight checks (git/node/gh)..."
try {
    $git = (git --version) 2>$null
    if (!$git) { throw "Git not found. Install Git and retry." }
} catch {
    Write-Host "ERROR: Git not found. Install Git from https://git-scm.com/downloads and try again." -ForegroundColor Red
    exit 1
}
try {
    $node = (node --version) 2>$null
    if (!$node) { throw "Node.js not found. Install Node LTS and retry." }
} catch {
    Write-Host "ERROR: Node.js not found. Install Node.js from https://nodejs.org/en/download/ and try again." -ForegroundColor Red
    exit 1
}
try {
    $gh = (gh --version) 2>$null
    if (!$gh) { Write-Host "WARNING: GitHub CLI not found. PR/workflow automation will be skipped." -ForegroundColor Yellow }
} catch {
    Write-Host "WARNING: GitHub CLI not found. Download from https://cli.github.com/ for full automation." -ForegroundColor Yellow
}

# 0.5) Check PowerShell execution policy
$policy = Get-ExecutionPolicy
if ($policy -eq "Restricted" -or $policy -eq "AllSigned") {
    Write-Host "ERROR: PowerShell execution policy blocks scripts. Run this command and try again:" -ForegroundColor Red
    Write-Host "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned" -ForegroundColor Cyan
    exit 1
}

# 1) Scaffold folders/files
Say "Ensuring required folders exist..."
$folders = @(
  ".github/workflows", "worker/src", "scripts", ".tmp", "public"
)
foreach ($d in $folders) { MakeDir $d }

Say "Ensuring minimal required files exist..."
$files = @(
  ".github/workflows/preview-deploy.yml",
  ".github/workflows/prod-deploy.yml",
  ".github/workflows/worker-deploy.yml",
  ".github/workflows/content-sync.yml",
  ".github/workflows/x-metrics-sync.yml",
  "wrangler.toml",
  "public/index.html"
)
foreach ($f in $files) { Touch $f }

# 2) Check for required secrets and prompt for missing ones
Say "Checking for required secrets..."
$requiredSecrets = @(
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_PROJECT_NAME",
  "WORKER_ADMIN_URL",
  "CLOUDFLARE_ADMIN_TOKEN",
  # Optional integrations
  "NOTION_API_KEY", "NOTION_DATABASE_ID",
  "X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET",
  "LINKEDIN_ACCESS_TOKEN", "LINKEDIN_ACTOR_URN",
  "DISCORD_WEBHOOK_URL"
)
$existingSecrets = @()
if ($gh) {
    $existingSecrets = gh secret list | Select-String -Pattern "^[^ ]+" | ForEach-Object { $_.Matches[0].Value }
}
foreach ($sec in $requiredSecrets) {
    if ($existingSecrets -contains $sec) {
        Say "✅ Secret exists: $sec"
    } else {
        Say "❌ Secret missing: $sec"
        if ($gh) {
            $val = Read-Host "Enter value for $sec (or press Enter to skip)"
            if ($val) {
                gh secret set $sec -b"$val"
                Say "➕ Secret $sec added."
            } else {
                Say "⚠️ Skipped $sec."
            }
        }
    }
}

# 3) Commit and push setup changes
Say "Committing and pushing setup files..."
try {
    git add .
    git commit -m "Automated setup: WIRED CHAOS infra scaffolding" 2>$null
    git push
} catch {
    Write-Host "ERROR: Git commit/push failed. Check your Git status and remote settings." -ForegroundColor Red
}

# 4) Trigger GitHub workflows (if CLI is present)
if ($gh) {
    $workflowFiles = @(
      "preview-deploy.yml",
      "prod-deploy.yml",
      "worker-deploy.yml",
      "content-sync.yml",
      "x-metrics-sync.yml"
    )
    foreach ($wf in $workflowFiles) {
        Say "Triggering workflow: $wf"
        try {
            gh workflow run $wf
        } catch {
            Write-Host "WARNING: Could not trigger workflow $wf. You may need to run it manually from the Actions tab." -ForegroundColor Yellow
        }
    }
}

Say "`n=== Automation complete! ===`nCheck the Actions tab in your GitHub repo for workflow status."
Say "If you see any errors above, follow the suggested fixes and run the script again."
