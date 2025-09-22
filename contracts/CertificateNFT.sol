// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CertificateNFT
 * @dev WIRED CHAOS NEUROLAB ACADEMY - NFT Certificate Contract
 * @author WIRED CHAOS Development Team
 * 
 * Features:
 * - ERC721 compliant NFT certificates
 * - Soulbound tokens (non-transferable after mint)
 * - Metadata stored on IPFS
 * - Batch minting for institutions
 * - Certificate verification
 * - Owner-controlled minting
 */
contract CertificateNFT is 
    ERC721, 
    ERC721URIStorage, 
    ERC721Enumerable, 
    Ownable, 
    ReentrancyGuard 
{
    using Counters for Counters.Counter;

    // State variables
    Counters.Counter private _tokenIdCounter;
    
    // Academy information
    string public academyName;
    string public academyUrl;
    
    // Certificate tracking
    mapping(uint256 => bool) public isSoulbound;
    mapping(address => uint256[]) public studentCertificates;
    mapping(string => uint256) public courseToTokenId;
    
    // Events
    event CertificateMinted(
        address indexed student,
        uint256 indexed tokenId,
        string courseId,
        string courseName,
        string metadataURI
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId,
        string reason
    );

    /**
     * @dev Constructor
     * @param _academyName Name of the issuing academy
     * @param _academyUrl URL of the academy website
     */
    constructor(
        string memory _academyName,
        string memory _academyUrl
    ) ERC721("WIRED CHAOS Certificate", "WCC") {
        academyName = _academyName;
        academyUrl = _academyUrl;
        
        // Start token IDs at 1
        _tokenIdCounter.increment();
    }

    /**
     * @dev Mint certificate to student
     * @param to Student wallet address
     * @param tokenURI IPFS URI for certificate metadata
     * @param courseId Unique course identifier
     * @param soulbound Whether certificate is transferable
     */
    function mintTo(
        address to,
        string memory tokenURI,
        string memory courseId,
        bool soulbound
    ) public onlyOwner nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint the token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Set soulbound status
        if (soulbound) {
            isSoulbound[tokenId] = true;
        }
        
        // Track student certificates
        studentCertificates[to].push(tokenId);
        courseToTokenId[courseId] = tokenId;
        
        emit CertificateMinted(to, tokenId, courseId, "", tokenURI);
        
        return tokenId;
    }

    /**
     * @dev Batch mint certificates to multiple students
     * @param recipients Array of student addresses
     * @param tokenURIs Array of IPFS URIs
     * @param courseIds Array of course identifiers
     * @param soulbound Whether certificates are transferable
     */
    function batchMintTo(
        address[] memory recipients,
        string[] memory tokenURIs,
        string[] memory courseIds,
        bool soulbound
    ) public onlyOwner nonReentrant {
        require(
            recipients.length == tokenURIs.length && 
            recipients.length == courseIds.length,
            "Array lengths must match"
        );
        require(recipients.length <= 100, "Cannot mint more than 100 at once");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mintTo(recipients[i], tokenURIs[i], courseIds[i], soulbound);
        }
    }

    /**
     * @dev Revoke certificate (emergency use only)
     * @param tokenId Token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeCertificate(
        uint256 tokenId, 
        string memory reason
    ) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        // Burn the token
        _burn(tokenId);
        
        emit CertificateRevoked(tokenId, reason);
    }

    /**
     * @dev Get all certificates owned by a student
     * @param student Student address
     * @return Array of token IDs
     */
    function getCertificatesByStudent(address student) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificates[student];
    }

    /**
     * @dev Check if certificate exists for course
     * @param courseId Course identifier
     * @return tokenId Token ID (0 if not found)
     */
    function getCertificateByCourse(string memory courseId) 
        public 
        view 
        returns (uint256) 
    {
        return courseToTokenId[courseId];
    }

    /**
     * @dev Verify certificate authenticity
     * @param tokenId Token ID to verify
     * @return isValid Whether certificate is valid
     * @return owner Certificate owner
     * @return tokenURI Metadata URI
     */
    function verifyCertificate(uint256 tokenId) 
        public 
        view 
        returns (bool isValid, address owner, string memory tokenURI) 
    {
        if (_exists(tokenId)) {
            return (true, ownerOf(tokenId), tokenURI(tokenId));
        }
        return (false, address(0), "");
    }

    /**
     * @dev Get total number of certificates issued
     */
    function totalCertificates() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Override transfer functions for soulbound tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(!isSoulbound[tokenId], "Soulbound token cannot be transferred");
        }
        
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Update academy information (owner only)
     */
    function updateAcademyInfo(
        string memory _academyName,
        string memory _academyUrl
    ) public onlyOwner {
        academyName = _academyName;
        academyUrl = _academyUrl;
    }

    /**
     * @dev Emergency pause (inherited from Ownable)
     * Note: Consider adding Pausable if needed
     */
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Install dependencies:
 *    npm install @openzeppelin/contracts
 * 
 * 2. Deploy to Sepolia testnet:
 *    npx hardhat run scripts/deploy.js --network sepolia
 * 
 * 3. Verify on Etherscan:
 *    npx hardhat verify --network sepolia DEPLOYED_ADDRESS "WIRED CHAOS NEUROLAB ACADEMY" "https://wiredchaos.xyz/neurolab"
 * 
 * 4. Update .env with contract address:
 *    CERT_ETH_CONTRACT=0xYOUR_DEPLOYED_ADDRESS
 * 
 * Example deploy script (scripts/deploy.js):
 * 
 * const { ethers } = require("hardhat");
 * 
 * async function main() {
 *   const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
 *   const cert = await CertificateNFT.deploy(
 *     "WIRED CHAOS NEUROLAB ACADEMY",
 *     "https://wiredchaos.xyz/neurolab"
 *   );
 *   
 *   await cert.deployed();
 *   console.log("CertificateNFT deployed to:", cert.address);
 * }
 * 
 * main().catch((error) => {
 *   console.error(error);
 *   process.exitCode = 1;
 * });
 */