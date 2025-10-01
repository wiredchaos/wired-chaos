# WIX/GAMMA Integration Deployment Guide

Complete deployment guide for the WIRED CHAOS WIX and GAMMA integration system.

## Prerequisites

- GitHub repository access
- Cloudflare account with Workers and R2
- WIX Developer account and app configured
- GAMMA API key
- Node.js 18+ installed
- Wrangler CLI installed

## Quick Start

```bash
# Clone repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos/wix-gamma-integration

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Deploy to Cloudflare
npm run deploy
```

## Detailed Setup

### 1. Environment Configuration

Create `.env` file in `wix-gamma-integration/`:

```env
# WIX Configuration
WIX_APP_ID=your_wix_app_id
WIX_APP_SECRET=your_wix_app_secret
WIX_SITE_ID=your_wix_site_id
WIX_API_TOKEN=your_api_token
WIX_ACCESS_TOKEN=your_access_token

# GAMMA Configuration
GAMMA_API_KEY=your_gamma_api_key
GAMMA_PROJECT_ID=your_project_id

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# R2 Bucket
R2_BUCKET_NAME=wired-chaos-ar-models

# KV Namespaces
CACHE_KV_ID=your_cache_kv_id
ANALYTICS_KV_ID=your_analytics_kv_id
SYNC_KV_ID=your_sync_kv_id
```

### 2. GitHub Secrets

Add secrets to GitHub repository:

```bash
# Use GitHub CLI
gh secret set WIX_APP_ID
gh secret set WIX_APP_SECRET
gh secret set WIX_SITE_ID
gh secret set WIX_API_TOKEN
gh secret set WIX_ACCESS_TOKEN
gh secret set GAMMA_API_KEY
gh secret set GAMMA_PROJECT_ID
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set CLOUDFLARE_API_TOKEN
```

Or via GitHub web interface:
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret listed above

### 3. Cloudflare Setup

#### Create KV Namespaces

```bash
# Create KV namespaces
wrangler kv:namespace create CACHE_KV
wrangler kv:namespace create ANALYTICS_KV
wrangler kv:namespace create SYNC_KV

# Note the IDs and update wrangler.toml
```

#### Create R2 Bucket

```bash
# Create R2 bucket for AR models
wrangler r2 bucket create wired-chaos-ar-models

# Upload sample models
wrangler r2 object put wired-chaos-ar-models/ar-models/sample.glb \
  --file ./assets/sample-model.glb \
  --content-type model/gltf-binary
```

#### Configure wrangler.toml

Create `wrangler.toml` in `wix-gamma-integration/cloudflare/workers/`:

```toml
name = "wix-gamma-integration"
main = "integration-worker.js"
compatibility_date = "2025-09-30"
account_id = "your_account_id"

[env.production]
workers_dev = false
route = "https://wired-chaos.pages.dev/api/*"

[[env.production.kv_namespaces]]
binding = "CACHE_KV"
id = "your_cache_kv_id"

[[env.production.kv_namespaces]]
binding = "ANALYTICS_KV"
id = "your_analytics_kv_id"

[[env.production.kv_namespaces]]
binding = "SYNC_KV"
id = "your_sync_kv_id"

[[env.production.r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "wired-chaos-ar-models"

[env.production.vars]
ENVIRONMENT = "production"

# Secrets (set via wrangler secret put)
# WIX_API_TOKEN
# WIX_ACCESS_TOKEN
# GAMMA_API_KEY
```

### 4. Deploy Worker

```bash
cd wix-gamma-integration/cloudflare/workers

# Set secrets
wrangler secret put WIX_API_TOKEN
wrangler secret put WIX_ACCESS_TOKEN
wrangler secret put GAMMA_API_KEY

# Deploy to production
wrangler deploy --env production

# Test deployment
curl https://wired-chaos.pages.dev/api/health
```

### 5. WIX Configuration

#### Install Velo Integration

1. Open WIX Editor
2. Enable Dev Mode (top bar)
3. Open Code Panel
4. Create folder: `public`
5. Create file: `public/wired-chaos-integration.js`
6. Copy contents from `wix-gamma-integration/wix/velo/wired-chaos-integration.js`

#### Configure Site Settings

Add to `site.config.json`:

```json
{
  "wiredChaos": {
    "apiBase": "https://wired-chaos.pages.dev",
    "apiKey": "your_api_key",
    "analyticsEnabled": true,
    "arEnabled": true
  }
}
```

#### Add to Page Code

```javascript
import wixChaos from './public/wired-chaos-integration.js';

$w.onReady(function() {
  const chaos = wixChaos.initialize({
    apiBase: 'https://wired-chaos.pages.dev',
    apiKey: 'YOUR_API_KEY'
  });
  
  console.log('WIRED CHAOS initialized');
});
```

### 6. GAMMA Configuration

#### Setup Webhooks

Configure GAMMA webhooks in dashboard:

```
Webhook URL: https://wired-chaos.pages.dev/api/gamma/webhook
Events: presentation.created, presentation.updated, presentation.deleted
```

#### Test API Connection

```bash
# Test GAMMA API
curl -X GET https://gamma.app/api/v1/presentations \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Deployment Strategies

### Development

```bash
# Deploy to dev environment
wrangler deploy --env development

# Watch mode for local development
wrangler dev
```

### Staging

```bash
# Deploy to staging
wrangler deploy --env staging

# Test staging
curl https://staging.wired-chaos.pages.dev/api/health
```

### Production

```bash
# Deploy to production
wrangler deploy --env production

# Verify deployment
curl https://wired-chaos.pages.dev/api/health

# Check logs
wrangler tail --env production
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy-wix-gamma.yml`:

```yaml
name: Deploy WIX/GAMMA Integration

on:
  push:
    branches:
      - main
    paths:
      - 'wix-gamma-integration/**'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Wrangler
        run: npm install -g wrangler
      
      - name: Deploy Worker
        working-directory: wix-gamma-integration/cloudflare/workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          # Set secrets
          echo "${{ secrets.WIX_API_TOKEN }}" | wrangler secret put WIX_API_TOKEN
          echo "${{ secrets.WIX_ACCESS_TOKEN }}" | wrangler secret put WIX_ACCESS_TOKEN
          echo "${{ secrets.GAMMA_API_KEY }}" | wrangler secret put GAMMA_API_KEY
          
          # Deploy
          wrangler deploy --env production
      
      - name: Test Deployment
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" \
            https://wired-chaos.pages.dev/api/health)
          
          if [ $response -eq 200 ]; then
            echo "✅ Deployment successful"
          else
            echo "❌ Deployment failed"
            exit 1
          fi
      
      - name: Notify Discord
        if: always()
        env:
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK_URL }}
        run: |
          curl -X POST "$DISCORD_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d '{"content": "WIX/GAMMA Integration deployed to production"}'
```

## Monitoring & Logging

### Cloudflare Analytics

View analytics at:
```
https://dash.cloudflare.com/your-account/workers/view/wix-gamma-integration
```

### Custom Logging

```javascript
// In worker
console.log('WIX request:', {
  endpoint: url.pathname,
  method: request.method,
  timestamp: Date.now()
});
```

### Error Tracking

```javascript
// Send errors to external service
async function logError(error, context) {
  await fetch('https://your-error-tracker.com/log', {
    method: 'POST',
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      context
    })
  });
}
```

## Performance Optimization

### Caching Strategy

```javascript
// Cache WIX content for 5 minutes
const CACHE_TTL = {
  WIX_CONTENT: 300,
  GAMMA_PRESENTATIONS: 600,
  STATIC_ASSETS: 86400
};

// Use Cache API
const cache = caches.default;
const cacheKey = new Request(url.toString(), request);
const cached = await cache.match(cacheKey);

if (cached) {
  return cached;
}

const response = await fetch(request);
ctx.waitUntil(cache.put(cacheKey, response.clone()));
return response;
```

### CDN Configuration

```javascript
// Set appropriate cache headers
return new Response(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600',
    'CDN-Cache-Control': 'max-age=86400'
  }
});
```

## Security

### API Key Rotation

```bash
# Generate new API key
NEW_KEY=$(openssl rand -hex 32)

# Update in secrets
wrangler secret put WIX_API_TOKEN
wrangler secret put GAMMA_API_KEY

# Update in GitHub
gh secret set WIX_API_TOKEN
gh secret set GAMMA_API_KEY
```

### Security Headers

```javascript
// Applied automatically by worker
{
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': '...'
}
```

## Rollback Procedure

### Rollback Worker

```bash
# List deployments
wrangler deployments list

# Rollback to specific version
wrangler rollback --deployment-id <deployment-id>
```

### Rollback via Git

```bash
# Revert to previous commit
git revert HEAD
git push

# CI/CD will automatically deploy previous version
```

## Testing

### Integration Tests

```bash
# Run integration tests
npm test

# Test specific endpoint
curl -X POST https://wired-chaos.pages.dev/api/wix/analytics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "test", "data": {}}'
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://wired-chaos.pages.dev/api/health

# Using wrk
wrk -t4 -c100 -d30s https://wired-chaos.pages.dev/api/health
```

## Troubleshooting

### Worker Not Responding

```bash
# Check worker status
wrangler deployments list

# View logs
wrangler tail

# Check for errors
wrangler tail --format pretty
```

### WIX Integration Issues

1. Verify API credentials
2. Check CORS configuration
3. Review browser console
4. Test API endpoints directly

### GAMMA Integration Issues

1. Verify API key is valid
2. Check rate limits
3. Review API response
4. Test with Postman

## Maintenance

### Regular Tasks

- **Daily**: Review logs and analytics
- **Weekly**: Check error rates
- **Monthly**: Update dependencies
- **Quarterly**: Rotate API keys

### Updates

```bash
# Update dependencies
npm update

# Update Wrangler
npm install -g wrangler@latest

# Redeploy with updates
wrangler deploy
```

## Support

For deployment issues:
- GitHub Issues: [github.com/wiredchaos/wired-chaos/issues](https://github.com/wiredchaos/wired-chaos/issues)
- Discord: WIRED CHAOS Community
- Email: support@wiredchaos.xyz

---

**WIRED CHAOS** - Seamless Integration
