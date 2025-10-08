# Joint ACK — Codex × Emergent Deployment Stack (WIRED CHAOS)

**Status received.**

- Codex: ✅ Orchestrator online (`scripts/orchestrator/execute.js`), CLI handlers in place, `codex.pipeline.yaml` published, JSON outputs verified.
- Emergent: ✅ Platform alignment confirmed for builds, error handling, and test harness integration.

**Operating standard:** Black `#000000` • Neon Cyan `#00FFFF` • Glitch Red `#FF3131` • Electric Green `#39FF14` • Accent Pink `#FF00FF` (WCAG 2.1 AA, high-contrast focus rings).

---

## Go-Forward Plan (staging → canary → prod)

### 1) Preflight: secrets + inventory

```bash
# Validate required secrets & generate a rollout summary artifact
node scripts/orchestrator/execute.js --summary-only --json-output artifacts/orchestrator-summary.json

# Full discovery without pipeline apply (sanity)
node scripts/orchestrator/execute.js --json-output artifacts/orchestrator-check.json --skip-pipeline
```

**Gate:** All required secrets present (`WIX_API_KEY`, `WIX_SITE_ID`, `WIX_SYNC_ENDPOINT`, `GAMMA_TOKEN`, `GAMMA_SPACE_ID`, `SWARM_NOTION_TOKEN`, `SWARM_DB_ID`, `NOTION_SLO_BADGE_URL`). If any missing → **stop**.

---

### 2) Build steps (deterministic)

```bash
# Wix build (tag may be commit SHA or semver)
node scripts/wix/build.js --tag v-demo --json-output artifacts/wix-build.json

# Gamma build
pnpm -C apps/gamma install && pnpm -C apps/gamma build
```

**Gate:** Non-zero exit or JSON schema mismatch → **stop**.

---

### 3) Dual deploy (Codex pipeline)

From Codex, run **Dual Deploy • Wix + Gamma (with Canary + SLO gates)**:

- `environment=staging`
- `version_tag=HEAD` (or release tag)

Codex will:

1. Deploy Wix (agent `wix/runner`) & Gamma (agent `gamma/runner`) **in parallel** at **5% canary**.
2. Orchestrate ramp **5% → 25% → 50% → 100%** with SLO gates.
3. Log each step to Notion SWARM.

Manual equivalent (if needed):

```bash
# 5% canary publish
node scripts/wix/deploy.js --site $WIX_SITE_ID --tag HEAD --canary 5
node scripts/gamma/deploy.js --space $GAMMA_SPACE_ID --tag HEAD --canary 5
node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99.0 --window "10m"
node scripts/swarm/log.js --event "canary:5" --env staging
```

---

### 4) Canary ramp with SLO gates

```bash
# 25%
node scripts/canary/shift.js --apps wix,gamma --pct 25
node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99.0 --window "10m"
node scripts/swarm/log.js --event "canary:25" --env staging

# 50%
node scripts/canary/shift.js --apps wix,gamma --pct 50
node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99.0 --window "10m"
node scripts/swarm/log.js --event "canary:50" --env staging

# 100%
node scripts/canary/shift.js --apps wix,gamma --pct 100
node scripts/slo/check.js --apps wix,gamma --slo-url $NOTION_SLO_BADGE_URL --min 99.0 --window "15m"
node scripts/swarm/log.js --event "canary:100" --env staging
```

**Gate:** Any SLO < 99.0 in window → **rollback**.

---

### 5) Notion → Wix sync (content plane)

```bash
node scripts/notion/sync.js \
  --db $SWARM_DB_ID \
  --slo-url $NOTION_SLO_BADGE_URL \
  --env staging \
  --json-output artifacts/notion-sync.json
node scripts/swarm/log.js --event "content-sync:swarm-registry" --env staging
```

**Verify in Wix CMS:** `SwarmRegistry` upserts reflect the latest (`lastSync` updated, SLO badge set).

---

### 6) Investor-view sanity (Gamma)

- Ensure SLO chip = Electric Green when ≥ 99.0; Glitch Red on breach.
- Confirm **Business** vs **Gaming** firewall (separate collections/spaces).

---

### 7) Promotion to production (feature-flag fenced)

```bash
# Flip canary flags off after Codex completes promotion
node scripts/flags/set.js --app wix --flag CanaryEnabled=false
node scripts/flags/set.js --app gamma --flag CanaryEnabled=false
node scripts/swarm/log.js --event "deploy:complete" --env production
```

---

## Rollback (automatic or manual)

**Automatic (Codex `on_failure`):**

```bash
node scripts/canary/shift.js --apps wix,gamma --pct 0
node scripts/rollback/redeploy-prev.js --apps wix,gamma --env ${ENVIRONMENT}
node scripts/swarm/log.js --event "rollback:triggered" --env ${ENVIRONMENT}
```

**Manual quick path:**

```bash
node scripts/canary/shift.js --apps wix,gamma --pct 0
node scripts/wix/deploy.js   --site $WIX_SITE_ID   --tag ${LAST_GREEN_TAG} --canary 0
node scripts/gamma/deploy.js --space $GAMMA_SPACE_ID --tag ${LAST_GREEN_TAG} --canary 0
```

---

## Minimal Test Matrix (run now)

1. **Idempotency**: re-run `scripts/notion/sync.js` twice → no dupes, stable `lastSync`.
2. **Fault Injection**: serve SLO badge with `score: 97.0` → ensure pipeline halts + rollback triggers.
3. **Permission Boundaries**: staging tokens must not mutate prod collections.
4. **Gamma A11y**: keyboard focus rings visible; color contrast ≥ 4.5:1.
5. **Wix Endpoint Hardening**: reject missing/invalid `x-wiredchaos-key`.

Artifacts to capture:

- `artifacts/orchestrator-summary.json`
- `artifacts/orchestrator-check.json`
- `artifacts/wix-build.json`
- `artifacts/notion-sync.json`

---

## Closing Signals

- **Codex:** proceed to execute the **Dual Deploy** pipeline in staging with SLO gates; write SWARM logs at each phase.
- **Emergent:** maintain build/test surfaces; surface pipeline status + SLO in the investor Gamma panel; no promotion until all gates pass.

All components are in place and runnable now.
