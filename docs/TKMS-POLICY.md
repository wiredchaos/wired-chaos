# Zama TKMS Policy — WIRED CHAOS

## Roles
- **Operator**: manages network parameters and rotation schedules.
- **Archivist**: can authorize decrypts for lore fragments after on-chain checks.
- **Community**: multi-sig role that can co-sign event-based reveals (e.g., 589 burn).

## Key Material
- FHE private key is split via MPC. No single party holds the full key.
- Shares live on TKMS nodes with HSM/TEE preferred.

## Policies
1. **Holder-Only Reads**: Decrypt callbacks only if `ownerOf(tokenId) == msg.sender`.
2. **Event-Gated Reveals**: Archivist + Community m-of-n signatures to authorize reveal
   after an on-chain condition (burn counts, quest completion).
3. **Rotation**: Regular key-share rotation every 90 days; emergency rotate on incident.

## Auditing
- Log all decrypt requests with tx hash, tokenId, requester, policy applied.
- Publish monthly transparency summary (counts, no plaintext).

## Incident Response
- Suspend decrypt endpoint on anomaly.
- Rotate shares; publish postmortem within 7 days.
