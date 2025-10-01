# WIRED CHAOS Automation Setup Script
# This PowerShell script automates repo setup, dependency checks, scaffolding, secrets, and workflow triggers.

param(
    [string]$RepoRoot = (Get-Location)
)

Write-Host "🚀 Starting WIRED CHAOS Automation Setup..." -ForegroundColor Cyan

# Dependency check
Write-Host "`n📋 Checking Dependencies..." -ForegroundColor Yellow
$dependencies = @('git', 'node', 'gh')
$missingDeps = @()

foreach ($dep in $dependencies) {
    Write-Host "Checking for $dep..." -NoNewline
    if (-not (Get-Command $dep -ErrorAction SilentlyContinue)) {
        Write-Host " ❌ MISSING" -ForegroundColor Red
        $missingDeps += $dep
    } else {
        Write-Host " ✅ OK" -ForegroundColor Green
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "`n⚠️  Missing dependencies detected!" -ForegroundColor Yellow
    Write-Host "Please install the following:" -ForegroundColor Yellow
    foreach ($dep in $missingDeps) {
        switch ($dep) {
            'git' { Write-Host "  • Git: https://git-scm.com/download/win" }
            'node' { Write-Host "  • Node.js: https://nodejs.org/" }
            'gh' { Write-Host "  • GitHub CLI: https://cli.github.com/" }
        }
    }
    Write-Host "`nRe-run this script after installing missing dependencies." -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# Scaffold missing folders/files
Write-Host "`n📁 Checking Project Structure..." -ForegroundColor Yellow
$folders = @('backend', 'contracts', 'frontend', 'public', 'src', 'tests', 'vault33-gatekeeper', '.github/workflows')
foreach ($folder in $folders) {
    if (-not (Test-Path "$RepoRoot\$folder")) {
        Write-Host "Creating missing folder: $folder" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path "$RepoRoot\$folder" -Force | Out-Null
    } else {
        Write-Host "✅ $folder exists" -ForegroundColor Green
    }
}

# Check for essential files
$files = @('README.md', 'package.json', '.gitignore')
foreach ($file in $files) {
    if (-not (Test-Path "$RepoRoot\$file")) {
        Write-Host "⚠️  Missing file: $file" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $file exists" -ForegroundColor Green
    }
}

# GitHub secrets setup (only if gh CLI is available)
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "`n🔐 GitHub Secrets Setup..." -ForegroundColor Yellow
    $secrets = @('GH_TOKEN', 'DEPLOY_KEY', 'CLOUDFLARE_API_TOKEN', 'NPM_TOKEN')
    
    Write-Host "You can set GitHub secrets now, or skip any you don't need:" -ForegroundColor Cyan
    foreach ($secret in $secrets) {
        $value = Read-Host "Enter value for GitHub secret '$secret' (or press Enter to skip)"
        if ($value) {
            Write-Host "Setting secret $secret..." -ForegroundColor Cyan
            try {
                gh secret set $secret -b"$value"
                Write-Host "✅ Secret $secret set successfully" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to set secret $secret" -ForegroundColor Red
            }
        } else {
            Write-Host "⏭️  Skipped $secret" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n⏭️  Skipping GitHub secrets (GitHub CLI not available)" -ForegroundColor Yellow
}

# Git operations (only if git is available)
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n📤 Git Operations..." -ForegroundColor Yellow
    
    # Check if we're in a git repository
    if (Test-Path ".git") {
        Write-Host "Git repository detected" -ForegroundColor Green
        
        # Add all changes
        Write-Host "Adding changes..." -ForegroundColor Cyan
        git add .
        
        # Commit changes
        $commitMessage = "WIRED CHAOS: Automated setup - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "Committing changes..." -ForegroundColor Cyan
        git commit -m $commitMessage
        
        # Push changes
        Write-Host "Pushing to remote..." -ForegroundColor Cyan
        try {
            git push
            Write-Host "✅ Changes pushed successfully" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Push failed - you may need to authenticate or check your remote" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Not a git repository - skipping git operations" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️  Skipping git operations (Git not available)" -ForegroundColor Yellow
}

# Trigger workflows (only if gh CLI is available)
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "`n🚀 GitHub Actions..." -ForegroundColor Yellow
    
    # List available workflows
    try {
        $workflows = gh workflow list --json name,path
        if ($workflows) {
            Write-Host "Available workflows:" -ForegroundColor Cyan
            gh workflow list
            
            $triggerWorkflows = Read-Host "Do you want to trigger workflows? (y/N)"
            if ($triggerWorkflows -eq 'y' -or $triggerWorkflows -eq 'Y') {
                # Try to trigger common workflow names
                $commonWorkflows = @('deploy', 'build', 'ci', 'phase2-deploy')
                foreach ($workflow in $commonWorkflows) {
                    try {
                        gh workflow run $workflow
                        Write-Host "✅ Triggered workflow: $workflow" -ForegroundColor Green
                    } catch {
                        Write-Host "⏭️  Workflow '$workflow' not found or failed to trigger" -ForegroundColor Yellow
                    }
                }
            }
        }
    } catch {
        Write-Host "⚠️  Could not access workflows - you may need to authenticate with GitHub" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏭️  Skipping workflow triggers (GitHub CLI not available)" -ForegroundColor Yellow
}

Write-Host "`n🎉 WIRED CHAOS Setup Complete!" -ForegroundColor Green
Write-Host "✅ Project structure verified" -ForegroundColor Green
Write-Host "✅ Dependencies checked" -ForegroundColor Green
Write-Host "✅ Git operations completed (if available)" -ForegroundColor Green
Write-Host "✅ Ready for development!" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check your GitHub Actions tab for deploy status" -ForegroundColor White
Write-Host "2. Install any missing dependencies if needed" -ForegroundColor White
Write-Host "3. Review your project structure" -ForegroundColor White
Write-Host "4. Start coding! 🚀" -ForegroundColor White

Write-Host "`n📍 Repository Location: $RepoRoot" -ForegroundColor Cyan
Read-Host "`nPress Enter to exit"