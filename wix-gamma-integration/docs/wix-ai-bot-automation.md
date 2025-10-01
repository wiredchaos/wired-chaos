# 🤖 Wix AI Bot Automation Guide

Complete guide for automating the Wired Chaos ecosystem using the Wix AI Bot integration.

## Table of Contents

- [Overview](#overview)
- [Setup and Configuration](#setup-and-configuration)
- [GitHub Actions Integration](#github-actions-integration)
- [API Reference](#api-reference)
- [Webhook Configuration](#webhook-configuration)
- [Event Payloads](#event-payloads)
- [Testing](#testing)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Overview

The Wix AI Bot automation enables seamless integration between your GitHub repository and Wix website, allowing automated content updates, notifications, and landing page management based on repository events.

### Key Features

✅ **Automated Landing Page Updates** - Update Wix pages on PR merges  
✅ **Real-time Notifications** - Send notifications on deployments  
✅ **Content Synchronization** - Sync GitHub content to Wix  
✅ **Secure Webhook Handling** - HMAC signature verification  
✅ **Retry Logic** - Automatic retries with exponential backoff  
✅ **Monitoring & Alerting** - Discord/Telegram notifications on failures  

## Setup and Configuration

### 1. Wix AI Bot Setup

1. **Access Wix AI Bot Dashboard**
   - Navigate to: https://manage.wix.com/dashboard/7aa81323-433d-4763-b6dc-5d98d409c459/custom-agent
   - Log in with your Wix account

2. **Get API Credentials**
   - Generate an API token in Wix Developer Console
   - Note your Site ID from the Wix dashboard URL
   - (Optional) Generate webhook secret for signature verification

3. **Configure Bot Permissions**
   - Enable Site API access
   - Enable Content API access
   - Enable Page Management permissions

### 2. GitHub Repository Setup

Add the following secrets to your GitHub repository:

#### Required Secrets

```bash
WIX_API_TOKEN        # Wix API authentication token
WIX_SITE_ID          # Your Wix site ID
```

#### Optional Secrets

```bash
WIX_AI_BOT_URL       # Custom Wix AI Bot endpoint (if different)
WIX_WEBHOOK_SECRET   # Secret for webhook signature verification
DISCORD_WEBHOOK_URL  # Discord webhook for notifications
TELEGRAM_BOT_TOKEN   # Telegram bot token for notifications
TELEGRAM_CHAT_ID     # Telegram chat ID for notifications
```

#### Add Secrets via GitHub CLI

```bash
# Required secrets
gh secret set WIX_API_TOKEN --body "your_api_token"
gh secret set WIX_SITE_ID --body "your_site_id"

# Optional secrets
gh secret set WIX_AI_BOT_URL --body "https://your-custom-endpoint.com"
gh secret set WIX_WEBHOOK_SECRET --body "your_webhook_secret"
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..."
```

### 3. Cloudflare Worker Setup

Configure the integration worker with Wix AI Bot credentials:

```bash
cd wix-gamma-integration/cloudflare/workers

# Set secrets
echo "your_wix_api_token" | wrangler secret put WIX_API_TOKEN
echo "your_wix_site_id" | wrangler secret put WIX_SITE_ID
echo "your_webhook_secret" | wrangler secret put WIX_WEBHOOK_SECRET

# Deploy
wrangler deploy
```

## GitHub Actions Integration

The workflow automatically triggers on:

- **Pull Request Merges** - Updates landing page
- **Push to Main** - Syncs content
- **Deployments** - Sends notifications
- **Manual Dispatch** - Custom actions

### Workflow Configuration

The workflow is located at `.github/workflows/wix-ai-bot-automation.yml`

### Trigger Workflow Manually

```bash
# Update landing page
gh workflow run wix-ai-bot-automation.yml \
  -f action=update_landing_page \
  -f message="Custom update message"

# Send notification
gh workflow run wix-ai-bot-automation.yml \
  -f action=send_notification \
  -f message="Deployment completed!"

# Sync content
gh workflow run wix-ai-bot-automation.yml \
  -f action=sync_content

# Test connection
gh workflow run wix-ai-bot-automation.yml \
  -f action=test_connection
```

## API Reference

### WixAIBotClient Class

```javascript
import { WixAIBotClient } from './wix-gamma-integration/wix/ai-bot/wix-ai-bot-client.js';

// Initialize client
const client = new WixAIBotClient({
  apiToken: 'your_api_token',
  siteId: 'your_site_id',
  botUrl: 'https://custom-bot-url.com',  // optional
  webhookSecret: 'your_webhook_secret'    // optional
});
```

### Methods

#### Update Landing Page

```javascript
const result = await client.updateLandingPage({
  title: 'New Feature Released',
  content: '<h1>Check out our latest features</h1><p>...</p>',
  metadata: {
    author: 'GitHub Actions',
    version: '1.2.0'
  }
});

console.log(result);
// { success: true, status: 200, data: {...}, attempt: 1 }
```

#### Send Notification

```javascript
const result = await client.sendNotification({
  message: 'PR #123 merged successfully',
  type: 'success',  // info, success, warning, error
  metadata: {
    pr_number: 123,
    repository: 'wiredchaos/wired-chaos'
  }
});
```

#### Sync Content

```javascript
const result = await client.syncContent({
  source: 'github_pr',
  data: {
    title: 'New Documentation',
    content: '...',
    files: ['README.md', 'GUIDE.md']
  }
});
```

#### Manage Page

```javascript
// Create new page
const result = await client.managePage({
  title: 'New Landing Page',
  url: 'new-feature',
  sections: [
    { type: 'header', content: 'Welcome' },
    { type: 'content', content: 'Description...' }
  ]
});

// Update existing page
const result = await client.managePage({
  pageId: 'existing-page-id',
  title: 'Updated Page',
  url: 'updated-feature',
  sections: [...]
});
```

#### Test Connection

```javascript
const result = await client.testConnection();
console.log(result);
// { success: true, status: 200, data: {...} }
```

## Webhook Configuration

### Configure GitHub Webhook

1. Go to Repository Settings → Webhooks → Add webhook
2. **Payload URL**: `https://wired-chaos.pages.dev/api/wix/webhook`
3. **Content Type**: `application/json`
4. **Events**: Select:
   - Pull requests
   - Pushes
   - Deployment statuses
5. **Active**: ✓ Enable

### Webhook Signature Verification

The webhook handler automatically verifies signatures if `WIX_WEBHOOK_SECRET` is configured:

```javascript
import { WixAIBotClient } from './wix-ai-bot-client.js';

const client = new WixAIBotClient({
  apiToken: process.env.WIX_API_TOKEN,
  siteId: process.env.WIX_SITE_ID,
  webhookSecret: process.env.WIX_WEBHOOK_SECRET
});

// Verify webhook signature
const payload = await request.text();
const signature = request.headers.get('X-Wix-Webhook-Signature');
const isValid = client.verifyWebhookSignature(payload, signature);

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

## Event Payloads

### Pull Request Merged

```json
{
  "event_type": "pr_merged",
  "pr_number": 123,
  "pr_title": "Add new feature",
  "pr_author": "wiredchaos",
  "repository": "wiredchaos/wired-chaos",
  "timestamp": "2024-01-15T10:30:00Z",
  "action": "update_landing_page",
  "site_id": "7aa81323-433d-4763-b6dc-5d98d409c459"
}
```

### Deployment Status

```json
{
  "event_type": "deployment",
  "deployment_state": "success",
  "environment": "production",
  "repository": "wiredchaos/wired-chaos",
  "timestamp": "2024-01-15T10:35:00Z",
  "action": "send_notification",
  "site_id": "7aa81323-433d-4763-b6dc-5d98d409c459"
}
```

### Manual Action

```json
{
  "event_type": "manual",
  "action": "update_landing_page",
  "message": "Custom update message",
  "repository": "wiredchaos/wired-chaos",
  "triggered_by": "github-user",
  "timestamp": "2024-01-15T10:40:00Z",
  "site_id": "7aa81323-433d-4763-b6dc-5d98d409c459"
}
```

## Testing

### End-to-End Test Scenario

This example demonstrates automating landing page update on PR merge:

#### 1. Create Test Branch

```bash
git checkout -b test/wix-ai-bot-integration
```

#### 2. Make Changes

```bash
echo "# Test Feature" >> TEST_FEATURE.md
git add TEST_FEATURE.md
git commit -m "Add test feature"
git push origin test/wix-ai-bot-integration
```

#### 3. Create Pull Request

```bash
gh pr create \
  --title "Test: Wix AI Bot Integration" \
  --body "Testing automated landing page update on PR merge"
```

#### 4. Merge Pull Request

```bash
gh pr merge --squash
```

#### 5. Verify Automation

```bash
# Check workflow run
gh run list --workflow=wix-ai-bot-automation.yml --limit=1

# View workflow logs
gh run view --log

# Check Wix site for updates
open https://manage.wix.com/dashboard/7aa81323-433d-4763-b6dc-5d98d409c459
```

### Unit Tests

```javascript
// test/wix-ai-bot-client.test.js
import { WixAIBotClient } from '../wix/ai-bot/wix-ai-bot-client.js';

describe('WixAIBotClient', () => {
  let client;
  
  beforeEach(() => {
    client = new WixAIBotClient({
      apiToken: 'test_token',
      siteId: 'test_site_id'
    });
  });
  
  test('should create client with config', () => {
    expect(client.apiToken).toBe('test_token');
    expect(client.siteId).toBe('test_site_id');
  });
  
  test('should update landing page', async () => {
    const result = await client.updateLandingPage({
      title: 'Test Page',
      content: 'Test content'
    });
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('status');
  });
});
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Test webhook endpoint
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d '{
    "action": "closed",
    "pull_request": {
      "merged": true,
      "number": 123,
      "title": "Test PR"
    }
  }'
```

## Monitoring and Alerting

### Health Checks

Monitor the integration worker health:

```bash
# Check worker health
curl https://wired-chaos.pages.dev/api/health

# View worker logs
wrangler tail --env production

# Check specific requests
wrangler tail --env production --format json | jq 'select(.outcome == "exception")'
```

### Discord Notifications

Automatic notifications are sent to Discord on:
- ✅ Successful Wix AI Bot triggers
- ⚠️ Failed API calls after retries
- ❌ Configuration errors

### Telegram Notifications

Similar notifications are sent to Telegram if configured.

### Metrics Dashboard

View integration metrics:

```bash
# KV storage usage
wrangler kv:namespace list

# Worker analytics
wrangler pages deployment list
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error**: `401 Unauthorized`

**Solution**:
```bash
# Verify token is set correctly
gh secret list | grep WIX_API_TOKEN

# Update token
gh secret set WIX_API_TOKEN --body "new_token"
```

#### 2. Rate Limiting

**Error**: `429 Too Many Requests`

**Solution**: The client implements automatic retry with exponential backoff. If issues persist:
- Check rate limits in Wix dashboard
- Consider implementing request queuing
- Contact Wix support for higher limits

#### 3. Webhook Signature Verification Failed

**Error**: `Invalid webhook signature`

**Solution**:
```bash
# Ensure webhook secret is set correctly
gh secret set WIX_WEBHOOK_SECRET --body "correct_secret"

# Verify secret in Wix dashboard matches GitHub secret
```

#### 4. Worker Deployment Issues

**Error**: `Worker deployment failed`

**Solution**:
```bash
# Check wrangler configuration
cat wrangler.toml

# Verify Cloudflare credentials
wrangler whoami

# Redeploy
cd wix-gamma-integration/cloudflare/workers
wrangler deploy --env production
```

### Debug Mode

Enable debug logging:

```bash
# In GitHub Actions
gh workflow run wix-ai-bot-automation.yml \
  -f action=test_connection

# Check logs
gh run view --log
```

### Support Channels

- 💬 Discord: Join #wix-integration channel
- 📧 Email: support@wiredchaos.xyz
- 📚 Docs: https://github.com/wiredchaos/wired-chaos/tree/main/wix-gamma-integration/docs

## Security Best Practices

### Secret Management

✅ **DO:**
- Store all credentials in GitHub Secrets or Cloudflare Worker secrets
- Use webhook signature verification
- Rotate tokens regularly
- Use read-only tokens where possible

❌ **DON'T:**
- Commit tokens to repository
- Share tokens in logs or error messages
- Use the same token across environments

### Network Security

- All API calls use HTTPS
- Webhook endpoints validate signatures
- Rate limiting prevents abuse
- CORS headers restrict access

### Audit Logging

All webhook events are logged to KV storage:

```javascript
// View audit logs
const logs = await env.ANALYTICS_KV.list({ prefix: 'github_webhook_' });
const recentLog = await env.ANALYTICS_KV.get(logs.keys[0].name);
console.log(JSON.parse(recentLog));
```

### Compliance

- GDPR compliant (data retention: 7-30 days)
- No PII stored without consent
- Secure data transmission (TLS 1.3)

---

## Next Steps

1. ✅ Complete setup following this guide
2. 🧪 Run test scenario to verify integration
3. 📊 Configure monitoring dashboards
4. 🔔 Set up notification channels
5. 📚 Train team on automation workflow

## Related Documentation

- [WIX Integration Guide](wix-integration.md)
- [GAMMA Integration Guide](gamma-integration.md)
- [Deployment Guide](deployment-guide.md)
- [Infrastructure Standards](../../.copilot/infrastructure.md)

---

**WIRED CHAOS** - Automated with ❤️ by the WIRED CHAOS Team

Last Updated: 2024
