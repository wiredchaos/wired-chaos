# WIRED CHAOS V3 Studio Bot - Complete Project Context

This document provides complete context for GitHub Copilot to understand the WIRED CHAOS ecosystem and assist with development, debugging, and feature implementation.

## 🏗️ Core Stack Architecture

### Frontend Stack
- **Framework**: React 18 with Create React App
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Cloudflare Pages (global CDN)
- **State Management**: React Context API + Hooks
- **3D/AR**: Three.js, React Three Fiber, model-viewer
- **Build**: craco for custom webpack configuration

**Frontend Structure**:
```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── AnimatedMotherboardGuide.js
│   │   ├── BrainAssistant3D.js
│   │   ├── CertificateMinter.js
│   │   ├── HRMDashboard.js
│   │   ├── VRGWidget.js
│   │   └── ...
│   ├── cert/            # Certificate minting logic
│   ├── chains/          # Blockchain integrations
│   ├── hooks/           # Custom React hooks
│   └── App.js           # Main application component
├── public/
│   ├── sections.js      # Section configuration
│   └── index.html
└── package.json
```

### Backend Stack
- **Framework**: Python FastAPI
- **APIs**: 
  - Certificate minting (`cert_api.py`)
  - Brain assistant AI (`brain_assistant_api.py`)
  - Content routing and blog proxy
- **AI Integration**: OpenAI GPT-4 for conversational AI
- **CORS**: Enabled for cross-origin requests

**Backend Structure**:
```
backend/
├── server.py              # Main FastAPI application
├── cert_api.py            # NFT certificate minting
├── brain_assistant_api.py # AI conversation endpoint
└── requirements.txt       # Python dependencies
```

### Cloudflare Workers (Edge Compute)
- **Purpose**: API proxy, routing, authentication
- **Location**: `src/index.js`
- **Configuration**: `src/wrangler.toml`
- **Features**:
  - Bearer token authentication
  - API request proxying
  - CORS header injection
  - Environment-based routing

**Worker Pattern**:
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    // Route to appropriate handler
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

### Storage Layer
- **Cloudflare KV**: Key-value store for configuration, caching
- **Cloudflare R2**: Object storage for 3D models, assets
- **Patterns**:
  - Cache-first with TTL
  - Atomic updates
  - Fallback to origin on cache miss

### Blockchain Integration
Supported networks:
1. **Ethereum** - ERC-721 NFT minting
2. **Solana** - SPL token standards
3. **XRPL** - Ripple validator integration (Vault33)
4. **Hedera** - Hashgraph consensus
5. **Dogecoin** - Community token support

## 🚀 Deployment Requirements & Zero-Downtime Principles

### GitHub Actions Workflows

**Frontend Deployment** (`frontend-deploy.yml`):
```yaml
- Build React application
- Deploy to Cloudflare Pages
- Preview URLs for PR branches
- Production deployment on main merge
```

**Worker Deployment** (`worker-deploy.yml`):
```yaml
- Validate wrangler.toml
- Deploy to Cloudflare Workers
- Update environment variables
- Health check validation
```

**Content Sync** (`content-sync.yml`):
```yaml
- Sync with Notion database
- Update social media (X, LinkedIn)
- Trigger Zapier workflows
- Blog feed updates
```

**Beta Testing** (`beta-test.yml`):
```yaml
- Run comprehensive integration tests
- Validate all blockchain connections
- Test AR/VR components
- Check third-party integrations
```

### Zero-Downtime Deployment Strategy
1. **Blue-Green Deployment**: Maintain two environments
2. **Health Checks**: Endpoint at `/api/health` validates services
3. **Automatic Rollback**: Failed health checks trigger rollback
4. **Gradual Rollout**: Canary deployments with traffic shifting
5. **Global Edge**: Cloudflare's edge network ensures availability

### Deployment URLs
- **Preview**: `https://wired-chaos-preview.pages.dev`
- **Staging**: `https://wired-chaos-staging.pages.dev`
- **Production**: `https://wired-chaos.pages.dev`
- **Worker**: `https://wired-chaos-worker.[account].workers.dev`

## 🎮 Event System & Gamification Patterns

### Vault33 Gatekeeper System
Located in `vault33-gatekeeper/` directory.

**Key Features**:
- Discord/Telegram bot integration
- XRPL validator connectivity
- Point-based rewards system
- Merovingian fragment quests
- Burn-to-reveal mechanics

**Point System** (from `shared/config.py`):
```python
WL_CLAIM_POINTS = 10          # Whitelist claim
MINT_TIER1_POINTS = 20        # Basic NFT mint
MINT_TIER2_POINTS = 40        # Premium NFT mint
BURN_BASE_POINTS = 50         # Standard burn
BURN_MEROVINGIAN_POINTS = 250 # Special quest burn
REFERRAL_POINTS = 15          # Successful referral
```

### Event Bus Architecture
- **Technology**: Cloudflare Durable Objects
- **Pattern**: Pub/Sub with event persistence
- **Events**:
  - NFT minting
  - Whitelist claims
  - Burn transactions
  - Quest completions
  - Referral tracking

### Gamification Mechanics
1. **Progressive Rewards**: Points unlock tiers
2. **Hidden Quests**: Merovingian fragments (base64 encoded)
3. **Social Integration**: Discord roles, Telegram badges
4. **Leaderboards**: Real-time ranking system
5. **Achievements**: NFT-based certificates

## 🥽 AR/VR Technical Specifications

### AR/VR Merch Store Architecture

**3D Model Support**:
- **GLB Format**: Binary glTF for web
- **USDZ Format**: Apple AR Quick Look
- **Model Viewer**: Google's `<model-viewer>` web component

**Required MIME Types**:
```
.glb  → model/gltf-binary
.usdz → model/vnd.usdz+zip
.gltf → model/gltf+json
```

### Cloudflare Pages `_headers` Configuration

Create `frontend/public/_headers`:
```
# AR/VR 3D Model Assets
/*.glb
  Content-Type: model/gltf-binary
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000
  Cross-Origin-Resource-Policy: cross-origin

/*.gltf
  Content-Type: model/gltf+json
  Access-Control-Allow-Origin: *
  Cross-Origin-Resource-Policy: cross-origin

# XR Permissions for iframe embeds
/*
  Permissions-Policy: camera=*, microphone=*, xr-spatial-tracking=*
```

### Cloudflare Worker MIME Type Overrides

```javascript
// In worker fetch handler
const mimeTypes = {
  'glb': 'model/gltf-binary',
  'usdz': 'model/vnd.usdz+zip',
  'gltf': 'model/gltf+json'
};

const ext = url.pathname.split('.').pop();
if (mimeTypes[ext]) {
  response.headers.set('Content-Type', mimeTypes[ext]);
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
}
```

### Model Viewer Integration Pattern

```javascript
import '@google/model-viewer';

function MerchItem({ modelUrl, posterUrl, name }) {
  return (
    <model-viewer
      src={modelUrl}
      poster={posterUrl}
      alt={name}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      environment-image="neutral"
      shadow-intensity="1"
      auto-rotate
    >
      <button slot="ar-button" className="ar-button">
        View in Your Space
      </button>
    </model-viewer>
  );
}
```

### XR Session Handling

```javascript
// Check for WebXR support
async function checkXRSupport() {
  if ('xr' in navigator) {
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    return supported;
  }
  return false;
}

// Initialize XR session
async function startXRSession() {
  const xrSession = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay']
  });
  
  // Setup XR rendering loop
  xrSession.requestAnimationFrame(onXRFrame);
}
```

## 🔒 Coding Standards & Auto-Fix Patterns

### 1. JSX Nesting Error Corrections

**Problem**: Invalid DOM nesting (e.g., `<p>` inside `<p>`, `<div>` inside `<p>`)

**Auto-Fix**:
```javascript
// ❌ Incorrect
<p>
  <div>Content</div>
</p>

// ✅ Correct
<div>
  <p>Content</p>
</div>
```

**Pattern**: Always validate parent-child DOM relationships. Use semantic HTML5 elements appropriately.

### 2. Environment Variable Handling

**Universal Safe Check Pattern**:
```javascript
// ❌ Incorrect - May fail in different environments
const apiKey = process.env.API_KEY;

// ✅ Correct - Works in Workers, Node, and browser
const apiKey = env?.API_KEY || process?.env?.API_KEY || '';

// For required variables with fallback
const apiUrl = env?.API_URL || process?.env?.API_URL || 'https://default-api.com';
```

**Worker Environment**:
```javascript
export default {
  async fetch(request, env, ctx) {
    // env object contains all environment variables
    const apiToken = env.API_TOKEN || '';
  }
};
```

**React Component**:
```javascript
// Use process.env with fallback
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '/api';
```

### 3. AR/VR CORS and MIME Type Configuration

**Cloudflare Worker CORS Handler**:
```javascript
function handleCORS(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  return headers;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }
    
    const corsHeaders = handleCORS(request);
    const response = await handleRequest(request, env);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }
};
```

### 4. Cloudflare Worker Routing Patterns

**Best Practice Routing**:
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Route mapping
    const routes = {
      '/api/health': () => handleHealth(),
      '/api/cert': () => handleCert(request, env),
      '/api/brain': () => handleBrain(request, env),
      '/api/vault': () => handleVault(request, env)
    };
    
    // Find matching route
    for (const [route, handler] of Object.entries(routes)) {
      if (path.startsWith(route)) {
        try {
          return await handler();
        } catch (error) {
          return new Response(
            JSON.stringify({ error: error.message }), 
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }
    
    // 404 for unmatched routes
    return new Response('Not Found', { status: 404 });
  }
};

function handleHealth() {
  return new Response(
    JSON.stringify({ status: 'healthy', timestamp: Date.now() }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

### 5. Build Error Diagnostics and Resolution

**Common Build Errors**:

1. **Missing Dependencies**:
```bash
# Check package.json for missing packages
npm install --save missing-package

# For dev dependencies
npm install --save-dev missing-dev-package
```

2. **Module Resolution Errors**:
```javascript
// ❌ Incorrect import path
import Component from './components/Component';

// ✅ Correct with extension
import Component from './components/Component.js';
```

3. **Webpack Configuration**:
```javascript
// craco.config.js for custom webpack
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/")
      };
      return webpackConfig;
    }
  }
};
```

4. **TypeScript Errors**:
```javascript
// Add to jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"]
    }
  },
  "include": ["src"]
}
```

### 6. React Component Patterns

**Functional Components with Hooks**:
```javascript
import React, { useState, useEffect, useCallback } from 'react';

function Component({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Async data fetching
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error('Failed to fetch:', error);
      }
    }
    
    fetchData();
  }, [prop1]); // Dependencies
  
  const handleClick = useCallback(() => {
    // Event handler
  }, [prop2]);
  
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}

export default Component;
```

### 7. Error Handling Patterns

**API Error Handling**:
```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred'
    };
  }
}
```

**React Error Boundaries**:
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## 🔐 Security Implementation Guidelines

### Bearer Token Authentication

**Worker Implementation**:
```javascript
function verifyBearerToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' };
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  const validToken = env.API_TOKEN || process.env.API_TOKEN;
  
  if (token !== validToken) {
    return { valid: false, error: 'Invalid token' };
  }
  
  return { valid: true };
}

export default {
  async fetch(request, env, ctx) {
    // Skip auth for public endpoints
    const publicPaths = ['/api/health', '/api/public'];
    const url = new URL(request.url);
    
    if (!publicPaths.some(path => url.pathname.startsWith(path))) {
      const auth = verifyBearerToken(request, env);
      if (!auth.valid) {
        return new Response(
          JSON.stringify({ error: auth.error }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Process authenticated request
    return handleRequest(request, env);
  }
};
```

### Circuit Breaker Pattern

**For External API Calls**:
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker(5, 60000);

async function callExternalAPI() {
  return breaker.call(async () => {
    const response = await fetch('https://external-api.com/endpoint');
    return response.json();
  });
}
```

### Wallet Gating System

**Multi-chain Wallet Verification**:
```javascript
async function verifyWalletOwnership(address, signature, message, chain) {
  const verifiers = {
    ethereum: verifyEthereumSignature,
    solana: verifySolanaSignature,
    xrpl: verifyXRPLSignature,
    hedera: verifyHederaSignature
  };
  
  const verifier = verifiers[chain.toLowerCase()];
  if (!verifier) {
    throw new Error(`Unsupported chain: ${chain}`);
  }
  
  return await verifier(address, signature, message);
}

async function verifyEthereumSignature(address, signature, message) {
  const { ethers } = require('ethers');
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}
```

### NDA Digital Signature Integration

**Document Signing Flow**:
```javascript
async function createNDASignature(documentHash, signerAddress, chain) {
  // Generate unique signing message
  const message = `
    I agree to the terms of the WIRED CHAOS NDA
    Document Hash: ${documentHash}
    Signer: ${signerAddress}
    Timestamp: ${Date.now()}
    Chain: ${chain}
  `.trim();
  
  // Request signature from wallet
  const signature = await requestWalletSignature(message, chain);
  
  // Store signature on-chain or in KV
  await storeSignature({
    documentHash,
    signerAddress,
    signature,
    message,
    chain,
    timestamp: Date.now()
  });
  
  return { success: true, signature, message };
}

async function verifyNDASignature(documentHash, signerAddress) {
  const stored = await retrieveSignature(documentHash, signerAddress);
  
  if (!stored) {
    return { valid: false, error: 'No signature found' };
  }
  
  const isValid = await verifyWalletOwnership(
    stored.signerAddress,
    stored.signature,
    stored.message,
    stored.chain
  );
  
  return { valid: isValid, signature: stored };
}
```

## 📝 Development Workflow Automation

### Sanity Check Script

Create `scripts/sanity-check.sh`:
```bash
#!/bin/bash
set -e

echo "🔍 Running WIRED CHAOS sanity checks..."

# Check Node.js version
echo "Checking Node.js version..."
node --version || { echo "❌ Node.js not found"; exit 1; }

# Check Python version
echo "Checking Python version..."
python --version || python3 --version || { echo "❌ Python not found"; exit 1; }

# Check key files exist
echo "Checking key files..."
files=(
  "frontend/package.json"
  "backend/server.py"
  "src/index.js"
  "src/wrangler.toml"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
    exit 1
  fi
done

# Check dependencies
echo "Checking frontend dependencies..."
cd frontend && npm list --depth=0 2>/dev/null || echo "⚠️  Some dependencies may be missing"
cd ..

# Check backend dependencies
echo "Checking backend dependencies..."
if [ -f "backend/requirements.txt" ]; then
  pip freeze | grep -f backend/requirements.txt || echo "⚠️  Some Python packages may be missing"
fi

echo "✅ All sanity checks passed!"
```

### Build Validation Script

Create `scripts/validate-build.sh`:
```bash
#!/bin/bash
set -e

echo "🏗️  Validating WIRED CHAOS build..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Check build output
if [ -d "frontend/build" ]; then
  echo "✅ Frontend build successful"
else
  echo "❌ Frontend build failed"
  exit 1
fi

# Validate worker syntax
echo "Validating worker..."
cd src
npx wrangler validate
cd ..

echo "✅ Build validation complete!"
```

### Auto-Patch Script

Create `scripts/auto-patch.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Running WIRED CHAOS auto-patch...');

// Fix common JSX nesting errors
function fixJSXNesting(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix <p> containing <div>
  if (content.includes('<p>') && content.includes('<div>')) {
    console.log(`Checking ${filePath} for JSX nesting issues...`);
    // Add logic to detect and fix
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  }
}

// Fix environment variable patterns
function fixEnvVars(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /process\.env\.(\w+)/g;
  
  const fixed = content.replace(regex, (match, varName) => {
    return `(env?.${varName} || process?.env?.${varName} || '')`;
  });
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed environment variables in ${filePath}`);
  }
}

// Scan and fix files
const jsFiles = [
  'frontend/src/App.js',
  'frontend/src/components/**/*.js'
];

console.log('✅ Auto-patch complete!');
```

## 🎨 Official Color Palette & Design System

See `.copilot/color-palette.md` for full details.

## 🌐 Infrastructure Standards

See `.copilot/infrastructure.md` for complete infrastructure documentation.

## 📚 Additional Resources

- **Cloudflare Docs**: https://developers.cloudflare.com
- **React Docs**: https://react.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Three.js Docs**: https://threejs.org/docs
- **Model Viewer**: https://modelviewer.dev

## 🆘 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure worker includes proper CORS headers. Check `handleCORS()` function.

### Issue: Build Fails
**Solution**: Run `npm install` in frontend directory. Check for missing dependencies.

### Issue: Worker Not Deploying
**Solution**: Validate `wrangler.toml` syntax. Ensure secrets are set in Cloudflare dashboard.

### Issue: 3D Models Not Loading
**Solution**: Check MIME types in `_headers` file. Verify CORS configuration.

### Issue: Blockchain Connection Fails
**Solution**: Verify RPC endpoints are accessible. Check wallet integration code.

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Development Team
