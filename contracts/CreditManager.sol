// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CreditManager
 * @dev Manage prompt credits with expiration and streaming
 * @author WIRED CHAOS Development Team
 */
contract CreditManager is Ownable, ReentrancyGuard {
    
    // Credit expiration time (7 days)
    uint256 public constant CREDIT_EXPIRY = 7 days;
    
    struct CreditBalance {
        uint256 amount;
        uint256 lastUpdate;
        uint256 streamRate;     // Credits per day for legendary holders
        bool hasLegendary;      // Permanent credit stream
    }
    
    // Player balances
    mapping(address => CreditBalance) public balances;
    
    // Credit usage tracking
    mapping(address => uint256) public totalCreditsEarned;
    mapping(address => uint256) public totalCreditsSpent;
    
    // Events
    event CreditsAdded(address indexed player, uint256 amount);
    event CreditsSpent(address indexed player, uint256 amount);
    event CreditsExpired(address indexed player, uint256 amount);
    event StreamRateSet(address indexed player, uint256 rate);
    
    /**
     * @dev Add credits to player balance
     */
    function addCredits(address player, uint256 amount) external onlyOwner {
        _updateBalance(player);
        balances[player].amount += amount;
        totalCreditsEarned[player] += amount;
        emit CreditsAdded(player, amount);
    }
    
    /**
     * @dev Spend credits
     */
    function spendCredits(address player, uint256 amount) external onlyOwner {
        _updateBalance(player);
        require(balances[player].amount >= amount, "Insufficient credits");
        
        balances[player].amount -= amount;
        totalCreditsSpent[player] += amount;
        emit CreditsSpent(player, amount);
    }
    
    /**
     * @dev Set streaming rate for legendary holders
     */
    function setStreamRate(address player, uint256 ratePerDay, bool legendary) external onlyOwner {
        _updateBalance(player);
        balances[player].streamRate = ratePerDay;
        balances[player].hasLegendary = legendary;
        emit StreamRateSet(player, ratePerDay);
    }
    
    /**
     * @dev Update balance with streaming and expiration
     */
    function _updateBalance(address player) internal {
        CreditBalance storage balance = balances[player];
        
        if (balance.lastUpdate == 0) {
            balance.lastUpdate = block.timestamp;
            return;
        }
        
        uint256 timePassed = block.timestamp - balance.lastUpdate;
        
        // Add streamed credits for legendary holders
        if (balance.hasLegendary && balance.streamRate > 0) {
            uint256 streamed = (balance.streamRate * timePassed) / 1 days;
            balance.amount += streamed;
            totalCreditsEarned[player] += streamed;
        }
        
        // Check for expiration (non-legendary only)
        if (!balance.hasLegendary && timePassed > CREDIT_EXPIRY) {
            uint256 expired = balance.amount;
            balance.amount = 0;
            emit CreditsExpired(player, expired);
        }
        
        balance.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Get current balance (including pending streams)
     */
    function getBalance(address player) external view returns (uint256) {
        CreditBalance storage balance = balances[player];
        uint256 current = balance.amount;
        
        if (balance.lastUpdate > 0) {
            uint256 timePassed = block.timestamp - balance.lastUpdate;
            
            // Add pending streamed credits
            if (balance.hasLegendary && balance.streamRate > 0) {
                uint256 streamed = (balance.streamRate * timePassed) / 1 days;
                current += streamed;
            }
            
            // Check if expired
            if (!balance.hasLegendary && timePassed > CREDIT_EXPIRY) {
                current = 0;
            }
        }
        
        return current;
    }
    
    /**
     * @dev Get detailed balance info
     */
    function getBalanceInfo(address player) external view returns (
        uint256 amount,
        uint256 streamRate,
        bool hasLegendary,
        uint256 lastUpdate,
        uint256 timeToExpiry
    ) {
        CreditBalance storage balance = balances[player];
        uint256 timeToExpiry_ = 0;
        
        if (balance.lastUpdate > 0 && !balance.hasLegendary) {
            uint256 timePassed = block.timestamp - balance.lastUpdate;
            if (timePassed < CREDIT_EXPIRY) {
                timeToExpiry_ = CREDIT_EXPIRY - timePassed;
            }
        }
        
        return (
            balance.amount,
            balance.streamRate,
            balance.hasLegendary,
            balance.lastUpdate,
            timeToExpiry_
        );
    }
}
