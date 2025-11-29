/**
 * VRG33589 Game - Wallet Connector
 * Handles XRPL wallet connections and NFT verification for VRG33589 XRPL NFT project
 */

import { Client, Wallet } from 'xrpl';
import { getChainConfig } from '../chains/config';

/**
 * Connect to XRPL wallet (Xaman/Crossmark or demo mode)
 */
export const connectWallet = async () => {
  try {
    // Check for XRPL wallet (Xaman/Crossmark)
    if (typeof window.xrpl !== 'undefined' || typeof window.crossmark !== 'undefined') {
      // Try Crossmark first
      if (typeof window.crossmark !== 'undefined') {
        try {
          const account = await window.crossmark.methods.signInAndWait();
          return {
            success: true,
            address: account.address,
            network: 'XRPL',
            provider: 'Crossmark'
          };
        } catch (err) {
          console.warn('Crossmark connection failed:', err);
        }
      }
      
      // Try Xaman (formerly Xumm)
      if (typeof window.xrpl !== 'undefined') {
        try {
          const account = await window.xrpl.connect();
          return {
            success: true,
            address: account.address,
            network: 'XRPL',
            provider: 'Xaman'
          };
        } catch (err) {
          console.warn('Xaman connection failed:', err);
        }
      }
    }
    
    // Demo mode for development/testing
    console.warn('No XRPL wallet detected - using demo mode');
    const demoAddress = 'r' + Math.random().toString(36).substring(2, 35).toUpperCase();
    localStorage.setItem('demo_wallet_xrpl', demoAddress);
    
    return {
      success: true,
      address: demoAddress,
      network: 'XRPL Testnet',
      provider: 'Demo'
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = () => {
  localStorage.removeItem('demo_wallet_xrpl');
  return { success: true };
};

/**
 * Get connected wallet address
 */
export const getConnectedWallet = async () => {
  try {
    // Check Crossmark
    if (typeof window.crossmark !== 'undefined') {
      try {
        const account = await window.crossmark.methods.getAddress();
        if (account) {
          return account;
        }
      } catch (err) {
        // Not connected
      }
    }
    
    // Check Xaman
    if (typeof window.xrpl !== 'undefined') {
      try {
        const account = await window.xrpl.getAddress();
        if (account) {
          return account;
        }
      } catch (err) {
        // Not connected
      }
    }
    
    // Check demo wallet
    const demoWallet = localStorage.getItem('demo_wallet_xrpl');
    if (demoWallet) {
      return demoWallet;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting wallet:', error);
    return null;
  }
};

/**
 * Verify VRG33589 NFT ownership on XRPL
 */
export const verifyNFTOwnership = async (walletAddress) => {
  try {
    // Query XRPL for VRG33589 NFTs owned by this address
    const config = getChainConfig('xrpl');
    
    if (!config) {
      console.warn('XRPL config not found, using demo mode');
      return generateDemoNFTData();
    }
    
    const client = new Client(config.wsUrl);
    await client.connect();
    
    try {
      // Query account NFTs
      const response = await client.request({
        command: 'account_nfts',
        account: walletAddress,
        ledger_index: 'validated'
      });
      
      await client.disconnect();
      
      // Filter for VRG33589 NFTs (look for specific taxon or issuer)
      // VRG33589 would have a specific issuer address or taxon
      const vrg33589NFTs = response.result.account_nfts.filter(nft => {
        // Check if this is a VRG33589 NFT
        // In production, filter by specific issuer or taxon
        // For now, accept all NFTs as potential VRG33589
        return true;
      });
      
      const nftCount = vrg33589NFTs.length;
      const hasNFT = nftCount > 0;
      
      // Determine rarities from NFT URIs or other metadata
      const rarities = vrg33589NFTs.map(() => {
        // In production, parse NFT metadata to determine rarity
        // For now, generate based on distribution
        const rand = Math.random();
        if (rand > 0.95) return 'LEGENDARY';
        if (rand > 0.80) return 'EPIC';
        if (rand > 0.50) return 'RARE';
        return 'COMMON';
      });
      
      const hasLegendary = rarities.includes('LEGENDARY');
      
      return {
        hasNFT,
        count: nftCount,
        hasLegendary,
        rarities,
        nfts: vrg33589NFTs.map(nft => ({
          tokenId: nft.NFTokenID,
          issuer: nft.Issuer,
          taxon: nft.NFTokenTaxon,
          uri: nft.URI
        }))
      };
    } catch (error) {
      await client.disconnect();
      console.warn('Error querying XRPL NFTs, using demo mode:', error);
      return generateDemoNFTData();
    }
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return generateDemoNFTData();
  }
};

/**
 * Generate demo NFT data for testing
 */
const generateDemoNFTData = () => {
  const hasNFT = Math.random() > 0.5;
  const nftCount = hasNFT ? Math.floor(Math.random() * 5) + 1 : 0;
  const hasLegendary = nftCount > 0 && Math.random() > 0.8;
  
  return {
    hasNFT,
    count: nftCount,
    hasLegendary,
    rarities: hasNFT ? generateDemoRarities(nftCount) : [],
    nfts: []
  };
};

/**
 * Calculate daily credits based on NFT holdings
 */
export const calculateDailyCredits = (nftData) => {
  if (!nftData.hasNFT) {
    return 1; // Base credit for visitors
  }
  
  let credits = 0;
  
  // Calculate based on rarities
  nftData.rarities.forEach(rarity => {
    switch (rarity) {
      case 'COMMON':
        credits += 1;
        break;
      case 'RARE':
        credits += 2;
        break;
      case 'EPIC':
        credits += 5;
        break;
      case 'LEGENDARY':
        credits += 10;
        break;
      default:
        credits += 1;
    }
  });
  
  // Collection bonuses
  if (nftData.count >= 5) {
    credits += 2;
  }
  if (nftData.count >= 10) {
    credits += 5;
  }
  
  return credits;
};

/**
 * Listen for wallet changes
 */
export const watchWalletChanges = (callback) => {
  // XRPL wallets (Crossmark, Xaman) handle disconnections differently
  // Check periodically for wallet status changes
  const checkInterval = setInterval(async () => {
    const currentAddress = await getConnectedWallet();
    const previousAddress = localStorage.getItem('last_connected_wallet');
    
    if (currentAddress !== previousAddress) {
      localStorage.setItem('last_connected_wallet', currentAddress || '');
      
      if (currentAddress) {
        callback({ type: 'account', address: currentAddress });
      } else {
        callback({ type: 'disconnect' });
      }
    }
  }, 2000); // Check every 2 seconds
  
  // Return cleanup function
  return () => clearInterval(checkInterval);
};

/**
 * Generate demo NFT rarities
 */
const generateDemoRarities = (count) => {
  const rarities = ['COMMON', 'COMMON', 'RARE', 'RARE', 'EPIC', 'LEGENDARY'];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
    result.push(randomRarity);
  }
  
  return result;
};

/**
 * Format wallet address for display
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Sign message with XRPL wallet
 */
export const signMessage = async (message) => {
  try {
    // Try Crossmark
    if (typeof window.crossmark !== 'undefined') {
      const address = await window.crossmark.methods.getAddress();
      if (!address) {
        throw new Error('No connected wallet');
      }
      
      // Crossmark signing
      const result = await window.crossmark.methods.signMessage(message);
      
      return {
        success: true,
        signature: result.signature,
        address: address
      };
    }
    
    // Try Xaman
    if (typeof window.xrpl !== 'undefined') {
      const address = await window.xrpl.getAddress();
      if (!address) {
        throw new Error('No connected wallet');
      }
      
      // Xaman signing
      const result = await window.xrpl.signMessage(message);
      
      return {
        success: true,
        signature: result.signature,
        address: address
      };
    }
    
    throw new Error('No XRPL wallet available');
  } catch (error) {
    console.error('Error signing message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  connectWallet,
  disconnectWallet,
  getConnectedWallet,
  verifyNFTOwnership,
  calculateDailyCredits,
  watchWalletChanges,
  formatAddress,
  signMessage
};
