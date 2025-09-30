# WIRED CHAOS Automation Documentation

This document describes the automated workflows and tools available in the WIRED CHAOS repository.

---

## Code Quality Fix Automation

The Code Quality Fix automation provides a comprehensive system to scan the repository, run language-appropriate linters and formatters, and optionally apply autofixes across JavaScript, CSS, Python, PowerShell, Solidity, and HTML files.

### Features

- **Multi-language support**: JavaScript/JSX, CSS, HTML, Python, PowerShell, and Solidity
- **Check-only mode**: Identify issues without modifying files
- **Apply-fixes mode**: Automatically fix issues and prepare PR
- **Infrastructure protection**: Guaranteed never to modify infrastructure files
- **Changelog generation**: Automatic summary of all changes applied

### Running from GitHub Actions

The easiest way to run code quality fixes is through GitHub Actions:

1. Go to the **Actions** tab in your repository
2. Select **"Code Quality Fix"** workflow
3. Click **"Run workflow"**
4. Configure options:
   - **apply_fixes**: 
     - `false` (default): Check-only mode - reports issues without changes
     - `true`: Apply fixes, commit to new branch, and open PR
   - **pr_title**: Customize the PR title (default: "chore(code-fix): automated code hygiene fixes")
   - **label**: Add label to the PR (default: "code-fix")
5. Click **"Run workflow"** button

#### Check-Only Mode (apply_fixes = false)

When run in check-only mode, the workflow:
- ✅ Scans all allowed source files
- ✅ Runs appropriate linters for each language
- ✅ Reports issues in the workflow log
- ❌ Does NOT modify any files
- ❌ Does NOT create branches or PRs

Use this mode to:
- Validate code quality before committing
- Get a report of potential issues
- Check what fixes would be applied

#### Apply Fixes Mode (apply_fixes = true)

When run with apply_fixes enabled, the workflow:
- ✅ Scans all allowed source files
- ✅ Runs linters with auto-fix enabled
- ✅ Creates timestamped branch (`bot/code-fix-YYYYMMDD-HHMM`)
- ✅ Commits changes with detailed message
- ✅ Generates `CODE_FIX_CHANGELOG.md`
- ✅ Opens PR with summary and verification checklist

Use this mode to:
- Automatically fix code quality issues
- Maintain consistent code style
- Apply best practices across the codebase

### Running from VS Code

For local development, use VS Code tasks:

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type: `Tasks: Run Task`
3. Select one of:
   - **"Code Fix: Check Only"** - Run checks without modifying files
   - **"Code Fix: Apply & Prepare PR"** - Apply fixes (review before committing!)
   - **"Code Fix: Generate Changelog"** - Create changelog from current changes

#### Tips for VS Code Usage

- **Review changes**: Always review with `git diff` before committing
- **Test locally**: Run check-only first to see what will be changed
- **Incremental fixes**: Fix one language at a time if needed

### Running from Command Line

#### Bash (Linux/macOS)

```bash
# Check only
./scripts/code-fix.sh --check-only

# Apply fixes
./scripts/code-fix.sh --apply-fixes

# Generate changelog
./scripts/generate-code-fix-changelog.sh
```

#### PowerShell (Windows)

```powershell
# Check only
.\scripts\code-fix.ps1 -CheckOnly

# Apply fixes
.\scripts\code-fix.ps1 -ApplyFixes

# Generate changelog
.\scripts\generate-code-fix-changelog.ps1
```

### Supported Languages and Tools

#### JavaScript/TypeScript/JSX (`.js`, `.jsx`, `.mjs`)

- **ESLint**: Identifies and fixes code quality issues
  - Command: `npx eslint --ext .js,.jsx,.mjs --fix`
- **Prettier**: Formats code consistently
  - Command: `npx prettier --write "**/*.{js,jsx,mjs}"`

#### CSS (`.css`)

- **Stylelint**: Lints and fixes CSS code
  - Command: `npx stylelint "**/*.css" --fix`

#### HTML (`.html`)

- **HTMLHint**: Validates HTML structure
  - Command: `npx htmlhint "**/*.html"`
- **Prettier**: Formats HTML consistently
  - Command: `npx prettier --write "**/*.html"`

#### Python (`.py`)

- **Black**: Opinionated code formatter (PEP 8 compliant)
  - Command: `black .`
- **Flake8**: Style guide enforcement
  - Command: `flake8`

#### PowerShell (`.ps1`, `.psm1`)

- **PSScriptAnalyzer**: Static analysis and best practices
  - Command: `Invoke-ScriptAnalyzer`

#### Solidity (`.sol`)

- **solhint**: Solidity linter with auto-fix
  - Command: `npx solhint "**/*.sol" --fix`

### File Allowlist

Only these file types can be modified by the automation:

- `**/*.js` - JavaScript files
- `**/*.jsx` - React JSX files
- `**/*.mjs` - JavaScript modules
- `**/*.css` - Stylesheets
- `**/*.html` - HTML files
- `**/*.py` - Python files
- `**/*.ps1` - PowerShell scripts
- `**/*.psm1` - PowerShell modules
- `**/*.sol` - Solidity smart contracts

### Infrastructure Denylist (Never Modified)

The following files and directories are **NEVER** modified by the automation:

- `.github/**` - GitHub Actions workflows and configurations
- `.devcontainer/**` - Development container configurations
- `**/Dockerfile` - Docker build files
- `**/docker/**` - Docker-related files
- `**/infra/**` - Infrastructure as Code
- `**/terraform/**` - Terraform configurations
- `**/ansible/**` - Ansible playbooks
- `**/deploy/**` - Deployment scripts
- `**/wrangler.toml` - Cloudflare Worker configuration
- `**/cloudflare*.{toml,yml,yaml}` - Cloudflare configurations
- `**/pages*.{yml,yaml}` - Pages configurations
- `**/.vscode/**` - VS Code workspace settings (except tasks.json)
- `**/node_modules/**` - Dependencies
- `**/dist/**`, `**/build/**` - Build outputs

### Safety Guarantees

1. **Infrastructure Protection**: Infrastructure files are never modified
2. **Isolated Branches**: All fixes are committed to separate timestamped branches
3. **Review Process**: Changes require PR review before merging to main
4. **Comprehensive Logging**: All actions logged in workflow and changelog
5. **Rollback Support**: Easy to revert via Git if needed
6. **No Breaking Changes**: Only formatting and style fixes, no logic changes

### Changelog Output

When fixes are applied, a `CODE_FIX_CHANGELOG.md` file is generated containing:

- **Timestamp**: When fixes were applied
- **File counts**: Number of files changed per language
- **Tools used**: Which linters/formatters ran
- **Changed files**: Complete list of modified files
- **Statistics**: Git diff stats
- **Verification**: Confirmation that denylist was respected

### Extending the Automation

To add support for a new language or tool:

1. **Update scripts**: Add commands to `scripts/code-fix.sh` and `scripts/code-fix.ps1`
2. **Update workflow**: Add tool installation to `.github/workflows/code-fix.yml`
3. **Update allowlist**: Add file extensions to the allowlist in all scripts
4. **Update documentation**: Document the new tool in this file
5. **Test thoroughly**: Ensure denylist is respected

### Troubleshooting

#### Workflow fails with "Node.js not found"
- The workflow uses Node.js 20 by default
- Check if the setup-node action is working
- Ensure runner has internet access to download Node.js

#### Linter tool not found locally
- Install the tool manually: `npm install -g eslint prettier stylelint`
- Or let the scripts install them: they use `npx` which auto-installs

#### PowerShell script execution policy error
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### No changes detected when there should be
- Verify files match the allowlist patterns
- Check if files are in the denylist
- Ensure linters are configured correctly

#### PR creation fails
- Ensure workflow has `contents: write` and `pull-requests: write` permissions
- Check that `GITHUB_TOKEN` is available
- Verify branch creation succeeded

### Best Practices

1. **Run check-only first**: Always run in check-only mode before applying fixes
2. **Review PRs carefully**: Code quality tools can sometimes be overly aggressive
3. **Test after fixes**: Ensure functionality wasn't affected by formatting changes
4. **Regular runs**: Schedule periodic runs to maintain code quality
5. **Language-specific configs**: Add `.eslintrc`, `.prettierrc`, etc. for custom rules

### Related Documentation

- **Megaprompt**: See `scripts/MEGAPROMPT.md` for detailed automation instructions
- **Scripts**: All automation scripts are in `scripts/` directory
- **Workflow**: Full workflow definition in `.github/workflows/code-fix.yml`
- **VS Code Tasks**: Task definitions in `.vscode/tasks.json`

---

## Other Automations

### Security Remediation

See `AUTOMATION_README.md` for the automated security vulnerability remediation system.

### VS Studio Bot

See `VS_STUDIO_BOT_README.md` for the VS Studio Bot automation system.

---

*Last updated: Code Quality Fix Automation implementation*
