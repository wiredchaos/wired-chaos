# 🚀 WIRED CHAOS Mega Prompt GIGA Integration Guide

## Overview

This document describes the comprehensive WIRED CHAOS Mega Prompt integration system that provides context-aware development, automated problem resolution, and intelligent infrastructure management across all system components.

## 🎯 What is GIGA Integration?

**GIGA Integration** stands for **G**lobal **I**ntelligent **G**uidance **A**utomation - a comprehensive system that:
- Provides complete context to GitHub Copilot and development tools
- Automates common fixes and debugging patterns
- Enforces security and design standards
- Validates infrastructure configuration
- Streamlines development workflows

## 📁 Core Components

### 1. Copilot Context (`.copilot/wired-chaos-context.md`)

**Purpose**: Complete system documentation for GitHub Copilot

**Contents**:
- WIRED CHAOS design system and color palette
- Full architecture overview (Frontend, Backend, Smart Contracts, Security)
- Cloudflare infrastructure patterns
- AR/VR integration specifications
- Security patterns (NSA-level, Bearer tokens, Circuit breakers)
- Common auto-fix patterns
- Development workflows
- Testing and debugging strategies
- Integration points (Gamma, Notion, Wix, Zapier)
- Code style guidelines
- Quick reference commands

**Usage**: GitHub Copilot automatically reads this file to understand your entire project context, enabling more accurate code suggestions and completions.

### 2. VS Code Settings (`.vscode/settings.json`)

**Purpose**: IDE configuration for optimal WIRED CHAOS development

**Features**:
- WIRED CHAOS color scheme integration
- Auto-fix on save for common issues
- File associations for special formats (GLB, USDZ, TOML)
- Python, JavaScript, PowerShell formatting rules
- Tailwind CSS and React/JSX support
- Search and watcher exclusions
- Terminal configuration
- Security and compliance settings

**Benefits**:
- Consistent development experience across team
- Automatic code formatting and organization
- Better file handling for AR/VR assets
- Optimized for Cloudflare Workers development

### 3. Auto-Fix Patterns (`AUTO_FIX_PATTERNS.md`)

**Purpose**: Comprehensive library of common issues and their solutions

**Categories**:
1. **Frontend Issues**: JSX nesting, environment variables, AR/VR CORS, model viewer
2. **Backend Issues**: FastAPI CORS, Python dependencies
3. **Cloudflare Worker Issues**: MIME types, environment variables
4. **Build & Deployment**: Module resolution, bundle optimization
5. **Git & GitHub**: Large files, workflow failures
6. **Security**: Exposed API keys, authentication patterns

**Usage**: Reference guide for developers and automated scripts to detect and fix common problems.

### 4. Sanity Check Script (`SANITY_CHECK.ps1`)

**Purpose**: Automated validation of development environment

**Checks**:
- ✅ Git installation and version
- ✅ Node.js version (18+ recommended)
- ✅ npm availability
- ✅ Python installation
- ✅ GitHub CLI (optional)
- ✅ Frontend dependencies installed
- ✅ Backend requirements satisfied
- ✅ Mega Prompt context files present
- ✅ AR/VR configuration (_headers file)
- ✅ .gitignore security
- ✅ Environment variable setup
- ✅ Stale build artifacts

**Usage**:
```powershell
# Run sanity check
.\SANITY_CHECK.ps1

# Run with auto-fix enabled
.\SANITY_CHECK.ps1 -Fix

# Verbose output
.\SANITY_CHECK.ps1 -Verbose

# Quiet mode (for CI/CD)
.\SANITY_CHECK.ps1 -QuietMode
```

### 5. Enhanced Master Automation (`RUN_MASTER_AUTOMATION.ps1`)

**New Features**:
- 🎨 Mega Prompt context loading
- 🛡️ NSA-level security pattern validation
- 🥽 AR/VR system integration checks
- ☁️ Cloudflare deployment validation
- 🎨 WIRED CHAOS design system enforcement

**Usage**:
```powershell
# Run with context validation only
.\RUN_MASTER_AUTOMATION.ps1 -ValidateContext -SkipConfirmation

# Full automation with mega prompt integration
.\RUN_MASTER_AUTOMATION.ps1
```

### 6. Enhanced VS Studio Bot (`VS_STUDIO_BOT_AUTOMATION.ps1`)

**New Features**:
- Mega Prompt context validation on startup
- Design system color palette display
- Enhanced logging with context awareness

## 🎨 WIRED CHAOS Design System

### Official Color Palette

```css
--bg-black: #000000;     /* Black base */
--cyan: #00FFFF;         /* Neon cyan - primary brand color */
--red: #FF3131;          /* Glitch red - alerts and errors */
--green: #39FF14;        /* Electric green - success states */
--pink: #FF00FF;         /* Accent pink - highlights */
--white: #FFFFFF;        /* White - text */
```

### Usage in Code

**CSS/SCSS**:
```css
.wired-chaos-button {
  background: #000000;
  color: #00FFFF;
  border: 2px solid #00FFFF;
  text-shadow: 0 0 10px #00FFFF;
}

.error-message {
  color: #FF3131;
  text-shadow: 0 0 5px #FF3131;
}
```

**JavaScript/React**:
```javascript
const WC_COLORS = {
  black: '#000000',
  cyan: '#00FFFF',
  red: '#FF3131',
  green: '#39FF14',
  pink: '#FF00FF',
  white: '#FFFFFF'
};

// Use in styles
<div style={{ color: WC_COLORS.cyan, background: WC_COLORS.black }}>
  WIRED CHAOS
</div>
```

**PowerShell**:
```powershell
Write-Host "Success!" -ForegroundColor Green    # Electric green
Write-Host "Warning!" -ForegroundColor Yellow   # Map to red/pink
Write-Host "Error!" -ForegroundColor Red        # Glitch red
Write-Host "Info" -ForegroundColor Cyan         # Neon cyan
```

## 🛡️ Security Patterns

### 1. Bearer Token Authentication

**Backend (Python/FastAPI)**:
```python
from fastapi import Header, HTTPException

async def verify_bearer_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(' ')[1]
    # Validate token against your auth system
    if not is_valid_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return token
```

**Frontend (JavaScript/React)**:
```javascript
const apiCall = async (endpoint, options = {}) => {
  const token = process.env.REACT_APP_API_TOKEN;
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};
```

### 2. Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED';
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
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
const data = await breaker.execute(() => fetch('/api/data'));
```

### 3. Wallet Gating with Visitor Pass

```javascript
async function checkUserAccess(walletAddress) {
  if (!walletAddress) {
    // Visitor pass - limited access
    return {
      level: 'visitor',
      features: ['browse', 'view_public'],
      message: 'Connect wallet for full access'
    };
  }
  
  // Check for NFT ownership or token holdings
  const hasAccess = await verifyWalletAssets(walletAddress);
  
  if (hasAccess) {
    return {
      level: 'member',
      features: ['browse', 'view_public', 'view_private', 'mint', 'interact'],
      message: 'Full access granted'
    };
  }
  
  return {
    level: 'connected',
    features: ['browse', 'view_public', 'request_access'],
    message: 'Wallet connected - acquire access NFT for full features'
  };
}
```

## 🥽 AR/VR Integration

### Model Viewer Setup

**HTML/React Component**:
```jsx
import { useEffect } from 'react';

const ARProductViewer = ({ modelPath, iosModelPath }) => {
  useEffect(() => {
    // Load model-viewer script
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
      src={modelPath}
      ios-src={iosModelPath}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      style={{ width: '100%', height: '500px' }}
    >
      <button slot="ar-button" style={{
        background: '#00FFFF',
        color: '#000000',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px'
      }}>
        View in AR
      </button>
    </model-viewer>
  );
};

export default ARProductViewer;
```

### CORS Configuration

**`public/_headers`**:
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
```

## ☁️ Cloudflare Integration

### Worker with MIME Type Override

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle AR/VR model files
    if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.usdz')) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      
      if (url.pathname.endsWith('.glb')) {
        newResponse.headers.set('Content-Type', 'model/gltf-binary');
      } else if (url.pathname.endsWith('.usdz')) {
        newResponse.headers.set('Content-Type', 'model/vnd.usdz+zip');
      }
      
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000');
      
      return newResponse;
    }
    
    return fetch(request);
  }
};
```

## 🔄 Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos

# 2. Run sanity check
.\SANITY_CHECK.ps1 -Fix

# 3. Install dependencies
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# 4. Set up environment variables
cp frontend/.env.example frontend/.env.local
# Edit .env.local with your values

# 5. Start development servers
npm run frontend:dev  # Terminal 1
npm run backend:dev   # Terminal 2
```

### Daily Development

```bash
# Run sanity check before starting work
.\SANITY_CHECK.ps1

# Start development
npm run frontend:dev

# Build for production
npm run frontend:build

# Deploy (automated via GitHub Actions)
git push origin main
```

### Before Committing

```bash
# Run sanity check with fixes
.\SANITY_CHECK.ps1 -Fix

# Check for security issues
# (Automated in master automation)

# Commit with descriptive message
git add .
git commit -m "feat: add new AR viewer component"
git push
```

## 📊 Monitoring & Validation

### Run Context Validation

```powershell
# Validate all mega prompt context
.\RUN_MASTER_AUTOMATION.ps1 -ValidateContext -SkipConfirmation

# This checks:
# - Copilot context file
# - VS Code settings
# - Security patterns
# - AR/VR configuration
# - Cloudflare setup
```

### Continuous Integration

All automation scripts are designed to work in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run Sanity Check
  run: |
    pwsh -File SANITY_CHECK.ps1 -QuietMode
```

## 🎓 Best Practices

### 1. Always Use Environment Variables
```javascript
// ❌ WRONG
const apiKey = 'sk_live_123456789';

// ✅ CORRECT
const apiKey = process.env.REACT_APP_API_KEY;
```

### 2. Follow WIRED CHAOS Color Scheme
```css
/* ❌ WRONG - Random colors */
.button { background: blue; color: yellow; }

/* ✅ CORRECT - WIRED CHAOS palette */
.button { background: #000000; color: #00FFFF; }
```

### 3. Implement Security Patterns
```python
# ✅ CORRECT - Always validate auth
@app.get("/api/secure")
async def secure_endpoint(token: str = Depends(verify_bearer_token)):
    return {"data": "secure"}
```

### 4. Configure CORS for AR/VR
```
# ✅ CORRECT - Always include _headers file
public/_headers should exist with proper MIME types
```

### 5. Run Sanity Checks Regularly
```powershell
# Before major changes
.\SANITY_CHECK.ps1 -Fix
```

## 🚀 Next Steps

1. **Explore Copilot Context**: Open `.copilot/wired-chaos-context.md` and familiarize yourself with the full system architecture
2. **Configure VS Code**: VS Code should automatically load settings from `.vscode/settings.json`
3. **Run Sanity Check**: Execute `.\SANITY_CHECK.ps1` to validate your environment
4. **Review Auto-Fix Patterns**: Read `AUTO_FIX_PATTERNS.md` for common solutions
5. **Use Master Automation**: Run `.\RUN_MASTER_AUTOMATION.ps1` for comprehensive setup

## 📚 Additional Resources

- **Repository**: https://github.com/wiredchaos/wired-chaos
- **Issues**: https://github.com/wiredchaos/wired-chaos/issues
- **Actions**: https://github.com/wiredchaos/wired-chaos/actions
- **Cloudflare Docs**: https://developers.cloudflare.com
- **Model Viewer Docs**: https://modelviewer.dev

---

**Version**: 1.0.0 (GIGA Integration)
**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Development Team
