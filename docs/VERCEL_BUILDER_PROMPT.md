# Vercel AI Builder Prompt — WIRED CHAOS META

Use this prompt inside Vercel AI to recreate the NEURO SWARM control plane:

```
Create a Next.js 14 App Router project named "WIRED CHAOS META — NEURO SWARM CONTROL PLANE". The homepage should show:
1) A WL event ticker fed by GET /api/ticker.
2) Tabs for VRG33589 and VAULT33 with WL thresholds.
3) NPC & swarm health stats from GET /api/health.
4) Cards for agents META_X, KIBA, SHADOWLUX, GRYMM, OYALAN, NEUROLUX, and UPLINK from lib/swarm/agents.ts.

Add mock API routes:
- GET /api/ticker returns { items: [{ id, label, project, delta, source, platform, createdAt }...] } with optional project, platform, limit filters.
- GET /api/health returns npcSessionsToday, xpEventsToday, status, swarmAgentsOnline.
- POST /api/npc/move returns a narrative, wlDelta, and project based on the prompt.
- POST /api/wl/log accepts WL deltas and logs them.
- POST /api/swarm/event validates agentId, eventType, and payload then logs.

Style for a dark, neon-inspired dashboard.
```
