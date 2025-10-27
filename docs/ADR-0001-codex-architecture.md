# ADR-0001 — CODΞX architecture
- Monorepo with core lib (parsers/crypto), web (Next.js), contracts (Solidity).
- Optional FHE: `packages/codex-contracts/contracts/ConfidentialHookFHE.sol` provides
  encrypted gating using Zama FHEVM types (`euint`, `ebool`). This file is separate
  from the vanilla `ConfidentialHook.sol` so builds succeed without FHEVM deps.
  When ready, deploy the FHE variant and wire read paths to it.
- Design goal: pluggable “knowledge artifacts” (lore, RSS summaries, prompts).
