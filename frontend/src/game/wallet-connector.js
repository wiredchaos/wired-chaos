/**
 * VRG33589 Game - Wallet Connector
 * Handles Web3 wallet connections and NFT verification
 */

/**
 * Connect to Web3 wallet (MetaMask, WalletConnect, etc.)
 */
export const connectWallet = async () => {
  try {
    // Check if Web3 is available
    if (typeof window.ethereum !== 'undefined') {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      
      // Get network
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      return {
        success: true,
        address,
        chainId,
        provider: 'MetaMask'
      };
    } else {
      // Demo mode for development
      console.warn('No Web3 wallet detected - using demo mode');
      const demoAddress = '0x' + Math.random().toString(16).substring(2, 42);
      localStorage.setItem('demo_wallet', demoAddress);
      
      return {
        success: true,
        address: demoAddress,
        chainId: '0x1',
        provider: 'Demo'
      };
    }
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
  localStorage.removeItem('demo_wallet');
  return { success: true };
};

/**
 * Get connected wallet address
 */
export const getConnectedWallet = async () => {
  try {
    // Check MetaMask
    if (typeof window.ethereum !== 'undefined') {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts.length > 0) {
        return accounts[0];
      }
    }
    
    // Check demo wallet
    const demoWallet = localStorage.getItem('demo_wallet');
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
 * Verify NFT ownership (simplified - production would query contract)
 */
export const verifyNFTOwnership = async (walletAddress) => {
  try {
    // In production, this would query the VRG33589 NFT contract
    // For now, return demo data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo NFT data
    const hasNFT = Math.random() > 0.5; // 50% chance for demo
    const nftCount = hasNFT ? Math.floor(Math.random() * 5) + 1 : 0;
    const hasLegendary = nftCount > 0 && Math.random() > 0.8;
    
    return {
      hasNFT,
      count: nftCount,
      hasLegendary,
      rarities: hasNFT ? generateDemoRarities(nftCount) : []
    };
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    return {
      hasNFT: false,
      count: 0,
      hasLegendary: false,
      rarities: []
    };
  }
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
  if (typeof window.ethereum !== 'undefined') {
    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        callback({ type: 'account', address: accounts[0] });
      } else {
        callback({ type: 'disconnect' });
      }
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', (chainId) => {
      callback({ type: 'chain', chainId });
    });
  }
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
 * Sign message with wallet
 */
export const signMessage = async (message) => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No Web3 wallet available');
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    if (accounts.length === 0) {
      throw new Error('No connected wallet');
    }
    
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });
    
    return {
      success: true,
      signature,
      address: accounts[0]
    };
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
