# Maintenance Window Production Rollout

This runbook captures the maintenance-window and feature-flag freeze flow for the
`Dual Deploy • Wix + Gamma (with Canary + SLO gates)` Codex pipeline.

## Updated Pipeline Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `maintenance_window_start` | ISO 8601 timestamp for the opening of the production window (e.g. `2025-10-06T22:00:00-04:00`). Leave blank to run immediately. | `""` |
| `maintenance_window_duration_min` | Minutes the window remains valid before an automatic timeout occurs. | `45` |
| `glassfx_prod_state` | Final `GlassFXEnabled` flag applied to Wix and Gamma once the rollout completes. | `true` |
| `canary_end_state` | Final `CanaryEnabled` flag applied after the canary ramp reaches 100%. | `false` |

These inputs extend the existing `environment` and `version_tag` toggles so production
operators can confirm both schedule and flag posture before executing.

## Gate + Freeze Stages

1. **Maintenance Window Gate** – waits until the provided window opens using
   `scripts/maintenance/wait-until.js`, then emits a `maintenance:window:start`
   SWARM log for telemetry traceability.
2. **Freeze Flags & Close Window** – after the `canary_step_up` stage reports
   success, the pipeline calls `scripts/flags/set.js` to apply the desired
   `CanaryEnabled` and `GlassFXEnabled` states across Wix and Gamma and logs
   `maintenance:window:end` for the closing marker.

Both scripts rely on lightweight Node helpers that can run inside the existing
Codex agents with no additional dependencies.

## Example Production Execution

```bash
codex run "Dual Deploy • Wix + Gamma (with Canary + SLO gates)" \
  environment=production \
  version_tag=v2.0.0 \
  maintenance_window_start="2025-10-06T22:00:00-04:00" \
  maintenance_window_duration_min=45 \
  glassfx_prod_state=true \
  canary_end_state=false
```

The pipeline pauses until the window opens, runs the Wix and Gamma deploys in
parallel, steps the canary 5% → 25% → 50% → 100% with SLO enforcement, then
locks flags to the requested end state.

## Post-Run Acceptance Checklist

- [ ] Canary held ≥99.0% SLO for the full 15 minute observation window.
- [ ] `CanaryEnabled=false` across Wix and Gamma unless an extended canary is
      desired.
- [ ] `GlassFXEnabled=true` across Wix and Gamma (or per the configured state).
- [ ] The Notion → Wix `SwarmRegistry` shows a fresh `lastSync` timestamp and the
      status badge is visible in production.
- [ ] Gamma investor panel renders GlassFX cards with ADA checks (focus rings and
      contrast) passing.
- [ ] SWARM telemetry contains the `maintenance:window:start`, `canary:*`,
      `deploy:complete`, and `maintenance:window:end` events for auditability.
