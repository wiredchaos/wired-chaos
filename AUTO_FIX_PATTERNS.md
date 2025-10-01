# WIRED CHAOS Auto-Fix Pattern Library

## 📋 Overview

This document provides comprehensive auto-fix patterns for common issues encountered in WIRED CHAOS development. Use this as a reference guide for automated debugging and problem resolution.

## 🔧 Frontend Issues

### 1. JSX Nesting Errors

#### Problem: Improper Component Nesting in App.js
```jsx
// ❌ WRONG - Missing closing tag or improper nesting
return (
  <div className="app">
    <Header />
  <MainContent />
  </div>
);

// ❌ WRONG - Fragment not closed properly
return (
  <>
    <Component1>
    <Component2 />
);
```

#### Solution:
```jsx
// ✅ CORRECT - Proper nesting and closing
return (
  <div className="app">
    <Header />
    <MainContent />
  </div>
);

// ✅ CORRECT - Fragment properly closed
return (
  <>
    <Component1 />
    <Component2 />
  </>
);
```

#### Auto-Fix Script:
```bash
# Check for common JSX issues with eslint
npx eslint src/**/*.jsx --fix
npx eslint src/**/*.js --fix
```

### 2. Environment Variable Handling

#### Problem: Using Wrong Environment Variable Syntax
```javascript
// ❌ WRONG - Using Vite syntax in CRA
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ WRONG - Using CRA syntax in Vite
const apiUrl = process.env.REACT_APP_API_URL;

// ❌ WRONG - Direct access without prefix
const apiKey = process.env.API_KEY; // Won't work in CRA
```

#### Solution:
```javascript
// ✅ CORRECT - Create React App (CRA)
const apiUrl = process.env.REACT_APP_API_URL;
const apiKey = process.env.REACT_APP_API_KEY;

// ✅ CORRECT - Vite
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

// ✅ CORRECT - Universal fallback pattern
const getEnvVar = (key) => {
  // Try import.meta.env first (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Fallback to process.env (CRA)
  return process.env[key];
};

const apiUrl = getEnvVar('VITE_API_URL') || getEnvVar('REACT_APP_API_URL');
```

#### Detection Script:
```bash
# Find files using wrong env syntax
grep -r "import.meta.env" frontend/src/*.js frontend/src/*.jsx 2>/dev/null
grep -r "process.env.VITE_" frontend/src/*.js frontend/src/*.jsx 2>/dev/null
```

### 3. AR/VR CORS Configuration

#### Problem: Model Viewer Files Not Loading
```
Access to fetch at 'https://example.com/models/product.glb' from origin 
'https://wired-chaos.pages.dev' has been blocked by CORS policy
```

#### Solution: Create `public/_headers` File
```
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD
  Access-Control-Allow-Headers: Content-Type, Authorization
  X-Content-Type-Options: nosniff

/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.gltf
  Content-Type: model/gltf+json
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *

/*.bin
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000
  Access-Control-Allow-Origin: *
```

#### Auto-Fix Script:
```powershell
# Create _headers file if it doesn't exist
$headersPath = "public/_headers"
if (-not (Test-Path $headersPath)) {
    @"
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS, HEAD
  Access-Control-Allow-Headers: Content-Type, Authorization

/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Cache-Control: public, max-age=31536000
"@ | Out-File -FilePath $headersPath -Encoding UTF8
    Write-Host "✅ Created _headers file for AR/VR CORS support"
}
```

### 4. Model Viewer Not Rendering

#### Problem: Missing or Incorrect Script Import
```html
<!-- ❌ WRONG - Missing or incorrect version -->
<script type="module" src="model-viewer.js"></script>
```

#### Solution:
```html
<!-- ✅ CORRECT - Use CDN with specific version -->
<script type="module" 
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js">
</script>

<!-- ✅ In React component -->
import { useEffect } from 'react';

const ARViewer = () => {
  useEffect(() => {
    // Load model-viewer dynamically
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  return (
    <model-viewer
      src="/models/product.glb"
      ios-src="/models/product.usdz"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
    />
  );
};
```

## 🔧 Backend Issues

### 5. FastAPI CORS Errors

#### Problem: Frontend Can't Connect to Backend
```python
# ❌ WRONG - Missing CORS middleware
from fastapi import FastAPI
app = FastAPI()

@app.get("/api/data")
async def get_data():
    return {"data": "value"}
```

#### Solution:
```python
# ✅ CORRECT - Add CORS middleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://wired-chaos.pages.dev",
        "https://wired-chaos-preview.pages.dev",
        "*"  # For development only - restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data")
async def get_data():
    return {"data": "value"}
```

### 6. Missing Python Dependencies

#### Problem: Import Errors on Backend Start
```
ModuleNotFoundError: No module named 'fastapi'
```

#### Solution:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Or individually
pip install fastapi uvicorn pydantic python-multipart
```

#### Auto-Fix Script:
```powershell
# Check and install Python dependencies
if (Test-Path "backend/requirements.txt") {
    Write-Host "Installing Python dependencies..."
    python -m pip install -r backend/requirements.txt
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python dependencies installed"
    } else {
        Write-Host "❌ Failed to install Python dependencies"
    }
}
```

## 🔧 Cloudflare Worker Issues

### 7. Worker MIME Type Overrides

#### Problem: GLB/USDZ Files Served with Wrong Content-Type
```javascript
// ❌ WRONG - Not handling MIME types
export default {
  async fetch(request, env) {
    return fetch(request);
  }
}
```

#### Solution:
```javascript
// ✅ CORRECT - Override MIME types for AR/VR files
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await fetch(request);
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    
    // Set correct MIME types
    if (url.pathname.endsWith('.glb')) {
      newResponse.headers.set('Content-Type', 'model/gltf-binary');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
    } else if (url.pathname.endsWith('.usdz')) {
      newResponse.headers.set('Content-Type', 'model/vnd.usdz+zip');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
    } else if (url.pathname.endsWith('.gltf')) {
      newResponse.headers.set('Content-Type', 'model/gltf+json');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    return newResponse;
  }
}
```

### 8. Worker Environment Variables Not Available

#### Problem: Accessing Secrets in Worker
```javascript
// ❌ WRONG - Using process.env
const apiKey = process.env.API_KEY; // Won't work in Cloudflare Worker
```

#### Solution:
```javascript
// ✅ CORRECT - Use env parameter
export default {
  async fetch(request, env, ctx) {
    const apiKey = env.API_KEY;
    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    
    // Use KV binding
    const value = await env.MY_KV_NAMESPACE.get('key');
    
    return new Response(JSON.stringify({ status: 'ok' }));
  }
}
```

## 🔧 Build & Deployment Issues

### 9. Node Module Resolution Errors

#### Problem: Module Not Found During Build
```
Module not found: Error: Can't resolve './components/Component'
```

#### Solution:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For frontend specifically
cd frontend
rm -rf node_modules package-lock.json
npm install
cd ..

# Clear build cache
rm -rf build dist .next
```

#### Auto-Fix Script:
```powershell
function Fix-NodeModules {
    param([string]$directory = ".")
    
    Write-Host "🔧 Fixing Node modules in $directory..."
    
    Push-Location $directory
    
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force node_modules
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force package-lock.json
    }
    
    npm install
    
    Pop-Location
    
    Write-Host "✅ Node modules fixed"
}

# Usage
Fix-NodeModules -directory "frontend"
```

### 10. Build Optimization Warnings

#### Problem: Large Bundle Size Warnings
```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit
```

#### Solution:
```javascript
// Update webpack config (craco.config.js or webpack.config.js)
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      return webpackConfig;
    },
  },
};
```

## 🔧 Git & GitHub Issues

### 11. Large Files Blocked by Git

#### Problem: Push Rejected Due to Large Files
```
remote: error: File is XXX MB; this exceeds GitHub's file size limit of 100 MB
```

#### Solution:
```bash
# Add to .gitignore
echo "*.glb" >> .gitignore
echo "*.usdz" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore

# Remove from Git history (if already committed)
git rm --cached large-file.glb
git commit -m "Remove large file from Git"

# Use Git LFS for large files
git lfs install
git lfs track "*.glb"
git lfs track "*.usdz"
git add .gitattributes
```

### 12. GitHub Actions Workflow Failures

#### Problem: Workflow Fails Due to Missing Secrets
```
Error: Secret CLOUDFLARE_API_TOKEN not found
```

#### Solution:
```powershell
# Check for required secrets
$requiredSecrets = @(
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_PROJECT_NAME"
)

Write-Host "Required GitHub Secrets:"
foreach ($secret in $requiredSecrets) {
    Write-Host "  - $secret"
}

Write-Host "`nAdd secrets at: https://github.com/wiredchaos/wired-chaos/settings/secrets/actions"
```

## 🔧 Security Issues

### 13. Exposed API Keys in Code

#### Problem: API Keys Committed to Repository
```javascript
// ❌ WRONG - Hardcoded API key
const apiKey = 'sk_live_123456789';
```

#### Solution:
```javascript
// ✅ CORRECT - Use environment variables
const apiKey = process.env.REACT_APP_API_KEY;

// ✅ Validate before use
if (!apiKey) {
  throw new Error('API key not configured');
}
```

#### Detection & Fix:
```bash
# Scan for potential API keys
grep -r "sk_live_" . --exclude-dir=node_modules
grep -r "api_key.*=.*['\"]" . --exclude-dir=node_modules

# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

## 🎯 Automated Sanity Checks

### PowerShell Sanity Check Script
```powershell
function Run-SanityChecks {
    Write-Host "🔍 Running WIRED CHAOS Sanity Checks..." -ForegroundColor Cyan
    
    $issues = @()
    
    # Check 1: Node.js installed
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $issues += "Node.js not installed"
    }
    
    # Check 2: Python installed
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        $issues += "Python not installed"
    }
    
    # Check 3: Frontend dependencies
    if (-not (Test-Path "frontend/node_modules")) {
        $issues += "Frontend dependencies not installed (run: cd frontend && npm install)"
    }
    
    # Check 4: _headers file exists for AR/VR
    if (-not (Test-Path "public/_headers")) {
        $issues += "_headers file missing for AR/VR CORS support"
    }
    
    # Check 5: .env files exist
    if (-not (Test-Path "frontend/.env.local") -and -not (Test-Path "frontend/.env")) {
        $issues += "Frontend .env file missing"
    }
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ All sanity checks passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Issues found:" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Yellow
        }
    }
}
```

### Bash Sanity Check Script
```bash
#!/bin/bash

echo "🔍 Running WIRED CHAOS Sanity Checks..."

ISSUES=()

# Check Node.js
if ! command -v node &> /dev/null; then
    ISSUES+=("Node.js not installed")
fi

# Check Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    ISSUES+=("Python not installed")
fi

# Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    ISSUES+=("Frontend dependencies not installed")
fi

# Check _headers file
if [ ! -f "public/_headers" ]; then
    ISSUES+=("_headers file missing")
fi

# Report results
if [ ${#ISSUES[@]} -eq 0 ]; then
    echo "✅ All sanity checks passed!"
else
    echo "⚠️  Issues found:"
    for issue in "${ISSUES[@]}"; do
        echo "  - $issue"
    done
fi
```

## 📝 Quick Fix Reference

| Issue | Quick Fix Command |
|-------|------------------|
| Frontend won't build | `cd frontend && rm -rf node_modules && npm install && npm run build` |
| Backend won't start | `cd backend && pip install -r requirements.txt && python server.py` |
| AR models not loading | Create `public/_headers` with CORS rules |
| Env vars not working | Check prefix: `REACT_APP_` for CRA, `VITE_` for Vite |
| Git push fails (large files) | Add to `.gitignore` or use Git LFS |
| Worker MIME types wrong | Add MIME override in worker `fetch()` |
| CORS errors | Add CORS middleware to backend |
| Module not found | Clear cache: `rm -rf node_modules && npm install` |

---

**Auto-Generated by**: WIRED CHAOS Mega Prompt Integration System
**Version**: 1.0.0
**Last Updated**: 2024
