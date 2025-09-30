# WIRED CHAOS UNIVERSITY - Documentation

## Overview
WIRED CHAOS UNIVERSITY (WCU) is a comprehensive educational platform integrated into the WIRED CHAOS ecosystem with Proof of School credentials on XRPL.

## Routes

### `/university`
Main curriculum interface displaying Tracks A-I with interactive modules, XP tracking, and badge system.

**Features:**
- Interactive curriculum with 9 tracks (Foundation through Capstone)
- Real-time XP and level tracking
- Badge earning system
- Proof of School credential issuance
- LocalStorage persistence for offline progress

### `/verify/:type/:tx`
Credential verification page for validating Proof of School credentials.

**Parameters:**
- `type`: Credential type (`pose` for Enrollment, `posm` for Mastery)
- `tx`: Transaction hash (e.g., `POSE_1234567890` or `POSM_1234567890`)

**Features:**
- Visual validation status (VALID/INVALID)
- Credential details display
- Print certificate functionality
- Back to University navigation

## API Endpoints

### `POST /api/university/progress/save`
Save student progress to server.

**Request Body:**
```json
{
  "userId": "user_123",
  "state": {
    "xp": 500,
    "level": 2,
    "tracks": {...},
    "badges": [...]
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

### `POST /api/pos/enroll/issue`
Issue a Proof of School - Enrollment SBT (Soul-Bound Token).

**Request Body:**
```json
{
  "userId": "user_123",
  "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
  "programId": "WCU-2024",
  "cohortId": "COHORT-1"
}
```

**Response:**
```json
{
  "status": "ok",
  "tx_hash": "POSE_1234567890",
  "credential_url": "/verify/pose/POSE_1234567890",
  "userId": "user_123",
  "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
  "programId": "WCU-2024",
  "cohortId": "COHORT-1",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /api/pos/enroll/revoke`
Revoke a Proof of School - Enrollment credential.

**Request Body:**
```json
{
  "userId": "user_123",
  "tx_hash": "POSE_1234567890"
}
```

**Response:**
```json
{
  "status": "ok",
  "revoked": true,
  "tx": "POSE_1234567890",
  "userId": "user_123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /api/pos/mastery/mint`
Mint a Proof of School - Mastery NFT.

**Request Body:**
```json
{
  "userId": "user_123",
  "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
  "badge": "White Belt",
  "modules": ["A1", "A2", "A3"],
  "artifacts": [
    { "name": "Project 1", "sha256": "abc123..." }
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "tx_hash": "POSM_1234567890",
  "credential_url": "/verify/posm/POSM_1234567890",
  "metadata": {
    "name": "WCU Badge: White Belt",
    "description": "Proof of School - Mastery credential for White Belt",
    "badge": "White Belt",
    "modules": ["A1", "A2", "A3"],
    "artifacts": [...],
    "evidenceRoot": "MERKLE_abc123_1234567890",
    "userId": "user_123",
    "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
    "kind": "XRPL",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "evidenceRoot": "MERKLE_abc123_1234567890"
}
```

### `POST /api/rss/digest`
Schedule RSS digest delivery.

**Request Body:**
```json
{
  "schedule": "daily"
}
```

**Response:**
```json
{
  "scheduled": true,
  "schedule": "daily",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Custom Events

The `wc-university` web component emits the following custom events:

### `wc-university:progress`
Emitted when student progress is updated.

**Detail:**
```json
{
  "state": {
    "userId": "user_123",
    "xp": 500,
    "level": 2,
    "tracks": {...},
    "badges": [...]
  }
}
```

### `wc-university:xp`
Emitted when XP is awarded.

**Detail:**
```json
{
  "amount": 50,
  "total": 500,
  "reason": "Completed module A1"
}
```

### `wc-university:badge`
Emitted when a badge is earned.

**Detail:**
```json
{
  "name": "White Belt",
  "modules": ["A1", "A2", "A3"],
  "artifacts": [],
  "userId": "user_123",
  "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
  "kind": "XRPL"
}
```

### `wc-university:enrollment:ready`
Emitted when student is ready for enrollment.

**Detail:**
```json
{
  "userId": "user_123",
  "wallet": "rXXXXXXXXXXXXXXXXXXXXXXXX",
  "programId": "WCU-2024",
  "cohortId": "COHORT-1"
}
```

### `wc-university:credential:pose`
Received when PoS-E credential is issued.

**Detail:**
```json
{
  "tx_hash": "POSE_1234567890",
  "credential_url": "/verify/pose/POSE_1234567890"
}
```

### `wc-university:credential:posm`
Received when PoS-M credential is minted.

**Detail:**
```json
{
  "bundle": {...},
  "tx_hash": "POSM_1234567890",
  "credential_url": "/verify/posm/POSM_1234567890"
}
```

## XP & Leveling System

### Level Thresholds
- **Level 1 (Beginner)**: 0-299 XP
- **Level 2 (Intermediate)**: 300-799 XP
- **Level 3 (Advanced)**: 800-1499 XP
- **Level 4 (Expert)**: 1500-2499 XP
- **Level 5 (Master)**: 2500+ XP

### XP Rewards
- Complete module: **50 XP**
- Complete track: **100 XP bonus**
- Submit artifact: **25 XP**
- Peer review: **15 XP**
- Community contribution: **10 XP**

## Curriculum Structure

### Track A: Foundation
- Module 1: Introduction to Blockchain
- Module 2: Cryptography Basics
- Module 3: Decentralization Principles

### Track B: XRPL Development
- Module 1: XRPL Architecture
- Module 2: Account Management
- Module 3: Payment Channels
- Module 4: Hooks & Smart Contracts

### Track C: Token Economics
- Module 1: Fungible Tokens (XRP, ERC-20)
- Module 2: Non-Fungible Tokens (NFTs)
- Module 3: DeFi Protocols
- Module 4: Tokenomics Design

### Track D: Web3 Development
- Module 1: dApp Architecture
- Module 2: Wallet Integration
- Module 3: Smart Contract Development
- Module 4: Frontend Integration

### Track E: Security & Best Practices
- Module 1: Cryptographic Security
- Module 2: Smart Contract Auditing
- Module 3: Operational Security
- Module 4: Incident Response

### Track F: Community & Governance
- Module 1: DAO Structures
- Module 2: Governance Mechanisms
- Module 3: Community Building
- Module 4: Decentralized Identity

### Track G: Advanced Topics
- Module 1: Layer 2 Scaling
- Module 2: Cross-Chain Interoperability
- Module 3: Zero-Knowledge Proofs
- Module 4: MEV & Advanced Trading

### Track H: Real-World Applications
- Module 1: Supply Chain
- Module 2: Digital Identity
- Module 3: Healthcare & Records
- Module 4: Gaming & Metaverse

### Track I: Capstone Projects
- Module 1: Project Planning
- Module 2: Implementation
- Module 3: Testing & Deployment
- Module 4: Presentation & Defense

## Proof of School Credentials

### PoS-E (Enrollment SBT)
- **Type**: Soul-Bound Token (non-transferable)
- **Purpose**: Proves enrollment in WCU program
- **Issued**: On enrollment
- **Contains**: userId, wallet, programId, cohortId, timestamp
- **Verification**: `/verify/pose/{tx_hash}`

### PoS-M (Mastery NFT)
- **Type**: Transferable NFT
- **Purpose**: Proves mastery of quest set/track
- **Issued**: On badge earning
- **Contains**: Badge name, modules, artifacts, evidence root, metadata
- **Verification**: `/verify/posm/{tx_hash}`

## Color Palette

The University interface uses the following color scheme:
- Background: `#000000` (Black)
- Primary: `#00FFFF` (Cyan)
- Secondary: `#FF3131` (Red)
- Accent: `#39FF14` (Neon Green)
- Highlight: `#FF00FF` (Magenta)
- Light: `#d9fffb` (Light Cyan)

## Accessibility

The University platform implements:
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Space, Arrow keys)
- Focus indicators with high contrast
- Reduced motion support (`prefers-reduced-motion` media query)
- Screen reader friendly announcements

## Implementation Notes

### No Infrastructure Changes
- No modifications to `.github/workflows/`, `wrangler.toml`, or deployment configs
- Only app code, web components, and worker route handlers added
- Integration with existing SPA and Cloudflare Worker

### Graceful Degradation
- LocalStorage fallback when APIs unavailable
- Progress saved locally for offline work
- Web component works standalone or integrated

### Mobile Responsive
- Adaptive grid layouts
- Touch-friendly controls
- Responsive typography

### Future Enhancements
- Real XRPL integration (currently stubbed)
- Peer review system
- Automated grading with AI
- Live cohort sessions
- Instructor dashboard
- Advanced analytics

## Getting Started

### For Students
1. Navigate to `/university`
2. Connect wallet (optional for browsing)
3. Browse curriculum and start completing modules
4. Earn XP and level up
5. Complete tracks to earn badges
6. Issue PoS-E enrollment credential
7. Mint PoS-M mastery NFTs for badges

### For Developers
1. Web component source: `frontend/public/wc-university.js`
2. React component: `frontend/src/pages/University.jsx`
3. Worker endpoints: `src/index.js`
4. Full spec: `scripts/MEGAPROMPT.md`

## Support
For questions or issues, refer to the main repository documentation or open an issue on GitHub.
