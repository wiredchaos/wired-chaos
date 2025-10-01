# API Reference

Complete API reference for GAMMA-Wix Automation System.

## Table of Contents

- [GammaClient](#gammaclient)
- [WixClient](#wixclient)
- [TemplateManager](#templatemanager)
- [PresentationGenerator](#presentationgenerator)
- [ContentSync](#contentsync)
- [Configuration](#configuration)

## GammaClient

GAMMA API client for presentation management.

### Constructor

```javascript
new GammaClient(apiToken, apiBase)
```

**Parameters:**
- `apiToken` (string) - GAMMA API authentication token
- `apiBase` (string, optional) - API base URL (default: 'https://gamma.app/api/v1')

**Example:**
```javascript
import GammaClient from './src/gamma-client.js';
const client = new GammaClient(process.env.GAMMA_API_TOKEN);
```

### Methods

#### createPresentation

Create a new presentation with WIRED CHAOS branding.

```javascript
await client.createPresentation(title, slides, metadata)
```

**Parameters:**
- `title` (string) - Presentation title
- `slides` (array) - Array of slide objects
- `metadata` (object, optional) - Additional metadata

**Returns:** `Promise<ApiResponse>`

**Example:**
```javascript
const result = await client.createPresentation(
  'My Presentation',
  [
    { type: 'title', title: 'Welcome', content: 'Subtitle' },
    { type: 'content', title: 'Overview', content: 'Content' }
  ],
  { type: 'component', author: 'WIRED CHAOS' }
);
```

#### getPresentation

Fetch presentation by ID.

```javascript
await client.getPresentation(presentationId)
```

**Parameters:**
- `presentationId` (string) - Presentation ID

**Returns:** `Promise<ApiResponse>`

#### updatePresentation

Update existing presentation.

```javascript
await client.updatePresentation(presentationId, updates)
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `updates` (object) - Fields to update

**Returns:** `Promise<ApiResponse>`

#### deletePresentation

Delete presentation.

```javascript
await client.deletePresentation(presentationId)
```

**Parameters:**
- `presentationId` (string) - Presentation ID

**Returns:** `Promise<ApiResponse>`

#### exportPresentation

Export presentation to specified format.

```javascript
await client.exportPresentation(presentationId, format, options)
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `format` (string) - Export format ('pdf', 'pptx', 'html')
- `options` (object, optional) - Export options

**Options:**
- `quality` ('low' | 'medium' | 'high') - Export quality
- `includeNotes` (boolean) - Include speaker notes
- `watermark` (string) - Custom watermark

**Returns:** `Promise<ApiResponse>` with download URL

#### listPresentations

List all presentations.

```javascript
await client.listPresentations(filters)
```

**Parameters:**
- `filters` (object, optional) - Filter criteria

**Returns:** `Promise<ApiResponse>` with array of presentations

#### addSlide

Add slide to presentation.

```javascript
await client.addSlide(presentationId, slide)
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `slide` (object) - Slide definition

**Returns:** `Promise<ApiResponse>`

## WixClient

Wix API client for content management.

### Constructor

```javascript
new WixClient(apiToken, siteId)
```

**Parameters:**
- `apiToken` (string) - Wix API token
- `siteId` (string) - Wix site ID

### Methods

#### getSiteInfo

Get site information.

```javascript
await client.getSiteInfo()
```

**Returns:** `Promise<ApiResponse>`

#### getContent

Get content from collection.

```javascript
await client.getContent(collectionId, filters)
```

**Parameters:**
- `collectionId` (string) - Collection ID
- `filters` (object, optional) - Filter criteria

**Returns:** `Promise<ApiResponse>` with items array

#### createContent

Create content item in collection.

```javascript
await client.createContent(collectionId, data)
```

**Parameters:**
- `collectionId` (string) - Collection ID
- `data` (object) - Item data

**Returns:** `Promise<ApiResponse>`

#### updateContent

Update content item.

```javascript
await client.updateContent(collectionId, itemId, data)
```

**Parameters:**
- `collectionId` (string) - Collection ID
- `itemId` (string) - Item ID
- `data` (object) - Updated data

**Returns:** `Promise<ApiResponse>`

#### deleteContent

Delete content item.

```javascript
await client.deleteContent(collectionId, itemId)
```

**Parameters:**
- `collectionId` (string) - Collection ID
- `itemId` (string) - Item ID

**Returns:** `Promise<ApiResponse>`

#### addToGallery

Add presentation to gallery.

```javascript
await client.addToGallery(galleryId, presentation)
```

**Parameters:**
- `galleryId` (string) - Gallery ID or type ('components', 'features', etc.)
- `presentation` (object) - Presentation data

**Returns:** `Promise<ApiResponse>`

#### listGalleries

List all galleries.

```javascript
await client.listGalleries()
```

**Returns:** `Promise<ApiResponse>` with galleries array

## TemplateManager

Presentation template management.

### Constructor

```javascript
new TemplateManager()
```

### Methods

#### createTitleSlide

Create title slide.

```javascript
manager.createTitleSlide(title, subtitle, footer)
```

**Parameters:**
- `title` (string) - Slide title
- `subtitle` (string, optional) - Subtitle text
- `footer` (string, optional) - Footer text (default: 'WIRED CHAOS')

**Returns:** Slide object

#### createContentSlide

Create content slide.

```javascript
manager.createContentSlide(title, content, layout)
```

**Parameters:**
- `title` (string) - Slide title
- `content` (string) - Slide content
- `layout` (string, optional) - Layout type (default: 'single')

**Returns:** Slide object

#### createCodeSlide

Create code slide.

```javascript
manager.createCodeSlide(title, code, language)
```

**Parameters:**
- `title` (string) - Slide title
- `code` (string) - Code content
- `language` (string, optional) - Programming language (default: 'javascript')

**Returns:** Slide object

#### createDataSlide

Create data visualization slide.

```javascript
manager.createDataSlide(title, chartData)
```

**Parameters:**
- `title` (string) - Slide title
- `chartData` (object) - Chart configuration

**Returns:** Slide object

#### createImageSlide

Create image slide.

```javascript
manager.createImageSlide(title, images, layout)
```

**Parameters:**
- `title` (string) - Slide title
- `images` (array) - Array of image URLs
- `layout` (string, optional) - Layout type (default: 'grid')

**Returns:** Slide object

#### generateComponentPresentation

Generate component documentation presentation.

```javascript
manager.generateComponentPresentation(componentData)
```

**Parameters:**
- `componentData` (object) - Component information

**Component Data:**
```javascript
{
  name: 'Component Name',
  description: 'Description',
  overview: 'Overview text',
  features: ['Feature 1', 'Feature 2'],
  codeExample: 'const x = 1;',
  language: 'javascript',
  apiEndpoints: [
    { method: 'GET', path: '/api/endpoint', description: 'Description' }
  ]
}
```

**Returns:** Presentation object

#### generateFeaturePresentation

Generate feature release presentation.

```javascript
manager.generateFeaturePresentation(featureData)
```

**Parameters:**
- `featureData` (object) - Feature information

**Returns:** Presentation object

#### generateMilestonePresentation

Generate milestone presentation.

```javascript
manager.generateMilestonePresentation(milestoneData)
```

**Parameters:**
- `milestoneData` (object) - Milestone information

**Returns:** Presentation object

## PresentationGenerator

Main automation engine for presentation generation.

### Constructor

```javascript
new PresentationGenerator()
```

### Methods

#### initialize

Initialize and validate configuration.

```javascript
await generator.initialize()
```

**Returns:** `Promise<void>`

#### generateComponentPresentation

Generate component documentation presentation.

```javascript
await generator.generateComponentPresentation(componentData)
```

**Parameters:**
- `componentData` (object) - Component information

**Returns:** `Promise<Presentation>`

#### generateFeaturePresentation

Generate feature release presentation.

```javascript
await generator.generateFeaturePresentation(featureData)
```

**Parameters:**
- `featureData` (object) - Feature information

**Returns:** `Promise<Presentation>`

#### generateMilestonePresentation

Generate milestone presentation.

```javascript
await generator.generateMilestonePresentation(milestoneData)
```

**Parameters:**
- `milestoneData` (object) - Milestone information

**Returns:** `Promise<Presentation>`

#### syncToWix

Sync presentation to Wix gallery.

```javascript
await generator.syncToWix(presentation, galleryType)
```

**Parameters:**
- `presentation` (object) - Presentation object
- `galleryType` (string, optional) - Gallery type (default: 'components')

**Returns:** `Promise<WixItem>`

#### batchGenerate

Batch generate presentations.

```javascript
await generator.batchGenerate(items, type)
```

**Parameters:**
- `items` (array) - Array of data items
- `type` (string) - Type ('component', 'feature', 'milestone')

**Returns:** `Promise<Array<Result>>`

#### sendNotification

Send notification via configured channels.

```javascript
await generator.sendNotification(message, type)
```

**Parameters:**
- `message` (string) - Notification message
- `type` (string, optional) - Message type ('info', 'success', 'error')

**Returns:** `Promise<void>`

## ContentSync

Content synchronization between GAMMA and Wix.

### Constructor

```javascript
new ContentSync()
```

### Methods

#### syncAllToWix

Sync all presentations to Wix.

```javascript
await sync.syncAllToWix()
```

**Returns:** `Promise<Array<Result>>`

#### syncPresentationToWix

Sync single presentation to Wix.

```javascript
await sync.syncPresentationToWix(presentationId, galleryType)
```

**Parameters:**
- `presentationId` (string) - Presentation ID
- `galleryType` (string, optional) - Gallery type

**Returns:** `Promise<WixItem>`

#### syncWixToGamma

Sync Wix content to GAMMA (reverse sync).

```javascript
await sync.syncWixToGamma(collectionId)
```

**Parameters:**
- `collectionId` (string) - Wix collection ID

**Returns:** `Promise<Array<Result>>`

#### checkSyncStatus

Check synchronization status.

```javascript
await sync.checkSyncStatus()
```

**Returns:** `Promise<StatusObject>`

## Configuration

Configuration management.

### config

Main configuration object.

```javascript
import { config } from './config/gamma-config.js';
```

**Structure:**
```javascript
{
  gamma: {
    apiToken: string,
    apiBase: string,
    templateIds: {
      component: string,
      feature: string,
      milestone: string
    },
    brandingSettings: {
      primaryColor: string,
      secondaryColor: string,
      accentColor: string,
      backgroundColor: string,
      textColor: string,
      fonts: {
        primary: string,
        secondary: string,
        monospace: string
      }
    }
  },
  wix: {
    siteId: string,
    apiToken: string,
    apiBase: string,
    galleryIds: {
      components: string,
      features: string,
      milestones: string
    }
  },
  automation: {
    retryAttempts: number,
    retryDelay: number,
    batchSize: number,
    enableNotifications: boolean,
    enableLogging: boolean
  },
  notifications: {
    discord: {
      enabled: boolean,
      webhookUrl: string
    },
    telegram: {
      enabled: boolean,
      botToken: string,
      chatId: string
    }
  }
}
```

### validateConfig

Validate configuration.

```javascript
import { validateConfig } from './config/gamma-config.js';
validateConfig();
```

**Throws:** Error if configuration is invalid

### getEnvironmentConfig

Get environment-specific configuration.

```javascript
import { getEnvironmentConfig } from './config/gamma-config.js';
const envConfig = getEnvironmentConfig();
```

**Returns:** Configuration object with environment info

## Types

### ApiResponse

Standard API response format.

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Slide

Slide definition.

```typescript
interface Slide {
  type: 'title' | 'content' | 'image' | 'data' | 'code';
  title?: string;
  content: string | object;
  layout: 'single' | 'two-column' | 'grid' | 'full';
  animations?: Array<Animation>;
}
```

### Presentation

Presentation object.

```typescript
interface Presentation {
  id: string;
  title: string;
  description?: string;
  slides: Array<Slide>;
  theme: Theme;
  metadata?: object;
  createdAt: Date;
  updatedAt: Date;
}
```

---

**WIRED CHAOS** - API Reference v1.0.0
