# VRG33589 "The Eternal Loop" - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- XRPL wallet address (testnet)

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
pip install fastapi uvicorn httpx pydantic

# Frontend dependencies (if building full React app)
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```bash
# XRPL Configuration
XRPL_RPC_URL=https://s.altnet.rippletest.net:51234
XRPL_NETWORK=testnet

# OpenAI for LLM Swarm (optional, has fallbacks)
OPENAI_API_KEY=sk-your-key-here
MODEL=gpt-4o-mini

# Server
PORT=8000
```

### 3. Start Backend

```bash
cd backend
python3 server.py
```

Backend runs at `http://localhost:8000`

### 4. Test Game API

```bash
# Health check
curl http://localhost:8000/api/vrg33589/health

# Initialize game
curl -X POST http://localhost:8000/api/vrg33589/game/initialize \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "rYourXRPLWalletAddress"}'

# Get game state
curl http://localhost:8000/api/vrg33589/game/state/rYourXRPLWalletAddress
```

### 5. Use Frontend Components

Add to your React app:

```jsx
import EternalLoop from './components/EternalLoop';
import SwarmMonitor from './components/SwarmMonitor';
import RealityLayers from './components/RealityLayers';

function GamePage() {
  return (
    <div>
      <EternalLoop />
    </div>
  );
}
```

Or use the full dashboard:

```jsx
import VRG33589Dashboard from './components/VRG33589Dashboard';

function App() {
  return <VRG33589Dashboard />;
}
```

## 🎮 Basic Gameplay Flow

### 1. Connect Wallet
```javascript
// Component automatically handles this
// Just enter your XRPL wallet address (starts with 'r')
```

### 2. Initialize Game State
```bash
POST /api/vrg33589/game/initialize
{
  "wallet_address": "rXXXXXXXXXXXXXX"
}
```

Response:
```json
{
  "success": true,
  "state": {
    "player_wallet": "rXXXXXXXXXXXXXX",
    "reality_layer": "surface",
    "loop_iteration": 0,
    "credit_balance": 0.0,
    "vrg33589_nfts": [],
    "puzzle_progress": []
  }
}
```

### 3. Register NFTs
```bash
POST /api/vrg33589/game/nft/register
{
  "wallet_address": "rXXXXXXXXXXXXXX",
  "nft_data": {
    "nft_id": "00080000XXXXXXXXXX",
    "rarity": "rare",
    "daily_credits": 2.5,
    "special_abilities": ["speed_boost"]
  }
}
```

### 4. Claim Daily Credits
```bash
POST /api/vrg33589/game/credits/claim
{
  "wallet_address": "rXXXXXXXXXXXXXX"
}
```

Response:
```json
{
  "success": true,
  "credits_claimed": 2.5,
  "new_balance": 2.5,
  "nft_count": 1
}
```

### 5. Solve Puzzles
```bash
POST /api/vrg33589/game/puzzle/submit
{
  "wallet_address": "rXXXXXXXXXXXXXX",
  "puzzle_id": "puzzle_12345",
  "solution": "your_answer"
}
```

## 📊 Component Usage Examples

### SwarmMonitor
```jsx
import SwarmMonitor from './components/SwarmMonitor';

<SwarmMonitor gameState={gameState} />
```

Shows:
- Active swarm types (Puzzle, Patch, Guardian, Community)
- Pending task queue
- Real-time swarm coordination status

### RealityLayers
```jsx
import RealityLayers from './components/RealityLayers';

<RealityLayers 
  currentLayer="surface"
  loopIteration={3}
  puzzlesSolved={12}
/>
```

Shows:
- Current reality layer (Surface, Deep, Core, Void)
- Progress through layers
- Unlock requirements
- Active puzzles in current layer

### XRPLWalletConnect
```jsx
import XRPLWalletConnect from './components/XRPLWalletConnect';

<XRPLWalletConnect
  onConnect={(wallet) => console.log('Connected:', wallet)}
  onDisconnect={() => console.log('Disconnected')}
  connected={isConnected}
/>
```

## 🎨 Styling Customization

All components use WIRED CHAOS color palette:
- Cyan: `#00FFFF` (primary)
- Red: `#FF3131` (accents)
- Green: `#39FF14` (success)
- Pink: `#FF00FF` (special)
- Black: `#000000` (background)

Customize by modifying CSS variables or component styles.

## 🔧 Advanced Configuration

### Enable Full LLM Swarm
Set `OPENAI_API_KEY` in `.env` for dynamic puzzle generation:

```bash
OPENAI_API_KEY=sk-your-openai-key
MODEL=gpt-4o-mini
```

Without API key, system uses fallback puzzles.

### XRPL Network Selection
```bash
# Testnet (default)
XRPL_RPC_URL=https://s.altnet.rippletest.net:51234
XRPL_NETWORK=testnet

# Mainnet (production)
XRPL_RPC_URL=https://xrplcluster.com
XRPL_NETWORK=mainnet
```

### Worker Integration
Add to `src/unified-worker.js`:

```javascript
if (path.startsWith('/game/')) {
  return await this.handleGameEndpoints(path, method, request, processor, corsHeaders);
}
```

## 🧪 Testing

### Test Backend Routes
```bash
# Run all tests
cd backend
pytest

# Test specific module
python3 -m pytest test_vrg33589_game.py
```

### Test Frontend Components
```bash
cd frontend
npm test
```

## 🐛 Common Issues

### "Module not found" errors
**Solution**: Install dependencies
```bash
pip install fastapi uvicorn httpx pydantic
```

### XRPL connection fails
**Solution**: Check network URL
```bash
# Test connection
curl https://s.altnet.rippletest.net:51234 -X POST \
  -H "Content-Type: application/json" \
  -d '{"method":"server_info"}'
```

### LLM swarm returns empty responses
**Solution**: Add OpenAI API key or use fallback mode (automatic)

### Game state not persisting
**Note**: Current implementation uses in-memory storage. For production, add database:
```python
# Example: Add PostgreSQL
from sqlalchemy import create_engine
engine = create_engine('postgresql://user:pass@localhost/vrg33589')
```

## 📚 Next Steps

1. **Read Full Documentation**: [VRG33589_ETERNAL_LOOP.md](./VRG33589_ETERNAL_LOOP.md)
2. **Explore API Reference**: Check backend docstrings
3. **Customize Components**: Modify CSS and logic
4. **Add Database**: Implement persistence layer
5. **Deploy**: See deployment section in main docs

## 🎯 Quick Integration Checklist

- [ ] Backend running on port 8000
- [ ] Environment variables configured
- [ ] XRPL wallet address ready
- [ ] Frontend components imported
- [ ] Game initialized successfully
- [ ] NFTs registered (if available)
- [ ] First puzzle attempted
- [ ] Credits claimed

## 💡 Pro Tips

1. **Testnet Faucet**: Get free testnet XRP at https://xrpl.org/xrp-testnet-faucet.html
2. **Wallet Creation**: Use https://xrpl.org/wallets.html for XRPL wallet setup
3. **Monitor Swarms**: Keep SwarmMonitor visible for debugging
4. **Reality Layers**: Progress shown in RealityLayers component
5. **Leaderboard**: Check `/api/vrg33589/leaderboard` for rankings

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This guide + full docs
- **Community**: Discord (TBD)

---

**Ready to enter The Eternal Loop!** 🌀

Start with `python3 backend/server.py` and visit `http://localhost:8000/api/vrg33589/health`
