# WIRED CHAOS Dual-Tier Stablecoin DCA Calculator

## Features
- Edge / Public Tier: no wallet required, Cloudflare Worker backend
- Trusted / Wallet-Gated Tier: wallet required, persistent KV/R2 storage, integrated with Retirement Calculator / Trust Layer, VRG-33-589 NFT milestones
- Dual-tier React component
- Swarm Automation RSS feed integration
- Cyberpunk UI (neon colors, glitch styling)

## Deployment
- Edge: Deploy Worker, route `/retirement/dca-public`
- Trusted: Deploy FastAPI backend, enable wallet auth, run RSS updater
- MotherboardHub: Add routing for `/retirement/dca-public` and `/trust/retirement/dca-private`
