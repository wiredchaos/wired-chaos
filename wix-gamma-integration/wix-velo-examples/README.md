# Wix Velo Backend Integration Examples

This directory contains example code for integrating the WIRED CHAOS Cloudflare Worker with Wix Velo backend code.

## Files

### 1. `worker-api-client.js`
Client library for making API calls to the Cloudflare Worker from Wix backend code.

**Features:**
- Authenticated API requests
- WIX site data operations
- GAMMA presentation management
- Content synchronization
- AR model uploads
- Analytics tracking
- Health checks

### 2. `data-hooks.js`
Wix Data Hooks for automatically syncing changes with the worker.

**Features:**
- Auto-sync on content creation
- Auto-sync on content updates
- Handle content deletions
- AR model upload automation
- Analytics event tracking

### 3. `http-functions.js`
Wix HTTP Functions for exposing worker API endpoints through Wix.

**Features:**
- RESTful API endpoints
- Site data retrieval
- Presentation fetching
- Bi-directional sync endpoints
- Health check endpoint
- Webhook handling

---

## Setup Instructions

### Prerequisites
- Wix site with Velo (formerly Corvid) enabled
- Deployed Cloudflare Worker
- API tokens configured

### Step 1: Enable Velo on Your Wix Site

1. Open your Wix site in the Editor
2. Click **Dev Mode** in the top menu (or enable it in Settings)
3. This enables the backend code editor

### Step 2: Install Backend Files

1. In the Wix Editor, open the **Backend** section (left sidebar)
2. Create a new folder: `backend/wired-chaos/`
3. Copy these files to your backend:
   - `worker-api-client.js` → `backend/wired-chaos/worker-api-client.js`
   - `data-hooks.js` → `backend/data.js` (or merge with existing)
   - `http-functions.js` → `backend/http-functions.js` (or merge with existing)

### Step 3: Configure API Credentials

Update `worker-api-client.js` with your values:

```javascript
const WORKER_BASE_URL = 'https://wix-gamma-integration-prod.YOUR-ACCOUNT.workers.dev';
const API_TOKEN = 'YOUR_API_TOKEN'; // Use Wix Secrets Manager
```

**Best Practice:** Use Wix Secrets Manager for tokens:

1. Go to **Velo Sidebar** → **Secrets Manager**
2. Add a secret named `WORKER_API_TOKEN`
3. Update the code to use secrets:

```javascript
import { getSecret } from 'wix-secrets-backend';

async function getApiToken() {
  return await getSecret('WORKER_API_TOKEN');
}
```

### Step 4: Set Up Data Hooks

1. Open **Database** in the Wix Editor
2. Select your collection (e.g., "Content")
3. Click **More Actions** → **Add Data Hooks**
4. Copy the hook functions from `data-hooks.js`
5. Test hooks by creating/updating items

### Step 5: Set Up HTTP Functions

1. Open `backend/http-functions.js`
2. Copy the functions from the example file
3. Publish your site
4. Access functions at:
   - `https://yoursite.com/_functions/siteData`
   - `https://yoursite.com/_functions/presentations`
   - `https://yoursite.com/_functions/syncToGamma`
   - etc.

---

## Usage Examples

### Frontend Code (Page Code)

#### Fetch Presentations
```javascript
import { getGammaPresentations } from 'backend/wired-chaos/worker-api-client';

$w.onReady(async function () {
  try {
    const result = await getGammaPresentations(5);
    console.log('Presentations:', result.data);
    
    // Display in repeater
    $w('#presentationsRepeater').data = result.data.presentations;
  } catch (error) {
    console.error('Error loading presentations:', error);
  }
});
```

#### Sync Content to GAMMA
```javascript
import { syncWixToGamma } from 'backend/wired-chaos/worker-api-client';

export async function syncButton_click(event) {
  const contentId = $w('#contentIdInput').value;
  
  try {
    $w('#syncButton').disable();
    $w('#statusText').text = 'Syncing...';
    
    const result = await syncWixToGamma({
      action: 'create',
      contentType: 'article',
      data: { id: contentId }
    });
    
    $w('#statusText').text = 'Synced successfully!';
    console.log('Sync result:', result);
  } catch (error) {
    $w('#statusText').text = `Error: ${error.message}`;
    console.error('Sync error:', error);
  } finally {
    $w('#syncButton').enable();
  }
}
```

#### Upload AR Model
```javascript
import { uploadARModel } from 'backend/wired-chaos/worker-api-client';

export async function uploadButton_click(event) {
  const file = $w('#arModelUpload').value[0];
  
  if (!file) {
    console.error('No file selected');
    return;
  }
  
  try {
    $w('#uploadButton').disable();
    
    // Upload file to Wix Media Manager first
    const uploadedFile = await $w('#arModelUpload').uploadFiles();
    
    // Then sync with worker
    const result = await uploadARModel({
      name: file.name,
      modelUrl: uploadedFile[0].url,
      format: file.name.split('.').pop(),
      metadata: {
        size: file.size,
        uploadedAt: Date.now()
      }
    });
    
    console.log('AR model uploaded:', result);
  } catch (error) {
    console.error('Upload error:', error);
  } finally {
    $w('#uploadButton').enable();
  }
}
```

---

## Data Hooks Examples

### Content Collection Hook
```javascript
// In backend/data.js

import { syncWixToGamma, trackAnalytics } from './wired-chaos/worker-api-client';

export function Content_afterInsert(item, context) {
  // Auto-sync to GAMMA
  syncWixToGamma({
    action: 'create',
    contentType: 'article',
    data: item
  }).catch(console.error);
  
  return item;
}
```

### ARModels Collection Hook
```javascript
// In backend/data.js

import { uploadARModel } from './wired-chaos/worker-api-client';

export function ARModels_afterInsert(item, context) {
  // Auto-upload to worker
  uploadARModel({
    id: item._id,
    name: item.name,
    modelUrl: item.modelUrl,
    format: item.format
  }).catch(console.error);
  
  return item;
}
```

---

## HTTP Functions Examples

### Custom Endpoint
```javascript
// In backend/http-functions.js

import { ok } from 'wix-http-functions';
import { getWixSiteData } from './wired-chaos/worker-api-client';

export async function get_customData(request) {
  const data = await getWixSiteData();
  
  return ok({
    body: JSON.stringify({
      custom: 'response',
      workerData: data
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
```

Access at: `https://yoursite.com/_functions/customData`

---

## Troubleshooting

### Common Issues

**Issue:** "Module not found" error
- **Solution:** Ensure file paths are correct in imports
- Use relative paths: `./wired-chaos/worker-api-client`

**Issue:** CORS errors
- **Solution:** Worker should have CORS configured for your Wix domain
- Check `Access-Control-Allow-Origin` header in worker response

**Issue:** Authentication failed
- **Solution:** Verify API token is correct
- Check token has not expired
- Ensure token is passed in Authorization header

**Issue:** Data hooks not firing
- **Solution:** Make sure hooks are saved in Wix Database
- Check hook function names match collection name
- Verify collection permissions allow backend writes

---

## Best Practices

1. **Use Secrets Manager** for API tokens
2. **Error Handling** - Always wrap API calls in try-catch
3. **Async Operations** - Use async/await for cleaner code
4. **Rate Limiting** - Be aware of API rate limits
5. **Testing** - Test in Wix Preview mode before publishing
6. **Logging** - Use console.log for debugging
7. **Validation** - Validate data before sending to worker

---

## API Reference

See the main documentation for complete API reference:
- [Worker API Documentation](../docs/api-reference.md)
- [Wix Integration Guide](../docs/wix-integration.md)

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- Documentation: See main project README
- Wix Velo Docs: https://www.wix.com/velo/reference

---

**WIRED CHAOS** - Build Something Amazing! 🚀
