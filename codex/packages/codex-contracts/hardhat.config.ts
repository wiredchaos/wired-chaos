import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const XRPLEVM_RPC = process.env.XRPLEVM_RPC || "http://localhost:8545";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    xrpl_evm: {
      url: XRPLEVM_RPC
    }
  }
};

export default config;
