# WIRED CHAOS EMERGENT - VSCode Extension

Comprehensive automation for PR management, conflict resolution, and Cloudflare deployment.

## Features

- 🔄 **Automated PR Management**: Convert drafts to ready, merge in dependency order
- 🔧 **Intelligent Conflict Resolution**: Auto-resolve common merge conflicts
- ☁️ **Cloudflare Deployment**: Automated deployment to Cloudflare Edge
- 🔥 **Smoke Testing**: Comprehensive endpoint validation
- 🎯 **System Fixes**: Tax suite and two-tier firewall fixes

## Installation

### Option 1: Install from VSIX (Recommended)

1. Build the extension:
```bash
cd wired-chaos-emergent
npm install
npm run compile
```

2. Package the extension:
```bash
npm install -g vsce
vsce package
```

3. Install in VSCode:
- Open VSCode
- Go to Extensions view (Ctrl+Shift+X)
- Click `...` → Install from VSIX
- Select the generated `.vsix` file

### Option 2: Development Mode

1. Open the `wired-chaos-emergent` folder in VSCode
2. Press F5 to launch Extension Development Host
3. Use the commands in the new VSCode window

## Configuration

Configure the extension via VSCode settings:

```json
{
  "wiredChaos.githubToken": "ghp_...",
  "wiredChaos.cloudflareToken": "...",
  "wiredChaos.cloudflareAccountId": "...",
  "wiredChaos.cloudflareProjectName": "wired-chaos",
  "wiredChaos.discordWebhook": "https://discord.com/api/webhooks/..."
}
```

Or set via environment variables:
```bash
export GITHUB_TOKEN="ghp_..."
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export DISCORD_WEBHOOK_URL="..."
```

## Usage

### Command Palette Commands

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type:

- **EMERGENT: Deploy All** - Full deployment automation sequence
- **EMERGENT: Manage Pull Requests** - Convert drafts and check PR status
- **EMERGENT: Resolve PR Conflicts** - Auto-resolve merge conflicts
- **EMERGENT: Deploy to Cloudflare** - Deploy worker and frontend
- **EMERGENT: Run Smoke Tests** - Validate all endpoints

### Status Bar

Click the `🚀 EMERGENT` button in the status bar to run full deployment.

### Shell Scripts

You can also run the automation scripts directly:

```bash
# Full deployment
./wired-chaos-emergent/scripts/emergent-deploy.sh

# Conflict resolution for specific PR
node ./wired-chaos-emergent/scripts/conflict-resolution.js 22

# Run smoke tests
node ./wired-chaos-emergent/scripts/smoke-tests.js

# Fix tax suite integration
node ./wired-chaos-emergent/scripts/tax-suite-fix.js

# Fix two-tier firewall
node ./wired-chaos-emergent/scripts/firewall-fix.js
```

## Deployment Sequence

The full deployment follows this order:

1. **PR Management**
   - Convert draft PRs to ready
   - Display PR status

2. **Conflict Resolution**
   - Auto-resolve merge conflicts using intelligent strategies
   - Manual intervention flagged when needed

3. **PR Merging**
   - Merge PRs in dependency order:
     - PR #23: SWARM Orchestrator Pipeline
     - PR #22: Video System (after rebase)
     - PR #24: System Patches
     - PR #25: Student Union VR/AR

4. **Cloudflare Deployment**
   - Build frontend
   - Deploy worker to Cloudflare Edge
   - Verify deployment via health check

5. **Smoke Testing**
   - Health check endpoint
   - Tax/Suite redirects
   - University audience routing
   - VSP contract generation
   - BUS event system
   - GAMMA integration endpoints

6. **System Fixes**
   - Tax suite integration
   - Two-tier school firewall

## Conflict Resolution Strategies

The extension uses intelligent strategies for common conflicts:

| File Pattern | Strategy | Reason |
|-------------|----------|---------|
| `.gitignore` | theirs (main) | Latest ignore rules |
| `package-lock.json` | theirs (main) | Lockfile consistency |
| `README.md` | theirs (main) | Comprehensive docs |
| `*.md` (others) | ours (PR) | Feature documentation |
| `*.yml` | theirs (main) | Workflow stability |
| Code files (`.js`, `.ts`) | manual | Requires review |

## Smoke Test Endpoints

Tests validate these critical endpoints:

- ✅ `/health` - Health check
- ✅ `/` - Root redirect
- ✅ `/school` - School page with Business/Esoteric toggle
- ✅ `/university?audience=business` - Business school (WCU)
- ✅ `/university?audience=esoteric` - Esoteric school (589)
- ✅ `/vsp` - Video Sales Page
- ✅ `/api/vsp/contract/generate` - Contract generation
- ✅ `/bus/status` - BUS event system status
- ✅ `/bus/poll` - BUS event polling
- ✅ `/tax` → `/suite` redirect
- ✅ `/gamma/tour` - GAMMA tour page
- ✅ `/gamma/journal` - GAMMA journal
- ✅ `/gamma/workbook` - GAMMA workbook

## Troubleshooting

### GitHub Authentication
```bash
gh auth login
gh auth status
```

### Cloudflare Authentication
```bash
wrangler login
wrangler whoami
```

### Extension Logs
- View logs: Output → WIRED CHAOS EMERGENT
- Check Developer Tools: Help → Toggle Developer Tools

### Common Issues

**PR Merge Fails**
- Check if checks are passing: `gh pr view <number>`
- Verify branch is up to date
- Check for merge conflicts

**Deployment Fails**
- Verify Cloudflare credentials
- Check wrangler.toml configuration
- Review build output

**Smoke Tests Fail**
- Ensure deployment completed
- Check endpoint URLs
- Verify CORS headers

## Development

### Project Structure

```
wired-chaos-emergent/
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript config
├── src/
│   ├── extension.ts         # Main entry point
│   ├── commands/            # Command handlers
│   ├── providers/           # API providers
│   └── utils/              # Utilities
└── scripts/                # Automation scripts
    ├── emergent-deploy.sh  # Main deployment script
    ├── conflict-resolution.js
    ├── smoke-tests.js
    ├── tax-suite-fix.js
    └── firewall-fix.js
```

### Building

```bash
npm install
npm run compile
```

### Watching for Changes

```bash
npm run watch
```

### Testing

Press F5 in VSCode to launch Extension Development Host.

## License

MIT License - See repository LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Documentation: See repository README.md

---

**WIRED CHAOS** - Automated deployment for the future 🚀
