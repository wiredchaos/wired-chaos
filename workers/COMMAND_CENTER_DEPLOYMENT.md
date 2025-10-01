# 🎛️ WIRED CHAOS Command Center Worker - Deployment Guide

## Overview

The Command Center Worker is a production-ready Cloudflare Worker that serves as the central command and control system for WIRED CHAOS integrations. It provides comprehensive support for Notion AI Bot commands, Wix/Zapier integrations, secure webhook handling, and administrative controls.

## Features

### ✨ Core Capabilities

- **🤖 Notion AI Bot Commands** - Execute commands via Notion integration
- **🌐 Wix Integration** - Manage Wix site content and webhooks
- **⚡ Zapier Automation** - Trigger Zapier workflows and notifications
- **🔐 HMAC Verification** - Secure webhook payload validation
- **👮 Admin Guard** - Role-based access control for privileged operations
- **🚦 Rate Limiting** - In-memory rate limiting with configurable thresholds
- **🎚️ Feature Flags** - Toggle features via environment variables
- **🔧 Helper Functions** - Comprehensive helpers for Wix, Zapier, GitHub, and Gamma

### 🛡️ Security Features

- HMAC signature verification for webhooks
- Bearer token authentication for admin endpoints
- Rate limiting per service (60-100 req/min)
- Security headers (CSP, HSTS, X-Frame-Options)
- Admin-only command execution
- IP-based rate limiting

### 📊 Supported Integrations

| Service | Commands | Features |
|---------|----------|----------|
| **Notion** | `/help`, `/status`, `/sync`, `/deploy`, `/health` | AI Bot command execution |
| **Wix** | `/wix/site`, `/wix/update`, `/wix/webhook/trigger` | Content management, webhooks |
| **Zapier** | `/zap/trigger`, `/zap/notify`, `/zap/sync` | Workflow automation |
| **GitHub** | Webhook processing | PR merges, deployments, issue comments |
| **Gamma** | API integration | Presentation creation, exports |

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Required API tokens and credentials (see below)
- Access to target services (Wix, Zapier, GitHub, Gamma, Notion)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos/workers
```

### 2. Configure Wrangler

Create or update `wrangler.toml`:

```toml
name = "wired-chaos-command-center"
main = "command-center.js"
compatibility_date = "2025-09-30"
account_id = "your_cloudflare_account_id"

[env.production]
name = "command-center-prod"
vars = { 
  GITHUB_OWNER = "wiredchaos",
  GITHUB_REPO = "wired-chaos"
}

[env.staging]
name = "command-center-staging"
vars = { 
  GITHUB_OWNER = "wiredchaos",
  GITHUB_REPO = "wired-chaos"
}
```

### 3. Set Required Secrets

```bash
# Admin authentication
echo "admin-user-1,admin-user-2" | wrangler secret put ADMIN_IDS
echo "secret-token-1,secret-token-2" | wrangler secret put ADMIN_TOKENS

# Wix integration
echo "your_wix_api_token" | wrangler secret put WIX_API_TOKEN
echo "your_wix_site_id" | wrangler secret put WIX_SITE_ID

# Zapier integration
echo "your_zapier_webhook_url" | wrangler secret put ZAPIER_WEBHOOK_URL

# GitHub integration
echo "your_github_token" | wrangler secret put GITHUB_TOKEN
echo "your_github_webhook_secret" | wrangler secret put GITHUB_WEBHOOK_SECRET

# Gamma integration
echo "your_gamma_api_key" | wrangler secret put GAMMA_API_KEY

# Notion integration
echo "your_notion_api_key" | wrangler secret put NOTION_API_KEY

# Webhook security
echo "your_webhook_secret" | wrangler secret put WEBHOOK_SECRET
```

### 4. Deploy Worker

```bash
# Deploy to production
wrangler deploy --env production

# Deploy to staging
wrangler deploy --env staging

# Test deployment
curl https://command-center-prod.your-subdomain.workers.dev/health
```

## Environment Variables

### Required Variables

#### Core Configuration
- `ADMIN_IDS` - Comma-separated list of admin user IDs
- `ADMIN_TOKENS` - Comma-separated list of admin API tokens

#### Wix Integration
- `WIX_API_TOKEN` - Wix API authentication token
- `WIX_SITE_ID` - Target Wix site ID
- `WIX_ACCESS_TOKEN` - Wix OAuth access token (alternative)

#### Zapier Integration
- `ZAPIER_WEBHOOK_URL` - Zapier webhook URL or hook ID

#### GitHub Integration
- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_WEBHOOK_SECRET` - Secret for webhook verification

#### Gamma Integration
- `GAMMA_API_KEY` - Gamma application API key

#### Notion Integration
- `NOTION_API_KEY` - Notion integration API key

#### Security
- `WEBHOOK_SECRET` - Shared secret for HMAC verification

### Optional Variables

#### Public Configuration (wrangler.toml vars)
- `GITHUB_OWNER` - Repository owner (default: wiredchaos)
- `GITHUB_REPO` - Repository name (default: wired-chaos)

#### Feature Flags (override defaults)
- `FEATURE_NOTION_COMMANDS` - Enable Notion commands (default: true)
- `FEATURE_WIX_INTEGRATION` - Enable Wix integration (default: true)
- `FEATURE_ZAPIER_INTEGRATION` - Enable Zapier integration (default: true)
- `FEATURE_GITHUB_WEBHOOKS` - Enable GitHub webhooks (default: true)
- `FEATURE_GAMMA_INTEGRATION` - Enable Gamma integration (default: true)
- `FEATURE_ADMIN_COMMANDS` - Enable admin commands (default: true)
- `FEATURE_RATE_LIMITING` - Enable rate limiting (default: true)
- `FEATURE_HMAC_VERIFICATION` - Enable HMAC verification (default: true)
- `FEATURE_DEBUG_MODE` - Enable debug logging (default: false)

## API Endpoints

### Health Check

```bash
# Basic health check
GET /health
GET /

# Response
{
  "success": true,
  "message": "Command Center is operational",
  "data": {
    "status": "healthy",
    "uptime": "N/A",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "wix": true,
      "zapier": true,
      "github": true,
      "gamma": true,
      "notion": true
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "branding": "WIRED CHAOS Command Center"
}
```

### Notion Commands

```bash
# Execute Notion command
POST /notion
POST /command

# Request body
{
  "command": "/help"
}

# Response
{
  "success": true,
  "message": "Command 'help' executed",
  "data": {
    "message": "WIRED CHAOS Command Center - Available Commands",
    "commands": [...]
  }
}
```

#### Available Commands

- `/help` - Show available commands
- `/status` - Check system status
- `/sync [target]` - Sync content (wix, gamma, all)
- `/deploy [environment]` - Trigger deployment (staging, production)
- `/health` - Check health of all services

### Wix Commands

```bash
# Get site info
GET /wix/site
GET /wix/site/info

# Update content
POST /wix/update
Content-Type: application/json

{
  "collectionId": "your_collection",
  "data": {
    "title": "New Content",
    "content": "..."
  }
}

# Trigger webhook
POST /wix/webhook/trigger
Content-Type: application/json

{
  "webhookUrl": "https://your-webhook-url.com",
  "payload": {...}
}
```

### Zapier Commands

```bash
# Trigger Zap
POST /zap/trigger
Content-Type: application/json

{
  "hookId": "your_hook_id",
  "payload": {...}
}

# Send notification
POST /zap/notify
Content-Type: application/json

{
  "hookId": "your_hook_id",
  "message": "Notification text",
  "metadata": {...}
}

# Sync content
POST /zap/sync
Content-Type: application/json

{
  "hookId": "your_hook_id",
  "type": "wix",
  "content": {...}
}
```

### GitHub Webhooks

```bash
# Webhook endpoint
POST /webhook/github
X-GitHub-Event: pull_request
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "action": "closed",
  "pull_request": {...}
}
```

### Admin Commands

```bash
# Get admin status
GET /admin/status
Authorization: Bearer your_admin_token

# Reset rate limit
POST /admin/reset-rate-limit
Authorization: Bearer your_admin_token
Content-Type: application/json

{
  "service": "wix",
  "identifier": "192.168.1.1"
}
```

## Rate Limits

Default rate limits (per minute):

| Service | Requests/Min | Window |
|---------|--------------|--------|
| Default | 60 | 60s |
| Wix | 100 | 60s |
| Zapier | 50 | 60s |
| Notion | 30 | 60s |
| GitHub | 100 | 60s |
| Gamma | 50 | 60s |

Rate limits are enforced per IP address or client identifier.

## Testing

### Local Development

```bash
# Start local development server
wrangler dev workers/command-center.js

# Test health endpoint
curl http://localhost:8787/health

# Test Notion command
curl -X POST http://localhost:8787/notion \
  -H "Content-Type: application/json" \
  -d '{"command": "/help"}'
```

### Production Testing

```bash
# Test health
curl https://command-center-prod.your-subdomain.workers.dev/health

# Test Notion command
curl -X POST https://command-center-prod.your-subdomain.workers.dev/notion \
  -H "Content-Type: application/json" \
  -d '{"command": "/status"}'

# Test Wix integration
curl https://command-center-prod.your-subdomain.workers.dev/wix/site

# Test admin endpoint
curl https://command-center-prod.your-subdomain.workers.dev/admin/status \
  -H "Authorization: Bearer your_admin_token"
```

### Integration Tests

```bash
# Test GitHub webhook
curl -X POST https://command-center-prod.your-subdomain.workers.dev/webhook/github \
  -H "X-GitHub-Event: pull_request" \
  -H "X-Hub-Signature-256: sha256=your_signature" \
  -H "Content-Type: application/json" \
  -d @test-webhook-payload.json

# Test Zapier integration
curl -X POST https://command-center-prod.your-subdomain.workers.dev/zap/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'
```

## Monitoring

### View Logs

```bash
# Tail logs in real-time
wrangler tail --env production

# Filter for errors
wrangler tail --env production --format json | jq 'select(.outcome == "exception")'

# View logs for specific endpoint
wrangler tail --env production | grep "/wix"
```

### Metrics

Check Cloudflare dashboard for:
- Request count
- Error rate
- Response time (p50, p95, p99)
- CPU time
- Memory usage

### Alerts

Set up alerts in Cloudflare dashboard:
- Error rate > 5%
- Response time > 1000ms
- CPU time > 50ms
- Rate limit violations

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error**: `401 Unauthorized` or `UNAUTHORIZED`

**Solution**:
```bash
# Verify secrets are set
wrangler secret list

# Update secret
echo "new_token" | wrangler secret put SECRET_NAME

# Test with curl
curl -H "Authorization: Bearer your_token" https://your-worker.workers.dev/admin/status
```

#### 2. Rate Limiting

**Error**: `429 Too Many Requests` or `RATE_LIMIT`

**Solution**:
- Wait for rate limit window to expire (60 seconds)
- Adjust rate limits in code if needed
- Use admin endpoint to reset specific rate limit
- Consider implementing request queuing

#### 3. HMAC Verification Failed

**Error**: `401 Invalid signature` or `INVALID_SIGNATURE`

**Solution**:
```bash
# Ensure webhook secret is set correctly
echo "correct_secret" | wrangler secret put WEBHOOK_SECRET

# Verify signature calculation matches
# GitHub: X-Hub-Signature-256: sha256=...
# Custom: Use HMAC-SHA256
```

#### 4. Feature Disabled

**Error**: `503 Service Unavailable` or `DISABLED`

**Solution**:
```bash
# Enable feature flag via environment variable
wrangler secret put FEATURE_WIX_INTEGRATION <<< "true"

# Or update code to enable by default
```

#### 5. Worker Deployment Failed

**Error**: `Deploy failed` or `Validation error`

**Solution**:
```bash
# Check wrangler configuration
cat wrangler.toml

# Verify Cloudflare credentials
wrangler whoami

# Re-authenticate if needed
wrangler login

# Try deploying again
wrangler deploy --env production
```

### Debug Mode

Enable debug logging:

```bash
# Set debug mode via environment variable
echo "true" | wrangler secret put FEATURE_DEBUG_MODE

# Or update FEATURE_FLAGS.DEBUG_MODE in code
```

View debug logs:

```bash
wrangler tail --env production --format pretty
```

## Security Best Practices

### Secret Management

✅ **DO:**
- Store all credentials in Worker secrets (not in code)
- Use HMAC verification for webhooks
- Rotate tokens regularly (quarterly)
- Use separate tokens for staging/production
- Implement IP allowlisting if possible

❌ **DON'T:**
- Commit secrets to repository
- Share secrets in logs or error messages
- Use the same token across environments
- Expose admin tokens in client-side code

### Network Security

- All endpoints use HTTPS
- Webhook signatures are verified
- Rate limiting prevents abuse
- CORS headers restrict access
- Security headers prevent common attacks

### Audit Logging

Enable debug mode to log all requests:

```javascript
FEATURE_FLAGS.DEBUG_MODE = true;
```

Logs include:
- Timestamp
- HTTP method and URL
- Client IP address
- User agent
- Request metadata

### Compliance

- No PII stored without consent
- Data retention: In-memory only (cleared on restart)
- Secure transmission: TLS 1.3
- GDPR compliant by design

## Performance Optimization

### Caching

Consider implementing caching for:
- Wix site info (TTL: 5 minutes)
- GitHub repository data (TTL: 10 minutes)
- Gamma presentations (TTL: 10 minutes)

### Request Optimization

- Use Promise.all() for parallel requests
- Implement request batching where possible
- Set appropriate timeouts
- Handle errors gracefully

### Rate Limit Tuning

Adjust rate limits based on usage patterns:

```javascript
const RATE_LIMITS = {
  WIX: { requests: 200, window: 60000 },  // Increase if needed
  // ...
};
```

## Maintenance

### Regular Tasks

- **Daily**: Review logs for errors
- **Weekly**: Check rate limit metrics
- **Monthly**: Rotate API tokens
- **Quarterly**: Update dependencies

### Updates

```bash
# Update Wrangler
npm install -g wrangler@latest

# Redeploy with updates
wrangler deploy --env production

# Test after deployment
curl https://your-worker.workers.dev/health
```

### Rollback

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback --message "Rolling back due to issue"
```

## GitHub Actions Integration

### Workflow Example

```yaml
name: Deploy Command Center

on:
  push:
    branches: [main]
    paths:
      - 'workers/command-center.js'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: workers
          command: deploy --env production
```

### Automated Testing

```yaml
- name: Test Worker
  run: |
    # Wait for deployment
    sleep 10
    
    # Test health endpoint
    curl -f https://command-center-prod.workers.dev/health
    
    # Test Notion command
    curl -f -X POST https://command-center-prod.workers.dev/notion \
      -H "Content-Type: application/json" \
      -d '{"command": "/status"}'
```

## VSCode NO TOUCH INFRA AUTOMATION Assignment

**Assignment**: This PR should be assigned to the **VSCode NO TOUCH INFRA AUTOMATION** system for automated review and merge.

The system will:
1. Validate worker syntax and configuration
2. Check environment variable documentation
3. Verify security best practices
4. Run integration tests
5. Deploy to staging environment
6. Approve and merge if all checks pass
7. Deploy to production environment

## Support

### Resources

- 📚 [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- 📚 [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- 📚 [WIRED CHAOS Integration Guides](../INTEGRATION_SETUP.md)

### Contact

- 💬 Discord: #command-center channel
- 📧 Email: support@wiredchaos.xyz
- 🐛 Issues: GitHub Issues tracker

---

**WIRED CHAOS Command Center** - Centralized control for all integrations ⚡

Last Updated: 2024
Version: 1.0.0
