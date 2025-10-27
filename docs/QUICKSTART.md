# Quickstart
pnpm i
pnpm bootstrap
cp .env.example .env

# Dev web
pnpm dev:web

# Tests
pnpm test

## Optional: FHEVM (encrypted traits)
- Ensure FHE gateway + TKMS are running.
- Deploy `ConfidentialHookFHE.sol` (see `packages/codex-contracts/README-FHE.md`)
- Point your app to call the FHE hook for gated reads.

## FreshRSS → Prompt Drills
- Set `FRESHRSS_URL`, `FRESHRSS_TOKEN` in `.env`
- Use `@wiredchaos/codex-core` → `rss.fetchFreshRSS()` and `rss.toPromptDrills()`
