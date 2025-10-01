# GAMMA Integration Guide

Complete guide for integrating GAMMA presentations with WIRED CHAOS infrastructure.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [GAMMA API Client](#gamma-api-client)
4. [Templates](#templates)
5. [Creating Presentations](#creating-presentations)
6. [AI-Powered Content](#ai-powered-content)
7. [Collaboration Features](#collaboration-features)
8. [Export & Publishing](#export--publishing)
9. [WIX Integration](#wix-integration)
10. [Troubleshooting](#troubleshooting)

## Overview

The GAMMA integration enables AI-powered presentation creation with WIRED CHAOS branding, data synchronization, and automated workflows.

### Features

- **AI-Driven Slide Creation**: Automatic content generation
- **WIRED CHAOS Templates**: Pre-designed branded themes
- **Real-time Collaboration**: Multi-user editing
- **Data Integration**: Live charts and visualizations
- **Export Automation**: PDF, PowerPoint, HTML formats
- **Version Control**: Presentation history and rollback

## Setup

### 1. GAMMA Account

1. Create account at [gamma.app](https://gamma.app)
2. Go to Settings → Developer → API Keys
3. Create new API key with "Read/Write" permissions
4. Copy API key for configuration

### 2. GitHub Secrets

Add to your GitHub repository:

```bash
GAMMA_API_KEY=your_api_key_here
GAMMA_PROJECT_ID=your_project_id
```

### 3. Environment Variables

For local development, create `.env`:

```env
GAMMA_API_KEY=your_api_key
GAMMA_API_BASE=https://gamma.app/api/v1
GAMMA_WEBHOOK_URL=https://your-worker.workers.dev/api/gamma/webhook
```

## GAMMA API Client

### Installation

```typescript
import { GammaAPIClient } from './wix-gamma-integration/gamma/api/gamma-client';

// Initialize client
const gamma = new GammaAPIClient('your-api-key');
```

### Basic Operations

#### List Presentations

```typescript
const presentations = await gamma.listPresentations();

if (presentations.success) {
  presentations.data.forEach(p => {
    console.log(`${p.title} - ${p.slides.length} slides`);
  });
}
```

#### Get Presentation

```typescript
const presentation = await gamma.getPresentation('presentation-id');

if (presentation.success) {
  console.log(`Title: ${presentation.data.title}`);
  console.log(`Slides: ${presentation.data.slides.length}`);
  console.log(`Created: ${presentation.data.createdAt}`);
}
```

#### Create Presentation

```typescript
const newPresentation = await gamma.createPresentation(
  'My WIRED CHAOS Presentation',
  [
    {
      type: 'title',
      title: 'Welcome',
      content: 'Powered by WIRED CHAOS'
    },
    {
      type: 'content',
      title: 'Overview',
      content: 'Key points...',
      layout: 'two-column'
    }
  ]
);

console.log('Created:', newPresentation.data.id);
```

#### Update Presentation

```typescript
const updated = await gamma.updatePresentation('presentation-id', {
  title: 'Updated Title',
  description: 'New description'
});
```

#### Delete Presentation

```typescript
await gamma.deletePresentation('presentation-id');
```

## Templates

### Pre-built Templates

WIRED CHAOS provides several branded templates:

#### Tech Pitch Template

```typescript
import { templates } from './gamma/templates/templates';

const presentation = await gamma.createPresentation(
  'My Startup Pitch',
  templates.techPitch('My Startup', 'Revolutionary product description').slides
);
```

#### Product Demo Template

```typescript
const demo = templates.productDemo('Product Name');
const presentation = await gamma.createPresentation(
  demo.title,
  demo.slides
);
```

#### Training Template

```typescript
const training = templates.training('Course Name');
const presentation = await gamma.createPresentation(
  training.title,
  training.slides
);
```

#### Status Report Template

```typescript
const report = templates.statusReport('Project Alpha');
const presentation = await gamma.createPresentation(
  report.title,
  report.slides
);
```

### Custom Templates

Create your own templates:

```typescript
import { 
  createTitleSlide,
  createContentSlide,
  createCodeSlide,
  createDataSlide 
} from './gamma/templates/templates';

const customSlides = [
  createTitleSlide('My Presentation', 'Subtitle', 'Author'),
  createContentSlide('Section 1', 'Content here...', 1),
  createCodeSlide(
    'Code Example',
    'const x = 42;\nconsole.log(x);',
    'javascript',
    2
  ),
  createDataSlide('Statistics', chartData, 3)
];

const presentation = await gamma.createPresentation(
  'Custom Presentation',
  customSlides
);
```

## Creating Presentations

### Add Slides

```typescript
// Add content slide
await gamma.addSlide('presentation-id', {
  type: 'content',
  title: 'New Slide',
  content: 'Slide content...',
  layout: 'single'
});

// Add code slide
await gamma.addCodeSlide(
  'presentation-id',
  'Code Example',
  'function hello() {\n  return "world";\n}',
  'javascript'
);

// Add data visualization
await gamma.addDataSlide(
  'presentation-id',
  'Performance Metrics',
  {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Revenue',
        data: [100, 150, 200, 250],
        color: '#00FFFF'
      }]
    }
  }
);
```

### Update Slides

```typescript
await gamma.updateSlide('presentation-id', 'slide-id', {
  title: 'Updated Title',
  content: 'Updated content...',
  animations: [
    {
      type: 'fade',
      duration: 1000,
      delay: 200
    }
  ]
});
```

### Delete Slides

```typescript
await gamma.deleteSlide('presentation-id', 'slide-id');
```

### Apply Themes

```typescript
import { themes } from './gamma/templates/templates';

// Apply Cyber Dark theme
await gamma.applyTheme('presentation-id', themes.CyberDarkTheme.id);

// Apply Glitch theme
await gamma.applyTheme('presentation-id', themes.GlitchTheme.id);

// Apply Electric theme
await gamma.applyTheme('presentation-id', themes.ElectricTheme.id);
```

## AI-Powered Content

### Generate from WIX Content

```typescript
// Fetch content from WIX
const wixContent = {
  title: 'Product Launch',
  description: 'New features announcement',
  sections: [
    { title: 'Overview', content: '...' },
    { title: 'Features', content: '...' },
    { title: 'Pricing', content: '...' }
  ]
};

// Create presentation from WIX content
const presentation = await gamma.createFromWixContent(
  wixContent,
  'Product Launch Presentation'
);

console.log('Created presentation:', presentation.data.id);
```

### Dynamic Data Integration

```typescript
// Create presentation with live data
const slides = [
  createTitleSlide('Monthly Report', 'Data-driven insights'),
  createDataSlide(
    'User Growth',
    {
      type: 'line',
      data: {
        labels: await fetchDateLabels(),
        datasets: [{
          label: 'Active Users',
          data: await fetchUserMetrics(),
          color: '#39FF14'
        }]
      }
    },
    1
  ),
  createDataSlide(
    'Revenue',
    {
      type: 'bar',
      data: {
        labels: await fetchDateLabels(),
        datasets: [{
          label: 'Monthly Revenue',
          data: await fetchRevenueMetrics(),
          color: '#00FFFF'
        }]
      }
    },
    2
  )
];

const presentation = await gamma.createPresentation(
  'Monthly Report',
  slides
);
```

## Collaboration Features

### Share Presentation

```typescript
// Share with viewers
await gamma.sharePresentation(
  'presentation-id',
  ['user1@example.com', 'user2@example.com'],
  'viewer'
);

// Share with editors
await gamma.sharePresentation(
  'presentation-id',
  ['editor@example.com'],
  'editor'
);
```

### Real-time Collaboration

```typescript
// Connect to collaboration session (WebSocket)
const ws = new WebSocket(
  'wss://your-worker.workers.dev/api/gamma/collaboration/session-id'
);

ws.onmessage = (event) => {
  const change = JSON.parse(event.data);
  
  if (change.type === 'slide.update') {
    console.log(`User ${change.userId} updated slide ${change.slideId}`);
  }
};

// Send changes
ws.send(JSON.stringify({
  type: 'slide.update',
  slideId: 'slide-123',
  data: { title: 'New Title' }
}));
```

### Version Control

```typescript
// Get presentation history
const history = await gamma.getStatistics('presentation-id');

// Rollback to previous version
await gamma.updatePresentation('presentation-id', {
  version: history.data.version - 1
});
```

## Export & Publishing

### Export Formats

```typescript
// Export as PDF
const pdf = await gamma.exportPresentation(
  'presentation-id',
  'pdf',
  {
    quality: 'high',
    includeNotes: true,
    watermark: 'WIRED CHAOS'
  }
);

console.log('PDF URL:', pdf.data.url);
console.log('Expires:', new Date(pdf.data.expiresAt));

// Export as PowerPoint
const pptx = await gamma.exportPresentation(
  'presentation-id',
  'pptx',
  { quality: 'high' }
);

// Export as HTML
const html = await gamma.exportPresentation(
  'presentation-id',
  'html',
  { includeNotes: false }
);

// Export as PNG images
const png = await gamma.exportPresentation(
  'presentation-id',
  'png',
  { quality: 'high' }
);
```

### Batch Export

```typescript
// Export multiple presentations
const presentations = await gamma.listPresentations();

if (presentations.success) {
  for (const p of presentations.data) {
    const exported = await gamma.exportPresentation(p.id, 'pdf');
    console.log(`Exported: ${p.title} → ${exported.data.url}`);
  }
}
```

### Automated Publishing

```typescript
// Schedule automatic export
async function exportDaily() {
  const presentations = await gamma.listPresentations();
  
  for (const p of presentations.data) {
    // Only export presentations updated in last 24 hours
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (new Date(p.updatedAt).getTime() > dayAgo) {
      await gamma.exportPresentation(p.id, 'pdf');
    }
  }
}

// Run daily
setInterval(exportDaily, 24 * 60 * 60 * 1000);
```

## WIX Integration

### Sync WIX to GAMMA

```typescript
// In Cloudflare Worker
async function syncWixToGamma(wixContentId: string) {
  // 1. Fetch content from WIX
  const wixResponse = await fetch(
    `https://www.wixapis.com/wix-data/v2/items/${wixContentId}`,
    {
      headers: {
        'Authorization': `Bearer ${env.WIX_ACCESS_TOKEN}`
      }
    }
  );
  
  const wixContent = await wixResponse.json();
  
  // 2. Create GAMMA presentation
  const gamma = new GammaAPIClient(env.GAMMA_API_KEY);
  const presentation = await gamma.createFromWixContent(wixContent);
  
  // 3. Store mapping
  await env.SYNC_KV.put(
    `wix:${wixContentId}`,
    JSON.stringify({
      gammaId: presentation.data.id,
      syncedAt: Date.now()
    })
  );
  
  return presentation;
}
```

### Sync GAMMA to WIX

```typescript
async function syncGammaToWix(presentationId: string) {
  // 1. Fetch presentation from GAMMA
  const gamma = new GammaAPIClient(env.GAMMA_API_KEY);
  const presentation = await gamma.getPresentation(presentationId);
  
  if (!presentation.success) {
    throw new Error('Failed to fetch presentation');
  }
  
  // 2. Transform to WIX format
  const wixContent = {
    title: presentation.data.title,
    content: presentation.data.slides
      .map(s => `## ${s.title}\n\n${s.content}`)
      .join('\n\n'),
    metadata: {
      gammaId: presentationId,
      slides: presentation.data.slides.length
    }
  };
  
  // 3. Update WIX
  await fetch(`https://www.wixapis.com/wix-data/v2/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WIX_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      collectionId: 'Presentations',
      item: wixContent
    })
  });
}
```

### Webhook Integration

```typescript
// Handle GAMMA webhooks
export async function handleGammaWebhook(request: Request) {
  const webhook = await request.json();
  
  switch (webhook.event) {
    case 'presentation.created':
      // Auto-sync to WIX
      await syncGammaToWix(webhook.presentationId);
      break;
      
    case 'presentation.updated':
      // Update WIX content
      await syncGammaToWix(webhook.presentationId);
      break;
      
    case 'presentation.deleted':
      // Remove from WIX
      await deleteWixContent(webhook.presentationId);
      break;
  }
  
  return new Response('OK');
}
```

## Troubleshooting

### Common Issues

#### API Authentication Failed

**Problem**: 401 Unauthorized error

**Solution**:
```typescript
// Verify API key is valid
const gamma = new GammaAPIClient(process.env.GAMMA_API_KEY);
const presentations = await gamma.listPresentations();

if (!presentations.success) {
  console.error('Auth failed:', presentations.error);
}
```

#### Export Failed

**Problem**: Export returns error

**Solution**:
1. Check presentation ID is valid
2. Verify export format is supported
3. Ensure presentation has content
4. Check API rate limits

#### Sync Issues

**Problem**: Content not syncing between WIX and GAMMA

**Solution**:
1. Verify webhook URLs are configured
2. Check worker logs for errors
3. Ensure KV mappings are stored
4. Test sync manually

#### Theme Not Applied

**Problem**: Theme changes not visible

**Solution**:
```typescript
// Force refresh presentation
const presentation = await gamma.getPresentation('id');
await gamma.applyTheme('id', 'wired-chaos-cyber-dark');
```

## Examples

### Complete Workflow

```typescript
// 1. Create presentation
const gamma = new GammaAPIClient(process.env.GAMMA_API_KEY);

const presentation = await gamma.createPresentation(
  'Q4 Review',
  [
    createTitleSlide('Q4 Review', '2025', 'WIRED CHAOS'),
    createDataSlide('Revenue', revenueData, 1),
    createDataSlide('Users', userData, 2),
    createContentSlide('Summary', 'Great quarter!', 3)
  ]
);

// 2. Share with team
await gamma.sharePresentation(
  presentation.data.id,
  ['team@company.com'],
  'editor'
);

// 3. Export as PDF
const pdf = await gamma.exportPresentation(
  presentation.data.id,
  'pdf',
  { quality: 'high' }
);

console.log('PDF ready:', pdf.data.url);
```

---

**WIRED CHAOS** - AI-Powered Presentations
