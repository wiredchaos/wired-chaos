# Wix AI Bot Integration - Examples

This directory contains example payloads and test automation scripts for the Wix AI Bot integration.

## Directory Structure

```
examples/
├── payloads/          # Example event payloads
│   ├── pr-merge.json          # Pull request merge event
│   ├── deployment.json        # Deployment status event
│   ├── content-sync.json      # Content synchronization event
│   └── manual-action.json     # Manual action trigger event
├── scripts/           # Test automation scripts
│   └── test-e2e.sh           # End-to-end test script
└── README.md          # This file
```

## Example Payloads

### PR Merge (`payloads/pr-merge.json`)

Example payload for a pull request merge event that triggers landing page update:

```bash
# Test with curl
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d @payloads/pr-merge.json
```

### Deployment (`payloads/deployment.json`)

Example payload for a deployment status event that triggers notification:

```bash
# Test with curl
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d @payloads/deployment.json
```

### Content Sync (`payloads/content-sync.json`)

Example payload for syncing GitHub content to Wix:

```bash
# Test with curl
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d @payloads/content-sync.json
```

### Manual Action (`payloads/manual-action.json`)

Example payload for manually triggered actions:

```bash
# Test with curl
curl -X POST https://wired-chaos.pages.dev/api/wix/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WIX_API_TOKEN}" \
  -d @payloads/manual-action.json
```

## Test Scripts

### End-to-End Test (`scripts/test-e2e.sh`)

Comprehensive end-to-end test that:
1. Creates a test branch
2. Makes changes and commits
3. Creates a pull request
4. Merges the pull request
5. Verifies workflow execution
6. Tests webhook endpoint
7. Validates Wix AI Bot integration

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- `curl` installed
- Repository cloned locally
- Required secrets configured

**Usage:**

```bash
cd wix-gamma-integration/examples/scripts

# Set environment variables (optional)
export WIX_API_TOKEN="your_api_token"
export WIX_SITE_ID="7aa81323-433d-4763-b6dc-5d98d409c459"
export WORKER_URL="https://wired-chaos.pages.dev"

# Run the test
./test-e2e.sh
```

**Expected Output:**

```
========================================
  Wix AI Bot E2E Test
========================================

[10:30:00] Checking prerequisites...
✓ GitHub CLI found
✓ curl found
✓ WIX_API_TOKEN configured

[10:30:01] Step 1: Creating test branch...
✓ Test branch created: test/wix-ai-bot-e2e-1234567890

[10:30:02] Step 2: Making test changes...
✓ Test changes committed

[10:30:03] Step 3: Pushing test branch...
✓ Branch pushed to remote

[10:30:05] Step 4: Creating pull request...
✓ Pull request created: #123

[10:30:10] Step 5: Waiting 5 seconds before merge...

[10:30:15] Step 6: Merging pull request...
✓ Pull request merged and branch deleted

[10:30:20] Step 7: Waiting for workflow to trigger...

[10:30:30] Step 8: Checking workflow status...
✓ Workflow run found: 67890

[10:30:31] Step 9: Testing webhook endpoint...
✓ Webhook endpoint responding correctly

[10:30:32] Step 10: Testing Wix AI Bot client...
✓ Using example payload: ../payloads/pr-merge.json

[10:30:33] Step 11: Verifying results...

Test Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Test branch created and pushed
✓ Pull request created (#123)
✓ Pull request merged
✓ Workflow triggered (run: 67890)

Manual Verification Steps:
1. Check workflow logs:
   gh run view 67890 --log

2. Check Wix site dashboard:
   https://manage.wix.com/dashboard/7aa81323-433d-4763-b6dc-5d98d409c459

3. Verify notifications:
   - Discord webhook
   - Telegram bot

4. Check integration worker logs:
   wrangler tail --env production

========================================
  E2E Test Completed Successfully!
========================================
```

## Testing Workflow Manually

### Test via GitHub Actions

```bash
# Update landing page
gh workflow run wix-ai-bot-automation.yml \
  -f action=update_landing_page \
  -f message="Test update"

# Send notification
gh workflow run wix-ai-bot-automation.yml \
  -f action=send_notification \
  -f message="Test notification"

# Sync content
gh workflow run wix-ai-bot-automation.yml \
  -f action=sync_content

# Test connection
gh workflow run wix-ai-bot-automation.yml \
  -f action=test_connection
```

### Test via API Client

```javascript
import { WixAIBotClient } from '../wix/ai-bot/wix-ai-bot-client.js';

const client = new WixAIBotClient({
  apiToken: process.env.WIX_API_TOKEN,
  siteId: process.env.WIX_SITE_ID
});

// Test connection
const result = await client.testConnection();
console.log('Connection test:', result);

// Update landing page
const updateResult = await client.updateLandingPage({
  title: 'Test Update',
  content: '<h1>Test Content</h1>',
  metadata: { test: true }
});
console.log('Update result:', updateResult);
```

## Customizing Payloads

You can modify the example payloads to fit your specific use case:

1. **Edit payload files**: Modify JSON files in `payloads/` directory
2. **Add new payloads**: Create new JSON files for custom events
3. **Test custom payloads**: Use curl to test your custom payloads

Example custom payload:

```json
{
  "event_type": "custom_event",
  "action": "custom_action",
  "site_id": "your_site_id",
  "data": {
    "custom_field_1": "value1",
    "custom_field_2": "value2"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Troubleshooting

### Test Script Fails

**Problem**: Script fails with "GitHub CLI not found"
**Solution**: Install GitHub CLI: `brew install gh` (macOS) or visit https://cli.github.com/

**Problem**: Script fails with "Not authenticated"
**Solution**: Run `gh auth login` to authenticate

**Problem**: Workflow not triggered
**Solution**: Check workflow file exists and is enabled in repository settings

### API Test Fails

**Problem**: 401 Unauthorized
**Solution**: Verify `WIX_API_TOKEN` is set correctly and not expired

**Problem**: 404 Not Found
**Solution**: Check that the worker is deployed and `WORKER_URL` is correct

**Problem**: 500 Server Error
**Solution**: Check Wix AI Bot dashboard for service status

## Related Documentation

- [Wix AI Bot Automation Guide](../docs/wix-ai-bot-automation.md)
- [API Client Reference](../wix/ai-bot/wix-ai-bot-client.js)
- [Integration Setup Guide](../../INTEGRATION_SETUP.md)
- [Worker Implementation](../cloudflare/workers/integration-worker.js)

## Contributing

To add new examples:

1. Create a new payload file in `payloads/` directory
2. Document the payload structure
3. Add usage examples to this README
4. Update the main documentation

---

**WIRED CHAOS** - Examples and Test Automation
