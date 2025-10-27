import { ethers } from "hardhat";

async function main() {
  const nftAddr = process.env.NFT_ADDRESS;
  if (!nftAddr) throw new Error("Set NFT_ADDRESS");
  const FHE = await ethers.getContractFactory("ConfidentialHookFHE");
  const fhe = await FHE.deploy(nftAddr);
  await fhe.waitForDeployment();
  console.log("ConfidentialHookFHE:", await fhe.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
