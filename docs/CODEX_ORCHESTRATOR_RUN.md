# Codex Orchestrator Runbook

The Codex orchestrator CLI can now execute a full stubbed deployment flow in addition to generating reports.
This runbook explains how to trigger the automation locally and interpret the generated artifacts.

## Quick start

Run the orchestrator with the `--run` flag to execute the staged rollout alongside the usual summary output:

```bash
node scripts/orchestrator/execute.js --run
```

You can also persist the combined summary + execution log to disk:

```bash
node scripts/orchestrator/execute.js --run --json-output docs/orchestrator-run.sample.json
```

### Useful flags

- `--version-tag <tag>` – overrides the default `HEAD` version used in build/deploy commands.
- `--environment <name>` – sets the target environment reported to stub scripts (defaults to `staging`).
- `--env-file <path>` – loads additional environment variables before running the orchestrator.

## What happens during `--run`

1. **Secrets + topology audit** – the summary step still highlights missing secrets and component availability.
2. **Builds** – runnable components (Wix stub + Notion sync) execute their build commands.
3. **Canary ramps** – the Wix deploy stub runs at 5/25/50/100%, with matching canary, SLO, and SWARM logging steps.
4. **Post-deploy tasks** – the Notion sync stub, feature-flag toggles, and final SWARM log complete the flow.

All shell commands are echoed before execution and written to the JSON report. Review `docs/orchestrator-run.sample.json` for an end-to-end example payload.

> **Note:** The current implementation uses stub scripts; no real infrastructure changes are made. Replace the stubs with production-ready commands when integrating live services.
