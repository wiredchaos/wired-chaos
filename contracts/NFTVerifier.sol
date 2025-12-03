// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTVerifier
 * @dev Verify VRG33589 NFT ownership and calculate credit bonuses
 * @author WIRED CHAOS Development Team
 * 
 * IMPORTANT: This is a REFERENCE IMPLEMENTATION for EVM chains.
 * VRG33589 NFTs exist on XRPL. Actual implementation queries XRPL
 * using the `account_nfts` command. See frontend/src/game/wallet-connector.js
 */
contract NFTVerifier is Ownable {
    
    // NFT rarity tiers
    enum Rarity { COMMON, RARE, EPIC, LEGENDARY }
    
    // VRG33589 NFT contract address
    address public vrgNFTContract;
    
    // Rarity multipliers
    mapping(Rarity => uint256) public rarityMultipliers;
    
    // Token ID to rarity mapping
    mapping(uint256 => Rarity) public tokenRarity;
    
    // Events
    event NFTContractSet(address indexed nftContract);
    event TokenRaritySet(uint256 indexed tokenId, Rarity rarity);
    
    constructor() {
        // Set default multipliers
        rarityMultipliers[Rarity.COMMON] = 1;
        rarityMultipliers[Rarity.RARE] = 2;
        rarityMultipliers[Rarity.EPIC] = 5;
        rarityMultipliers[Rarity.LEGENDARY] = 10;
    }
    
    /**
     * @dev Set the VRG33589 NFT contract address
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address");
        vrgNFTContract = _nftContract;
        emit NFTContractSet(_nftContract);
    }
    
    /**
     * @dev Set rarity for a token ID
     */
    function setTokenRarity(uint256 tokenId, Rarity rarity) external onlyOwner {
        tokenRarity[tokenId] = rarity;
        emit TokenRaritySet(tokenId, rarity);
    }
    
    /**
     * @dev Batch set rarities
     */
    function batchSetRarity(
        uint256[] memory tokenIds,
        Rarity[] memory rarities
    ) external onlyOwner {
        require(tokenIds.length == rarities.length, "Length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenRarity[tokenIds[i]] = rarities[i];
            emit TokenRaritySet(tokenIds[i], rarities[i]);
        }
    }
    
    /**
     * @dev Verify if address owns any VRG33589 NFTs
     */
    function ownsNFT(address owner) external view returns (bool) {
        if (vrgNFTContract == address(0)) return false;
        
        IERC721 nft = IERC721(vrgNFTContract);
        return nft.balanceOf(owner) > 0;
    }
    
    /**
     * @dev Get total NFT count for address
     */
    function getNFTCount(address owner) external view returns (uint256) {
        if (vrgNFTContract == address(0)) return 0;
        
        IERC721 nft = IERC721(vrgNFTContract);
        return nft.balanceOf(owner);
    }
    
    /**
     * @dev Calculate daily credits based on NFT holdings
     */
    function calculateDailyCredits(address owner) external view returns (uint256) {
        if (vrgNFTContract == address(0)) return 1; // Base credit
        
        IERC721 nft = IERC721(vrgNFTContract);
        uint256 balance = nft.balanceOf(owner);
        
        if (balance == 0) return 1; // Base credit for visitors
        
        // Simplified calculation - in production would enumerate tokens
        // and check each rarity
        uint256 credits = balance; // 1 credit per NFT minimum
        
        // Could add collection bonuses here
        if (balance >= 5) {
            credits += 2; // Small collection bonus
        }
        if (balance >= 10) {
            credits += 5; // Large collection bonus
        }
        
        return credits;
    }
    
    /**
     * @dev Check if address holds legendary NFT
     */
    function hasLegendary(address owner) external view returns (bool) {
        // Simplified - production would check owned token IDs
        return false; // Placeholder
    }
    
    /**
     * @dev Update rarity multiplier
     */
    function setRarityMultiplier(Rarity rarity, uint256 multiplier) external onlyOwner {
        require(multiplier > 0, "Invalid multiplier");
        rarityMultipliers[rarity] = multiplier;
    }
}
