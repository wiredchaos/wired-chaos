# 🚀 WIRED CHAOS Emergency Infrastructure Deployment

## 🎯 Purpose
This deployment package provides comprehensive emergency infrastructure for the WIRED CHAOS ecosystem including GitHub Actions workflows, enhanced public pages, and automated deployment systems.

## 📦 Components

### GitHub Actions Workflows
- **deploy-complete.yml**: Full system deployment with testing, frontend, backend, and worker deployment
- **emergency-production.yml**: Emergency deployment workflow for critical fixes

### Enhanced Public Pages
- **public/index.html**: Emergency production motherboard with navigation system
- **public/404.html**: Cyberpunk-themed 404 error page with auto-redirect

### Key Features

#### 🌐 Emergency Production Environment
- **Cyber-themed UI** with animated grid background
- **Navigation system** routing to /school with section parameters
- **API health monitoring** with real-time status updates
- **Responsive design** for all device types

#### ⚡ Automated Deployment
- **Multi-stage deployment** with testing, building, and deployment phases
- **Smoke tests** for health verification
- **Emergency deployment** capability with manual trigger
- **Notification system** for deployment status

#### 🔧 Infrastructure Components
- **Cloudflare Workers** deployment automation
- **Cloudflare Pages** frontend deployment
- **Backend services** deployment configuration
- **Health monitoring** and status checks

## 🚀 Deployment Instructions

### Automatic Deployment
The workflows will automatically trigger on:
- Push to main branch
- Pull request to main branch
- Manual workflow dispatch

### Manual Worker Deployment
Deploy the Cloudflare Worker manually using wrangler:

```bash
# Deploy to default environment
npx wrangler deploy

# Deploy to production environment
npx wrangler deploy --env production

# Deploy to staging environment
npx wrangler deploy --env staging

# Dry-run to verify configuration
npx wrangler deploy --dry-run
```

### Post-Deployment Verification
After deploying, verify the endpoints are working:

```bash
# Test health endpoint
curl https://wired-chaos-meta.wiredchaos.workers.dev/health

# Test suite endpoint (should show config warning if not set)
curl https://www.wiredchaos.xyz/suite

# Test tax endpoint (should show config warning if not set)
curl https://www.wiredchaos.xyz/tax
```

Expected responses:
- `/health` - JSON with `{"ok": true, "timestamp": ...}`
- `/suite` - HTML page (config warning or launch page)
- `/tax` - HTML page (config warning or launch page)

### Emergency Deployment
Use the emergency workflow for critical fixes:
1. Go to Actions tab in GitHub
2. Select "🚨 Emergency Production Deploy"
3. Click "Run workflow"
4. Provide deployment reason
5. Deploy

### Required Secrets
Configure these secrets in GitHub repository settings:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `REACT_APP_BACKEND_URL`
- `REACT_APP_API_URL`
- `BACKEND_API_KEY`
- `DATABASE_URL`

### Cloudflare Worker Environment Variables
Configure these in the Cloudflare dashboard or wrangler.toml:
- `SUITE_URL` - URL for the Suite application (optional, shows "not configured" if empty)
- `TAX_URL` - URL for the Tax Suite application (optional, shows "not configured" if empty)

To set via Cloudflare dashboard:
1. Go to Workers & Pages > wired-chaos-meta > Settings > Variables
2. Add `SUITE_URL` and `TAX_URL` with appropriate values
3. Redeploy the worker

To set via wrangler CLI:
```bash
wrangler secret put SUITE_URL
wrangler secret put TAX_URL
```

Or configure in wrangler.toml for specific environments:
```toml
[env.production]
vars = { SUITE_URL = "https://suite.wiredchaos.xyz", TAX_URL = "https://tax.wiredchaos.xyz" }
```

## 📊 Status Monitoring

### Health Endpoints
- **Frontend**: https://wired-chaos.pages.dev/health
- **Worker**: https://wired-chaos-worker.wiredchaos.workers.dev/health
- **Main Page**: https://wired-chaos.pages.dev/

### Worker Endpoints
The Cloudflare Worker provides several edge-served endpoints:

#### `/health`
Returns JSON health status:
```json
{
  "ok": true,
  "timestamp": 1234567890
}
```

#### `/suite`
Edge-hosted HTML landing page that:
- Opens the configured `SUITE_URL` in a new tab automatically (1 second delay)
- Shows manual "Launch Suite" button as fallback
- Displays "URL not configured" warning if `SUITE_URL` is not set

#### `/tax`
Edge-hosted HTML landing page that:
- Opens the configured `TAX_URL` in a new tab automatically (1 second delay)
- Shows manual "Launch Tax Suite" button as fallback
- Displays "URL not configured" warning if `TAX_URL` is not set

#### Other Endpoints
- `/school` - School landing page
- `/vsp` - Video Sales Page
- `/gamma/*` - Gamma module routes
- `/bus/*` - Event bus endpoints
- `/wl/xp/*` - Wallet XP endpoints
- `/api/*` - API proxy routes

### Navigation System
The emergency production environment routes all navigation through:
- Base route: `/school`
- Section routing: `/school?section={section}`
- Available sections: neurolab, vault33, fm333, csn, vrg33589, bwb, eveningvibes, b2b

## 🎨 Design System

### Color Palette
- **Primary**: #00FFFF (Cyan)
- **Accent**: #FF3131 (Red)
- **Success**: #39FF14 (Green) 
- **Background**: #000000 (Black)

### Typography
- **Font**: Orbitron (Google Fonts)
- **Fallback**: Courier New, monospace

### Animations
- **Grid movement**: 20s linear infinite
- **Title pulse**: 3s ease-in-out infinite
- **Status blink**: 2s infinite

## 🔧 Technical Implementation

### Workflow Features
- **Node.js 18** environment
- **Python 3.9** support
- **Automated testing** before deployment
- **Multi-environment** support (production, staging, emergency)
- **Parallel deployment** of frontend, worker, and backend

### Error Handling
- **Graceful fallbacks** for API failures
- **Auto-redirect** on 404 pages (5 second delay)
- **Health check retries** with status indication
- **Deployment failure notifications**

## 📈 Success Metrics
- **Zero-downtime deployments**
- **Sub-30 second emergency response**
- **Automated health monitoring**
- **Multi-platform compatibility**

This infrastructure ensures the WIRED CHAOS ecosystem remains operational with automated deployment capabilities and emergency response protocols.