# 🌐 WIRED CHAOS - WIX & GAMMA Integration System

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![WIX](https://img.shields.io/badge/WIX-Integration-blue.svg)](https://www.wix.com/)
[![GAMMA](https://img.shields.io/badge/GAMMA-API-purple.svg)](https://gamma.app/)

> **Seamless integration between WIX websites and GAMMA presentations with WIRED CHAOS infrastructure**

## 🎯 Overview

The WIX & GAMMA Integration System provides a comprehensive solution for connecting WIX websites and GAMMA presentations with the WIRED CHAOS infrastructure, featuring:

- ⚡️ **TypeScript Cloudflare Workers** - Type-safe, high-performance API gateway with global edge caching
- 🔒 **NSA-Level Security** - Advanced CSP, CORS, rate limiting, CSRF protection, and HMAC signature verification
- 💾 **Durable Objects** - Distributed rate limiting and audit logging with persistent state
- 🎨 **WIRED CHAOS Branding** - Pre-built templates with cyber-themed design
- 📊 **Real-time Analytics** - WC-BUS integration for unified event tracking
- 🥽 **AR/VR Support** - WebXR model viewer for 3D content on WIX
- 🤖 **AI-Powered Content** - Automated presentation generation
- 🔄 **Bi-directional Sync** - Automatic content synchronization with Zapier & Wix Velo
- 📱 **Responsive Design** - Mobile-first approach

## 📁 Project Structure

```
wix-gamma-integration/
├── wix/                          # WIX Integration
│   ├── components/               # Reusable WIX components
│   ├── pages/                    # Example page templates
│   ├── backend/                  # WIX backend code
│   ├── public/                   # Public assets
│   └── velo/                     # Velo integration library
│       └── wired-chaos-integration.js
├── gamma/                        # GAMMA Integration
│   ├── templates/                # Presentation templates
│   │   └── templates.ts
│   ├── themes/                   # Custom themes
│   ├── api/                      # GAMMA API client
│   │   └── gamma-client.ts
│   └── exports/                  # Export automation
├── cloudflare/                   # Cloudflare Infrastructure
│   ├── workers/                  # Workers scripts (TypeScript)
│   │   ├── integration-worker.ts # Main worker (TypeScript)
│   │   ├── integration-worker.js # Legacy JavaScript (backup)
│   │   ├── types.ts              # Type definitions
│   │   ├── tsconfig.json         # TypeScript config
│   │   ├── wrangler.toml         # Worker configuration
│   │   └── durable-objects/      # Durable Objects
│   │       ├── RateLimiter.ts    # Rate limiting DO
│   │       └── AuditLogger.ts    # Audit logging DO
│   ├── pages/                    # Pages configuration
│   └── kv-schemas/               # KV data schemas
├── zapier-templates/             # Zapier Automation Templates
│   ├── README.md                 # Zapier setup guide
│   ├── wix-to-gamma-sync.json   # WIX→GAMMA sync template
│   └── gamma-to-wix-export.json # GAMMA→WIX export template
├── wix-velo-examples/            # Wix Velo Backend Examples
│   ├── README.md                 # Velo integration guide
│   ├── worker-api-client.js     # API client library
│   ├── data-hooks.js            # Data collection hooks
│   └── http-functions.js        # HTTP function endpoints
├── shared/                       # Shared Code
│   ├── types/                    # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   └── index.js
│   └── constants/                # Constants and config
│       └── index.js
└── docs/                         # Documentation
    ├── wix-integration.md
    ├── gamma-integration.md
    ├── deployment-guide.md
    ├── typescript-migration.md   # TypeScript migration guide
    └── durable-objects.md        # Durable Objects guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- TypeScript 5+
- Cloudflare account with Durable Objects enabled
- WIX Developer account
- GAMMA API key
- Wrangler CLI

### Installation

```bash
# Clone repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos/wix-gamma-integration

# Install dependencies
npm install

# TypeScript type check
cd cloudflare/workers
npx tsc --noEmit

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Deploy TypeScript worker to Cloudflare
npm run deploy
```

## 🔥 What's New in TypeScript Version

### TypeScript with Strict Type Safety
- Full TypeScript rewrite with strict mode enabled
- Type-safe API calls and error handling
- Better IDE support and autocomplete
- Compile-time error detection

### Durable Objects
- **Rate Limiter DO**: Distributed rate limiting across edge locations
- **Audit Logger DO**: Persistent audit logs with query and export
- Automatic cleanup with alarms
- Scalable to millions of requests

### Enhanced Security
- HMAC signature verification for webhooks (properly awaited)
- Enhanced CORS headers for broader compatibility
- Rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- Structured audit logging for compliance

### Developer Experience
- Zapier integration templates
- Wix Velo backend code examples
- Comprehensive TypeScript documentation
- GitHub Actions workflow for automated deployment

### Basic Usage

#### WIX Integration

```javascript
import wixChaos from './public/wired-chaos-integration.js';

$w.onReady(function() {
  // Initialize
  const chaos = wixChaos.initialize({
    apiBase: 'https://wired-chaos.pages.dev',
    apiKey: 'YOUR_API_KEY'
  });
  
  // Load AR model
  chaos.loadARModel('model-123', '#arViewer');
  
  // Track events
  chaos.trackEvent('page_view', { page: 'home' });
});
```

#### GAMMA Integration

```typescript
import { GammaAPIClient } from './gamma/api/gamma-client';

const gamma = new GammaAPIClient('YOUR_API_KEY');

// Create presentation
const presentation = await gamma.createPresentation(
  'My Presentation',
  [
    { type: 'title', title: 'Welcome', content: 'WIRED CHAOS' },
    { type: 'content', title: 'Overview', content: '...' }
  ]
);

// Export as PDF
const pdf = await gamma.exportPresentation(
  presentation.data.id,
  'pdf',
  { quality: 'high' }
);
```

#### Zapier Integration

```javascript
// See zapier-templates/ for ready-to-use templates
// 1. WIX to GAMMA sync - Automatically sync content updates
// 2. GAMMA to WIX export - Export presentations and upload to WIX

// Setup:
// 1. Import template from zapier-templates/
// 2. Configure webhook URLs
// 3. Set API tokens in Zapier
// 4. Test and activate

// See zapier-templates/README.md for full instructions
```

#### Wix Velo Backend

```javascript
// In backend code (backend/wired-chaos/worker-api-client.js)
import { getGammaPresentations } from 'backend/wired-chaos/worker-api-client';

$w.onReady(async function () {
  const result = await getGammaPresentations(5);
  $w('#presentationsRepeater').data = result.data.presentations;
});

// Auto-sync with data hooks (backend/data.js)
export function Content_afterInsert(item, context) {
  syncWixToGamma({ action: 'create', data: item });
  return item;
}

// See wix-velo-examples/ for complete examples
```

## ✨ Features

### WIX Integration

#### 🔐 Security Headers
- Automatic CSP, X-Frame-Options, CORS
- Rate limiting (100 req/min)
- Bearer token authentication
- CSRF protection

#### 🥽 AR/VR Model Viewer
- GLB, USDZ, GLTF support
- WebXR API integration
- Lazy loading
- R2 storage optimization

#### 📊 Analytics & Tracking
- WC-BUS event integration
- Real-time analytics
- Custom event tracking
- Session management

#### 📝 Form Processing
- Secure form handling
- Built-in validation
- CSRF protection
- Custom webhooks

### GAMMA Integration

#### 🎨 Templates & Themes
- **Cyber Dark** - Neon cyan accents on black
- **Glitch** - Red glitch effects
- **Electric** - Green electric theme

Pre-built templates:
- Tech Pitch
- Product Demo
- Training/Tutorial
- Status Report

#### 🤖 AI-Powered Content
- Automatic slide generation
- WIX content transformation
- Dynamic data integration
- Live chart updates

#### 👥 Collaboration
- Real-time multi-user editing
- Version control
- Comment system
- Permission management

#### 📤 Export Automation
- PDF export
- PowerPoint (PPTX)
- HTML export
- PNG images
- Batch processing

### TypeScript Cloudflare Worker

#### ⚡️ Performance
- Global edge caching
- 0ms cold starts
- Smart cache invalidation
- CDN optimization

#### 🔒 Security
- NSA-level encryption
- DDoS protection
- Durable Objects rate limiting (distributed)
- Persistent audit logging with Durable Objects
- HMAC webhook signature verification

#### 🔄 Sync Engine
- Bi-directional sync
- Conflict resolution
- Webhook integration
- Real-time updates
- Zapier automation support

#### 💾 Durable Objects
- **RateLimiter DO**: Distributed rate limiting across edge
  - Per-identifier tracking (IP, user, API key)
  - Configurable windows and limits
  - X-RateLimit-* headers
- **AuditLogger DO**: Persistent audit logs
  - Query by time range and type
  - CSV export for compliance
  - 30-day automatic retention

## 📚 Documentation

### Core Documentation
- [WIX Integration Guide](docs/wix-integration.md)
- [GAMMA Integration Guide](docs/gamma-integration.md)
- [Deployment Guide](docs/deployment-guide.md)

### TypeScript & Durable Objects
- [TypeScript Migration Guide](docs/typescript-migration.md) - **NEW!**
- [Durable Objects Guide](docs/durable-objects.md) - **NEW!**

### Integration Examples
- [Zapier Templates](zapier-templates/README.md) - **NEW!**
- [Wix Velo Examples](wix-velo-examples/README.md) - **NEW!**

## 🎨 WIRED CHAOS Branding

### Color Palette

```css
--wc-black: #000000;
--wc-neon-cyan: #00FFFF;
--wc-glitch-red: #FF3131;
--wc-electric-green: #39FF14;
--wc-accent-pink: #FF00FF;
```

### Typography

```css
--wc-font-heading: 'Orbitron', sans-serif;
--wc-font-body: 'Rajdhani', sans-serif;
--wc-font-mono: 'Share Tech Mono', monospace;
```

## 🔧 Configuration

### Environment Variables

```env
# WIX
WIX_APP_ID=your_app_id
WIX_APP_SECRET=your_app_secret
WIX_SITE_ID=your_site_id
WIX_API_TOKEN=your_api_token

# GAMMA
GAMMA_API_KEY=your_api_key
GAMMA_PROJECT_ID=your_project_id

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Cloudflare KV Namespaces

```bash
# Create namespaces
wrangler kv:namespace create CACHE_KV
wrangler kv:namespace create ANALYTICS_KV
wrangler kv:namespace create SYNC_KV
```

### R2 Bucket

```bash
# Create bucket for AR models
wrangler r2 bucket create wired-chaos-ar-models
```

## 🧪 Testing

```bash
# TypeScript type check
cd cloudflare/workers
npx tsc --noEmit

# Run tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### TypeScript Worker Deployment

```bash
# Deploy to production
cd cloudflare/workers
wrangler deploy --env production

# Deploy to staging
wrangler deploy --env staging

# View logs
wrangler tail --env production

# Monitor Durable Objects
# Check Cloudflare Dashboard → Workers & Pages → Durable Objects
```

### GitHub Actions

The TypeScript worker automatically deploys via GitHub Actions:
- **File**: `.github/workflows/deploy-wix-gamma-ts.yml`
- **Triggers**: Push to main, PR, manual dispatch
- **Steps**:
  1. TypeScript type check
  2. Run tests
  3. Deploy worker
  4. Set secrets
  5. Generate deployment report

### Secrets Configuration

Set secrets in GitHub or via Wrangler:

```bash
# Via Wrangler
echo "YOUR_TOKEN" | wrangler secret put WIX_API_TOKEN --env production
echo "YOUR_SECRET" | wrangler secret put WIX_WEBHOOK_SECRET --env production
echo "YOUR_KEY" | wrangler secret put GAMMA_API_KEY --env production

# Via GitHub (Settings → Secrets → Actions)
# Required secrets:
# - CLOUDFLARE_API_TOKEN
# - CLOUDFLARE_ACCOUNT_ID
# - WIX_API_TOKEN
# - WIX_WEBHOOK_SECRET
# - GAMMA_API_KEY
```

## 📈 Performance

- **Cold start**: <100ms (TypeScript compiled by Wrangler)
- **Average response**: <50ms
- **Cache hit rate**: >95%
- **Global latency**: <30ms
- **Durable Objects**: Single-digit millisecond reads/writes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

## 🔗 Links

- [WIRED CHAOS Main Site](https://wiredchaos.xyz)
- [GitHub Repository](https://github.com/wiredchaos/wired-chaos)
- [WIX Developer](https://dev.wix.com)
- [GAMMA App](https://gamma.app)
- [Cloudflare Workers](https://workers.cloudflare.com)

## 💬 Support

- GitHub Issues: [Report a bug](https://github.com/wiredchaos/wired-chaos/issues)
- Discord: [Join community](https://discord.gg/wiredchaos)
- Email: support@wiredchaos.xyz

## 🙏 Acknowledgments

- WIX Platform Team
- GAMMA App Team
- Cloudflare Workers Team
- WIRED CHAOS Community

---

**Built with 💜 by WIRED CHAOS** | Bridging Web2 and Web3

🔗 [wiredchaos.xyz](https://wiredchaos.xyz) | 🐦 [@wiredchaos](https://twitter.com/wiredchaos) | 💼 [LinkedIn](https://linkedin.com/company/wiredchaos)
