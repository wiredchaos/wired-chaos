import { expect } from "chai";
import { ethers } from "hardhat";

describe("CodexRegistry", () => {
  it("registers", async () => {
    const Codex = await ethers.getContractFactory("CodexRegistry");
    const codex = await Codex.deploy();
    await codex.waitForDeployment();
    const tx = await codex.register("ipfs://example");
    await tx.wait();
    expect(await codex.uriOf(1)).to.equal("ipfs://example");
  });
});
