# WIRED CHAOS - Complete System Context

This document provides comprehensive context for GitHub Copilot and development tools to understand the entire WIRED CHAOS infrastructure, security patterns, and technical architecture.

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

### Typography
- **Primary Font**: 'Orbitron' (futuristic, tech aesthetic)
- **Secondary Font**: 'Rajdhani' (clean, modern)
- **Monospace**: System monospace for code blocks

### Visual Effects
- Neon glow shadows: `text-shadow: 0 0 10px var(--cyan), 0 0 20px var(--cyan)`
- Glitch animations for title elements
- Grid background with moving animation
- Circuit board aesthetic patterns

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend (React + Next.js)
- **Location**: `/frontend`
- **Framework**: React 18+ with hooks
- **Styling**: CSS Modules + Tailwind CSS
- **AR/VR**: `<model-viewer>` for GLB/USDZ 3D models
- **Deployment**: Cloudflare Pages
- **Build**: Create React App (CRA) with custom config

#### Backend (Python FastAPI)
- **Location**: `/backend`
- **Framework**: FastAPI with async/await
- **APIs**: 
  - Certificate Minting (Multi-chain NFT)
  - Brain Assistant AI
  - HRM/VRG System
- **Database**: MongoDB (referenced in vault33-gatekeeper)
- **Deployment**: Cloudflare Workers (Python support)

#### Smart Contracts
- **Location**: `/contracts`
- **Chains**: Ethereum, Solana, XRPL, Hedera, Dogecoin
- **Use Cases**: NFT Certificates, Vault33 Gatekeeper

#### Security Layer (Vault33 Gatekeeper)
- **Location**: `/vault33-gatekeeper`
- **Purpose**: NSA-level security, wallet gating, NDA signatures
- **Components**: Discord/Telegram bots, API, shared config

### Infrastructure Components

#### Cloudflare Stack
```
Pages (Frontend) → Workers (API) → KV (Cache) → R2 (Assets)
                ↓
         Circuit Breaker
                ↓
         Bearer Token Auth
```

**Key Files**:
- `src/wrangler.toml` - Worker configuration
- `public/_headers` - CORS and MIME type headers (if exists)
- `.github/workflows/frontend-deploy.yml` - Pages deployment
- `.github/workflows/worker-deploy.yml` - Worker deployment

#### AR/VR Integration
**Model Viewer Setup**:
```html
<model-viewer 
  src="models/product.glb"
  ios-src="models/product.usdz"
  ar ar-modes="webxr scene-viewer quick-look"
  camera-controls
  auto-rotate>
</model-viewer>
```

**Required Headers** (`public/_headers`):
```
/*
  Access-Control-Allow-Origin: *
  X-Content-Type-Options: nosniff
  
/*.glb
  Content-Type: model/gltf-binary
  
/*.usdz
  Content-Type: model/vnd.usdz+zip
```

**XR Permissions**:
```json
{
  "xr-spatial-tracking": ["self"],
  "camera": ["self"]
}
```

## 🛡️ Security Patterns (NSA-Level)

### 1. Bearer Token Authentication
```javascript
// Frontend
const headers = {
  'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`,
  'X-API-Key': process.env.REACT_APP_API_KEY
};

// Backend (Python)
from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(' ')[1]
    # Verify token
```

### 2. Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
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
}
```

### 3. Wallet Gating with Visitor Pass
```javascript
// Check wallet connection, fallback to visitor pass
async function checkAccess(walletAddress) {
  if (walletAddress) {
    // Check NFT/token ownership
    return await verifyWalletAssets(walletAddress);
  }
  // Visitor pass - limited access
  return { access: 'visitor', features: ['browse', 'view'] };
}
```

### 4. NDA Digital Signatures (Aurora Phi Trust DAO)
```python
# Backend validation
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

def verify_nda_signature(message: bytes, signature: bytes, public_key):
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except:
        return False
```

## 🔧 Common Auto-Fix Patterns

### 1. JSX Nesting Errors (App.js)
**Problem**: Components wrapped incorrectly
```jsx
// ❌ Wrong
return (
  <div>
    <Component1 />
  <Component2 />
  </div>
);

// ✅ Correct
return (
  <div>
    <Component1 />
    <Component2 />
  </div>
);
```

### 2. Environment Variable Handling
**Frontend (Vite/React)**:
```javascript
// Use import.meta.env for Vite
const apiUrl = import.meta.env.VITE_API_URL;

// Use process.env for Create React App
const apiUrl = process.env.REACT_APP_API_URL;
```

**Backend (Python)**:
```python
import os
API_KEY = os.getenv("API_KEY", "default_value")
```

### 3. AR/VR CORS Configuration
**Problem**: Model files not loading due to CORS
**Fix**: Add `_headers` file in `public/`:
```
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type

/*.glb
  Content-Type: model/gltf-binary
  Cache-Control: public, max-age=31536000
```

### 4. Cloudflare Worker MIME Overrides
```javascript
// In Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname.endsWith('.glb')) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Content-Type', 'model/gltf-binary');
      return newResponse;
    }
    
    return fetch(request);
  }
}
```

### 5. Build Error Diagnostics
**Common Issues**:
- Missing dependencies: `npm install` or `pip install -r requirements.txt`
- Node version mismatch: Use Node 18+ LTS
- Python version: Use Python 3.9+
- Module not found: Check import paths and case sensitivity

## 🚀 Development Workflow

### Local Development Setup
```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Run development servers
npm run frontend:dev  # React dev server (port 3000)
npm run backend:dev   # FastAPI server (port 8000)
```

### Environment Variables
**Frontend** (`.env.local`):
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TOKEN=dev_token
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your_account_id
```

**Backend** (`.env`):
```
MONGODB_URI=mongodb://localhost:27017
API_SECRET=your_secret_key
CLOUDFLARE_API_TOKEN=your_token
```

### Build & Deploy
```bash
# Frontend build
cd frontend && npm run build

# Deploy to Cloudflare Pages (automated via GitHub Actions)
# Triggered on push to main branch

# Worker deploy
npx wrangler deploy
```

## 🤖 Master Automation Systems

### RUN_MASTER_AUTOMATION.ps1
**Purpose**: Complete security and environment setup
**Features**:
- Dependency installation (Node.js, Python, GitHub CLI)
- Security vulnerability fixes
- Automated testing
- Git commit and push
- PR creation

**Usage**:
```powershell
.\RUN_MASTER_AUTOMATION.ps1
# With options:
.\RUN_MASTER_AUTOMATION.ps1 -SkipConfirmation -QuietMode
```

### VS_STUDIO_BOT_AUTOMATION.ps1
**Purpose**: VS Studio Bot integration and deployment
**Features**:
- Automated dependency checks
- GitHub secret management
- Security audits
- Integration verification
- Comprehensive reporting

**Usage**:
```powershell
.\VS_STUDIO_BOT_AUTOMATION.ps1
# Skip specific tasks:
.\VS_STUDIO_BOT_AUTOMATION.ps1 -SkipDependencies -SkipTests
```

### MEGA_DEPLOYMENT.ps1
**Purpose**: Complete deployment and beta test verification
**Features**:
- Environment setup
- Integration status checks
- Deployment URL reporting
- Beta environment verification

## 📊 Testing & Quality Assurance

### Frontend Testing
```bash
cd frontend
npm test              # Run Jest tests
npm run test:coverage # Coverage report
```

### Backend Testing
```bash
cd backend
pytest                # Run pytest suite
pytest --cov          # With coverage
```

### Manual Testing Checklist
- [ ] Frontend builds without errors
- [ ] Backend API responds on localhost:8000
- [ ] AR/VR models load correctly
- [ ] Wallet connection works
- [ ] Environment variables loaded
- [ ] CORS headers configured
- [ ] Security headers present

## 🔍 Debugging Patterns

### Frontend Debug
```javascript
// Enable React DevTools
console.log('Component state:', this.state);

// Check environment variables
console.log('Env vars:', {
  apiUrl: process.env.REACT_APP_API_URL,
  node_env: process.env.NODE_ENV
});

// Network requests
fetch(url)
  .then(r => { console.log('Response:', r); return r.json(); })
  .catch(e => console.error('Error:', e));
```

### Backend Debug
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f"Request received: {request.method} {request.url}")
logger.info(f"Processing: {data}")
logger.error(f"Error occurred: {error}")
```

### Cloudflare Workers Debug
```javascript
// Use wrangler tail for live logs
// In worker:
console.log('Request:', request.url);
console.error('Error:', error.message);
```

## 🎯 Integration Points

### Gamma Integration
- Content management
- Dynamic page generation
- Webhook configuration

### Notion Integration
- Database sync
- API integration
- Content updates

### Wix Integration
- Iframe embedding
- E-commerce connection
- Event tracking

### Zapier Integration
- Automation workflows
- Multi-platform sync
- Event triggers

## 📝 Code Style Guidelines

### JavaScript/React
```javascript
// Use functional components with hooks
const Component = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};

// Export default
export default Component;
```

### Python
```python
# FastAPI route pattern
@router.post("/endpoint", response_model=ResponseModel)
async def endpoint_handler(
    request: RequestModel,
    background_tasks: BackgroundTasks
):
    """
    Endpoint documentation
    """
    try:
        result = await process_request(request)
        return ResponseModel(success=True, data=result)
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

### PowerShell
```powershell
# Function pattern
function FunctionName {
    param(
        [string]$Parameter1,
        [switch]$Flag
    )
    
    try {
        # Logic
        Write-Success "Success message"
    } catch {
        Write-Error "Error: $($_.Exception.Message)"
    }
}
```

## 🌐 Deployment URLs

### Production
- **Frontend**: `https://wired-chaos.pages.dev`
- **Worker**: `https://wired-chaos-worker.[account].workers.dev`
- **API**: Routed through Worker

### Preview
- **Frontend**: `https://wired-chaos-preview.pages.dev`
- **Branch Previews**: `https://[branch].wired-chaos.pages.dev`

### GitHub
- **Repository**: `https://github.com/wiredchaos/wired-chaos`
- **Actions**: `https://github.com/wiredchaos/wired-chaos/actions`
- **Issues**: `https://github.com/wiredchaos/wired-chaos/issues`

## 🎓 Certificate NFT System

### Supported Blockchains
1. **Ethereum** (Sepolia Testnet)
2. **Solana** (Devnet)
3. **XRPL** (Testnet)
4. **Hedera** (Testnet)
5. **Dogecoin** (Stub implementation)

### API Endpoint
```python
POST /api/cert/mint
{
  "studentName": "John Doe",
  "courseId": "WC101",
  "courseName": "WIRED CHAOS Basics",
  "chain": "ethereum",
  "to": "0x...",
  "metadataUri": "ipfs://..."
}
```

## 🧠 Brain Assistant System

### Features
- 3D brain visualization
- AI-powered responses
- Real-time interaction
- Multi-modal input (text, voice)

### Integration
Located in `/backend/brain_assistant_api.py`

## 🔐 Vault33 Gatekeeper

### Configuration
- Discord bot integration
- Telegram bot integration
- Wallet verification
- Gamification points system
- Burn mechanics for Merovingian fragments

### Key Components
- `/vault33-gatekeeper/shared/config.py` - Configuration
- Discord/Telegram bots for community management
- API for external integrations

## 🎮 Beta Test Environment

### Active Features
- Certificate NFT minting (multi-blockchain)
- 3D Brain Assistant with AI
- Vault33 Gatekeeper System
- Animated Motherboard UI
- Real-time blockchain integration

### Testing Access
Beta environment confirmed active per automation reports.

## 📚 Documentation References

- **Automation**: `AUTOMATION_README.md`
- **Security**: `SECURITY_ANALYSIS.md`
- **Deployment**: `DEPLOYMENT_REPORT.md`
- **VS Studio Bot**: `VS_STUDIO_BOT_README.md`
- **Integration**: `INTEGRATION_SETUP.md`

## 🚨 Common Pitfalls & Solutions

### Issue: Model Viewer Not Loading
**Solution**: 
1. Check CORS headers in `_headers` file
2. Verify MIME types for .glb and .usdz files
3. Ensure files are in `public/` directory
4. Check browser console for errors

### Issue: Environment Variables Undefined
**Solution**:
1. Verify `.env` file exists and is loaded
2. Check variable prefix (REACT_APP_ for CRA, VITE_ for Vite)
3. Restart development server after changes
4. Use `import.meta.env` for Vite, `process.env` for CRA

### Issue: API CORS Errors
**Solution**:
1. Add CORS middleware in backend
2. Configure Cloudflare Worker CORS headers
3. Set proper `Access-Control-Allow-Origin` headers
4. Handle preflight OPTIONS requests

### Issue: Build Failures
**Solution**:
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check Node version: `node --version` (use 18+ LTS)
3. Clear build cache: `rm -rf build dist .next`
4. Check for TypeScript errors if applicable

## 🎯 Quick Reference Commands

```bash
# Development
npm run frontend:dev
npm run backend:dev

# Building
npm run frontend:build
npm run build

# Testing
npm test
pytest

# Deployment (manual)
npx wrangler deploy
git push origin main  # Triggers GitHub Actions

# Automation
.\RUN_MASTER_AUTOMATION.ps1
.\VS_STUDIO_BOT_AUTOMATION.ps1
.\MEGA_DEPLOYMENT.ps1

# Debugging
npx wrangler tail              # Worker logs
npm run frontend:dev --verbose # Verbose React build
pytest -v                      # Verbose Python tests
```

## 🌟 WIRED CHAOS Philosophy

**Vision**: Create a seamless, secure, and futuristic Web3 experience that combines:
- Cutting-edge AR/VR technology
- NSA-level security patterns
- Multi-chain blockchain integration
- Community-driven governance (Aurora Phi Trust DAO)
- Automated development workflows
- Zero-touch deployment

**Principles**:
1. Security First - NSA-level patterns throughout
2. User Experience - Smooth, intuitive interfaces
3. Automation - Minimize manual intervention
4. Transparency - Open source, documented systems
5. Innovation - Bleeding edge tech stack

---

**Last Updated**: Auto-generated by WIRED CHAOS Mega Prompt Integration
**Maintained By**: WIRED CHAOS Development Team
**Context Version**: 1.0.0 (GIGA Integration)
