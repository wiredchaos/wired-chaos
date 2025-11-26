# Codex & Emergent Gateway

This service exposes production-ready REST endpoints for the Wired Chaos Codex
and Emergent modules using a lightweight Node.js HTTP server. It consumes the
shared configuration defined in `config/wiredchaos.config.json` and presents a
deployable microservice that can run behind `api.wiredchaos.film3` or be
embedded inside Notion Gamma and Wix Swarm integrations.

## Features

- **Codex API** – manage lore entries, metadata, and creator registries.
- **Emergent API** – manage collaboration sessions, performance metrics, and
  trend intelligence.
- **Sync manager** – rotates hashed keys every 24h (configurable) to keep both
  modules aligned for rights management and narrative continuity.
- **Security headers & CORS** – baseline HTTP hardening without external
  dependencies.
- **Validation & error reporting** – explicit payload validation with helpful
  feedback for integrators.

## Running Locally

```bash
npm run services:codex-emergent
```

The service listens on port `4200` by default. Override with:

```bash
PORT=8081 npm run services:codex-emergent
```

### Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `4200` |
| `CODEX_EMERGENT_SYNC_MS` | Interval in milliseconds for sync key rotation | `86400000` (24 hours) |
| `ALLOWED_ORIGINS` | Comma-separated list of origins for CORS | `*` |
| `CODEX_API_GATEWAY` | Override Codex API gateway URL from config | — |
| `EMERGENT_API_GATEWAY` | Override Emergent API gateway URL | — |
| `CODEX_STORAGE_LAYER` | Override Codex storage layer description | — |
| `WIREDCHAOS_API_VERSION` | Override reported API version | — |
| `WIREDCHAOS_CONFIG_PATH` | Custom path to the production configuration JSON | Internal default |

## Deployment

- **Node/HTTP** – run `backend/codex-emergent/src/server.js` in your Node or
  Next.js environment.
- **Container** – copy the `backend/codex-emergent` directory into your image,
  install dependencies (none beyond Node core), and run the server.
- **Notion Gamma / Wix Swarm** – embed the API behind your automations; the
  service exposes JSON endpoints that power widgets or custom elements.

Ensure TLS termination (the service assumes SSL enforcement happens upstream)
and connect to the configured AI providers and storage backends from your
platform-specific adapters.
