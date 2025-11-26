# WIRED CHAOS Tax Suite Starter Assets

This directory contains structured assets used by the Project LedgerMind prototype:

- `rules/` – strategy definitions that can be loaded by the Codex knowledge core.
- `intake/` – example client payloads for the intake parser.
- `report/` – HTML & PDF templates for report generation.

## File Overview

| File | Description |
| --- | --- |
| `rules/traditional.json` | Ten baseline strategies covering traditional tax planning, business, real estate, and state regimes. |
| `rules/crypto.json` | Ten crypto, DeFi, NFT, and ETF oriented strategies with audit metadata. |
| `intake/ClientProfile.sample.json` | Normalized client profile example combining traditional and on-chain data. |
| `intake/TaxYearDataset.sample.json` | 2025 tax year reference data with bracket tables and policy flags. |
| `intake/client_intake_sample.csv` | Flat file example mimicking manual intake submissions. |
| `report/tax_strategy_report_template.html` | Jinja-compatible template for the Emergent report builder. |
| `report/tax_strategy_report_template.pdf` | Printable summary referencing the HTML template and compliance disclaimer. |

## Usage Notes

1. Load the JSON rule packs into Codex with:
   ```bash
   codex import data/tax/rules/traditional.json
   codex import data/tax/rules/crypto.json
   ```
2. Feed the sample intake files into the Emergent runtime while developing the parser:
   ```bash
   emergent start tax-engine --source ./codex/core \
       --client data/tax/intake/ClientProfile.sample.json \
       --dataset data/tax/intake/TaxYearDataset.sample.json
   ```
3. Render reports by binding the template to engine output variables (`baseline`, `optimized`, `strategies`, `audit_vault`, `metadata`).

All values are illustrative and should be adjusted before using with real client data.
