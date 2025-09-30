# AR/VR Merch Store Configuration

Complete technical specifications for the WIRED CHAOS AR/VR merch store implementation.

## 🎯 Overview

The AR/VR merch store enables customers to view 3D product models in augmented reality before purchase. This document covers all technical requirements for implementing and deploying AR/VR functionality.

## 📦 3D Model Formats

### Supported Formats

#### GLB (GL Transmission Format Binary)
- **Extension**: `.glb`
- **MIME Type**: `model/gltf-binary`
- **Use Case**: Primary format for web-based 3D rendering
- **Browser Support**: All modern browsers with WebGL
- **File Size**: Optimized, typically 1-5 MB per model
- **Compression**: Draco compression recommended

**Example GLB Structure**:
```
product-hoodie.glb
├── Geometry (Binary)
├── Textures (Embedded)
├── Materials (PBR)
└── Animations (Optional)
```

#### USDZ (Universal Scene Description)
- **Extension**: `.usdz`
- **MIME Type**: `model/vnd.usdz+zip`
- **Use Case**: Apple AR Quick Look (iOS/iPadOS)
- **Browser Support**: Safari on iOS 12+
- **File Size**: Typically 2-10 MB
- **Compression**: ZIP-based archive

**iOS AR Quick Look Requirements**:
- Maximum 10 MB file size
- PBR materials only
- Single mesh or scene
- Embedded textures

#### GLTF (GL Transmission Format)
- **Extension**: `.gltf`
- **MIME Type**: `model/gltf+json`
- **Use Case**: Development and debugging (human-readable JSON)
- **Production**: Convert to GLB for production

## 🌐 Cloudflare Pages Configuration

### `_headers` File Configuration

Create `frontend/public/_headers`:

```
# Global CORS for all routes
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Range, Authorization
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN

# 3D Model Assets - GLB Format
/*.glb
  Content-Type: model/gltf-binary
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin
  Cross-Origin-Embedder-Policy: require-corp
  Access-Control-Expose-Headers: Content-Length, Content-Range

# 3D Model Assets - USDZ Format (Apple AR Quick Look)
/*.usdz
  Content-Type: model/vnd.usdz+zip
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin
  Access-Control-Expose-Headers: Content-Length, Content-Range

# 3D Model Assets - GLTF Format (Development)
/*.gltf
  Content-Type: model/gltf+json
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
  Cross-Origin-Resource-Policy: cross-origin

# Binary buffers (used by GLTF)
/*.bin
  Content-Type: application/octet-stream
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

# Texture Images
/*.jpg /*.jpeg
  Content-Type: image/jpeg
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

/*.png
  Content-Type: image/png
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

/*.webp
  Content-Type: image/webp
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable
  Cross-Origin-Resource-Policy: cross-origin

# XR Permissions for all pages (required for AR features)
/*
  Permissions-Policy: camera=*, microphone=*, xr-spatial-tracking=*, accelerometer=*, gyroscope=*, magnetometer=*

# Content Security Policy for XR
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src 'self'; worker-src 'self' blob:; media-src 'self' blob:;
```

## 🔧 Cloudflare Worker MIME Type Overrides

Update `src/index.js` to handle 3D model MIME types:

```javascript
const MIME_TYPES = {
  'glb': 'model/gltf-binary',
  'usdz': 'model/vnd.usdz+zip',
  'gltf': 'model/gltf+json',
  'bin': 'application/octet-stream',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'webp': 'image/webp'
};

const AR_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cache-Control': 'public, max-age=31536000, immutable'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle OPTIONS preflight for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: AR_CORS_HEADERS
      });
    }
    
    // Extract file extension
    const pathname = url.pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    
    // Check if this is a 3D model or asset request
    const is3DAsset = ['glb', 'usdz', 'gltf', 'bin'].includes(ext);
    const isTexture = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    
    if (is3DAsset || isTexture) {
      // Fetch from R2 or origin
      let response;
      
      if (env.ASSETS_BUCKET) {
        // Fetch from R2 bucket
        const object = await env.ASSETS_BUCKET.get(pathname.substring(1));
        
        if (object === null) {
          return new Response('Not Found', { status: 404 });
        }
        
        const headers = new Headers(AR_CORS_HEADERS);
        headers.set('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        headers.set('ETag', object.httpEtag);
        
        response = new Response(object.body, {
          status: 200,
          headers
        });
      } else {
        // Fetch from origin
        response = await fetch(request);
        
        // Override headers
        const newHeaders = new Headers(response.headers);
        Object.entries(AR_CORS_HEADERS).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        
        if (MIME_TYPES[ext]) {
          newHeaders.set('Content-Type', MIME_TYPES[ext]);
        }
        
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }
      
      return response;
    }
    
    // Handle other routes
    return fetch(request);
  }
};
```

## 📱 Model Viewer Integration

### Installation

```bash
npm install @google/model-viewer
```

### Basic Implementation

```javascript
import '@google/model-viewer';
import { useState } from 'react';

function ProductViewer({ product }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Model URLs
  const modelUrl = `/models/${product.sku}.glb`;
  const iosModelUrl = `/models/${product.sku}.usdz`;
  const posterUrl = `/images/${product.sku}-poster.jpg`;
  
  return (
    <div className="product-viewer">
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Loading 3D Model...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Failed to load 3D model</p>
          <small>{error}</small>
        </div>
      )}
      
      <model-viewer
        src={modelUrl}
        ios-src={iosModelUrl}
        poster={posterUrl}
        alt={product.name}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        camera-orbit="0deg 75deg 105%"
        min-camera-orbit="auto auto 5%"
        max-camera-orbit="auto auto 500%"
        environment-image="neutral"
        exposure="1"
        shadow-intensity="1"
        shadow-softness="0.5"
        auto-rotate
        auto-rotate-delay="3000"
        rotation-per-second="30deg"
        loading="eager"
        reveal="auto"
        style={{ width: '100%', height: '500px' }}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          setError(e.detail?.message || 'Unknown error');
          setIsLoading(false);
        }}
      >
        {/* AR Button */}
        <button 
          slot="ar-button" 
          className="ar-button"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#00FFFF',
            color: '#000000',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👁️ View in Your Space
        </button>
        
        {/* Loading Progress Bar */}
        <div 
          slot="progress-bar" 
          className="progress-bar"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            backgroundColor: 'rgba(0, 255, 255, 0.2)'
          }}
        >
          <div 
            className="progress-bar-fill"
            style={{
              height: '100%',
              backgroundColor: '#00FFFF',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        
        {/* Hotspot annotations */}
        <button
          slot="hotspot-1"
          className="hotspot"
          data-position="0 0.5 0.5"
          data-normal="0 0 1"
        >
          <div className="annotation">Premium Material</div>
        </button>
      </model-viewer>
      
      {/* Product Info */}
      <div className="product-info">
        <h2>{product.name}</h2>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>
      </div>
    </div>
  );
}

export default ProductViewer;
```

### Advanced Configuration

```javascript
function AdvancedProductViewer({ product }) {
  const modelViewerRef = useRef(null);
  const [annotations, setAnnotations] = useState([]);
  
  useEffect(() => {
    const viewer = modelViewerRef.current;
    
    if (viewer) {
      // Listen for AR session events
      viewer.addEventListener('ar-status', (e) => {
        console.log('AR Status:', e.detail.status);
      });
      
      // Listen for model load
      viewer.addEventListener('load', () => {
        console.log('Model loaded successfully');
        // Extract annotations from model metadata
        const model = viewer.model;
        // Process annotations...
      });
      
      // Listen for camera changes
      viewer.addEventListener('camera-change', (e) => {
        console.log('Camera changed:', e.detail);
      });
    }
    
    return () => {
      if (viewer) {
        viewer.removeEventListener('ar-status');
        viewer.removeEventListener('load');
        viewer.removeEventListener('camera-change');
      }
    };
  }, []);
  
  return (
    <model-viewer
      ref={modelViewerRef}
      src={`/models/${product.sku}.glb`}
      ios-src={`/models/${product.sku}.usdz`}
      // ... other props
    >
      {/* Dynamic hotspots */}
      {annotations.map((annotation, index) => (
        <button
          key={index}
          slot={`hotspot-${index}`}
          data-position={annotation.position}
          data-normal={annotation.normal}
          className="hotspot"
        >
          {annotation.label}
        </button>
      ))}
    </model-viewer>
  );
}
```

## 🎮 XR Session Handling

### WebXR API Integration

```javascript
class XRSessionManager {
  constructor() {
    this.session = null;
    this.supported = false;
  }
  
  async checkSupport() {
    if ('xr' in navigator) {
      try {
        this.supported = await navigator.xr.isSessionSupported('immersive-ar');
        return this.supported;
      } catch (err) {
        console.error('XR support check failed:', err);
        return false;
      }
    }
    return false;
  }
  
  async startSession(canvas) {
    if (!this.supported) {
      throw new Error('WebXR not supported');
    }
    
    try {
      this.session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        optionalFeatures: ['light-estimation'],
        domOverlay: { root: document.getElementById('overlay') }
      });
      
      // Setup rendering
      const gl = canvas.getContext('webgl', { xrCompatible: true });
      await gl.makeXRCompatible();
      
      this.session.updateRenderState({
        baseLayer: new XRWebGLLayer(this.session, gl)
      });
      
      // Start render loop
      this.session.requestAnimationFrame(this.onXRFrame.bind(this));
      
      return this.session;
    } catch (err) {
      console.error('Failed to start XR session:', err);
      throw err;
    }
  }
  
  onXRFrame(time, frame) {
    const session = frame.session;
    session.requestAnimationFrame(this.onXRFrame.bind(this));
    
    // Render frame
    const pose = frame.getViewerPose(/* reference space */);
    if (pose) {
      // Render scene for each view
      pose.views.forEach(view => {
        // Rendering logic...
      });
    }
  }
  
  async endSession() {
    if (this.session) {
      await this.session.end();
      this.session = null;
    }
  }
}

// Usage
const xrManager = new XRSessionManager();

async function launchAR() {
  const supported = await xrManager.checkSupport();
  
  if (!supported) {
    alert('AR not supported on this device');
    return;
  }
  
  const canvas = document.getElementById('xr-canvas');
  await xrManager.startSession(canvas);
}
```

### React XR Component

```javascript
import { useState, useEffect } from 'react';

function ARExperience({ modelUrl }) {
  const [xrSupported, setXrSupported] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  
  useEffect(() => {
    async function checkXR() {
      if ('xr' in navigator) {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        setXrSupported(supported);
      }
    }
    checkXR();
  }, []);
  
  async function startAR() {
    // Use model-viewer's AR functionality
    const viewer = document.querySelector('model-viewer');
    
    if (viewer && viewer.canActivateAR) {
      viewer.activateAR();
      setSessionActive(true);
    }
  }
  
  return (
    <div className="ar-experience">
      {xrSupported ? (
        <button 
          onClick={startAR}
          className="ar-launch-button"
        >
          Launch AR Experience
        </button>
      ) : (
        <p>AR not available on this device</p>
      )}
    </div>
  );
}
```

## 📐 3D Model Optimization

### Best Practices

1. **File Size Optimization**
   - Target: < 5 MB for web GLB
   - Target: < 10 MB for iOS USDZ
   - Use Draco compression for GLB
   - Optimize texture resolution (max 2048x2048)

2. **Polygon Count**
   - Low poly: < 50K triangles (recommended)
   - Medium: 50K-100K triangles
   - High: 100K-200K triangles (use sparingly)

3. **Texture Optimization**
   - Use power-of-2 dimensions (512, 1024, 2048)
   - WebP format for smaller file sizes
   - Combine textures into atlases when possible
   - Use normal maps instead of high-poly geometry

4. **Material Simplification**
   - PBR materials only
   - Limit material count to 3-5 per model
   - Bake lighting when possible

### Compression Tools

```bash
# Install gltf-pipeline for optimization
npm install -g gltf-pipeline

# Optimize GLB file with Draco compression
gltf-pipeline -i input.glb -o output.glb -d

# Convert GLTF to GLB
gltf-pipeline -i model.gltf -o model.glb

# Install for USDZ conversion
pip install usd-core

# Convert GLB to USDZ (requires Apple tools or Reality Converter)
```

## 🧪 Testing AR Features

### Device Testing Checklist

- [ ] iOS Safari (iPhone 12+, iOS 14+)
- [ ] Android Chrome (ARCore devices, Android 8+)
- [ ] Desktop Chrome (for model viewing)
- [ ] Desktop Safari (for model viewing)

### Test Scenarios

1. **Model Loading**
   - Model loads within 3 seconds
   - Textures appear correctly
   - No console errors

2. **AR Activation**
   - AR button appears on supported devices
   - AR session starts successfully
   - Model appears at correct scale

3. **Interactions**
   - Camera controls work smoothly
   - Auto-rotate functions properly
   - Hotspots are clickable

4. **Performance**
   - Maintains 60 FPS during interaction
   - No memory leaks after extended use
   - Battery drain is acceptable

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS AR/VR Team
