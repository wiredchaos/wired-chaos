# GAMMA Integration Guide

## Overview

This guide covers the integration of GAMMA 3.0 AI presentation platform with the WIRED CHAOS automation system.

## Table of Contents

- [Setup](#setup)
- [Configuration](#configuration)
- [API Client](#api-client)
- [Templates](#templates)
- [Automation](#automation)
- [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Node.js 18+
- GAMMA API token
- Wix API credentials

### Installation

```bash
cd gamma-wix-automation
npm install
```

### Environment Variables

Create a `.env` file:

```env
# GAMMA Configuration
GAMMA_API_TOKEN=your_gamma_api_token
GAMMA_API_BASE=https://gamma.app/api/v1

# Wix Configuration
WIX_API_TOKEN=your_wix_api_token
WIX_SITE_ID=your_site_id

# Notifications
DISCORD_WEBHOOK_URL=your_discord_webhook
DISCORD_ENABLED=true

# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=wiredchaos
GITHUB_REPO=wired-chaos
```

## Configuration

### GAMMA Settings

Configure GAMMA settings in `config/gamma-config.js`:

```javascript
export const config = {
  gamma: {
    apiToken: process.env.GAMMA_API_TOKEN,
    apiBase: 'https://gamma.app/api/v1',
    templateIds: {
      component: 'template-component-id',
      feature: 'template-feature-id',
      milestone: 'template-milestone-id'
    },
    brandingSettings: {
      primaryColor: '#00fff0',
      secondaryColor: '#ff2a2a',
      accentColor: '#8000ff',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      fonts: {
        primary: 'Orbitron',
        secondary: 'Rajdhani',
        monospace: 'Share Tech Mono'
      }
    }
  }
};
```

## API Client

### Basic Usage

```javascript
import GammaClient from './src/gamma-client.js';

const client = new GammaClient(process.env.GAMMA_API_TOKEN);

// Create presentation
const presentation = await client.createPresentation(
  'My Presentation',
  [
    {
      type: 'title',
      title: 'Welcome',
      content: 'Subtitle text'
    },
    {
      type: 'content',
      title: 'Overview',
      content: 'Main content'
    }
  ]
);
```

### Advanced Features

#### Custom Theming

```javascript
const theme = client.createWiredChaosTheme();
// Theme automatically includes WIRED CHAOS branding
```

#### Export Presentations

```javascript
const exported = await client.exportPresentation(
  presentationId,
  'pdf',
  { quality: 'high' }
);
```

#### Batch Operations

```javascript
const presentations = await client.listPresentations();
for (const p of presentations.data) {
  await client.exportPresentation(p.id, 'pdf');
}
```

## Templates

### Template Structure

Templates are JSON files that define presentation structure:

```json
{
  "name": "Component Documentation Template",
  "slides": [
    {
      "type": "title",
      "template": {
        "title": "{{componentName}}",
        "subtitle": "Component Documentation"
      }
    },
    {
      "type": "content",
      "template": {
        "title": "Overview",
        "content": "{{overview}}"
      }
    }
  ]
}
```

### Available Templates

1. **Component Template** - `component-template.json`
   - Component documentation
   - API references
   - Usage examples

2. **Feature Template** - `feature-template.json`
   - Feature releases
   - Benefits and demos
   - Implementation guides

3. **Milestone Template** - `milestone-template.json`
   - Project milestones
   - Achievement summaries
   - Metrics and next steps

### Creating Custom Templates

```javascript
import TemplateManager from './src/template-manager.js';

const manager = new TemplateManager();

const customPresentation = manager.generateComponentPresentation({
  name: 'My Component',
  description: 'Description',
  features: ['Feature 1', 'Feature 2'],
  codeExample: 'const x = 1;'
});
```

## Automation

### GitHub Actions Integration

The automation workflow triggers on:

- **Push to main** - Generates presentations for new changes
- **Release published** - Creates feature release presentations
- **Milestone closed** - Generates milestone summary presentations
- **Schedule** - Daily batch processing at 9 AM UTC
- **Manual dispatch** - On-demand generation

### Manual Execution

Generate presentations manually:

```bash
# Generate presentations
npm run generate

# Sync to Wix
npm run sync

# Check status
node src/content-sync.js status
```

### Batch Generation

```javascript
import { PresentationGenerator } from './src/presentation-generator.js';

const generator = new PresentationGenerator();
await generator.initialize();

// Generate multiple presentations
const components = [
  { name: 'Component A', description: '...' },
  { name: 'Component B', description: '...' }
];

await generator.batchGenerate(components, 'component');
```

## Troubleshooting

### Common Issues

#### API Authentication Failed

**Problem**: 401 Unauthorized error

**Solution**:
1. Verify GAMMA_API_TOKEN is correct
2. Check token expiration
3. Ensure proper authorization scope

```bash
# Test API connection
node -e "import('./src/gamma-client.js').then(m => {
  const c = new m.default(process.env.GAMMA_API_TOKEN);
  c.listPresentations().then(r => console.log(r));
})"
```

#### Export Failed

**Problem**: Presentation export returns error

**Solution**:
1. Check presentation ID is valid
2. Verify export format is supported
3. Ensure presentation has content
4. Check rate limits

#### Sync Issues

**Problem**: Content not syncing to Wix

**Solution**:
1. Verify Wix API credentials
2. Check gallery IDs are correct
3. Ensure network connectivity
4. Review API rate limits

### Debug Mode

Enable detailed logging:

```bash
NODE_ENV=development npm run generate
```

### Rate Limiting

The client includes automatic retry with exponential backoff:

```javascript
// Configured in gamma-config.js
automation: {
  retryAttempts: 3,
  retryDelay: 2000,  // 2 seconds
  batchSize: 5
}
```

## Best Practices

### 1. Template Management

- Keep templates version controlled
- Use descriptive template names
- Document template variables
- Test templates before deployment

### 2. Error Handling

- Always check response status
- Implement proper error logging
- Use retry mechanisms
- Handle rate limiting gracefully

### 3. Performance Optimization

- Use batch operations for multiple presentations
- Implement caching where appropriate
- Monitor API usage and limits
- Schedule heavy operations during off-peak hours

### 4. Security

- Never commit API tokens
- Use environment variables
- Rotate tokens regularly
- Implement proper access controls

## API Reference

### GammaClient

#### Methods

- `createPresentation(title, slides, metadata)` - Create new presentation
- `getPresentation(id)` - Fetch presentation by ID
- `updatePresentation(id, updates)` - Update existing presentation
- `deletePresentation(id)` - Delete presentation
- `exportPresentation(id, format, options)` - Export to PDF/PPTX
- `listPresentations(filters)` - List all presentations

### PresentationGenerator

#### Methods

- `initialize()` - Initialize and validate configuration
- `generateComponentPresentation(data)` - Generate component doc
- `generateFeaturePresentation(data)` - Generate feature release
- `generateMilestonePresentation(data)` - Generate milestone summary
- `syncToWix(presentation, galleryType)` - Sync to Wix gallery
- `batchGenerate(items, type)` - Batch generate presentations

### ContentSync

#### Methods

- `syncAllToWix()` - Sync all presentations to Wix
- `syncPresentationToWix(id, galleryType)` - Sync single presentation
- `syncWixToGamma(collectionId)` - Reverse sync from Wix
- `checkSyncStatus()` - Check current sync status

## Support

For issues and questions:

- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Documentation: https://github.com/wiredchaos/wired-chaos/tree/main/gamma-wix-automation
- Discord: [WIRED CHAOS Community]

---

**WIRED CHAOS** - Automated Presentation Generation 🚀
