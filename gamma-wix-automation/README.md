# 🎨 GAMMA-Wix Automation System

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![GAMMA](https://img.shields.io/badge/GAMMA-3.0-purple.svg)](https://gamma.app/)
[![Wix](https://img.shields.io/badge/Wix-Integration-blue.svg)](https://www.wix.com/)

> **Comprehensive automation script for generating GAMMA presentations and syncing to Wix sites**

## 🌟 Features

- 🤖 **Automated Presentation Generation** - Create presentations from templates
- 🔄 **Bi-directional Sync** - Sync content between GAMMA and Wix
- 🎨 **WIRED CHAOS Branding** - Consistent cyberpunk theme across all presentations
- 📦 **Batch Processing** - Generate multiple presentations efficiently
- 🔔 **Notifications** - Discord and Telegram integration
- 🔁 **Retry Logic** - Automatic retry with exponential backoff
- 📊 **Analytics** - Track presentation engagement
- ⚡ **GitHub Actions** - Automated workflows for CI/CD

## 📁 Project Structure

```
gamma-wix-automation/
├── src/
│   ├── gamma-client.js          # GAMMA API integration
│   ├── wix-client.js            # Wix API integration
│   ├── presentation-generator.js # Main generation logic
│   ├── template-manager.js      # Template handling
│   └── content-sync.js          # Wix synchronization
├── templates/
│   ├── component-template.json  # Component documentation template
│   ├── feature-template.json    # Feature release template
│   └── milestone-template.json  # Milestone template
├── workflows/
│   └── gamma-automation.yml     # GitHub Actions workflow
├── config/
│   ├── gamma-config.js          # Configuration management
│   └── environment.js           # Environment settings
├── tests/
│   ├── gamma-client.test.js     # Unit tests
│   └── integration.test.js      # Integration tests
└── docs/
    ├── GAMMA_INTEGRATION.md     # Integration guide
    └── API_REFERENCE.md         # API documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- GAMMA API token
- Wix API credentials
- GitHub account (for CI/CD)

### Installation

```bash
# Clone repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos/gamma-wix-automation

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Configuration

Create `.env` file:

```env
# GAMMA Configuration
GAMMA_API_TOKEN=your_gamma_api_token
GAMMA_API_BASE=https://gamma.app/api/v1

# Wix Configuration
WIX_API_TOKEN=your_wix_api_token
WIX_SITE_ID=your_site_id
WIX_API_BASE=https://www.wixapis.com

# Automation Settings
RETRY_ATTEMPTS=3
RETRY_DELAY=2000
BATCH_SIZE=5
ENABLE_NOTIFICATIONS=true
ENABLE_LOGGING=true

# Notifications
DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=your_discord_webhook
TELEGRAM_ENABLED=false
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_chat_id

# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=wiredchaos
GITHUB_REPO=wired-chaos
```

### Basic Usage

#### Generate Presentations

```bash
# Generate presentations
npm run generate

# Or run directly
node src/presentation-generator.js
```

#### Sync to Wix

```bash
# Sync all presentations
npm run sync

# Sync specific presentation
node src/content-sync.js presentation <presentation-id> <gallery-type>

# Check sync status
node src/content-sync.js status
```

#### Run Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

## 📖 Usage Examples

### Generate Component Documentation

```javascript
import { PresentationGenerator } from './src/presentation-generator.js';

const generator = new PresentationGenerator();
await generator.initialize();

const componentData = {
  name: 'Suite Landing Component',
  description: 'WIRED CHAOS Suite Landing Page',
  overview: 'A comprehensive landing page component',
  features: [
    'Responsive design',
    'Cyberpunk theme',
    'AR/VR integration'
  ],
  codeExample: `import SuiteLanding from '@wired-chaos/suite-landing';
const landing = new SuiteLanding({ theme: 'cyber-dark' });
landing.render('#app');`,
  language: 'javascript'
};

const presentation = await generator.generateComponentPresentation(componentData);
await generator.syncToWix(presentation, 'components');
```

### Generate Feature Release

```javascript
const featureData = {
  name: 'AR Model Viewer',
  version: 'v2.0',
  description: 'Enhanced AR model viewing with WebXR support',
  benefits: [
    'Cross-platform compatibility',
    'Improved performance',
    'Real-time collaboration'
  ],
  implementation: `const viewer = new ARViewer({
  model: '/models/demo.glb',
  enableXR: true
});`,
  gettingStarted: 'Install with npm install @wired-chaos/ar-viewer'
};

const presentation = await generator.generateFeaturePresentation(featureData);
```

### Batch Generation

```javascript
const components = [
  { name: 'Component A', description: '...' },
  { name: 'Component B', description: '...' },
  { name: 'Component C', description: '...' }
];

const results = await generator.batchGenerate(components, 'component');
console.log(`Generated ${results.filter(r => r.status === 'fulfilled').length} presentations`);
```

## 🔧 Configuration

### GAMMA Settings

Configure in `config/gamma-config.js`:

```javascript
export const config = {
  gamma: {
    apiToken: process.env.GAMMA_API_TOKEN,
    templateIds: {
      component: 'template-component-id',
      feature: 'template-feature-id',
      milestone: 'template-milestone-id'
    },
    brandingSettings: {
      primaryColor: '#00fff0',      // Cyan
      secondaryColor: '#ff2a2a',    // Red
      accentColor: '#8000ff',       // Purple
      fonts: {
        primary: 'Orbitron',
        secondary: 'Rajdhani'
      }
    }
  }
};
```

### Wix Settings

```javascript
wix: {
  siteId: process.env.WIX_SITE_ID,
  apiToken: process.env.WIX_API_TOKEN,
  galleryIds: {
    components: 'gallery-components-id',
    features: 'gallery-features-id',
    milestones: 'gallery-milestones-id'
  }
}
```

## 🤖 GitHub Actions Integration

The automation workflow triggers on:

- **Push to main** - Auto-generate presentations for changes
- **Release published** - Create feature release presentations
- **Milestone closed** - Generate milestone summaries
- **Schedule** - Daily batch processing at 9 AM UTC
- **Manual dispatch** - On-demand generation

### Workflow Configuration

Place in `.github/workflows/gamma-automation.yml`:

```yaml
name: GAMMA-Wix Presentation Automation

on:
  push:
    branches: [main]
  release:
    types: [published]
  schedule:
    - cron: '0 9 * * *'
  workflow_dispatch:

jobs:
  generate-presentations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd gamma-wix-automation && npm install
      - run: cd gamma-wix-automation && npm run generate
        env:
          GAMMA_API_TOKEN: ${{ secrets.GAMMA_API_TOKEN }}
          WIX_API_TOKEN: ${{ secrets.WIX_API_TOKEN }}
```

## 📚 Documentation

- [GAMMA Integration Guide](docs/GAMMA_INTEGRATION.md)
- [API Reference](docs/API_REFERENCE.md)
- [Wix Integration](../wix-gamma-integration/docs/wix-integration.md)

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

### Test Coverage

- ✅ GAMMA API client
- ✅ Wix API client
- ✅ Template manager
- ✅ Presentation generator
- ✅ Content synchronization
- ✅ Configuration validation

## 🔔 Notifications

### Discord

Configure Discord webhook:

```env
DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Telegram

Configure Telegram bot:

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## 🐛 Troubleshooting

### Common Issues

#### API Authentication Failed

```bash
# Verify tokens
echo $GAMMA_API_TOKEN
echo $WIX_API_TOKEN

# Test connection
node -e "import('./src/gamma-client.js').then(m => {
  const c = new m.default(process.env.GAMMA_API_TOKEN);
  c.listPresentations().then(console.log);
})"
```

#### Sync Failed

```bash
# Check sync status
npm run sync status

# Manual sync
npm run sync all
```

#### Rate Limiting

Adjust retry settings in `config/gamma-config.js`:

```javascript
automation: {
  retryAttempts: 5,      // Increase retries
  retryDelay: 3000,      // Increase delay
  batchSize: 3           // Reduce batch size
}
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details

## 🔗 Related Projects

- [wix-gamma-integration](../wix-gamma-integration) - Core integration system
- [grants-bot](../grants-bot) - Grant automation with GAMMA pitch decks

## 📞 Support

- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Discord: [WIRED CHAOS Community]
- Email: support@wiredchaos.io

---

**WIRED CHAOS** - Automated Presentation Generation 🚀

*Built with 💜 by the WIRED CHAOS team*
