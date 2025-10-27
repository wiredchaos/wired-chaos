# ADR-0002 — Confidential Traits & Encrypted Reads

## Status
Proposed — Implemented in `ConfidentialHookFHE.sol`, optional at deploy time.

## Context
Vault/Artifact metadata may include hidden “Akashic codes” and puzzle flags.
We want on-chain evaluation without leaking plaintext until reveal conditions.

## Decision
Use Zama FHEVM encrypted types in a companion contract:
- `mapping(uint256 => euint256) hiddenCode`
- `mapping(uint256 => ebool) solved`
- Holder-only async decrypt via `FHE.requestDecryption`.

We keep a non-FHE `ConfidentialHook.sol` for vanilla deployments.

## Consequences
- Slightly higher gas/latency on encrypted paths; offloaded where possible.
- Requires FHEVM toolchain and node/gateway at deploy time.

## Rollout
1) Ship non-FHE contracts first.
2) Stand up FHEVM gateway + KMS/TKMS.
3) Deploy `ConfidentialHookFHE` and migrate read calls.
