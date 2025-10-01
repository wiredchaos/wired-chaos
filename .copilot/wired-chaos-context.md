# WIRED CHAOS • Copilot Context (Studio + Edge)

## Architecture
- Frontend: React SPA (CRA/Vite compatible), University module + Proof of School (PoS-E/PoS-M)
- Edge: Cloudflare Worker routes for /health, /school, /gamma/*, /bus/*, /wl/xp/*, /api/*
- Storage/Queues: KV/R2 (planned), BUS eventing (worker-backed)
- Integrations: Wix/Gamma, XRPL (NFT/SBT), Zapier webhooks

## Deployment principles
- Zero-downtime merges via auto-ready/merge + smoke tests
- Protected infra files (do not change): .github/**, wrangler.toml, Dockerfiles, terraform, ansible, deploy/**
- Health checks: GET /health -> { ok: true }

## Eventing & Gamification
- University Web Component emits:
  - wc-university:progress, :xp, :badge, :enrollment:ready
  - Credentials echoed back via :credential:pose / :credential:posm
- Badge matrix (IDs exact): White Belt, Builder, Operator, Leader, Architect

## Security
- Bearer tokens for admin endpoints
- Wallet gating via X-Wallet-Address
- Circuit breaker hooks (ADMIN_TOKEN)
- CORS: strict allowlist per route

## Coding standards
- Env helpers: getSuiteUrl(), getTaxSuiteUrl() (CRA/Vite/Next safe)
- Lint/format: ESLint+Prettier, Stylelint, HTMLHint, Black/Flake8, PSScriptAnalyzer, solhint
- UI: a11y AA contrast, keyboard nav, reduced-motion respected

## AR/VR (Merch)
- <model-viewer> for GLB/USDZ, XR iframe permissions
- MIME overrides for .glb/.usdz where needed
- Pages `_headers` for caching and CORS

## Color palette
- Black #000000, Neon cyan #00FFFF, Glitch red #FF3131, Electric green #39FF14, Accent pink #FF00FF, Ink #d9fffb

## Troubleshooting
- WC-BUS offline → hide SwarmStatusWidget (no console spam)
- Suite/Tax URLs unset → hide/disable buttons, no loops
