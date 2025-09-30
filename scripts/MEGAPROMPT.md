# GIGA PROMPT • WIRED CHAOS UNIVERSITY + PROOF OF SCHOOL + FULL CURRICULUM

## Overview
This document contains the complete specification for WIRED CHAOS UNIVERSITY (WCU), a comprehensive educational platform integrated into the WIRED CHAOS ecosystem with Proof of School credentials on XRPL.

## Architecture

### Web Component (wc-university.js)
- Custom web component implementing the full WCU interface
- Tracks A-I with modular quest structure
- XP and leveling system with localStorage persistence
- Badge emission system with CustomEvents
- Proof of School (PoS) credential issuance (Enrollment and Mastery)

### SPA Integration
- React route `/university` for full curriculum access
- Verify routes `/verify/:type/:tx` for credential validation
- Integration with existing Motherboard Hub

### Edge Functions (Cloudflare Worker)
- POST `/api/university/progress/save` - Save student progress
- POST `/api/pos/enroll/issue` - Issue Proof of School Enrollment SBT
- POST `/api/pos/enroll/revoke` - Revoke enrollment credential
- POST `/api/pos/mastery/mint` - Mint Proof of School Mastery NFT
- POST `/api/rss/digest` - Schedule RSS digest

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

## XP & Leveling System

### Level Thresholds
- **Level 1**: 0-299 XP (Beginner)
- **Level 2**: 300-799 XP (Intermediate)
- **Level 3**: 800-1499 XP (Advanced)
- **Level 4**: 1500-2499 XP (Expert)
- **Level 5**: 2500+ XP (Master)

### XP Awards
- Complete module: 50 XP
- Complete track: 100 XP bonus
- Submit artifact: 25 XP
- Peer review: 15 XP
- Community contribution: 10 XP

## Proof of School Credentials

### PoS-E (Enrollment SBT)
- Issued on enrollment
- Non-transferable Soul-Bound Token
- Records: userId, wallet, programId, cohortId, timestamp
- Stored on XRPL ledger

### PoS-M (Mastery NFT)
- Minted on quest set completion
- Transferable NFT with metadata
- Includes: badge name, modules completed, artifacts, rubric, evaluator
- Evidence root (Merkle root of artifact hashes)
- Credential URL for verification

## Event System

### Custom Events Emitted
```javascript
// Progress update
wc-university:progress { state }

// XP gained
wc-university:xp { amount, total }

// Badge earned
wc-university:badge { 
  name, modules, artifacts, 
  rubric?, evaluator?, 
  userId, wallet, kind:"XRPL" 
}

// Enrollment ready
wc-university:enrollment:ready { 
  userId, wallet, programId, cohortId 
}

// PoS-E credential issued/received
wc-university:credential:pose { 
  tx_hash, credential_url 
}

// PoS-M credential minted/received
wc-university:credential:posm { 
  bundle, tx_hash, credential_url 
}
```

## Color Palette
- Background: #000000 (Black)
- Primary: #00FFFF (Cyan)
- Secondary: #FF3131 (Red)
- Accent: #39FF14 (Neon Green)
- Highlight: #FF00FF (Magenta)
- Light: #d9fffb (Light Cyan)

## Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Space, Arrow keys)
- Focus indicators with high contrast
- `prefers-reduced-motion` media query respected
- Screen reader friendly announcements

## Implementation Notes
- No infrastructure changes (no wrangler.toml, .github/workflows, etc.)
- Integration with existing SPA and Cloudflare Worker
- LocalStorage fallback for offline progress tracking
- Graceful degradation when APIs unavailable
- Mobile-responsive design
- Progressive enhancement approach

## API Contracts

### Save Progress
```
POST /api/university/progress/save
Body: { userId, state: {...} }
Response: { ok: true }
```

### Issue PoS-E
```
POST /api/pos/enroll/issue
Body: { userId, wallet, programId?, cohortId? }
Response: { 
  status: "ok", 
  tx_hash: "POSE_${timestamp}", 
  credential_url: "/verify/pose/POSE_${timestamp}" 
}
```

### Revoke PoS-E
```
POST /api/pos/enroll/revoke
Body: { userId, tx_hash }
Response: { status: "ok", revoked: true, tx: "..." }
```

### Mint PoS-M
```
POST /api/pos/mastery/mint
Body: { 
  userId, wallet, badge, 
  modules: [...], artifacts: [...] 
}
Response: { 
  status: "ok", 
  tx_hash: "POSM_${timestamp}", 
  credential_url: "/verify/posm/POSM_${timestamp}" 
}
```

### Schedule RSS Digest
```
POST /api/rss/digest
Body: { schedule?: "daily" }
Response: { scheduled: true }
```

## Future Enhancements
- Real XRPL integration (currently stubbed)
- Peer review system
- Automated grading with AI
- Live cohort sessions
- Instructor dashboard
- Advanced analytics
- Integration with external credential platforms
- Multi-chain support
