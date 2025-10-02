/**
 * VRG33589 Game - Loop Manager
 * Manages reality layer progression and loop iterations
 */

const PROGRESS_KEY = 'vrg33589_game_progress';
const PATCH_KEY = 'vrg33589_patch_history';

/**
 * Get current game progress
 */
export const getGameProgress = () => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default initial state
  return {
    currentLayer: 0,
    loopIteration: 1,
    systemStability: 100,
    totalScore: 0,
    solvedCount: 0,
    startedAt: Date.now()
  };
};

/**
 * Save game progress
 */
export const saveGameProgress = (progress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
};

/**
 * Check if player should advance to next layer
 */
export const checkLayerAdvancement = () => {
  const progress = getGameProgress();
  const solvedCount = progress.solvedCount || 0;
  
  // Requirements for each layer
  const layerRequirements = {
    0: 0,  // Surface - start here
    1: 3,  // Deep - need 3 puzzles
    2: 8,  // Core - need 8 puzzles
    3: 15  // Void - need 15 puzzles
  };
  
  // Find highest eligible layer
  let newLayer = 0;
  for (let layer = 3; layer >= 0; layer--) {
    if (solvedCount >= layerRequirements[layer]) {
      newLayer = layer;
      break;
    }
  }
  
  // Check if advanced
  if (newLayer > progress.currentLayer) {
    progress.currentLayer = newLayer;
    saveGameProgress(progress);
    
    return {
      advanced: true,
      oldLayer: progress.currentLayer,
      newLayer
    };
  }
  
  return {
    advanced: false,
    currentLayer: progress.currentLayer
  };
};

/**
 * Update system stability
 */
export const updateSystemStability = (delta) => {
  const progress = getGameProgress();
  
  progress.systemStability = Math.max(0, Math.min(100, 
    progress.systemStability + delta
  ));
  
  saveGameProgress(progress);
  
  // Check if patch needed
  if (progress.systemStability <= 20) {
    return {
      stability: progress.systemStability,
      patchNeeded: true
    };
  }
  
  return {
    stability: progress.systemStability,
    patchNeeded: false
  };
};

/**
 * Trigger system patch (reset the loop)
 */
export const triggerSystemPatch = (reason) => {
  const progress = getGameProgress();
  
  // Record patch in history
  const patch = {
    iteration: progress.loopIteration,
    timestamp: Date.now(),
    reason,
    preservedScore: progress.totalScore,
    preservedSolves: progress.solvedCount,
    oldLayer: progress.currentLayer
  };
  
  addToPatchHistory(patch);
  
  // Reset but preserve some progress
  const newProgress = {
    currentLayer: 0, // Reset to surface
    loopIteration: progress.loopIteration + 1,
    systemStability: 100, // Restore stability
    totalScore: Math.floor(progress.totalScore * 0.5), // Keep 50% of score
    solvedCount: Math.floor(progress.solvedCount * 0.3), // Keep 30% of solves
    startedAt: Date.now(),
    lastPatchAt: Date.now(),
    lastPatchReason: reason
  };
  
  saveGameProgress(newProgress);
  
  return {
    success: true,
    patch,
    newProgress
  };
};

/**
 * Get patch history
 */
export const getPatchHistory = () => {
  const stored = localStorage.getItem(PATCH_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Add to patch history
 */
const addToPatchHistory = (patch) => {
  const history = getPatchHistory();
  history.push(patch);
  
  // Keep only last 20 patches
  if (history.length > 20) {
    history.shift();
  }
  
  localStorage.setItem(PATCH_KEY, JSON.stringify(history));
};

/**
 * Get layer name
 */
export const getLayerName = (layer) => {
  const names = ['Surface', 'Deep', 'Core', 'Void'];
  return names[layer] || 'Unknown';
};

/**
 * Get layer description
 */
export const getLayerDescription = (layer) => {
  const descriptions = {
    0: 'Basic riddles and obvious blockchain clues',
    1: 'Complex ciphers requiring multiple NFTs',
    2: 'Meta-game awareness and simulation questioning',
    3: 'Glitched reality and philosophical puzzles'
  };
  return descriptions[layer] || '';
};

/**
 * Calculate progress percentage
 */
export const calculateProgressPercentage = () => {
  const progress = getGameProgress();
  
  // Total puzzles needed to reach Void
  const totalNeeded = 15;
  const completed = Math.min(progress.solvedCount || 0, totalNeeded);
  
  return Math.floor((completed / totalNeeded) * 100);
};

/**
 * Get time in current loop
 */
export const getTimeInLoop = () => {
  const progress = getGameProgress();
  const startTime = progress.lastPatchAt || progress.startedAt;
  return Date.now() - startTime;
};

/**
 * Format time in loop
 */
export const formatTimeInLoop = () => {
  const ms = getTimeInLoop();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
};

/**
 * Get statistics
 */
export const getLoopStats = () => {
  const progress = getGameProgress();
  const history = getPatchHistory();
  
  return {
    currentIteration: progress.loopIteration,
    currentLayer: progress.currentLayer,
    totalScore: progress.totalScore,
    solvedCount: progress.solvedCount,
    systemStability: progress.systemStability,
    totalPatches: history.length,
    timeInLoop: getTimeInLoop(),
    progressPercentage: calculateProgressPercentage()
  };
};

/**
 * Check for automatic patch triggers
 */
export const checkPatchTriggers = () => {
  const progress = getGameProgress();
  const triggers = [];
  
  // System stability critical
  if (progress.systemStability <= 20) {
    triggers.push({
      type: 'stability',
      message: 'System stability critical'
    });
  }
  
  // Too many consecutive solves
  if (progress.solvedCount >= 20) {
    triggers.push({
      type: 'progress',
      message: 'Community consensus forming'
    });
  }
  
  // Player reached Void layer
  if (progress.currentLayer >= 3) {
    triggers.push({
      type: 'layer',
      message: 'Reality layer breach detected'
    });
  }
  
  return triggers;
};

/**
 * Simulate AI guardian decision
 */
export const shouldAITriggerPatch = () => {
  const triggers = checkPatchTriggers();
  const progress = getGameProgress();
  
  // Random chance increases with triggers
  const baseChance = 0.01; // 1%
  const triggerBonus = triggers.length * 0.05; // 5% per trigger
  const stabilityFactor = (100 - progress.systemStability) / 200; // Up to 50%
  
  const totalChance = baseChance + triggerBonus + stabilityFactor;
  
  return Math.random() < totalChance;
};

/**
 * Reset loop progress (for testing)
 */
export const resetLoopProgress = () => {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(PATCH_KEY);
};

export default {
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
};
