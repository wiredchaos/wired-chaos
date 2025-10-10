/**
 * VRG33589 Game - Puzzle Solver
 * Handles puzzle solution submission and validation
 */

import { spendCredits, addToCreditHistory } from './credit-tracker';

const STORAGE_KEY = 'vrg33589_solved_puzzles';
const ATTEMPTS_KEY = 'vrg33589_puzzle_attempts';

/**
 * Get solved puzzles
 */
export const getSolvedPuzzles = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Mark puzzle as solved
 */
export const markPuzzleSolved = (puzzleId, solution) => {
  const solved = getSolvedPuzzles();
  
  const entry = {
    puzzleId,
    solvedAt: Date.now(),
    solution: hashSolution(solution) // Don't store actual solution
  };
  
  solved.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
  
  return entry;
};

/**
 * Check if puzzle is solved
 */
export const isPuzzleSolved = (puzzleId) => {
  const solved = getSolvedPuzzles();
  return solved.some(entry => entry.puzzleId === puzzleId);
};

/**
 * Submit puzzle solution
 */
export const submitSolution = async (puzzle, solution, credits) => {
  try {
    // Check if already solved
    if (isPuzzleSolved(puzzle.id)) {
      return {
        success: false,
        error: 'Puzzle already solved'
      };
    }
    
    // Check credits
    if (credits < 1) {
      return {
        success: false,
        error: 'Insufficient credits'
      };
    }
    
    // Record attempt
    recordAttempt(puzzle.id, solution);
    
    // Verify solution
    const isCorrect = verifySolution(puzzle, solution);
    
    if (isCorrect) {
      // Spend credit
      spendCredits(1);
      addToCreditHistory('spend', 1);
      
      // Mark as solved
      markPuzzleSolved(puzzle.id, solution);
      
      // Award points
      const points = calculatePoints(puzzle);
      
      return {
        success: true,
        correct: true,
        points,
        message: 'Correct! Puzzle solved!'
      };
    } else {
      // Spend credit even on wrong answer
      spendCredits(1);
      addToCreditHistory('spend', 1);
      
      return {
        success: true,
        correct: false,
        message: 'Incorrect solution. Try again.'
      };
    }
  } catch (error) {
    console.error('Error submitting solution:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify solution (simplified - production would use smart contract)
 */
const verifySolution = (puzzle, solution) => {
  // Sample correct answers for demo puzzles
  const correctAnswers = {
    '1': ['loop', 'the loop', 'simulation'],
    '2': ['vrg33589', 'VRG33589'],
    '3': ['four', '4', 'four layers']
  };
  
  const answers = correctAnswers[puzzle.id] || [];
  const normalized = solution.toLowerCase().trim();
  
  return answers.some(answer => normalized === answer.toLowerCase());
};

/**
 * Calculate points for solving puzzle
 */
const calculatePoints = (puzzle) => {
  const basePoints = 10;
  const difficultyMultiplier = puzzle.difficulty || 1;
  const layerBonus = puzzle.layer * 5;
  
  return basePoints * difficultyMultiplier + layerBonus;
};

/**
 * Hash solution (simple hash for demo)
 */
const hashSolution = (solution) => {
  // In production, use proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < solution.length; i++) {
    const char = solution.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

/**
 * Record puzzle attempt
 */
const recordAttempt = (puzzleId, solution) => {
  const attempts = getAttempts();
  
  if (!attempts[puzzleId]) {
    attempts[puzzleId] = [];
  }
  
  attempts[puzzleId].push({
    timestamp: Date.now(),
    solutionHash: hashSolution(solution)
  });
  
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
};

/**
 * Get all attempts
 */
export const getAttempts = () => {
  const stored = localStorage.getItem(ATTEMPTS_KEY);
  return stored ? JSON.parse(stored) : {};
};

/**
 * Get attempts for specific puzzle
 */
export const getPuzzleAttempts = (puzzleId) => {
  const attempts = getAttempts();
  return attempts[puzzleId] || [];
};

/**
 * Get solve statistics
 */
export const getSolveStats = () => {
  const solved = getSolvedPuzzles();
  const attempts = getAttempts();
  
  const totalSolved = solved.length;
  const totalAttempts = Object.values(attempts).reduce(
    (sum, puzzleAttempts) => sum + puzzleAttempts.length,
    0
  );
  
  const totalPoints = solved.reduce((sum, entry) => {
    // Recalculate points (simplified - in production would store)
    return sum + 10;
  }, 0);
  
  return {
    totalSolved,
    totalAttempts,
    totalPoints,
    successRate: totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0
  };
};

/**
 * Get puzzles by layer
 */
export const getPuzzlesByLayer = (layer) => {
  // Sample puzzles - in production would fetch from backend/contract
  const allPuzzles = [
    {
      id: '1',
      layer: 0,
      type: 'riddle',
      title: 'The Beginning',
      content: 'I am the start of every simulation, yet I exist only in reflection. What am I?',
      difficulty: 1,
      unlocked: true
    },
    {
      id: '2',
      layer: 0,
      type: 'cipher',
      title: 'Hidden Message',
      content: 'Decode: 56 52 47 33 33 35 38 39',
      difficulty: 2,
      unlocked: true
    },
    {
      id: '3',
      layer: 1,
      type: 'meta',
      title: 'Reality Check',
      content: 'Count the layers between truth and illusion',
      difficulty: 5,
      unlocked: false
    },
    {
      id: '4',
      layer: 1,
      type: 'cipher',
      title: 'The Pattern',
      content: 'Every third letter reveals the truth',
      difficulty: 4,
      unlocked: false
    },
    {
      id: '5',
      layer: 2,
      type: 'meta',
      title: 'Core Question',
      content: 'What happens when the simulation knows it\'s a simulation?',
      difficulty: 7,
      unlocked: false
    },
    {
      id: '6',
      layer: 3,
      type: 'collaborative',
      title: 'The Void Gate',
      content: 'Only together can we escape. Or can we?',
      difficulty: 10,
      unlocked: false
    }
  ];
  
  return allPuzzles.filter(p => p.layer === layer);
};

/**
 * Get available puzzles for player
 */
export const getAvailablePuzzles = (currentLayer) => {
  const allPuzzles = [];
  
  // Get puzzles for all layers up to current
  for (let i = 0; i <= currentLayer; i++) {
    allPuzzles.push(...getPuzzlesByLayer(i));
  }
  
  // Mark solved puzzles
  const solved = getSolvedPuzzles();
  
  return allPuzzles.map(puzzle => ({
    ...puzzle,
    solved: isPuzzleSolved(puzzle.id),
    attempts: getPuzzleAttempts(puzzle.id).length
  }));
};

/**
 * Reset puzzle progress (for testing)
 */
export const resetPuzzleProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
};

export default {
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
};
