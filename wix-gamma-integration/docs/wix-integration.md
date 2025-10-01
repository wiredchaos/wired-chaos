# WIX Integration Guide

Complete guide for integrating WIX websites with WIRED CHAOS infrastructure.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Security Configuration](#security-configuration)
4. [WIX Velo Integration](#wix-velo-integration)
5. [AR/VR Model Viewer](#arvr-model-viewer)
6. [Analytics Integration](#analytics-integration)
7. [Form Processing](#form-processing)
8. [Content Synchronization](#content-synchronization)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Overview

The WIX integration provides seamless connectivity between WIX websites and WIRED CHAOS infrastructure, enabling:

- **Security Headers**: Automatic CSP, CORS, and iframe protection
- **AR/VR Support**: WebXR model viewer for 3D content
- **Analytics Tracking**: Real-time event tracking and analytics
- **Content Sync**: Bi-directional sync with GAMMA presentations
- **Form Processing**: Secure form handling with validation
- **Performance Optimization**: Cloudflare edge caching

## Setup

### 1. WIX Developer Account

1. Create account at [dev.wix.com](https://dev.wix.com)
2. Create new app: **Website Integration**
3. Configure OAuth permissions:
   - Site API (Read/Write)
   - Data API (Read/Write)
   - Members API (Read)

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

```bash
# Required
WIX_APP_ID=your_app_id
WIX_APP_SECRET=your_app_secret
WIX_SITE_ID=your_site_id
WIX_API_TOKEN=your_api_token
WIX_ACCESS_TOKEN=your_access_token

# Optional
WIX_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Cloudflare Worker Configuration

The WIX integration worker handles all API requests with security and caching:

```bash
# Deploy worker
wrangler deploy wix-gamma-integration/cloudflare/workers/integration-worker.js

# Configure environment variables
wrangler secret put WIX_API_TOKEN
wrangler secret put WIX_ACCESS_TOKEN
```

## Security Configuration

### Content Security Policy

The integration automatically applies CSP headers:

```javascript
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://cdn.wix.com; 
  style-src 'self' 'unsafe-inline' https://cdn.wix.com; 
  img-src 'self' data: https: blob:; 
  connect-src 'self' https://*.wix.com https://*.cloudflare.com;
```

### CORS Configuration

Allowed origins:
- `https://*.wix.com`
- `https://*.wixsite.com`
- `https://*.pages.dev`

### Rate Limiting

- **WIX API**: 100 requests per minute per IP
- **Analytics**: Unlimited
- **Webhooks**: No limit

## WIX Velo Integration

### Installation

1. Open WIX Editor
2. Add a **Custom Element** to your page
3. In the **Code Panel**, create new file: `wired-chaos-integration.js`
4. Copy contents from `wix-gamma-integration/wix/velo/wired-chaos-integration.js`

### Basic Usage

```javascript
// In your page code (Page Code section)
import wixChaos from './public/wired-chaos-integration.js';

$w.onReady(function() {
  // Initialize integration
  const chaos = wixChaos.initialize({
    apiBase: 'https://your-worker.workers.dev',
    apiKey: 'YOUR_API_KEY',
    analyticsEnabled: true,
    arEnabled: true
  });

  // Track page view (automatic)
  
  // Load AR model
  chaos.loadARModel('model-id-123', '#arViewer');
  
  // Setup form submission
  $w('#submitButton').onClick(async () => {
    const formData = {
      name: $w('#nameInput').value,
      email: $w('#emailInput').value,
      message: $w('#messageInput').value
    };
    
    try {
      await chaos.submitForm(formData, 'contact-form');
      chaos.WixHelpers.showSuccess('Form submitted successfully!');
    } catch (error) {
      chaos.WixHelpers.showError('Failed to submit form');
    }
  });
});
```

### Advanced Features

#### AR/VR Model Viewer

```javascript
// Add model-viewer custom element to page
// In Custom Element HTML:
<model-viewer
  id="arViewer"
  camera-controls
  auto-rotate
  ar
  ar-modes="webxr scene-viewer quick-look"
  style="width: 100%; height: 500px;"
>
</model-viewer>

// In page code:
$w.onReady(async function() {
  const chaos = wixChaos.initialize({...});
  
  // Load 3D model
  await chaos.loadARModel('glb-model-123', '#arViewer');
  
  // Track AR interactions
  chaos.trackEvent('ar_interaction', {
    modelId: 'glb-model-123',
    action: 'view'
  });
});
```

#### Dynamic Content Loading

```javascript
// Load content from WIX Data Collections
$w.onReady(async function() {
  const chaos = wixChaos.initialize({...});
  
  // Get products from collection
  const products = await chaos.getContent('Products', {
    limit: 10,
    sort: 'price_asc'
  });
  
  // Setup repeater with products
  chaos.WixHelpers.setupRepeater('#productsRepeater', products, 
    ($item, product) => {
      $item('#productName').text = product.name;
      $item('#productPrice').text = `$${product.price}`;
      $item('#productImage').src = product.image;
    }
  );
});
```

#### WIRED CHAOS Branding

```javascript
$w.onReady(function() {
  const chaos = wixChaos.initialize({...});
  
  // Apply cyber theme to button
  chaos.Branding.applyStyle('#ctaButton', 'cyber');
  
  // Apply glitch effect to title
  chaos.Branding.applyGlitchEffect('#heroTitle');
  
  // Use brand colors
  $w('#banner').style.backgroundColor = chaos.Branding.colors.black;
  $w('#banner').style.borderColor = chaos.Branding.colors.neonCyan;
});
```

## AR/VR Model Viewer

### Supported Formats

- **GLB** (recommended): Binary glTF format
- **USDZ**: Apple AR Quick Look format
- **GLTF**: JSON-based glTF format

### Upload Models to R2

```bash
# Upload model to Cloudflare R2
wrangler r2 object put wired-chaos-bucket/ar-models/model-123.glb \
  --file ./models/my-model.glb \
  --content-type model/gltf-binary
```

### Model Viewer Configuration

```html
<!-- Full featured model viewer -->
<model-viewer
  id="arViewer"
  src="https://your-worker.workers.dev/api/wix/ar-model/model-123.glb"
  ios-src="https://your-worker.workers.dev/api/wix/ar-model/model-123.usdz"
  alt="3D Model"
  camera-controls
  auto-rotate
  auto-rotate-delay="0"
  rotation-per-second="30deg"
  ar
  ar-modes="webxr scene-viewer quick-look"
  ar-scale="auto"
  camera-orbit="45deg 55deg 2.5m"
  min-camera-orbit="auto auto auto"
  max-camera-orbit="auto auto 10m"
  shadow-intensity="1"
  exposure="1"
  environment-image="neutral"
  style="width: 100%; height: 500px; background-color: #000000;"
>
  <div class="progress-bar" slot="progress-bar">
    <div class="update-bar"></div>
  </div>
  <button slot="ar-button" id="ar-button">
    View in AR
  </button>
</model-viewer>
```

### Performance Optimization

```javascript
// Lazy load models
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      chaos.loadARModel('model-123', '#arViewer');
      observer.unobserve(entry.target);
    }
  });
});

observer.observe($w('#arViewer'));
```

## Analytics Integration

### Event Tracking

```javascript
// Track custom events
chaos.trackEvent('button_click', {
  buttonId: 'cta-button',
  location: 'homepage'
});

chaos.trackEvent('video_play', {
  videoId: 'intro-video',
  duration: 120
});

chaos.trackEvent('purchase', {
  productId: 'prod-123',
  amount: 99.99,
  currency: 'USD'
});
```

### Analytics Dashboard

Access analytics at:
```
https://your-worker.workers.dev/api/wix/analytics/dashboard
```

### WC-BUS Integration

Events are automatically sent to WC-BUS for unified analytics:

```javascript
// Events flow:
WIX Page → WIX Velo → Worker → WC-BUS → Analytics KV
```

## Form Processing

### Secure Form Handling

```javascript
$w('#contactForm').onSubmit(async (event) => {
  event.preventDefault();
  
  const formData = {
    name: $w('#nameInput').value,
    email: $w('#emailInput').value,
    phone: $w('#phoneInput').value,
    message: $w('#messageInput').value
  };
  
  // Validate
  if (!formData.name || !formData.email) {
    chaos.WixHelpers.showError('Please fill required fields');
    return;
  }
  
  // Submit with CSRF protection
  try {
    chaos.WixHelpers.showLoading('#loadingSpinner');
    
    const result = await chaos.submitForm(formData, 'contact');
    
    chaos.WixHelpers.hideLoading('#loadingSpinner');
    chaos.WixHelpers.showSuccess('Thank you! We will contact you soon.');
    
    // Reset form
    $w('#contactForm').reset();
  } catch (error) {
    chaos.WixHelpers.hideLoading('#loadingSpinner');
    chaos.WixHelpers.showError('Submission failed. Please try again.');
  }
});
```

## Content Synchronization

### Sync WIX to GAMMA

```javascript
// Sync WIX page content to GAMMA presentation
$w.onReady(async function() {
  const chaos = wixChaos.initialize({...});
  
  $w('#syncButton').onClick(async () => {
    try {
      const result = await chaos.syncToGamma(
        'page-content-123',
        'My Presentation Title'
      );
      
      console.log('Synced to GAMMA:', result);
      chaos.WixHelpers.showSuccess('Content synced to GAMMA!');
    } catch (error) {
      chaos.WixHelpers.showError('Sync failed');
    }
  });
});
```

### Automatic Sync

Setup webhook to automatically sync on content changes:

```javascript
// WIX Backend Code (events.js)
import { syncToGamma } from './wired-chaos-backend.js';

export function wixData_afterUpdate(item, context) {
  // Auto-sync to GAMMA when content updated
  syncToGamma(item._id, item.title);
}
```

## Deployment

### 1. Deploy Worker

```bash
cd wix-gamma-integration
wrangler deploy cloudflare/workers/integration-worker.js
```

### 2. Configure WIX App

1. Go to WIX Developer Console
2. Add redirect URI: `https://your-worker.workers.dev/wix-callback`
3. Set webhook URL: `https://your-worker.workers.dev/api/wix/webhook`

### 3. Install on WIX Site

1. Open WIX Editor
2. Add integration code to pages
3. Configure API key in site settings
4. Publish site

## Troubleshooting

### Common Issues

#### CORS Errors

**Problem**: Cross-origin request blocked

**Solution**: 
```javascript
// Ensure origin is whitelisted in worker
const allowedOrigins = [
  'https://yoursitename.wixsite.com',
  'https://www.yoursite.com'
];
```

#### AR Models Not Loading

**Problem**: Model viewer shows error

**Solution**:
1. Check model file format (GLB recommended)
2. Verify R2 bucket permissions
3. Check model file size (< 50MB)
4. Test direct model URL

#### Analytics Not Tracking

**Problem**: Events not appearing in dashboard

**Solution**:
1. Verify API key is correct
2. Check browser console for errors
3. Ensure analytics is enabled in config
4. Check rate limits

#### Form Submission Fails

**Problem**: Form submit returns error

**Solution**:
1. Verify CSRF token
2. Check API authentication
3. Validate form data structure
4. Check worker logs

### Support

For additional support:
- GitHub Issues: [github.com/wiredchaos/wired-chaos/issues](https://github.com/wiredchaos/wired-chaos/issues)
- Documentation: [wiredchaos.xyz/docs](https://wiredchaos.xyz/docs)
- Discord: WIRED CHAOS Community

## Examples

### Complete Landing Page

See `examples/wix-landing-page.js` for a complete example of:
- Hero section with AR model viewer
- Contact form with validation
- Analytics tracking
- Dynamic content loading
- WIRED CHAOS branding

### E-commerce Integration

See `examples/wix-ecommerce.js` for:
- Product catalog
- Shopping cart
- Checkout flow
- Order tracking

---

**WIRED CHAOS** - Bridging Web2 and Web3
