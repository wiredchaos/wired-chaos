/**
 * VRG33589 Game - Credit Tracker
 * Manages prompt credits and spending
 */

const STORAGE_KEY = 'vrg33589_credits';
const LAST_CLAIM_KEY = 'vrg33589_last_claim';

/**
 * Get current credit balance
 */
export const getCredits = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

/**
 * Set credit balance
 */
export const setCredits = (amount) => {
  localStorage.setItem(STORAGE_KEY, amount.toString());
  return amount;
};

/**
 * Add credits to balance
 */
export const addCredits = (amount) => {
  const current = getCredits();
  const newBalance = current + amount;
  setCredits(newBalance);
  return newBalance;
};

/**
 * Spend credits
 */
export const spendCredits = (amount) => {
  const current = getCredits();
  
  if (current < amount) {
    throw new Error('Insufficient credits');
  }
  
  const newBalance = current - amount;
  setCredits(newBalance);
  return newBalance;
};

/**
 * Check if can claim daily credits
 */
export const canClaimDaily = () => {
  const lastClaim = localStorage.getItem(LAST_CLAIM_KEY);
  
  if (!lastClaim) {
    return true;
  }
  
  const lastClaimTime = parseInt(lastClaim, 10);
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  return (now - lastClaimTime) >= oneDayMs;
};

/**
 * Claim daily credits
 */
export const claimDailyCredits = (nftData) => {
  if (!canClaimDaily()) {
    throw new Error('Already claimed today');
  }
  
  // Calculate credits based on NFT holdings
  let dailyAmount = 1; // Base amount
  
  if (nftData && nftData.hasNFT) {
    dailyAmount = calculateDailyAmount(nftData);
  }
  
  // Add credits
  const newBalance = addCredits(dailyAmount);
  
  // Update last claim time
  localStorage.setItem(LAST_CLAIM_KEY, Date.now().toString());
  
  return {
    amount: dailyAmount,
    newBalance,
    nextClaimIn: 24 * 60 * 60 * 1000 // 24 hours in ms
  };
};

/**
 * Get time until next claim
 */
export const getTimeUntilNextClaim = () => {
  const lastClaim = localStorage.getItem(LAST_CLAIM_KEY);
  
  if (!lastClaim) {
    return 0;
  }
  
  const lastClaimTime = parseInt(lastClaim, 10);
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const timeSinceClaim = now - lastClaimTime;
  
  if (timeSinceClaim >= oneDayMs) {
    return 0;
  }
  
  return oneDayMs - timeSinceClaim;
};

/**
 * Format time until next claim
 */
export const formatTimeUntilClaim = () => {
  const ms = getTimeUntilNextClaim();
  
  if (ms === 0) {
    return 'Available now';
  }
  
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  
  return `${hours}h ${minutes}m`;
};

/**
 * Calculate daily amount based on NFT data
 */
const calculateDailyAmount = (nftData) => {
  let amount = 0;
  
  // Base on rarities
  if (nftData.rarities && nftData.rarities.length > 0) {
    nftData.rarities.forEach(rarity => {
      switch (rarity) {
        case 'COMMON':
          amount += 1;
          break;
        case 'RARE':
          amount += 2;
          break;
        case 'EPIC':
          amount += 5;
          break;
        case 'LEGENDARY':
          amount += 10;
          break;
        default:
          amount += 1;
      }
    });
  } else {
    // Fallback to count-based calculation
    amount = nftData.count || 1;
  }
  
  // Collection bonuses
  if (nftData.count >= 5) {
    amount += 2;
  }
  if (nftData.count >= 10) {
    amount += 5;
  }
  
  return amount;
};

/**
 * Get credit history (for statistics)
 */
export const getCreditHistory = () => {
  const history = localStorage.getItem('vrg33589_credit_history');
  return history ? JSON.parse(history) : [];
};

/**
 * Add to credit history
 */
export const addToCreditHistory = (type, amount) => {
  const history = getCreditHistory();
  const entry = {
    type, // 'claim' or 'spend'
    amount,
    timestamp: Date.now()
  };
  
  history.push(entry);
  
  // Keep only last 100 entries
  if (history.length > 100) {
    history.shift();
  }
  
  localStorage.setItem('vrg33589_credit_history', JSON.stringify(history));
};

/**
 * Get credit statistics
 */
export const getCreditStats = () => {
  const history = getCreditHistory();
  
  const stats = {
    totalClaimed: 0,
    totalSpent: 0,
    claimCount: 0,
    spendCount: 0
  };
  
  history.forEach(entry => {
    if (entry.type === 'claim') {
      stats.totalClaimed += entry.amount;
      stats.claimCount++;
    } else if (entry.type === 'spend') {
      stats.totalSpent += entry.amount;
      stats.spendCount++;
    }
  });
  
  stats.netCredits = stats.totalClaimed - stats.totalSpent;
  
  return stats;
};

/**
 * Reset credits (for testing)
 */
export const resetCredits = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_CLAIM_KEY);
  localStorage.removeItem('vrg33589_credit_history');
};

export default {
  getCredits,
  setCredits,
  addCredits,
  spendCredits,
  canClaimDaily,
  claimDailyCredits,
  getTimeUntilNextClaim,
  formatTimeUntilClaim,
  getCreditHistory,
  getCreditStats,
  resetCredits
};
