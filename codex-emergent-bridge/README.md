# Codex Emergent Bridge

This service connects the **Akira Codex** app (running on Caffeine) to the **WIRED CHAOS META Swarm** (via Emergent or an equivalent orchestration layer).

- Before WIRED CHAOS META is live:
  - `WIRED_CHAOS_ENABLED=false`
  - Service returns stubbed responses for testing.

- After WIRED CHAOS META is live:
  - Set `WIRED_CHAOS_ENABLED=true`
  - Configure `SWARM_ENDPOINT` and `SWARM_API_KEY`
  - All Caffeine events and Codex API calls are routed into the Swarm.

## Quick Start

```bash
cp .env.example .env
# edit values
npm install
npm run dev
```

- Health check: `GET /health`
- Caffeine webhook: `POST /caffeine/webhook`
- Codex ask endpoint: `POST /codex/ask`

When WIRED CHAOS META is live, point `SWARM_ENDPOINT` at your Emergent or Swarm HTTP entry point to forward `TaskEnvelope` payloads into the appropriate agents.
