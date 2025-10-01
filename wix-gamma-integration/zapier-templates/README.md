# Zapier Templates for WIRED CHAOS Integration

This directory contains Zapier automation templates for integrating WIX and GAMMA with the WIRED CHAOS platform.

## Available Templates

### 1. WIX to GAMMA Content Sync
**File:** `wix-to-gamma-sync.json`

Automatically syncs content updates from WIX to GAMMA presentations.

**Setup:**
1. Import the template into Zapier
2. Set up a webhook in WIX to trigger on content updates
3. Configure environment variables:
   - `WIX_API_TOKEN`: Your WIX API authentication token
   - `GAMMA_API_KEY`: Your GAMMA API key
4. Update the worker URL to your deployed Cloudflare Worker
5. Configure Slack notifications (optional)

**Trigger:** WIX content update webhook

**Actions:**
- Transform WIX data to GAMMA format
- POST to worker sync endpoint
- Send Slack notification

---

### 2. GAMMA to WIX Export
**File:** `gamma-to-wix-export.json`

Exports GAMMA presentations as PDF and uploads them to WIX Media Manager.

**Setup:**
1. Import the template into Zapier
2. Set up a webhook in GAMMA to trigger on export requests
3. Configure environment variables:
   - `GAMMA_API_KEY`: Your GAMMA API key
   - `WIX_API_TOKEN`: Your WIX API authentication token
4. Update the worker URL to your deployed Cloudflare Worker
5. Configure email notifications

**Trigger:** GAMMA export webhook

**Actions:**
- Export GAMMA presentation as PDF
- Upload to WIX Media Manager
- Send email notification

---

## Setup Instructions

### Prerequisites
- Zapier account (Professional plan recommended for webhooks)
- WIX API access token
- GAMMA API key
- Deployed Cloudflare Worker

### General Setup Steps

1. **Import Template to Zapier**
   - Log in to your Zapier account
   - Go to "Zaps" → "Create Zap"
   - Click "Use a Zap template" → "Import"
   - Upload the JSON file

2. **Configure Webhook**
   - For WIX: Set up webhook in WIX Dashboard → Settings → Webhooks
   - For GAMMA: Configure webhook in GAMMA settings
   - Point webhook to the Zapier catch hook URL

3. **Set Environment Variables**
   - In Zapier, go to "My Apps" → "Add Connection"
   - Store API keys and tokens securely
   - Reference them in actions using `{{env.VARIABLE_NAME}}`

4. **Update Worker URL**
   - Replace `YOUR-WORKER.workers.dev` with your actual Cloudflare Worker URL
   - Format: `https://wix-gamma-integration-prod.YOUR-ACCOUNT.workers.dev`

5. **Test the Zap**
   - Use Zapier's built-in test feature
   - Verify data transformation and API calls
   - Check notifications

6. **Turn On the Zap**
   - Once tested, activate the Zap
   - Monitor the task history for any issues

---

## Custom Templates

You can create custom templates based on these examples:

### Template Structure
```json
{
  "name": "Template Name",
  "description": "Template description",
  "trigger": {
    "app": "App name",
    "event": "Event type",
    "config": { ... }
  },
  "actions": [
    {
      "app": "App name",
      "event": "Action type",
      "config": { ... }
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "author": "Your Name",
    "category": "Category"
  }
}
```

---

## Common Use Cases

### 1. **Automated Content Publishing**
- Trigger: New content created in WIX
- Action: Create GAMMA presentation and publish

### 2. **Analytics Sync**
- Trigger: Scheduled (daily)
- Action: Sync WIX analytics to GAMMA insights

### 3. **AR Model Updates**
- Trigger: New AR model uploaded to WIX
- Action: Update GAMMA presentation with AR model link

### 4. **Collaboration Notifications**
- Trigger: GAMMA presentation shared
- Action: Notify WIX team members via email/Slack

---

## Troubleshooting

### Common Issues

**Issue:** Webhook not triggering
- **Solution:** Verify webhook URL in source app settings
- Check Zapier webhook history for incoming requests

**Issue:** Authentication failed
- **Solution:** Verify API tokens are correct and not expired
- Check token permissions in source app

**Issue:** Data transformation errors
- **Solution:** Review the JavaScript code in Code by Zapier step
- Add console.log statements for debugging

**Issue:** Worker not responding
- **Solution:** Check worker deployment status
- Verify worker URL is correct
- Check worker logs: `wrangler tail --env production`

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Documentation: See main project README
- Worker Logs: `wrangler tail --env production`

---

**WIRED CHAOS** - Automate Everything! 🚀
