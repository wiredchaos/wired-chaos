/**
 * WIRED CHAOS - Multi-Chain Configuration for NEUROLAB ACADEMY
 * TESTNET ONLY - No mainnet configurations
 */

import { ETH_RPC_URL, SOL_RPC_URL, XRPL_WS_URL, HBAR_MIRROR_URL, CERT_ETH_CONTRACT } from '../config/env';

export const CHAIN_CONFIG = {
  // Ethereum Sepolia Testnet
  ethereum: {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: ETH_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      certificateNFT: CERT_ETH_CONTRACT
    },
    gasLimit: 200000,
    enabled: true
  },

  // Solana Devnet
  solana: {
    name: 'Solana Devnet',
    rpcUrl: SOL_RPC_URL,
    explorerUrl: 'https://explorer.solana.com',
    cluster: 'devnet',
    commitment: 'confirmed',
    enabled: true
  },

  // XRPL Testnet
  xrpl: {
    name: 'XRPL Testnet',
    wsUrl: XRPL_WS_URL,
    explorerUrl: 'https://testnet.xrpl.org',
    networkId: 'testnet',
    enabled: true
  },

  // Hedera Testnet
  hedera: {
    name: 'Hedera Testnet',
    nodeId: '0.0.3',
    mirrorUrl: HBAR_MIRROR_URL,
    explorerUrl: 'https://hashscan.io/testnet',
    networkId: 'testnet',
    enabled: true
  },

  // Dogecoin Testnet (Stub)
  dogecoin: {
    name: 'Dogecoin Testnet',
    rpcUrl: 'https://testnet-api.dogecoin.com',
    explorerUrl: 'https://sochain.com/testnet/doge',
    enabled: false, // Disabled until Doginals support
    stubMessage: 'NFTs not supported on Doge testnet yet.'
  }
};

// Supported chains array for UI
export const SUPPORTED_CHAINS = Object.keys(CHAIN_CONFIG).filter(
  chain => CHAIN_CONFIG[chain].enabled
);

// Chain display names
export const CHAIN_NAMES = {
  ethereum: '🔷 Ethereum',
  solana: '🟣 Solana', 
  xrpl: '🔹 XRPL',
  hedera: '🌿 Hedera',
  dogecoin: '🐕 Dogecoin'
};

// Get chain config by name
export const getChainConfig = (chainName) => {
  return CHAIN_CONFIG[chainName] || null;
};

// Validate chain support
export const isChainSupported = (chainName) => {
  return SUPPORTED_CHAINS.includes(chainName);
};

// Get all enabled chains
export const getEnabledChains = () => {
  return SUPPORTED_CHAINS.map(chain => ({
    key: chain,
    name: CHAIN_NAMES[chain],
    config: CHAIN_CONFIG[chain]
  }));
};

// IPFS Configuration
export const IPFS_CONFIG = {
  pinUrl: 'https://api.web3.storage/upload',
  gatewayUrl: 'https://dweb.link/ipfs/',
  timeout: 30000
};

// Certificate Template Configuration
export const CERT_CONFIG = {
  issuer: 'WIRED CHAOS NEUROLAB ACADEMY',
  issuerLogo: 'https://wiredchaos.xyz/images/neuro_academy_logo.png',
  description: 'Certificate of Completion issued by WIRED CHAOS NEUROLAB ACADEMY',
  externalUrl: 'https://wiredchaos.xyz/neurolab',
  attributes: {
    trait_type_academy: 'Academy',
    trait_value_academy: 'WIRED CHAOS NEUROLAB',
    trait_type_category: 'Education',
    trait_value_category: 'Blockchain Certificate'
  }
};

export default CHAIN_CONFIG;