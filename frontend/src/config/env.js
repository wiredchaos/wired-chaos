/**
 * WIRED CHAOS - Environment Configuration
 * Centralized environment variable access for bundler safety
 * 
 * Purpose: Ensure env variables are accessed at module load time,
 * not inline, making them bundler-safe and easier to maintain.
 */

// Backend Configuration
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
export const API_URL = `${BACKEND_URL}/api`;

// Suite Configuration (Admin/Management Dashboard)
export const SUITE_URL = process.env.REACT_APP_SUITE_URL || '';

// Chain RPC URLs
export const ETH_RPC_URL = process.env.REACT_APP_ETH_RPC_TEST || 'https://rpc.sepolia.org';
export const SOL_RPC_URL = process.env.REACT_APP_SOL_RPC_TEST || 'https://api.devnet.solana.com';
export const XRPL_WS_URL = process.env.REACT_APP_XRPL_WS_TEST || 'wss://s.altnet.rippletest.net:51233';
export const HBAR_MIRROR_URL = process.env.REACT_APP_HBAR_MIRROR_TEST || 'https://testnet.mirrornode.hedera.com';

// IPFS Configuration
export const IPFS_TOKEN = process.env.REACT_APP_IPFS_TOKEN || '';

// Contract Addresses
export const CERT_ETH_CONTRACT = process.env.REACT_APP_CERT_ETH_CONTRACT || '0x0000000000000000000000000000000000000000';

// Environment Info
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// Feature Flags from Environment
export const DEBUG_MODE = IS_DEVELOPMENT;

export default {
  BACKEND_URL,
  API_URL,
  SUITE_URL,
  ETH_RPC_URL,
  SOL_RPC_URL,
  XRPL_WS_URL,
  HBAR_MIRROR_URL,
  IPFS_TOKEN,
  CERT_ETH_CONTRACT,
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  DEBUG_MODE
};
