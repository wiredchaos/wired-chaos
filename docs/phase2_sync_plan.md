# Phase 2 Sync Infrastructure Plan

This document outlines the recommended steps for completing Phase 2 of the WIRED CHAOS rollout, focusing on enabling live Notion → Wix automation.

## Priority Rationale

1. **Build the missing sync infrastructure first.**
   - Without an operational sync layer, the existing UI panels and mock routes cannot deliver value.
   - Implementing the Notion → Wix bridge unlocks meaningful end-to-end tests and validates the architecture before secrets or deployment work.

2. **Harden authentication and secrets management next.**
   - Once the sync script exists, we can identify the precise scopes/tokens required and configure GitHub secrets with confidence.

3. **Expand validation and monitoring.**
   - With a working pipeline and secured credentials, we can invest in automated tests, SWARM logging, and health checks.

## Work Breakdown Structure

### 1. Notion Sync Script (`/scripts/notion/sync.js`)
- Scaffold a Node.js worker that:
  - Reads `NOTION_API_TOKEN`, `NOTION_DATABASE_ID`, and `WIX_API_KEY` from environment variables.
  - Fetches published records from Notion using the official API.
  - Normalizes Notion page content into the schema expected by Wix.
  - Batches updates to Wix via REST (or the Wix CLI if required).
  - Writes status and metrics to SWARM/Notion logs.
- Include retry logic, exponential backoff, and structured logging.

### 2. Backend Route Upgrades
- Replace mock handlers in `/backend/notion_routes.py` and `/backend/wix_routes.py` with thin proxies that call the sync service.
- Add health endpoints that surface the last sync timestamp and error state.

### 3. Frontend Integration
- Update `WixPanel.jsx` and `NotionPanel.jsx` to display real sync metrics:
  - Last sync time
  - Number of pages updated
  - Error summaries (if any)
- Provide controls to trigger a manual sync (invoking the backend route).

### 4. Automation & Scheduling
- Add a GitHub Action or cron job to run the sync script on a schedule.
- Ensure the workflow uses the configured secrets and posts results to the SWARM dashboard.

## Success Criteria

- Running `node scripts/notion/sync.js` performs a full Notion → Wix update without manual intervention.
- Frontend panels display live data from the sync process.
- GitHub workflows can execute the sync in staging with production-ready logging and alerting.

## Next Steps After Implementation

Once the above milestones are complete, proceed with:
- Finalizing GitHub secrets for production.
- Enabling SWARM-driven decision loops for automatic retries or rollbacks.
- Designing self-modifying code paths under strict guardrails.

