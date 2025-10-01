# 🎛️ WIRED CHAOS Workers

This directory contains Cloudflare Workers for the WIRED CHAOS ecosystem.

## Workers

### Command Center (`command-center.js`)

**Production-ready command and control worker** for WIRED CHAOS integrations.

**Features:**
- 🤖 Notion AI Bot command execution
- 🌐 Wix integration (site management, content updates, webhooks)
- ⚡ Zapier workflow automation
- 🔐 HMAC webhook verification
- 👮 Admin access control
- 🚦 In-memory rate limiting
- 🎚️ Feature flag system
- 🔧 Helper functions for Wix, Zapier, GitHub, and Gamma

**Quick Start:**
```bash
cd workers
./setup-command-center.sh production
```

**Documentation:**
- [Deployment Guide](COMMAND_CENTER_DEPLOYMENT.md) - Complete setup and deployment instructions
- [Quick Reference](COMMAND_CENTER_QUICK_REFERENCE.md) - API endpoints and examples
- [Wrangler Config](command-center-wrangler.toml) - Configuration template

**API Endpoints:**
- `GET /health` - Health check
- `POST /notion` - Notion AI Bot commands
- `GET /wix/*` - Wix integration
- `POST /zap/*` - Zapier automation
- `POST /webhook/github` - GitHub webhooks
- `GET /admin/*` - Admin commands (auth required)

### Suite Landing (`suite-landing/`)

**Landing page worker** for WIRED CHAOS Suite.

## Getting Started

### Prerequisites

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Cloudflare account
- Required API tokens and credentials

### Installation

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate**
   ```bash
   wrangler login
   ```

3. **Configure Worker**
   ```bash
   cd workers
   cp command-center-wrangler.toml wrangler.toml
   # Edit wrangler.toml with your settings
   ```

4. **Set Secrets**
   ```bash
   ./setup-command-center.sh
   # Or manually: echo "value" | wrangler secret put SECRET_NAME
   ```

5. **Deploy**
   ```bash
   wrangler deploy --env production
   ```

## Directory Structure

```
workers/
├── command-center.js                    # Command center worker
├── command-center-wrangler.toml         # Wrangler config template
├── COMMAND_CENTER_DEPLOYMENT.md         # Deployment guide
├── COMMAND_CENTER_QUICK_REFERENCE.md    # Quick reference
├── setup-command-center.sh              # Setup script
├── suite-landing/                       # Suite landing worker
│   ├── index.js
│   └── suite-landing.test.js
└── README.md                            # This file
```

## Environment Variables

### Required for Command Center

**Core:**
- `ADMIN_IDS` - Admin user IDs (comma-separated)
- `ADMIN_TOKENS` - Admin API tokens (comma-separated)

**Integrations:**
- `WIX_API_TOKEN` - Wix API token
- `WIX_SITE_ID` - Wix site ID
- `ZAPIER_WEBHOOK_URL` - Zapier webhook URL
- `GITHUB_TOKEN` - GitHub access token
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret
- `GAMMA_API_KEY` - Gamma API key
- `NOTION_API_KEY` - Notion API key
- `WEBHOOK_SECRET` - General webhook secret

See [COMMAND_CENTER_DEPLOYMENT.md](COMMAND_CENTER_DEPLOYMENT.md) for complete list.

## Development

### Local Development

```bash
# Start local dev server
wrangler dev command-center.js

# Test locally
curl http://localhost:8787/health
```

### Testing

```bash
# Test health endpoint
curl https://your-worker.workers.dev/health

# Test Notion command
curl -X POST https://your-worker.workers.dev/notion \
  -H "Content-Type: application/json" \
  -d '{"command": "/status"}'
```

### Monitoring

```bash
# View real-time logs
wrangler tail --env production

# View deployment history
wrangler deployments list --env production
```

## Deployment

### Deploy to Production

```bash
wrangler deploy --env production
```

### Deploy to Staging

```bash
wrangler deploy --env staging
```

### Rollback

```bash
wrangler rollback --message "Rolling back deployment"
```

## Rate Limits

Default limits (per minute):

| Service | Requests |
|---------|----------|
| Default | 60       |
| Wix     | 100      |
| Zapier  | 50       |
| Notion  | 30       |
| GitHub  | 100      |
| Gamma   | 50       |

## Security

- All endpoints use HTTPS
- HMAC verification for webhooks
- Bearer token authentication for admin endpoints
- Rate limiting per IP/client
- Security headers on all responses
- No sensitive data logged

## Support

- 📚 [Full Documentation](COMMAND_CENTER_DEPLOYMENT.md)
- 💬 Discord: #workers channel
- 📧 Email: support@wiredchaos.xyz
- 🐛 Issues: GitHub Issues

## VSCode NO TOUCH INFRA AUTOMATION

This PR is assigned to the **VSCode NO TOUCH INFRA AUTOMATION** system for:
- Automated validation
- Integration testing
- Staging deployment
- Production deployment
- Automated merge on success

## License

MIT License - See [LICENSE](../LICENSE) for details

---

**WIRED CHAOS Workers** ⚡ Built with Cloudflare Workers
