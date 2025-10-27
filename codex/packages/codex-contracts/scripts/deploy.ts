import { ethers } from "hardhat";

async function main() {
  const Codex = await ethers.getContractFactory("CodexRegistry");
  const codex = await Codex.deploy();
  await codex.waitForDeployment();
  console.log("CodexRegistry:", await codex.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
