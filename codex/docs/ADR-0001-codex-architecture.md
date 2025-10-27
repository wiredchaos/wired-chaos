# ADR-0001 — CODΞX architecture
- Monorepo with core lib (parsers/crypto), web (Next.js), contracts (Solidity).
- Optional FHE: future `ConfidentialHook.sol` compiled only if FHEVM libs present.
- Design goal: pluggable “knowledge artifacts” (lore, RSS summaries, prompts).
