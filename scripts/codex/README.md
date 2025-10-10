# Codex Guardrails

This directory hosts automation used by the Codex safety workflows. The
`fix-secrets.js` utility provides a lightweight sweep for secret material
before commits are pushed.

## Usage

```bash
# Run a dry run secret scan (default behaviour)
node scripts/codex/fix-secrets.js --check

# JSON output for CI consumption
node scripts/codex/fix-secrets.js --check --json

# Persist a report to disk
node scripts/codex/fix-secrets.js --check --json --report reports/secrets.json
```

## Exit Codes

- `0` – No potential secrets detected.
- `1` – Potential secrets were detected and need review.
- `2` – CLI usage error.

## Notes

- Files larger than 512 KiB are skipped to avoid scanning generated assets.
- Binary files are skipped.
- Dotfiles are ignored by default; pass `--include-dotfiles` to include them.
- Detected matches are masked in the output to avoid leaking the underlying
  value in logs or terminals.

Feel free to extend `SECRET_PATTERNS` in `fix-secrets.js` to cover additional
service tokens as they surface in the WIRED CHAOS stack.
