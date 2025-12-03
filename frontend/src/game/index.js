/**
 * VRG33589 Game System - Main Exports
 * Centralized exports for all game utilities
 */

export {
  connectWallet,
  disconnectWallet,
  getConnectedWallet,
  verifyNFTOwnership,
  calculateDailyCredits,
  watchWalletChanges,
  formatAddress,
  signMessage
} from './wallet-connector';

export {
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
} from './credit-tracker';

export {
  getSolvedPuzzles,
  markPuzzleSolved,
  isPuzzleSolved,
  submitSolution,
  getAttempts,
  getPuzzleAttempts,
  getSolveStats,
  getPuzzlesByLayer,
  getAvailablePuzzles,
  resetPuzzleProgress
} from './puzzle-solver';

export {
  getGameProgress,
  saveGameProgress,
  checkLayerAdvancement,
  updateSystemStability,
  triggerSystemPatch,
  getPatchHistory,
  getLayerName,
  getLayerDescription,
  calculateProgressPercentage,
  getTimeInLoop,
  formatTimeInLoop,
  getLoopStats,
  checkPatchTriggers,
  shouldAITriggerPatch,
  resetLoopProgress
} from './loop-manager';

// Re-export everything as default object for convenience
import * as walletConnector from './wallet-connector';
import * as creditTracker from './credit-tracker';
import * as puzzleSolver from './puzzle-solver';
import * as loopManager from './loop-manager';

export default {
  wallet: walletConnector,
  credits: creditTracker,
  puzzles: puzzleSolver,
  loop: loopManager
};
