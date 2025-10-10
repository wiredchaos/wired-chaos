# WIRED CHAOS Platform Implementation Guide

## Overview

This document provides comprehensive documentation for the WIRED CHAOS Platform implementation, including InsightX real-time integration, Resources Repository, and Persona-based Provider Rankings.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   WIRED CHAOS Platform                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │ Edge Worker  │  │  InsightX    │ │
│  │    React     │◄─┤  Cloudflare  │◄─┤     API      │ │
│  │              │  │   Workers    │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                            │
│         │                  │                            │
│         └──────────────────┴───────────────────────────┤
│                            │                            │
│                    ┌───────▼───────┐                   │
│                    │  Cloudflare   │                   │
│                    │   KV Storage  │                   │
│                    │               │                   │
│                    │ • Profiles    │                   │
│                    │ • Providers   │                   │
│                    │ • Vault       │                   │
│                    └───────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Features

### 1. InsightX Real-Time Integration

#### Ticker SSE (`/api/ticker`)
- **Description**: Server-Sent Events stream providing real-time market data and InsightX signals
- **Events**:
  - `connected`: Initial connection confirmation
  - `price`: Price updates for major tokens
  - `ix:risk`: Risk level signals
  - `ix:bubble`: Bubble detection signals
  - `ix:watch`: Watchlist activity signals
- **Fallback**: Stub mode when `INSIGHTX_API_KEY` is not configured
- **Error Handling**: Silent failures for 401/5xx errors

#### Heat Map API (`/api/heatmap`)
- **Description**: Generates 8x8 intensity grids from InsightX signals
- **Response Format**:
  ```json
  {
    "ts": 1234567890,
    "grid": {
      "rows": 8,
      "cols": 8,
      "cells": [
        {
          "row": 0,
          "col": 0,
          "intensity": 0.75,
          "symbol": "BTC",
          "metric": "volume"
        }
      ]
    },
    "mode": "live|stub"
  }
  ```
- **Update Frequency**: 5 seconds
- **Fallback**: Generates synthetic data when API unavailable

### 2. Resources Repository

#### User Profiles (`/api/profile`)
- **GET**: Retrieve user profile (requires authentication)
- **POST**: Create or update profile
- **Fields**:
  - `displayName`: User's display name
  - `avatar`: Profile picture URL (optional)
  - `bio`: User biography
  - `persona`: Default persona (builder/analyst/trader/security)
  - `weights`: Custom criteria weights

#### Provider Catalog (`/api/providers`)
- **Description**: 7 pre-seeded blockchain API providers
- **Providers**:
  1. **Alchemy** (92/100) - RPC + Enhanced APIs
  2. **The Graph** (88/100) - Indexing/Subgraphs
  3. **Bitquery** (84/100) - GraphQL On-chain Data
  4. **CoinGecko API** (82/100) - Market Data
  5. **DappRadar API** (78/100) - Dapp Analytics
  6. **Kaiko** (74/100) - Reference/DEX Pools
  7. **Glassnode** (70/100) - On-chain Metrics

#### Encrypted Vault (`/api/vault`)
- **Encryption**: AES-GCM with 32-byte keys
- **Security**:
  - Server-side encryption only
  - Client receives aliases only
  - No secrets transmitted to browser
- **Operations**:
  - `GET /api/vault`: List stored keys (aliases only)
  - `POST /api/vault`: Add encrypted API key

### 3. Persona-Based Rankings

#### Personas
1. **Builder** - Development Focus
   - High: Reliability (10), Docs (9), Free Quota (8), Multi-chain (8)
   - Ideal for: Developers building applications

2. **Analyst** - Research Focus
   - High: Multi-chain (9), Reliability (8), Docs (8), Community (7)
   - Ideal for: Data analysts and researchers

3. **Trader** - Real-time Focus
   - High: Real-time (10), Reliability (7), Multi-chain (7)
   - Ideal for: Active traders and market makers

4. **Security** - Reliability Focus
   - High: Reliability (10), Rate Limits (9), Real-time (8)
   - Ideal for: Security professionals and auditors

#### Scoring Criteria
- **Reliability**: Uptime and service stability (0-10)
- **Free Quota**: Generosity of free tier (0-10)
- **Multi-chain**: Number of blockchains supported (0-10)
- **Real-time**: Speed and freshness of data (0-10)
- **Documentation**: Quality of API docs (0-10)
- **Community**: Active community and support (0-10)
- **Rate Limits**: Flexibility of rate limiting (0-10)

#### Score Calculation
```javascript
score = Σ (criterion_value × weight) / (10 × Σ weights) × 100
```

## Environment Configuration

### Edge Worker (`.env`)
```bash
# InsightX API
INSIGHTX_API_URL=https://api.insightx.network
INSIGHTX_API_KEY=your-api-key-here

# Vault Encryption
VAULT_KMS_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Session Management
SESSION_COOKIE_NAME=wc_session

# CORS
TICKER_ALLOW_ORIGINS=*
```

### Frontend (`.env`)
```bash
# Edge Worker URL
REACT_APP_EDGE_API=http://localhost:8787

# Production
# REACT_APP_EDGE_API=https://edge.wiredchaos.xyz
```

## Development Workflow

### 1. Setup
```bash
# Install dependencies
cd edge/worker && npm install
cd frontend && npm install

# Copy environment files
cp edge/worker/.env.example edge/worker/.env
cp frontend/.env.example frontend/.env
```

### 2. Development
```bash
# Start both services (VS Code)
# Press Ctrl+Shift+P → Tasks: Run Task → dev:all

# Or manually:
# Terminal 1: Edge Worker
cd edge/worker && npx wrangler dev

# Terminal 2: Frontend
cd frontend && npm start
```

### 3. Access
- **Frontend**: http://localhost:3000
- **Edge Worker**: http://localhost:8787
- **Dashboard**: http://localhost:3000/dashboard
- **Resources**: http://localhost:3000/resources

### 4. Testing
```bash
# Run smoke tests
node scripts/smoke_insightx.mjs

# View provider catalog
node scripts/seed_providers.mjs

# Run CI tests
npm run test
```

## API Documentation

### Ticker SSE Stream
```javascript
const eventSource = new EventSource('http://localhost:8787/api/ticker');

eventSource.addEventListener('connected', (e) => {
  const data = JSON.parse(e.data);
  console.log('Connected:', data.mode); // 'live' or 'stub'
});

eventSource.addEventListener('price', (e) => {
  const data = JSON.parse(e.data);
  console.log('Price:', data);
  // { symbol: 'BTC', price: 45000, change: 2.5, timestamp: ... }
});

eventSource.addEventListener('ix:risk', (e) => {
  const data = JSON.parse(e.data);
  console.log('Risk:', data);
  // { symbol: 'ETH', riskLevel: 'high', score: 75, ... }
});
```

### Heat Map API
```javascript
const response = await fetch('http://localhost:8787/api/heatmap');
const data = await response.json();

console.log(`Grid: ${data.grid.rows}x${data.grid.cols}`);
console.log(`Cells: ${data.grid.cells.length}`);
console.log(`Mode: ${data.mode}`);

// Access cell intensity
data.grid.cells.forEach(cell => {
  console.log(`[${cell.row},${cell.col}]: ${cell.intensity}`);
});
```

### Profile Management
```javascript
// Create/Update Profile
const response = await fetch('http://localhost:8787/api/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    displayName: 'John Doe',
    bio: 'Blockchain developer',
    persona: 'builder'
  })
});

const profile = await response.json();
console.log('Profile:', profile);
```

### Provider Catalog
```javascript
// Get all providers with personalized scores
const response = await fetch('http://localhost:8787/api/providers?category=all', {
  credentials: 'include'
});

const data = await response.json();
console.log(`Found ${data.providers.length} providers`);
console.log(`Personalized: ${data.personalized}`);

data.providers.forEach(provider => {
  console.log(`${provider.name}: ${provider.score}/100`);
});
```

### Vault Operations
```javascript
// Store API Key
const response = await fetch('http://localhost:8787/api/vault', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    alias: 'My Alchemy Key',
    provider: 'Alchemy',
    apiKey: 'your-secret-api-key'
  })
});

// List Keys (aliases only)
const keys = await fetch('http://localhost:8787/api/vault', {
  credentials: 'include'
}).then(r => r.json());

console.log('Stored keys:', keys.keys);
// [{ id, alias, provider, createdAt }]
```

## Security Considerations

### Vault Encryption
- **Algorithm**: AES-256-GCM
- **Key Length**: 32 bytes (256 bits)
- **IV Length**: 12 bytes (96 bits)
- **Authentication**: GCM provides built-in authentication
- **Storage**: Encrypted data stored in Cloudflare KV
- **Client Safety**: Only aliases sent to browser

### Session Management
- **Cookie Name**: `wc_session` (configurable)
- **HttpOnly**: Yes
- **Secure**: Yes (HTTPS only)
- **SameSite**: Lax
- **Max-Age**: 1 year

### CORS Configuration
- **Default**: Allow all origins (`*`)
- **Configurable**: Via `TICKER_ALLOW_ORIGINS`
- **Credentials**: Supported for authenticated endpoints

## Deployment

### Cloudflare Workers
```bash
# Set secrets
cd edge/worker
wrangler secret put INSIGHTX_API_KEY
wrangler secret put VAULT_KMS_KEY

# Deploy
wrangler deploy --env production
```

### Frontend (Static Hosting)
```bash
cd frontend
npm run build

# Deploy to Cloudflare Pages, Vercel, or Netlify
```

## Monitoring

### Key Metrics
- **Ticker Connections**: Active SSE connections
- **Heat Map Requests**: Requests per minute
- **Provider Rankings**: Query frequency
- **Vault Operations**: Encryption/decryption ops

### Error Rates
- **InsightX API**: 401 (auth) and 5xx (server) errors
- **Vault Encryption**: Failed encryptions
- **Profile Operations**: Failed creates/updates

### Performance
- **Ticker Latency**: Time to first event
- **Heat Map Generation**: Grid computation time
- **Score Calculation**: Ranking algorithm performance

## Troubleshooting

### Ticker Not Connecting
1. Check edge worker is running: `curl http://localhost:8787/api/health`
2. Verify CORS headers: Check browser console
3. Test SSE manually: `curl http://localhost:8787/api/ticker`

### Heat Map Not Loading
1. Check API response: `curl http://localhost:8787/api/heatmap | jq`
2. Verify grid structure: 8x8 with 64 cells
3. Check intensity values: All between 0 and 1

### Vault Errors
1. Verify KMS key length: Must be 64 hex characters (32 bytes)
2. Check authentication: Must have valid session cookie
3. Test encryption: Use provided crypto tests

### Profile Not Saving
1. Check session cookie: Verify `wc_session` is set
2. Test profile endpoint: `curl -X POST http://localhost:8787/api/profile`
3. Verify KV bindings: Check wrangler.toml

## Future Enhancements

### Phase 2
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-user team support
- [ ] Enhanced provider integrations

### Phase 3
- [ ] Mobile applications
- [ ] Browser extensions
- [ ] API marketplace
- [ ] Advanced ML predictions

## Support

For issues, questions, or contributions:
- **GitHub**: https://github.com/wiredchaos/wired-chaos
- **Email**: team@wiredchaos.xyz
- **Discord**: Join WIRED CHAOS community

## License

[Your License Here]

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-15  
**Status**: Production Ready
