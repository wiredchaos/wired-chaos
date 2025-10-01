# 🎛️ Command Center Quick Reference

## 🚀 Quick Deploy

```bash
# 1. Configure wrangler.toml
cp command-center-wrangler.toml wrangler.toml
# Edit account_id and routes

# 2. Set required secrets
./setup-command-center.sh

# 3. Deploy
wrangler deploy --env production
```

## 📡 API Endpoints

### Health & Status
```bash
GET  /health              # Health check
GET  /                    # Root (same as health)
```

### Notion AI Bot Commands
```bash
POST /notion             # Execute Notion command
POST /command            # Alternative endpoint

# Commands:
# - /help     - Show available commands
# - /status   - System status
# - /sync     - Sync content
# - /deploy   - Trigger deployment
# - /health   - Service health
```

### Wix Integration
```bash
GET  /wix/site           # Get site info
POST /wix/update         # Update content
POST /wix/webhook/trigger # Trigger webhook
```

### Zapier Integration
```bash
POST /zap/trigger        # Trigger Zap
POST /zap/notify         # Send notification
POST /zap/sync           # Sync content
```

### GitHub Webhooks
```bash
POST /webhook/github     # GitHub webhook handler
```

### Admin Commands (requires auth)
```bash
GET  /admin/status       # Admin status
POST /admin/reset-rate-limit # Reset rate limit
```

## 🔑 Required Secrets

```bash
# Core
ADMIN_IDS
ADMIN_TOKENS

# Integrations
WIX_API_TOKEN
WIX_SITE_ID
ZAPIER_WEBHOOK_URL
GITHUB_TOKEN
GITHUB_WEBHOOK_SECRET
GAMMA_API_KEY
NOTION_API_KEY
WEBHOOK_SECRET
```

## 🎯 Quick Examples

### Test Health
```bash
curl https://your-worker.workers.dev/health
```

### Execute Notion Command
```bash
curl -X POST https://your-worker.workers.dev/notion \
  -H "Content-Type: application/json" \
  -d '{"command": "/status"}'
```

### Trigger Zapier Workflow
```bash
curl -X POST https://your-worker.workers.dev/zap/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'
```

### Update Wix Content
```bash
curl -X POST https://your-worker.workers.dev/wix/update \
  -H "Content-Type: application/json" \
  -d '{"collectionId": "posts", "data": {"title": "New Post"}}'
```

### Admin Status (requires token)
```bash
curl https://your-worker.workers.dev/admin/status \
  -H "Authorization: Bearer your_admin_token"
```

## 🚦 Rate Limits (per minute)

| Service | Limit |
|---------|-------|
| Default | 60    |
| Wix     | 100   |
| Zapier  | 50    |
| Notion  | 30    |
| GitHub  | 100   |
| Gamma   | 50    |

## 🛠️ Troubleshooting

### Check Logs
```bash
wrangler tail --env production
```

### List Secrets
```bash
wrangler secret list
```

### Update Secret
```bash
echo "new_value" | wrangler secret put SECRET_NAME
```

### Rollback Deployment
```bash
wrangler rollback --message "Issue found"
```

## 🎚️ Feature Flags

Override via environment variables:

```bash
FEATURE_NOTION_COMMANDS=true
FEATURE_WIX_INTEGRATION=true
FEATURE_ZAPIER_INTEGRATION=true
FEATURE_GITHUB_WEBHOOKS=true
FEATURE_GAMMA_INTEGRATION=true
FEATURE_ADMIN_COMMANDS=true
FEATURE_RATE_LIMITING=true
FEATURE_HMAC_VERIFICATION=true
FEATURE_DEBUG_MODE=false
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00Z",
  "branding": "WIRED CHAOS Command Center"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": null
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "branding": "WIRED CHAOS Command Center"
}
```

## 🔐 Security Headers

All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 📞 Support

- **Docs**: [COMMAND_CENTER_DEPLOYMENT.md](./COMMAND_CENTER_DEPLOYMENT.md)
- **Discord**: #command-center
- **Email**: support@wiredchaos.xyz

---

**WIRED CHAOS Command Center** ⚡ Version 1.0.0
