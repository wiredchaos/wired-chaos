// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VRG33589Game
 * @dev The Eternal Loop - NFT-gated game system for VRG33589 holders
 * @author WIRED CHAOS Development Team
 * 
 * IMPORTANT: This is a REFERENCE IMPLEMENTATION for EVM chains.
 * VRG33589 NFTs exist on the XRPL (XRP Ledger), not Ethereum.
 * 
 * This contract demonstrates the game logic that is implemented
 * client-side with XRPL NFT verification. Future versions may use
 * XRPL Hooks for on-chain game state management.
 * 
 * Features:
 * - Prompt credit management based on NFT ownership
 * - Reality layer progression tracking
 * - System patch mechanism
 * - Puzzle state management
 */
contract VRG33589Game is Ownable, ReentrancyGuard {
    
    // Game constants
    uint8 public constant MAX_REALITY_LAYER = 4; // surface=0, deep=1, core=2, void=3
    uint256 public constant COMMON_DAILY_CREDITS = 1;
    uint256 public constant RARE_MULTIPLIER = 2;
    uint256 public constant EPIC_MULTIPLIER = 5;
    uint256 public constant LEGENDARY_MULTIPLIER = 10;
    
    // Structs
    struct GameProgress {
        uint8 realityLayer;        // Current reality layer (0-3)
        uint16 loopIteration;      // Number of loops completed
        uint256 lastPatchTime;     // Last system patch timestamp
        bytes32[] solvedPuzzles;   // Array of solved puzzle IDs
        uint256 totalScore;        // Cumulative score
    }
    
    struct PuzzleState {
        string puzzleId;           // Unique puzzle identifier
        uint8 requiredLayer;       // Minimum reality layer required
        string puzzleType;         // riddle, cipher, meta, collaborative
        bytes32 solutionHash;      // Hash of the solution
        uint256 timeUnlock;        // Timestamp when puzzle unlocks
        bool communityRequired;    // Requires multiple solvers
        uint256 solveCount;        // Number of times solved
        bool isActive;             // Whether puzzle is active
    }
    
    // State variables
    mapping(address => uint256) public promptCredits;
    mapping(address => uint256) public lastCreditClaim;
    mapping(uint256 => PuzzleState) public puzzles;
    mapping(address => GameProgress) public playerProgress;
    mapping(bytes32 => mapping(address => bool)) public puzzleSolutions;
    
    uint256 public puzzleCounter;
    uint256 public systemStability = 100; // Decreases as players progress
    address public aiGuardian;
    
    // Events
    event CreditsClaimedBy(address indexed player, uint256 amount, uint256 timestamp);
    event PuzzleSolved(address indexed player, bytes32 indexed puzzleId, uint8 layer);
    event SystemPatched(uint16 indexed iteration, string reason, uint256 timestamp);
    event RealityLayerChanged(address indexed player, uint8 oldLayer, uint8 newLayer);
    event PuzzleCreated(uint256 indexed puzzleId, uint8 requiredLayer, string puzzleType);
    
    constructor() {
        aiGuardian = msg.sender;
    }
    
    /**
     * @dev Set the AI guardian address
     */
    function setAIGuardian(address _guardian) external onlyOwner {
        aiGuardian = _guardian;
    }
    
    /**
     * @dev Claim daily prompt credits (simplified - production would check NFT ownership)
     */
    function claimCredits() external nonReentrant {
        require(
            block.timestamp >= lastCreditClaim[msg.sender] + 1 days,
            "Credits already claimed today"
        );
        
        // In production, this would query NFT contract for rarity and quantity
        uint256 credits = COMMON_DAILY_CREDITS;
        
        promptCredits[msg.sender] += credits;
        lastCreditClaim[msg.sender] = block.timestamp;
        
        emit CreditsClaimedBy(msg.sender, credits, block.timestamp);
    }
    
    /**
     * @dev Submit a puzzle solution
     */
    function submitSolution(
        uint256 puzzleId,
        string memory solution
    ) external nonReentrant {
        require(puzzles[puzzleId].isActive, "Puzzle not active");
        require(promptCredits[msg.sender] > 0, "Insufficient credits");
        
        PuzzleState storage puzzle = puzzles[puzzleId];
        GameProgress storage progress = playerProgress[msg.sender];
        
        require(progress.realityLayer >= puzzle.requiredLayer, "Layer locked");
        require(block.timestamp >= puzzle.timeUnlock, "Puzzle locked");
        
        bytes32 solutionHash = keccak256(abi.encodePacked(solution));
        require(solutionHash == puzzle.solutionHash, "Incorrect solution");
        
        // Deduct credit
        promptCredits[msg.sender] -= 1;
        
        // Mark as solved
        bytes32 puzzleHash = keccak256(abi.encodePacked(puzzleId));
        puzzleSolutions[puzzleHash][msg.sender] = true;
        progress.solvedPuzzles.push(puzzleHash);
        progress.totalScore += 10;
        
        puzzle.solveCount += 1;
        
        emit PuzzleSolved(msg.sender, puzzleHash, progress.realityLayer);
        
        // Check if player should advance
        _checkLayerAdvancement(msg.sender);
    }
    
    /**
     * @dev Check and advance player to next reality layer
     */
    function _checkLayerAdvancement(address player) internal {
        GameProgress storage progress = playerProgress[player];
        
        // Advance if player has solved enough puzzles for current layer
        uint256 requiredSolves = (progress.realityLayer + 1) * 3;
        
        if (progress.solvedPuzzles.length >= requiredSolves && 
            progress.realityLayer < MAX_REALITY_LAYER) {
            
            uint8 oldLayer = progress.realityLayer;
            progress.realityLayer += 1;
            
            emit RealityLayerChanged(player, oldLayer, progress.realityLayer);
            
            // Decrease system stability as players advance
            if (systemStability > 10) {
                systemStability -= 5;
            }
        }
    }
    
    /**
     * @dev Trigger a system patch (AI guardian only)
     */
    function triggerSystemPatch(string memory reason) external {
        require(
            msg.sender == aiGuardian || msg.sender == owner(),
            "Only AI guardian can patch"
        );
        
        // Reset system stability
        systemStability = 100;
        
        // Increment loop iteration for all active players
        // In production, this would be more sophisticated
        
        emit SystemPatched(0, reason, block.timestamp);
    }
    
    /**
     * @dev Create a new puzzle (owner only)
     */
    function createPuzzle(
        string memory puzzleId,
        uint8 requiredLayer,
        string memory puzzleType,
        bytes32 solutionHash,
        uint256 timeUnlock,
        bool communityRequired
    ) external onlyOwner {
        require(requiredLayer <= MAX_REALITY_LAYER, "Invalid layer");
        
        puzzleCounter += 1;
        
        puzzles[puzzleCounter] = PuzzleState({
            puzzleId: puzzleId,
            requiredLayer: requiredLayer,
            puzzleType: puzzleType,
            solutionHash: solutionHash,
            timeUnlock: timeUnlock,
            communityRequired: communityRequired,
            solveCount: 0,
            isActive: true
        });
        
        emit PuzzleCreated(puzzleCounter, requiredLayer, puzzleType);
    }
    
    /**
     * @dev Deactivate a puzzle
     */
    function deactivatePuzzle(uint256 puzzleId) external onlyOwner {
        puzzles[puzzleId].isActive = false;
    }
    
    /**
     * @dev Get player progress
     */
    function getPlayerProgress(address player) external view returns (
        uint8 realityLayer,
        uint16 loopIteration,
        uint256 lastPatchTime,
        uint256 solvedCount,
        uint256 totalScore
    ) {
        GameProgress storage progress = playerProgress[player];
        return (
            progress.realityLayer,
            progress.loopIteration,
            progress.lastPatchTime,
            progress.solvedPuzzles.length,
            progress.totalScore
        );
    }
    
    /**
     * @dev Get puzzle details
     */
    function getPuzzle(uint256 puzzleId) external view returns (
        string memory puzzleId_,
        uint8 requiredLayer,
        string memory puzzleType,
        uint256 timeUnlock,
        bool communityRequired,
        uint256 solveCount,
        bool isActive
    ) {
        PuzzleState storage puzzle = puzzles[puzzleId];
        return (
            puzzle.puzzleId,
            puzzle.requiredLayer,
            puzzle.puzzleType,
            puzzle.timeUnlock,
            puzzle.communityRequired,
            puzzle.solveCount,
            puzzle.isActive
        );
    }
    
    /**
     * @dev Award bonus credits (owner only, for events/promotions)
     */
    function awardCredits(address player, uint256 amount) external onlyOwner {
        promptCredits[player] += amount;
        emit CreditsClaimedBy(player, amount, block.timestamp);
    }
}
