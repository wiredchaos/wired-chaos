# 🚀 WIRED CHAOS - Deployment Guide

## Quick Deploy

**One-Command Deployment:**
```powershell
.\DEPLOY.ps1
```

This will:
- ✅ Commit and push all changes
- ✅ Trigger GitHub Actions workflows  
- ✅ Deploy frontend to Cloudflare Pages
- ✅ Deploy worker to Cloudflare Workers
- ✅ Show deployment URLs and status

## Expected URLs

After deployment completes (5-10 minutes):

### 🌐 Frontend
- **Production:** https://wired-chaos.pages.dev
- **Preview:** https://wired-chaos-preview.pages.dev

### ⚡ Worker API  
- **API Base:** https://wired-chaos-worker.wiredchaos.workers.dev
- **Health Check:** /health
- **Brain Assistant:** /api/brain/query
- **Certificate API:** /api/certificate/*

## GitHub Secrets Required

Set these in your GitHub repository settings:

```bash
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

Optional secrets:
- `DISCORD_WEBHOOK_URL` - For deployment notifications
- `REACT_APP_BACKEND_URL` - Custom backend URL

## Manual Deployment

If you prefer manual control:

### Frontend Only
```bash
gh workflow run deploy-frontend.yml
```

### Worker Only  
```bash
gh workflow run deploy-worker.yml
```

### Complete System
```bash
gh workflow run deploy-complete.yml
```

## Integration Systems

After core deployment, configure integrations:

### WIX/GAMMA Integration
```powershell
cd wix-gamma-integration
.\deploy.ps1
```

### Notion/Zapier Setup
Follow instructions in `INTEGRATION_SETUP.md`

## Troubleshooting

### Build Fails
- Frontend build failures are handled gracefully
- Basic fallback deployment will still work
- Check GitHub Actions logs for details

### Worker Issues
- Basic worker is auto-generated if none exists
- Includes CORS headers and health checks
- API endpoints for Brain Assistant and Certificates

### DNS Not Propagated
- Initial deployment URLs may take 5-10 minutes
- Check Cloudflare dashboard for status
- GitHub Actions will show success even if DNS pending

## Status Monitoring

- **GitHub Actions:** https://github.com/wiredchaos/wired-chaos/actions
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Worker Logs:** `wrangler tail` (if Wrangler installed)

## Next Steps

1. ✅ **Run `.\DEPLOY.ps1`**
2. ⏳ **Wait 5-10 minutes for deployment**
3. 🌐 **Test your URLs**
4. 🔧 **Configure integrations (optional)**

Your WIRED CHAOS system will be live and operational!