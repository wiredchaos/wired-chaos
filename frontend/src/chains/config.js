/**
 * WIRED CHAOS - Multi-Chain Configuration for NEUROLAB ACADEMY
 * TESTNET ONLY - No mainnet configurations
 */

export const CHAIN_CONFIG = {
  // Ethereum Sepolia Testnet
  ethereum: {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    rpcUrl: process.env.REACT_APP_ETH_RPC_TEST || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18
    },
    contracts: {
      certificateNFT: process.env.REACT_APP_CERT_ETH_CONTRACT || '0x0000000000000000000000000000000000000000'
    },
    gasLimit: 200000,
    enabled: true
  },

  // Solana Devnet
  solana: {
    name: 'Solana Devnet',
    rpcUrl: process.env.REACT_APP_SOL_RPC_TEST || 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    cluster: 'devnet',
    commitment: 'confirmed',
    enabled: true
  },

  // XRPL Testnet
  xrpl: {
    name: 'XRPL Testnet',
    wsUrl: process.env.REACT_APP_XRPL_WS_TEST || 'wss://s.altnet.rippletest.net:51233',
    explorerUrl: 'https://testnet.xrpl.org',
    networkId: 'testnet',
    enabled: true
  },

  // Hedera Testnet
  hedera: {
    name: 'Hedera Testnet',
    nodeId: '0.0.3',
    mirrorUrl: process.env.REACT_APP_HBAR_MIRROR_TEST || 'https://testnet.mirrornode.hedera.com',
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