# WIRED CHAOS - Quick Reference Card

## 🎨 Color Palette
```
Black:  #000000  │  Cyan:  #00FFFF  │  Red:    #FF3131
Green:  #39FF14  │  Pink:  #FF00FF  │  White:  #FFFFFF
```

## 🚀 Quick Commands

### Development
```bash
npm run frontend:dev          # Start React dev server (port 3000)
npm run backend:dev           # Start FastAPI server (port 8000)
npm run frontend:build        # Build for production
```

### Video System (NEW)
```bash
# Backend API
python backend/server.py      # Start video API server

# Test video system
python test_video_avatar.py   # Run video avatar tests

# See documentation
cat VIDEO_QUICKSTART.md       # Quick start guide
cat VIDEO_AVATAR_DOCUMENTATION.md  # Complete documentation
```

### Validation
```powershell
.\SANITY_CHECK.ps1           # Check environment
.\SANITY_CHECK.ps1 -Fix      # Check and auto-fix issues
.\RUN_MASTER_AUTOMATION.ps1 -ValidateContext  # Validate mega prompt context
```

### Installation
```bash
npm install                           # Root dependencies
cd frontend && npm install            # Frontend dependencies
cd backend && pip install -r requirements.txt  # Backend dependencies
```

## 🛡️ Security Patterns

### Bearer Token Auth (Backend)
```python
from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401)
    return authorization.split(' ')[1]
```

### Bearer Token Auth (Frontend)
```javascript
const headers = {
  'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
};
```

### Environment Variables
```javascript
// CRA (Create React App)
process.env.REACT_APP_API_URL

// Vite
import.meta.env.VITE_API_URL

// Python
import os
os.getenv("API_KEY")
```

## 🥽 AR/VR Quick Setup

### Model Viewer Component
```jsx
<model-viewer
  src="/models/product.glb"
  ios-src="/models/product.usdz"
  ar ar-modes="webxr scene-viewer quick-look"
  camera-controls auto-rotate>
</model-viewer>
```

### Required Headers File (public/_headers)
```
/*.glb
  Content-Type: model/gltf-binary
  Access-Control-Allow-Origin: *

/*.usdz
  Content-Type: model/vnd.usdz+zip
  Access-Control-Allow-Origin: *
```

## ☁️ Cloudflare

### Worker MIME Override
```javascript
if (url.pathname.endsWith('.glb')) {
  newResponse.headers.set('Content-Type', 'model/gltf-binary');
}
```

### Deploy
```bash
npx wrangler deploy           # Manual deploy
git push origin main          # Triggers GitHub Actions
```

## 🔧 Common Fixes

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Frontend Won't Build
```bash
cd frontend
rm -rf node_modules build
npm install
npm run build
```

### Backend Won't Start
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### AR Models Not Loading
```bash
# Create public/_headers file with CORS + MIME types
# See AR/VR Quick Setup above
```

### CORS Errors (Backend)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)
```

## 📁 Key Files

```
.copilot/wired-chaos-context.md     # Full system context for Copilot
.vscode/settings.json               # VS Code configuration
AUTO_FIX_PATTERNS.md                # Auto-fix reference library
SANITY_CHECK.ps1                    # Environment validation
RUN_MASTER_AUTOMATION.ps1           # Master automation script
VS_STUDIO_BOT_AUTOMATION.ps1        # VS Studio Bot automation
MEGA_PROMPT_INTEGRATION_GUIDE.md    # Complete integration guide
```

## 🎯 Automation Scripts

### SANITY_CHECK.ps1
```powershell
.\SANITY_CHECK.ps1              # Run checks
.\SANITY_CHECK.ps1 -Fix         # Auto-fix issues
.\SANITY_CHECK.ps1 -Verbose     # Detailed output
```

### RUN_MASTER_AUTOMATION.ps1
```powershell
.\RUN_MASTER_AUTOMATION.ps1                     # Full automation
.\RUN_MASTER_AUTOMATION.ps1 -ValidateContext    # Context validation only
.\RUN_MASTER_AUTOMATION.ps1 -SkipConfirmation   # Skip prompts
```

### VS_STUDIO_BOT_AUTOMATION.ps1
```powershell
.\VS_STUDIO_BOT_AUTOMATION.ps1                  # Full automation
.\VS_STUDIO_BOT_AUTOMATION.ps1 -SkipDependencies # Skip dependency check
```

## 🔍 Debugging

### Frontend
```javascript
console.log('Env:', process.env.REACT_APP_API_URL);
console.log('State:', componentState);
```

### Backend
```python
import logging
logger = logging.getLogger(__name__)
logger.debug(f"Request: {request.url}")
```

### Worker
```javascript
console.log('Request:', request.url);
// View with: npx wrangler tail
```

## 📊 File Structure

```
wired-chaos/
├── .copilot/                   # Copilot context
├── .vscode/                    # VS Code settings
├── frontend/                   # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                    # Python FastAPI
│   ├── cert_api.py
│   ├── server.py
│   └── requirements.txt
├── contracts/                  # Smart contracts
├── vault33-gatekeeper/         # Security layer
├── public/                     # Static assets + AR models
│   └── _headers               # CORS configuration
├── src/
│   └── wrangler.toml          # Worker config
└── .github/workflows/          # CI/CD
```

## 🌐 URLs

**Production**:
- Frontend: https://wired-chaos.pages.dev
- Worker: https://wired-chaos-worker.[account].workers.dev

**Preview**:
- Frontend: https://wired-chaos-preview.pages.dev

**GitHub**:
- Repo: https://github.com/wiredchaos/wired-chaos
- Actions: https://github.com/wiredchaos/wired-chaos/actions

## 💡 Pro Tips

1. **Always run sanity check before major changes**
2. **Use WIRED CHAOS color palette consistently**
3. **Never commit .env files (they're in .gitignore)**
4. **Test AR/VR models in _headers file before deployment**
5. **Use bearer token auth for all API endpoints**
6. **Implement circuit breakers for external services**
7. **Follow code style in existing files**

---

**Quick Help**: See `MEGA_PROMPT_INTEGRATION_GUIDE.md` for detailed documentation
**Auto-Fix Patterns**: See `AUTO_FIX_PATTERNS.md` for common solutions
**Full Context**: See `.copilot/wired-chaos-context.md` for complete system info
