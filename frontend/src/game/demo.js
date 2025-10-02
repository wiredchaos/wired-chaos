/**
 * VRG33589 Game System - Demo Script
 * Run this to test game functionality
 */

import gameUtils from './index';

/**
 * Demo: Complete game flow
 */
export const runGameDemo = async () => {
  console.log('🌀 VRG33589 Game Demo Starting...\n');
  
  // Step 1: Connect Wallet
  console.log('Step 1: Connecting wallet...');
  const walletResult = await gameUtils.wallet.connectWallet();
  console.log('✅ Wallet connected:', walletResult.address);
  console.log('Provider:', walletResult.provider, '\n');
  
  // Step 2: Verify NFT Ownership
  console.log('Step 2: Verifying NFT ownership...');
  const nftData = await gameUtils.wallet.verifyNFTOwnership(walletResult.address);
  console.log('✅ NFT Status:');
  console.log('  - Has NFT:', nftData.hasNFT);
  console.log('  - Count:', nftData.count);
  console.log('  - Has Legendary:', nftData.hasLegendary);
  console.log('  - Rarities:', nftData.rarities.join(', '), '\n');
  
  // Step 3: Calculate and Claim Credits
  console.log('Step 3: Claiming daily credits...');
  const dailyCredits = gameUtils.wallet.calculateDailyCredits(nftData);
  console.log('Daily credit rate:', dailyCredits);
  
  if (gameUtils.credits.canClaimDaily()) {
    const claimResult = gameUtils.credits.claimDailyCredits(nftData);
    console.log('✅ Credits claimed:', claimResult.amount);
    console.log('New balance:', claimResult.newBalance);
    console.log('Next claim in:', gameUtils.credits.formatTimeUntilClaim(), '\n');
  } else {
    console.log('⏰ Already claimed today');
    console.log('Next claim in:', gameUtils.credits.formatTimeUntilClaim(), '\n');
  }
  
  // Step 4: View Game Progress
  console.log('Step 4: Checking game progress...');
  const progress = gameUtils.loop.getGameProgress();
  console.log('✅ Game State:');
  console.log('  - Current Layer:', gameUtils.loop.getLayerName(progress.currentLayer));
  console.log('  - Loop Iteration:', progress.loopIteration);
  console.log('  - System Stability:', progress.systemStability + '%');
  console.log('  - Total Score:', progress.totalScore);
  console.log('  - Puzzles Solved:', progress.solvedCount, '\n');
  
  // Step 5: Get Available Puzzles
  console.log('Step 5: Loading available puzzles...');
  const puzzles = gameUtils.puzzles.getAvailablePuzzles(progress.currentLayer);
  console.log('✅ Available puzzles:', puzzles.length);
  puzzles.slice(0, 3).forEach(puzzle => {
    console.log(`  - ${puzzle.title} (Layer ${puzzle.layer}, Difficulty ${puzzle.difficulty})`);
    console.log(`    ${puzzle.solved ? '✓ SOLVED' : '○ Not solved'}`);
  });
  console.log();
  
  // Step 6: Attempt a Puzzle
  console.log('Step 6: Attempting puzzle solution...');
  const testPuzzle = puzzles.find(p => !p.solved);
  if (testPuzzle) {
    console.log('Attempting:', testPuzzle.title);
    console.log('Content:', testPuzzle.content);
    
    const credits = gameUtils.credits.getCredits();
    const result = await gameUtils.puzzles.submitSolution(
      testPuzzle,
      'loop', // Try correct answer
      credits
    );
    
    if (result.correct) {
      console.log('✅ Correct! Puzzle solved!');
      console.log('Points earned:', result.points);
    } else {
      console.log('❌', result.message);
    }
    console.log('Credits remaining:', gameUtils.credits.getCredits(), '\n');
  } else {
    console.log('All current puzzles solved!\n');
  }
  
  // Step 7: Check Layer Advancement
  console.log('Step 7: Checking layer advancement...');
  const advanceResult = gameUtils.loop.checkLayerAdvancement();
  if (advanceResult.advanced) {
    console.log('🎉 Advanced to new layer!');
    console.log('New layer:', gameUtils.loop.getLayerName(advanceResult.newLayer), '\n');
  } else {
    console.log('Current layer:', gameUtils.loop.getLayerName(advanceResult.currentLayer));
    console.log('Progress:', gameUtils.loop.calculateProgressPercentage() + '%', '\n');
  }
  
  // Step 8: Check System Stability
  console.log('Step 8: Checking system stability...');
  const stabilityResult = gameUtils.loop.updateSystemStability(-5);
  console.log('System stability:', stabilityResult.stability + '%');
  if (stabilityResult.patchNeeded) {
    console.log('⚠️ SYSTEM UNSTABLE - Patch needed!');
  }
  console.log();
  
  // Step 9: View Statistics
  console.log('Step 9: Viewing statistics...');
  const loopStats = gameUtils.loop.getLoopStats();
  const solveStats = gameUtils.puzzles.getSolveStats();
  const creditStats = gameUtils.credits.getCreditStats();
  
  console.log('✅ Player Statistics:');
  console.log('Loop Stats:');
  console.log('  - Iteration:', loopStats.currentIteration);
  console.log('  - Time in Loop:', gameUtils.loop.formatTimeInLoop());
  console.log('  - Progress:', loopStats.progressPercentage + '%');
  
  console.log('\nPuzzle Stats:');
  console.log('  - Total Solved:', solveStats.totalSolved);
  console.log('  - Total Attempts:', solveStats.totalAttempts);
  console.log('  - Success Rate:', solveStats.successRate.toFixed(1) + '%');
  
  console.log('\nCredit Stats:');
  console.log('  - Total Claimed:', creditStats.totalClaimed);
  console.log('  - Total Spent:', creditStats.totalSpent);
  console.log('  - Net Credits:', creditStats.netCredits);
  console.log();
  
  // Step 10: Check Patch Triggers
  console.log('Step 10: Checking patch triggers...');
  const triggers = gameUtils.loop.checkPatchTriggers();
  if (triggers.length > 0) {
    console.log('⚠️ Patch triggers detected:');
    triggers.forEach(trigger => {
      console.log(`  - ${trigger.type}: ${trigger.message}`);
    });
  } else {
    console.log('✅ No patch triggers');
  }
  console.log();
  
  console.log('🌀 Demo Complete!\n');
  console.log('Visit /game in your browser to play!');
};

/**
 * Demo: Simulate system patch
 */
export const demoPatch = () => {
  console.log('🔄 Simulating System Patch...\n');
  
  const result = gameUtils.loop.triggerSystemPatch('Demo patch trigger');
  
  console.log('✅ Patch Applied:');
  console.log('Previous iteration:', result.patch.iteration);
  console.log('New iteration:', result.newProgress.loopIteration);
  console.log('Preserved score:', result.newProgress.totalScore);
  console.log('Preserved solves:', result.newProgress.solvedCount);
  console.log('System stability restored:', result.newProgress.systemStability + '%');
  console.log('\n"The simulation adapts. The loop continues. Reality persists."\n');
};

/**
 * Demo: Reset everything
 */
export const demoReset = () => {
  console.log('🔄 Resetting all game data...\n');
  
  gameUtils.credits.resetCredits();
  gameUtils.puzzles.resetPuzzleProgress();
  gameUtils.loop.resetLoopProgress();
  
  console.log('✅ All data reset!');
  console.log('Ready to start fresh.\n');
};

// Auto-run demo in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Expose demo functions to window for console access
  window.VRG33589Demo = {
    run: runGameDemo,
    patch: demoPatch,
    reset: demoReset
  };
  
  console.log('💎 VRG33589 Demo Functions Available!');
  console.log('Run in console:');
  console.log('  - VRG33589Demo.run()   - Full game demo');
  console.log('  - VRG33589Demo.patch() - Trigger system patch');
  console.log('  - VRG33589Demo.reset() - Reset all data');
}

export default {
  runGameDemo,
  demoPatch,
  demoReset
};
