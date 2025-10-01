# Megaprompt for VS Studio Bot Automation

## Code Quality Fix Automation

This automation implements a comprehensive code quality fix system that scans the repository, runs language-appropriate linters/formatters, and optionally applies autofixes across multiple languages.

### Supported Languages & Tools

#### JavaScript/TypeScript/JSX
- **ESLint**: Linting and auto-fixing
  - Command: `npx eslint --ext .js,.jsx,.mjs --fix`
- **Prettier**: Code formatting
  - Command: `npx prettier --write`

#### CSS
- **Stylelint**: CSS linting and auto-fixing
  - Command: `npx stylelint "**/*.{css}" --fix`

#### HTML
- **HTMLHint**: HTML validation
  - Command: `npx htmlhint`
- **Prettier**: HTML formatting
  - Command: `npx prettier --write "**/*.html"`

#### Python
- **Black**: Code formatter
  - Command: `black .`
- **Flake8**: Code linter
  - Command: `flake8`

#### PowerShell
- **PSScriptAnalyzer**: PowerShell static analysis
  - Command: `Invoke-ScriptAnalyzer`

#### Solidity
- **solhint**: Solidity linter
  - Command: `npx solhint "**/*.sol" --fix`

### File Allowlist

Only these file types can be modified by the automation:
- `**/*.{js,jsx,mjs,css,html,py,ps1,psm1,sol}`

### File Denylist (Never Modified)

Infrastructure and configuration files are never touched:
- `.github/**` - GitHub Actions and configurations
- `.devcontainer/**` - Development container configs
- `**/Dockerfile` - Docker configurations
- `**/docker/**` - Docker-related files
- `**/infra/**` - Infrastructure code
- `**/terraform/**` - Terraform configurations
- `**/ansible/**` - Ansible playbooks
- `**/deploy/**` - Deployment scripts
- `**/wrangler.toml` - Cloudflare Worker config
- `**/cloudflare*.{toml,yml,yaml}` - Cloudflare configs
- `**/pages*.{yml,yaml}` - Pages configurations
- `**/.vscode/**` - VS Code settings (except tasks.json created by this automation)

### Workflow Features

1. **Check-Only Mode**: Runs linters and reports issues without making changes
2. **Apply Fixes Mode**: Runs linters with auto-fix, commits changes, and opens a PR
3. **Changelog Generation**: Creates `CODE_FIX_CHANGELOG.md` summarizing all changes
4. **Branch Management**: Creates timestamped branches (`bot/code-fix-YYYYMMDD-HHMM`)
5. **PR Automation**: Automatically opens PRs with comprehensive descriptions

### Usage

#### From GitHub Actions
1. Navigate to Actions tab
2. Select "Code Quality Fix" workflow
3. Click "Run workflow"
4. Choose options:
   - `apply_fixes`: false (check-only) or true (apply and PR)
   - `pr_title`: Customize PR title
   - `label`: Add labels to PR

#### From VS Code
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "Tasks: Run Task"
3. Select:
   - "Code Fix: Check Only" - Runs checks without modifying files
   - "Code Fix: Apply & PR" - Applies fixes and prepares for PR

#### From Command Line

**Bash (Linux/macOS):**
```bash
# Check only
./scripts/code-fix.sh --check-only

# Apply fixes
./scripts/code-fix.sh --apply-fixes

# Generate changelog
./scripts/generate-code-fix-changelog.sh
```

**PowerShell (Windows):**
```powershell
# Check only
.\scripts\code-fix.ps1 -CheckOnly

# Apply fixes
.\scripts\code-fix.ps1 -ApplyFixes

# Generate changelog
.\scripts\generate-code-fix-changelog.ps1
```

### Safety Guarantees

1. **No Infrastructure Changes**: Infrastructure files are never modified
2. **Isolated Branches**: All fixes are committed to separate branches
3. **Review Process**: Changes require PR review before merging
4. **Comprehensive Logging**: All actions are logged and traceable
5. **Rollback Support**: Changes can be easily reverted via Git

### Extending the Automation

To add support for a new language:

1. Add tool installation to workflow setup
2. Add lint/format commands to scripts
3. Add file extensions to allowlist
4. Update this documentation

### Output Files

- `CODE_FIX_CHANGELOG.md`: Summary of all changes applied
- Workflow logs: Available in GitHub Actions interface
- Local logs: Printed to console during script execution
