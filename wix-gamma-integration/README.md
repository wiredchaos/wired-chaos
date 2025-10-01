# 🌐 WIRED CHAOS - WIX & GAMMA Integration System

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![WIX](https://img.shields.io/badge/WIX-Integration-blue.svg)](https://www.wix.com/)
[![GAMMA](https://img.shields.io/badge/GAMMA-API-purple.svg)](https://gamma.app/)

> **Seamless integration between WIX websites and GAMMA presentations with WIRED CHAOS infrastructure**

## 🎯 Overview

The WIX & GAMMA Integration System provides a comprehensive solution for connecting WIX websites and GAMMA presentations with the WIRED CHAOS infrastructure, featuring:

- ⚡️ **Cloudflare Workers** - High-performance API gateway with global edge caching
- 🔒 **NSA-Level Security** - Advanced CSP, CORS, rate limiting, and CSRF protection
- 🎨 **WIRED CHAOS Branding** - Pre-built templates with cyber-themed design
- 📊 **Real-time Analytics** - WC-BUS integration for unified event tracking
- 🥽 **AR/VR Support** - WebXR model viewer for 3D content on WIX
- 🤖 **AI-Powered Content** - Automated presentation generation
- 🔄 **Bi-directional Sync** - Automatic content synchronization
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
│   ├── workers/                  # Workers scripts
│   │   └── integration-worker.js
│   ├── pages/                    # Pages configuration
│   └── kv-schemas/               # KV data schemas
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
    └── deployment-guide.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
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

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Deploy to Cloudflare
npm run deploy
```

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

### Cloudflare Worker

#### ⚡️ Performance
- Global edge caching
- 0ms cold starts
- Smart cache invalidation
- CDN optimization

#### 🔒 Security
- NSA-level encryption
- DDoS protection
- Rate limiting
- Audit logging

#### 🔄 Sync Engine
- Bi-directional sync
- Conflict resolution
- Webhook integration
- Real-time updates

## 📚 Documentation

- [WIX Integration Guide](docs/wix-integration.md)
- [GAMMA Integration Guide](docs/gamma-integration.md)
- [Deployment Guide](docs/deployment-guide.md)

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
# Run tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📈 Performance

- **Cold start**: <100ms
- **Average response**: <50ms
- **Cache hit rate**: >95%
- **Global latency**: <30ms

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
