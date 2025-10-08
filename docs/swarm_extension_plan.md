# WIRED CHAOS Autonomous Evolution Roadmap

The WIRED CHAOS platform is production-ready with the **No Touch Infra Automation** stack already shipping zero-intervention
deployments. This roadmap layers autonomous intelligence on top of that foundation so the system can eventually self-evolve
while preserving safety, auditability, and human oversight.

## Guiding Principles

1. **Ground everything in production telemetry.** Every new autonomous behaviour must consume the data already captured by the
   automation workflows and extend those signals where gaps exist.
2. **Guardrails before autonomy.** Each phase ships with explicit rollback plans, audit logs, and human approval gates.
3. **Incremental expansion.** Capabilities graduate to the next phase only after stability metrics and runbook updates are in
   place.
4. **Document the machine.** Every automated decision must trace back to a Notion record (the "neural cortex") with clear
   ownership and recovery steps.

## Phase 1 – Extend the SWARM Foundation (Active)

**Objective:** Strengthen the existing SWARM + Notion backbone so recommendations can be generated automatically without
unattended execution.

### 1. Notion Neural Cortex Enhancements
- Map Notion databases to a stable schema (Playbooks, Incidents, Automation Policies, Feature Flags).
- Introduce schema validation jobs that run inside the No Touch automation workflows before syncing into the Artifacts
  directory.
- Normalize content into JSON capsules (`artifacts/notion/*.json`) with metadata: owner, last-reviewed, rollback-link, and
  dependency list.

### 2. Telemetry & Observability Expansion
- Extend the SWARM logging hooks to emit deployment stage, SLO gate scores, GlassFX flag state, and script outputs from
  `scripts/monitor-performance.sh`.
- Mirror telemetry into both the existing logging pipeline and Notion for historical traceability.
- Add anomaly detection thresholds that flag deviations for operator review rather than auto-action.

### 3. Human-in-the-Loop Decision Engine Prototype
- Build a rules engine that converts telemetry events into recommended actions (e.g., "Advance canary to 50%", "Hold GlassFX").
- Deliver recommendations as Notion comments + optional Slack/Discord webhooks, keeping a person responsible for each step.
- Capture feedback on every recommendation to continuously tune the rules and provide confidence scores.

### 4. Implementation Milestones
| Sprint | Deliverable | Owner Signals | Exit Criteria |
| --- | --- | --- | --- |
| 1 | Schema normalization & validation | Notion → artifacts sync job | JSON capsules populating on every content change |
| 2 | Telemetry enrichment | Deployment logs, SLO snapshots | Dashboards list SLO gate outcomes + GlassFX readiness |
| 3 | Decision engine v0 | SWARM orchestration team | Recommendations appear in Notion with audit log IDs |
| 4 | Feedback loop | Ops & SRE | Confidence scores >70% for three consecutive deployments |

## Phase 2 – Controlled Self-Modification

**Objective:** Allow the platform to generate improvement proposals while ensuring humans approve and merge the work.

- Introduce automated pull request drafts for documentation, runbooks, and configuration files only.
- Use Codex/Emergent hybrid workflows to generate code, run linting/tests (`npm run test`, `npm run test:e2e` in dry-run mode),
  and attach telemetry snapshots to each PR.
- Require human reviewers to approve; the automation closes stale or rejected proposals automatically.

## Phase 3 – Multi-Agent Orchestration

**Objective:** Coordinate multiple AI components for planning, coding, and validation.

- Add planning agents (LLM chain-of-thought) that break features into tasks stored in Notion task boards.
- Introduce specialized builders: coding agents for backend/frontend, infra agents for pipeline changes.
- Establish arbitration rules so conflicting agent proposals defer to the human owner recorded in Notion.

## Phase 4 – Infrastructure Autonomy

**Objective:** Achieve supervised self-healing and scaling.

- Automate infrastructure provisioning hooks (Wix, Gamma, Cloudflare) using the proven No Touch scripts as execution harnesses.
- Enable self-healing routines that can roll back deployments, toggle feature flags, or trigger new builds when SLO gates fall
  below thresholds.
- Maintain manual override at all times: any human can pause automation via a Notion toggle or command in the control plane.

## LLM & Tooling Strategy

| Capability | Primary Model | Secondary/Validation | Notes |
| --- | --- | --- | --- |
| Summaries & schema normalization | OpenAI GPT-4.1 | Anthropic Claude 3 | Run through Codex pipeline with redaction |
| Decision engine explanations | OpenAI GPT-4o Mini | Google Gemini 1.5 | Provide rationale + risk level |
| PR draft generation (Phase 2) | OpenAI o1-mini | Anthropic Claude 3 Haiku | Lightweight, cost-effective |
| Planning agent (Phase 3) | OpenAI o1 | Google Gemini Advanced | Enforce max token + rate limits |

All model access must respect the Codex vault policies and re-use the existing secret provisioning flow.

## Safety Guardrails & Boundaries

- **Change Boundary:** Until Phase 4, automation cannot merge code or deploy without human approval; Phase 4 still requires a
  human kill-switch.
- **Policy Validation:** Every update touching production must pass schema validation, SLO checks, and decision-engine review.
- **Audit Trail:** Recommendations, approvals, and actions are logged to Notion + telemetry storage with timestamps and actors.
- **Secret Handling:** All scripts continue to source credentials from the Codex vault; no plaintext secrets inside repos.

## Immediate Next Steps

1. Implement Notion schema normalization job and backfill existing records.
2. Extend telemetry collectors to persist SLO gate outcomes and GlassFX readiness flags.
3. Prototype the decision engine with two high-value scenarios (deployment ramp, GlassFX enablement) and review with operations.
4. Document the feedback loop process in Notion, ensuring ops teams know how to rate recommendations.

Progress across these steps will validate Phase 1, unlock Phase 2 experimentation, and keep the WIRED CHAOS automation stack
aligned with the production readiness confirmed in the staging smoke tests.
