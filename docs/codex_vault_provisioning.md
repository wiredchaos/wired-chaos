# Codex Vault Secret Provisioning Guide

This guide walks through the exact steps required to load the production credentials that unblock the `Dual Deploy • Wix + Gamma` pipeline. Follow the checklist in order so the deployment agents can pick up each secret without manual intervention.

> **Scope**: Production only. Make sure you are operating in the `wired-chaos / production` vault space before saving anything.

## 1. Confirm Access and Environment

1. Sign in to the [Codex Control Plane](https://control.codex.ai/) with an account that has **Vault Maintainer** permissions for the `wired-chaos` workspace.
2. In the top-left environment picker choose **Production** (not Staging). You should see the banner text `Environment: production` in green.
3. Open the **Vault → Secrets** module and confirm the namespace is `wired-chaos/prod`.
4. (Optional) If you prefer the CLI, run:
   ```bash
   codex auth login
   codex vault scope set wired-chaos --environment production
   codex vault status
   ```
   The final command should display `active scope: wired-chaos (environment: production)`.

## 2. Gather the Required Values

Use the table below to collect each credential. Always pull the values from the production dashboards and double-check URLs reference the live domain (`wiredchaos.xyz`).

| Secret Name | Where to Retrieve | Production Validation Tips |
|-------------|------------------|-----------------------------|
| `WIX_API_KEY` | Wix Developer Center → **My Apps** → Select the production app → **API Keys** | Verify the associated **Site** matches the production domain. Look for the live domain badge in the Wix UI. |
| `WIX_SITE_ID` | Wix Dashboard → **Settings → Advanced → API Keys** | Copy the `Site ID` from the production site only. Stage IDs usually end in `-stg`; production IDs do not. |
| `WIX_SYNC_ENDPOINT` | Wired Chaos production site admin → **Developer Tools → Web Modules** | Ensure the URL starts with `https://wiredchaos.xyz/_functions/notionSync`. If it points to `-staging` or `-dev`, do not use it. |
| `GAMMA_TOKEN` | Gamma Console → **Account → API Access** | Confirm the token scopes include `spaces:write` and that the **Environment** column lists `prod`. |
| `GAMMA_SPACE_ID` | Gamma Console → **Spaces** | Choose the space labeled `WIRED CHAOS – Production`. IDs with the suffix `-beta` or `-preview` are non-production. |
| `SWARM_NOTION_TOKEN` | Notion Integrations → **WIRED CHAOS SWARM** integration | Under **Capabilities**, confirm the integration has access to the production workspace (look for the gold shield icon). |
| `SWARM_DB_ID` | Notion workspace → open the production SWARM database → `Share → Copy link` | Database links contain the ID; ensure the domain is `https://www.notion.so/` (not `staging.notion.so`). |
| `NOTION_SLO_BADGE_URL` | Wired Chaos Status Page (Statuspage or custom badge service) | The JSON endpoint must resolve to `https://status.wiredchaos.xyz/badge.json` in a browser. Test it before saving. |
| `SENDGRID_API_KEY` | SendGrid Dashboard → **Settings → API Keys** | The key description should include `WIRED CHAOS PROD`. Keys tagged `test` or `staging` should not be used. |

## 3. Enter Secrets into the Vault

### Using the Codex UI

1. In **Vault → Secrets**, click **New Secret**.
2. Enter the secret name exactly as specified above (case sensitive).
3. Paste the production value, set the visibility to `Agents + Pipelines`, and click **Save**.
4. Repeat for each secret.

### Using the Codex CLI

```bash
# Example for the Wix API key
codex vault secrets put WIX_API_KEY "<actual-value>"

# Repeat for each secret
codex vault secrets put WIX_SITE_ID "<actual-value>"
codex vault secrets put WIX_SYNC_ENDPOINT "https://wiredchaos.xyz/_functions/notionSync"
codex vault secrets put GAMMA_TOKEN "<actual-value>"
codex vault secrets put GAMMA_SPACE_ID "<actual-value>"
codex vault secrets put SWARM_NOTION_TOKEN "<actual-value>"
codex vault secrets put SWARM_DB_ID "<actual-value>"
codex vault secrets put NOTION_SLO_BADGE_URL "https://status.wiredchaos.xyz/badge.json"
codex vault secrets put SENDGRID_API_KEY "<actual-value>"
```

> The CLI will prompt for confirmation when overwriting existing keys. Accept the prompt only if you have validated that the value is the correct production credential.

## 4. Validate and Audit

1. Run `codex vault secrets list` and confirm all nine secrets show the scope `wired-chaos/prod` and `status: active`.
2. Trigger a dry run of the deployment pipeline:
   ```bash
   codex pipeline run --name "Dual Deploy • Wix + Gamma" \
     --environment production \
     --version-tag v2.0.0 \
     --dry-run
   ```
   The pipeline should pass the credential validation step.
3. Open **Vault → Audit Log** and verify that your changes are recorded. Export the log and attach it to the deployment ticket.

## 5. Handoff Checklist

- [ ] All secrets populated with production values
- [ ] Dry-run pipeline succeeded
- [ ] Audit log exported and shared with the release channel
- [ ] Feature flags for GlassFX prepared for post-ramp enablement

Once these steps are complete, notify the deployment lead that the vault is production-ready. The autonomous pipeline can then proceed with the canary rollout and subsequent ramp stages.
