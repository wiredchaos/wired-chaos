# 🤖 Wix AI Bot Integration - Summary

This document provides a quick overview of the Wix AI Bot integration implementation for the Wired Chaos ecosystem.

## 📋 Overview

The Wix AI Bot integration enables seamless automation between GitHub repository events and your Wix website, providing:

- **Automated landing page updates** when PRs are merged
- **Real-time deployment notifications** to Wix site
- **Content synchronization** from GitHub to Wix
- **Webhook-driven automation** for custom workflows
- **Secure, reliable API interactions** with retry logic

## 🏗️ Architecture

```
GitHub Events
    ↓
GitHub Actions Workflow
    ↓
Wix AI Bot API ← → Cloudflare Integration Worker
    ↓                       ↓
Wix Website            KV Storage (Audit Logs)
    ↓
Discord/Telegram Notifications
```

## 📁 File Structure

```
.github/workflows/
└── wix-ai-bot-automation.yml         # Main automation workflow

wix-gamma-integration/
├── wix/ai-bot/
│   └── wix-ai-bot-client.js          # API client library
├── cloudflare/workers/
│   └── integration-worker.js         # Enhanced webhook handling
├── docs/
│   └── wix-ai-bot-automation.md      # Comprehensive documentation
└── examples/
    ├── payloads/                      # Example event payloads
    │   ├── pr-merge.json
    │   ├── deployment.json
    │   ├── content-sync.json
    │   └── manual-action.json
    ├── scripts/                       # Test automation
    │   ├── test-e2e.sh               # End-to-end test
    │   └── test-api-client.js        # API client tests
    └── README.md                      # Examples documentation
```

## 🚀 Quick Start

### 1. Configure Secrets

```bash
gh secret set WIX_API_TOKEN --body "your_wix_api_token"
gh secret set WIX_SITE_ID --body "7aa81323-433d-4763-b6dc-5d98d409c459"
```

### 2. Test Connection

```bash
gh workflow run wix-ai-bot-automation.yml -f action=test_connection
```

### 3. Update Landing Page (Manual)

```bash
gh workflow run wix-ai-bot-automation.yml \
  -f action=update_landing_page \
  -f message="Test update"
```

### 4. Automatic Triggers

The workflow automatically runs on:
- ✅ Pull request merges to `main`
- ✅ Push events to `main` branch
- ✅ Deployment status updates
- ✅ Manual workflow dispatch

## 🔧 API Client Usage

```javascript
import { WixAIBotClient } from './wix/ai-bot/wix-ai-bot-client.js';

const client = new WixAIBotClient({
  apiToken: process.env.WIX_API_TOKEN,
  siteId: process.env.WIX_SITE_ID
});

// Update landing page
await client.updateLandingPage({
  title: 'New Feature',
  content: '<h1>Announcement</h1>',
  metadata: { version: '1.0' }
});

// Send notification
await client.sendNotification({
  message: 'Deployment complete',
  type: 'success'
});

// Test connection
await client.testConnection();
```

## 🧪 Testing

### Run End-to-End Test

```bash
cd wix-gamma-integration/examples/scripts
./test-e2e.sh
```

### Run API Client Tests

```bash
node wix-gamma-integration/examples/scripts/test-api-client.js
```

### Test Webhook Endpoint

```bash
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d @wix-gamma-integration/examples/payloads/pr-merge.json
```

## 📊 Monitoring

### View Workflow Runs

```bash
gh run list --workflow=wix-ai-bot-automation.yml
```

### View Latest Run Logs

```bash
gh run view --log
```

### Monitor Worker

```bash
wrangler tail --env production
```

## 🔐 Security Features

- ✅ **GitHub Secrets**: All credentials stored securely
- ✅ **HMAC Verification**: Webhook signature validation
- ✅ **Rate Limiting**: Automatic retry with exponential backoff
- ✅ **Audit Logging**: Events logged to Cloudflare KV
- ✅ **TLS 1.3**: Secure communication
- ✅ **Token Masking**: Secrets never exposed in logs

## 📚 Documentation

### Main Documents

- **[Complete Guide](docs/wix-ai-bot-automation.md)** - Comprehensive documentation
- **[Integration Setup](../../INTEGRATION_SETUP.md)** - Setup instructions
- **[Examples](examples/README.md)** - Example payloads and scripts

### API Reference

- **[API Client](wix/ai-bot/wix-ai-bot-client.js)** - Client library source
- **[Integration Worker](cloudflare/workers/integration-worker.js)** - Worker implementation

## 🎯 Use Cases

### 1. PR Merge → Landing Page Update

**Trigger**: PR merged to main  
**Action**: Update Wix landing page with PR details  
**Notification**: Discord + Telegram

### 2. Deployment → Notification

**Trigger**: Deployment completed  
**Action**: Send notification to Wix site  
**Notification**: Status update on landing page

### 3. Content Sync

**Trigger**: Push to main with doc changes  
**Action**: Sync documentation to Wix  
**Notification**: Content updated notification

### 4. Manual Updates

**Trigger**: Manual workflow dispatch  
**Action**: Custom action (update, notify, sync)  
**Notification**: Confirmation message

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Verify `WIX_API_TOKEN` is set correctly |
| 429 Rate Limited | Automatic retry enabled, check rate limits |
| 500 Server Error | Check Wix AI Bot dashboard status |
| Workflow not triggered | Verify workflow file and branch protection |

### Debug Commands

```bash
# Check workflow status
gh run list --workflow=wix-ai-bot-automation.yml --limit=5

# View specific run
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# Check secrets
gh secret list | grep WIX
```

## 📈 Metrics

### Workflow Success Rate

View in GitHub Actions tab:
- Total runs
- Success rate
- Average duration
- Failed runs with logs

### API Performance

Monitor in Cloudflare dashboard:
- Request count
- Response times
- Error rates
- Cache hit ratio

## 🔄 Continuous Improvement

### Planned Enhancements

- [ ] Add support for multi-site deployments
- [ ] Implement A/B testing for landing pages
- [ ] Add analytics dashboard integration
- [ ] Create more example templates
- [ ] Add support for scheduled updates

### Feedback

Submit issues or feature requests:
- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Discord: #wix-integration channel
- Email: support@wiredchaos.xyz

## 📝 Changelog

### Version 1.0.0 (2024-01-15)

**Added:**
- GitHub Actions workflow for automation
- Wix AI Bot API client library
- Webhook handler in integration worker
- Comprehensive documentation
- Example payloads and test scripts
- End-to-end test automation
- Monitoring and alerting

**Security:**
- HMAC signature verification
- Rate limiting with exponential backoff
- Audit logging
- Secure secrets management

**Testing:**
- API client unit tests
- Integration tests
- E2E test script

---

## 🎉 Getting Started

1. **Setup**: Configure GitHub secrets
2. **Test**: Run `test-connection` workflow
3. **Deploy**: Merge a PR and watch automation
4. **Monitor**: Check notifications and logs
5. **Customize**: Add custom workflows as needed

## 📞 Support

Need help? Check these resources:

- 📖 [Complete Documentation](docs/wix-ai-bot-automation.md)
- 💬 [Discord Community](https://discord.gg/wiredchaos)
- 📧 [Email Support](mailto:support@wiredchaos.xyz)
- 🐛 [Report Issues](https://github.com/wiredchaos/wired-chaos/issues)

---

**WIRED CHAOS** - Automated with ❤️

*Last Updated: 2024-01-15*
