# WIRED CHAOS Doge Notary

NSA-grade tooling to transform any document into a verifiable Dogecoin inscription with full support for the WIRED CHAOS brand palette and GROK metadata.

## Features

- 🔍 **Auto-routing** between full-document and chunked manifests (WCN-INS-1).
- 🔐 **Privacy-aware** flows with XChaCha20-Poly1305 encryption and recipient binding.
- 🧱 **Chunked manifest** builder with attestation JSON that references the final inscription IDs.
- 🌐 **Express microservice** for REST automation.
- 🛠️ **CLI** (`wcn`) for notarize / verify / info flows.
- 🤖 **FreshRSS hook** to notarize the latest feed entries as branded PDFs.
- ⚙️ **GitHub Action** to notarize PR diffs on merge.
- 🧾 **Verifier web page** for drag-and-drop hash checks with WIRED CHAOS watermarking.

## Installation

```bash
cd apps/wcn-doge-notary
npm install
npm run build
```

Add the CLI to your PATH:

```bash
npm link
# or use npx from the project root
node dist/bin/wcn.js --help
```

## Required Environment

| Name | Purpose |
| ---- | ------- |
| `DOGE_WALLET_MNEMONIC` or `DOGE_WALLET_WIF` | Signing key for inscriptions |
| `DOGE_RPC_URL` or `INSCRIBE_SERVICE_URL` | RPC endpoint or hosted inscriber |
| `AUTHOR_HANDLE` | Default author name (defaults to `WIRED CHAOS`) |
| `MAX_INLINE_KB` | Override inline threshold (default `256`) |
| `CHUNK_KB` | Override chunk size (default `512`) |

> 💡 Run with `--dry-run` to simulate inscriptions without hitting the chain.

## CLI Usage

### Notarize

```bash
node dist/bin/wcn.js notarize \
  --file ./docs/sample.pdf \
  --title "WIRED CHAOS Playbook" \
  --privacy public \
  --namespace wcn-ins \
  --dry-run
```

Returns:

```json
{
  "mode": "full",
  "doc_hash": "…",
  "file_insc": "sim-wcn-ins-full-…",
  "manifest_insc": null,
  "attestation_insc": "sim-wcn-ins-attestation-…",
  "chunks": [{ "i": 0, "insc": "sim-wcn-ins-full-…", "hash": "…" }],
  "ts": "2024-09-01T00:00:00.000Z"
}
```

### Verify

```bash
node dist/bin/wcn.js verify \
  --file ./docs/sample.pdf \
  --attestation ./attestation.json \
  --manifest ./manifest.json
```

### Info

```bash
node dist/bin/wcn.js info --insc 12345abcdef
```

## REST API

```bash
npm run start:api
```

Endpoints:

- `POST /notarize` – body with `file_path` or `content_base64`, returns inscription IDs + manifest/attestation payloads.
- `POST /verify` – body with `file_path`, `attestation`, optional `manifest` JSON.
- `GET /inscription/:id` – placeholder endpoint for external RPC enrichment.
- `GET /health` – heartbeat.

## FreshRSS Automation

- Script: `dist/integrations/freshrss.js`
- Configuration: `FRESHRSS_API_URL`, `FRESHRSS_TOKEN`, `FRESHRSS_DRY_RUN`, optional `FRESHRSS_PRIVACY`, `FRESHRSS_RECIPIENT_KEY`.
- Example crontab: see [`docs/freshrss-crontab.md`](./docs/freshrss-crontab.md).

## GitHub Action

`.github/workflows/notary.yml` notarizes PR diffs on merge and uploads the proof bundle as an artifact. Populate `DOGE_WALLET_MNEMONIC`, `DOGE_RPC_URL`, and optionally `INSCRIBE_SERVICE_URL` in repository secrets.

## Verifier Web App

Open [`public/verifier.html`](./public/verifier.html) in a browser to locally verify attestation or manifest JSON against a file. The UI honors the WIRED CHAOS palette and includes GROK watermarking.

## Troubleshooting

- **Missing credentials** – supply wallet + RPC/inscriber or run with `--dry-run` for simulations.
- **Large files** – increase `CHUNK_KB` and `MAX_INLINE_KB` as needed.
- **Encrypted docs** – set `--privacy encrypted` and provide `--recipient` to derive the encryption key.
