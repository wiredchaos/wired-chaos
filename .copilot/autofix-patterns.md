# WIRED CHAOS Auto-Fix Pattern Library

This document contains common patterns for automatic fixes in the WIRED CHAOS codebase. Use these patterns to quickly resolve common issues.

## 1. JSX Nesting Error Corrections

### Problem: Invalid DOM Nesting
React enforces strict HTML5 nesting rules. Common violations include:
- `<p>` elements containing block elements like `<div>`, `<section>`, etc.
- `<a>` elements containing other `<a>` elements
- `<button>` elements containing `<button>` elements

### Detection Pattern
```javascript
// Search for these patterns in JSX files:
<p>
  <div>  // ❌ Invalid
```

### Auto-Fix Pattern
```javascript
// Before (Invalid)
<p>
  <div className="content">
    <span>Text</span>
  </div>
</p>

// After (Fixed)
<div>
  <p className="content">
    <span>Text</span>
  </p>
</div>

// Alternative Fix (Keep semantic meaning)
<div className="paragraph-wrapper">
  <p>First paragraph</p>
  <div className="content">
    <span>Text</span>
  </div>
</div>
```

### Common Invalid Combinations
| Parent | Invalid Children |
|--------|-----------------|
| `<p>` | `<div>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<table>` |
| `<a>` | `<a>`, `<button>` (interactive elements) |
| `<button>` | `<a>`, `<button>`, `<input>` (interactive elements) |
| `<span>` | Block elements (should use `<div>` instead) |

### Automated Fix Script
```javascript
function fixJSXNesting(content) {
  // Fix <p> containing <div>
  content = content.replace(
    /<p([^>]*)>\s*<div/g,
    '<div$1>\n  <p>'
  );
  content = content.replace(
    /<\/div>\s*<\/p>/g,
    '</p>\n</div>'
  );
  
  // Fix nested interactive elements
  content = content.replace(
    /<(a|button)([^>]*)>\s*<(a|button)/g,
    '<$1$2>\n  <span'
  );
  
  return content;
}
```

## 2. Environment Variable Handling (Universal Safe Checks)

### Problem: Environment Access Varies by Runtime
Different JavaScript runtimes access environment variables differently:
- **Node.js**: `process.env.VAR_NAME`
- **Cloudflare Workers**: `env.VAR_NAME`
- **Browser**: Limited access, requires build-time injection

### Universal Safe Check Pattern
```javascript
// ❌ Incorrect - Fails in Workers
const apiKey = process.env.API_KEY;

// ❌ Incorrect - Fails in Node.js
const apiKey = env.API_KEY;

// ✅ Correct - Works everywhere
const apiKey = env?.API_KEY || process?.env?.API_KEY || '';

// ✅ With fallback value
const apiUrl = env?.API_URL || process?.env?.API_URL || 'https://default.com';
```

### Cloudflare Worker Pattern
```javascript
export default {
  async fetch(request, env, ctx) {
    // env object is passed as parameter
    const apiToken = env.API_TOKEN || '';
    const apiBase = env.API_BASE || 'https://api.default.com';
    
    // Use configuration
    const response = await fetch(apiBase, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    return response;
  }
};
```

### React Component Pattern
```javascript
// In React, use REACT_APP_ prefix for build-time injection
function Component() {
  // Build-time environment variable (injected by webpack)
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '/api';
  
  // Runtime check (if needed)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return <div>API: {apiEndpoint}</div>;
}
```

### Backend (Python FastAPI) Pattern
```python
import os
from typing import Optional

# Safe environment variable access
def get_env(key: str, default: str = "") -> str:
    return os.getenv(key, default)

# Configuration class
class Config:
    API_TOKEN: str = get_env("API_TOKEN", "")
    API_BASE: str = get_env("API_BASE", "https://api.default.com")
    DEBUG: bool = get_env("DEBUG", "false").lower() == "true"
```

### Automated Fix Script
```javascript
function fixEnvVariables(content) {
  // Replace simple process.env access with universal pattern
  content = content.replace(
    /process\.env\.([A-Z_]+)/g,
    '(env?.$1 || process?.env?.$1 || \'\')'
  );
  
  // Fix worker environment access
  content = content.replace(
    /env\.([A-Z_]+)(?!\?)/g,
    '(env?.$1 || \'\')'
  );
  
  return content;
}
```

## 3. AR/VR CORS and MIME Type Configurations

### Problem: 3D Models Not Loading
AR/VR assets require specific MIME types and CORS headers to load properly.

### Cloudflare Pages `_headers` File
Create or update `frontend/public/_headers`:

```
# Global CORS for all assets
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  X-Content-Type-Options: nosniff

# 3D Model Assets - GLB Format
/*.glb
  Content-Type: model/gltf-binary
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

# 3D Model Assets - USDZ Format (Apple AR)
/*.usdz
  Content-Type: model/vnd.usdz+zip
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

# 3D Model Assets - GLTF Format
/*.gltf
  Content-Type: model/gltf+json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin

# Textures and Images
/*.jpg /*.jpeg
  Content-Type: image/jpeg
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin

/*.png
  Content-Type: image/png
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin

# XR Permissions for iframe embeds
/*
  Permissions-Policy: camera=*, microphone=*, xr-spatial-tracking=*, accelerometer=*, gyroscope=*, magnetometer=*
```

### Cloudflare Worker MIME Type Override
```javascript
const MIME_TYPES = {
  'glb': 'model/gltf-binary',
  'usdz': 'model/vnd.usdz+zip',
  'gltf': 'model/gltf+json',
  'bin': 'application/octet-stream',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }
    
    // Get file extension
    const ext = url.pathname.split('.').pop()?.toLowerCase();
    
    // Fetch the asset (from R2, origin, etc.)
    let response = await fetch(request);
    
    // Override MIME type if needed
    if (ext && MIME_TYPES[ext]) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Content-Type', MIME_TYPES[ext]);
      
      // Add CORS headers
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    return response;
  }
};
```

### Model Viewer Error Handling
```javascript
import '@google/model-viewer';
import { useState } from 'react';

function ModelViewer({ src, alt, poster }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  return (
    <div className="model-viewer-container">
      {error && (
        <div className="error-message">
          Failed to load 3D model: {error}
        </div>
      )}
      
      {loading && <div className="loading-spinner">Loading...</div>}
      
      <model-viewer
        src={src}
        alt={alt}
        poster={poster}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        environment-image="neutral"
        shadow-intensity="1"
        auto-rotate
        loading="eager"
        onLoad={() => setLoading(false)}
        onError={(e) => {
          setError(e.detail?.message || 'Unknown error');
          setLoading(false);
        }}
      >
        <button slot="ar-button" className="ar-button">
          👁️ View in AR
        </button>
        
        <div slot="progress-bar" className="progress-bar">
          <div className="progress-bar-inner" />
        </div>
      </model-viewer>
    </div>
  );
}
```

## 4. Cloudflare Worker Routing and Headers

### Problem: Incorrect Response Format
Workers must return proper Response objects with correct status codes and headers.

### Standard Response Pattern
```javascript
// ✅ Correct - Proper Response object
function successResponse(data) {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

function errorResponse(message, status = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}

// ❌ Incorrect - Missing headers
return new Response(JSON.stringify(data));

// ❌ Incorrect - Not returning Response object
return data;
```

### Router Pattern with Error Handling
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
      }
      
      // Route mapping
      const routes = {
        '/api/health': handleHealth,
        '/api/cert': handleCert,
        '/api/brain': handleBrain,
        '/api/vault': handleVault
      };
      
      // Find and execute route handler
      for (const [path, handler] of Object.entries(routes)) {
        if (url.pathname.startsWith(path)) {
          return await handler(request, env, ctx);
        }
      }
      
      // 404 for unmatched routes
      return new Response(
        JSON.stringify({ error: 'Not Found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
      
    } catch (error) {
      // Global error handler
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error.message 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }
};

async function handleHealth(request, env, ctx) {
  return new Response(
    JSON.stringify({ 
      status: 'healthy',
      timestamp: Date.now(),
      version: '3.0.0'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}
```

## 5. Build Error Diagnostics and Resolution

### Common Build Errors and Fixes

#### Error: "Module not found"
```bash
# Symptom
Error: Can't resolve 'some-module' in '/path/to/file'

# Fix
npm install some-module --save

# For dev dependencies
npm install some-module --save-dev

# Check if module is listed in package.json
cat package.json | grep some-module
```

#### Error: "Invalid hook call"
```javascript
// Symptom
Error: Invalid hook call. Hooks can only be called inside the body of a function component.

// Cause - Hooks called outside component
const value = useState(0); // ❌

function App() {
  return <div>{value}</div>;
}

// Fix - Move hooks inside component
function App() {
  const [value, setValue] = useState(0); // ✅
  return <div>{value}</div>;
}
```

#### Error: "Objects are not valid as a React child"
```javascript
// Symptom
Error: Objects are not valid as a React child (found: object with keys {x, y})

// Cause - Rendering object directly
<div>{someObject}</div> // ❌

// Fix - Render specific properties or stringify
<div>{someObject.property}</div> // ✅
<div>{JSON.stringify(someObject)}</div> // ✅
```

#### Error: "Cannot read property of undefined"
```javascript
// Symptom
TypeError: Cannot read property 'map' of undefined

// Cause - Data not loaded yet
const list = data.items.map(...); // ❌ data might be null

// Fix - Use optional chaining and defaults
const list = data?.items?.map(...) || []; // ✅

// Or conditional rendering
{data?.items && data.items.map(...)}
```

### Webpack Configuration Issues

#### Fix: Polyfill Node.js modules in browser
```javascript
// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
        "vm": require.resolve("vm-browserify")
      };
      
      // Provide global polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      );
      
      return webpackConfig;
    }
  }
};
```

#### Fix: Import paths
```javascript
// jsconfig.json (for VS Code)
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@hooks/*": ["hooks/*"]
    }
  },
  "include": ["src"]
}
```

### Automated Build Fix Script
```bash
#!/bin/bash

echo "🔧 Running build auto-fix..."

# Clear caches
echo "Clearing caches..."
rm -rf node_modules/.cache
rm -rf frontend/node_modules/.cache
rm -rf frontend/build

# Reinstall dependencies
echo "Reinstalling dependencies..."
cd frontend
npm ci
cd ..

# Validate configuration
echo "Validating configuration..."
if [ -f "frontend/craco.config.js" ]; then
  echo "✅ craco.config.js found"
else
  echo "⚠️  craco.config.js missing"
fi

# Try build
echo "Attempting build..."
cd frontend
npm run build 2>&1 | tee build.log
cd ..

echo "✅ Build fix complete!"
```

## 6. React Component Error Patterns

### Pattern: Proper State Updates
```javascript
// ❌ Incorrect - Mutating state directly
const [items, setItems] = useState([]);
items.push(newItem); // Don't mutate

// ✅ Correct - Create new array
setItems([...items, newItem]);

// ❌ Incorrect - Mutating object
const [user, setUser] = useState({});
user.name = 'New Name'; // Don't mutate

// ✅ Correct - Create new object
setUser({ ...user, name: 'New Name' });
```

### Pattern: Async Effects
```javascript
// ❌ Incorrect - Async function as effect
useEffect(async () => { // This doesn't work
  const data = await fetchData();
  setData(data);
}, []);

// ✅ Correct - Define async function inside effect
useEffect(() => {
  async function loadData() {
    const data = await fetchData();
    setData(data);
  }
  loadData();
}, []);

// ✅ Alternative - IIFE
useEffect(() => {
  (async () => {
    const data = await fetchData();
    setData(data);
  })();
}, []);
```

### Pattern: Cleanup in useEffect
```javascript
// ✅ Proper cleanup for subscriptions
useEffect(() => {
  const subscription = api.subscribe(data => {
    setData(data);
  });
  
  // Cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);

// ✅ Proper cleanup for timers
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

## 7. Quick Reference Commands

### Development
```bash
# Start frontend dev server
npm run dev

# Build frontend
npm run build

# Start backend
python backend/server.py

# Deploy worker
cd src && npx wrangler deploy
```

### Debugging
```bash
# View worker logs
npx wrangler tail

# Test worker locally
npx wrangler dev

# Check React build issues
cd frontend && npm run build -- --verbose
```

### Common Fixes
```bash
# Fix dependency issues
rm -rf node_modules package-lock.json
npm install

# Fix frontend build
cd frontend
rm -rf node_modules/.cache build
npm ci
npm run build

# Fix Python dependencies
pip install -r backend/requirements.txt
```

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Development Team
