# FHE Deploy Notes (Zama FHEVM)

## Prereqs
- Run a compatible FHEVM node + gateway and TKMS.
- Install libs:
  ```
  pnpm add -D @zama-fhe/solidity
  ```

## Compile
Ensure your Hardhat config resolves `fhevm` packages. Then:
```
pnpm -C packages/codex-contracts build
```

## Deploy
Pass the ERC-721 address to the constructor:
```
npx hardhat run scripts/deploy-fhe.ts --network xrpl_evm
```

## Client
- Fetch chain FHE public key
- Encrypt inputs, e.g., the `hiddenCode` and `guess`
- Call `requestSolvedDecrypt` and poll the gateway for the plaintext result

