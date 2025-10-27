# CODΞX (WIRED CHAOS)

Encrypted-lore nucleus with web UI, core utils, and optional confidential hooks.

## Use
pnpm i
pnpm bootstrap
pnpm dev:web  # http://localhost:3000

## Contracts
cd packages/codex-contracts && pnpm build && npx hardhat run scripts/deploy.ts --network xrpl_evm
