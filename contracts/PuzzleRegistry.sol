// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PuzzleRegistry
 * @dev Registry for puzzle definitions and solutions
 * @author WIRED CHAOS Development Team
 * 
 * IMPORTANT: This is a REFERENCE IMPLEMENTATION for EVM chains.
 * Actual puzzle management is client-side. See frontend/src/game/puzzle-solver.js
 */
contract PuzzleRegistry is Ownable {
    
    enum PuzzleType { RIDDLE, CIPHER, META, COLLABORATIVE }
    enum RealityLayer { SURFACE, DEEP, CORE, VOID }
    
    struct Puzzle {
        bytes32 id;
        string content;
        PuzzleType puzzleType;
        RealityLayer layer;
        bytes32 solutionHash;
        uint256 complexity;      // 1-10
        uint256 nftRequirement;  // Minimum NFTs needed
        uint256 unlockTime;
        bool communityRequired;
        bool isActive;
        uint256 solveCount;
        uint256 createdAt;
    }
    
    struct Solution {
        address solver;
        uint256 timestamp;
        uint8 attemptCount;
    }
    
    // Storage
    mapping(bytes32 => Puzzle) public puzzles;
    mapping(bytes32 => mapping(address => Solution)) public solutions;
    mapping(RealityLayer => bytes32[]) public puzzlesByLayer;
    
    bytes32[] public allPuzzleIds;
    
    // Events
    event PuzzleCreated(
        bytes32 indexed puzzleId,
        PuzzleType puzzleType,
        RealityLayer layer,
        uint256 complexity
    );
    event PuzzleSolved(
        bytes32 indexed puzzleId,
        address indexed solver,
        uint256 timestamp
    );
    event PuzzleDeactivated(bytes32 indexed puzzleId);
    
    /**
     * @dev Create a new puzzle
     */
    function createPuzzle(
        string memory content,
        PuzzleType puzzleType,
        RealityLayer layer,
        string memory solution,
        uint256 complexity,
        uint256 nftRequirement,
        uint256 unlockTime,
        bool communityRequired
    ) external onlyOwner returns (bytes32) {
        require(complexity >= 1 && complexity <= 10, "Invalid complexity");
        
        bytes32 puzzleId = keccak256(
            abi.encodePacked(content, block.timestamp, puzzleType)
        );
        
        bytes32 solutionHash = keccak256(abi.encodePacked(solution));
        
        puzzles[puzzleId] = Puzzle({
            id: puzzleId,
            content: content,
            puzzleType: puzzleType,
            layer: layer,
            solutionHash: solutionHash,
            complexity: complexity,
            nftRequirement: nftRequirement,
            unlockTime: unlockTime,
            communityRequired: communityRequired,
            isActive: true,
            solveCount: 0,
            createdAt: block.timestamp
        });
        
        allPuzzleIds.push(puzzleId);
        puzzlesByLayer[layer].push(puzzleId);
        
        emit PuzzleCreated(puzzleId, puzzleType, layer, complexity);
        
        return puzzleId;
    }
    
    /**
     * @dev Submit solution attempt
     */
    function submitSolution(
        bytes32 puzzleId,
        string memory solution
    ) external returns (bool) {
        Puzzle storage puzzle = puzzles[puzzleId];
        require(puzzle.isActive, "Puzzle not active");
        require(block.timestamp >= puzzle.unlockTime, "Puzzle locked");
        
        bytes32 solutionHash = keccak256(abi.encodePacked(solution));
        bool correct = solutionHash == puzzle.solutionHash;
        
        Solution storage sol = solutions[puzzleId][msg.sender];
        sol.attemptCount += 1;
        
        if (correct && sol.timestamp == 0) {
            sol.solver = msg.sender;
            sol.timestamp = block.timestamp;
            puzzle.solveCount += 1;
            
            emit PuzzleSolved(puzzleId, msg.sender, block.timestamp);
        }
        
        return correct;
    }
    
    /**
     * @dev Check if solution is correct (view only, no state change)
     */
    function verifySolution(
        bytes32 puzzleId,
        string memory solution
    ) external view returns (bool) {
        Puzzle storage puzzle = puzzles[puzzleId];
        bytes32 solutionHash = keccak256(abi.encodePacked(solution));
        return solutionHash == puzzle.solutionHash;
    }
    
    /**
     * @dev Deactivate a puzzle
     */
    function deactivatePuzzle(bytes32 puzzleId) external onlyOwner {
        puzzles[puzzleId].isActive = false;
        emit PuzzleDeactivated(puzzleId);
    }
    
    /**
     * @dev Get puzzle by ID
     */
    function getPuzzle(bytes32 puzzleId) external view returns (
        string memory content,
        PuzzleType puzzleType,
        RealityLayer layer,
        uint256 complexity,
        uint256 nftRequirement,
        uint256 unlockTime,
        bool communityRequired,
        bool isActive,
        uint256 solveCount
    ) {
        Puzzle storage puzzle = puzzles[puzzleId];
        return (
            puzzle.content,
            puzzle.puzzleType,
            puzzle.layer,
            puzzle.complexity,
            puzzle.nftRequirement,
            puzzle.unlockTime,
            puzzle.communityRequired,
            puzzle.isActive,
            puzzle.solveCount
        );
    }
    
    /**
     * @dev Get puzzles by layer
     */
    function getPuzzlesByLayer(RealityLayer layer) external view returns (bytes32[] memory) {
        return puzzlesByLayer[layer];
    }
    
    /**
     * @dev Get all puzzle IDs
     */
    function getAllPuzzles() external view returns (bytes32[] memory) {
        return allPuzzleIds;
    }
    
    /**
     * @dev Get solution info
     */
    function getSolution(bytes32 puzzleId, address solver) external view returns (
        uint256 timestamp,
        uint8 attemptCount,
        bool solved
    ) {
        Solution storage sol = solutions[puzzleId][solver];
        return (sol.timestamp, sol.attemptCount, sol.timestamp > 0);
    }
    
    /**
     * @dev Check if player has solved puzzle
     */
    function hasSolved(bytes32 puzzleId, address solver) external view returns (bool) {
        return solutions[puzzleId][solver].timestamp > 0;
    }
}
