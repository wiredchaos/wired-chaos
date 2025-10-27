// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Requires FHEVM libraries in your project:
//   npm i @zama-fhe/solidity
// And a gateway/TKMS running.
import "fhevm/lib/TFHE.sol";

/**
 * ConfidentialHookFHE
 * - Stores encrypted "hiddenCode" and "solved" flags per tokenId
 * - Allows holder-only async decrypt via FHE.requestDecryption
 */
contract ConfidentialHookFHE {
    using TFHE for euint256;
    using TFHE for ebool;

    address public immutable nft; // ERC-721 address for ownership checks

    mapping(uint256 => euint256) private hiddenCode;
    mapping(uint256 => ebool) private solved;

    event HiddenCodeSet(uint256 indexed tokenId);
    event Solved(uint256 indexed tokenId);
    event DecryptRequested(uint256 indexed tokenId, bytes32 requestId);

    constructor(address _nft) {
        nft = _nft;
    }

    function _ownerOf(uint256 tokenId) internal view returns (address) {
        (bool ok, bytes memory data) = nft.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", tokenId)
        );
        require(ok && data.length >= 32, "ownerOf failed");
        return abi.decode(data, (address));
    }

    /// @notice Set hidden code (encrypted input) — can be restricted to minter/owner via modifiers
    function setHiddenCode(uint256 tokenId, euint256 _cipher) external {
        // In practice add auth (onlyOwner/onlyMinter/etc.)
        hiddenCode[tokenId] = _cipher;
        emit HiddenCodeSet(tokenId);
    }

    /// @notice Submit an encrypted guess and mark solved if equals
    function submitGuess(uint256 tokenId, euint256 guess) external {
        // Compare entirely under encryption
        ebool isEq = TFHE.eq(hiddenCode[tokenId], guess);
        // Update solved: OR the new result with existing
        solved[tokenId] = TFHE.or(solved[tokenId], isEq);
        // Optional: emit event on success (cannot branch on encrypted value here)
    }

    /// @notice Holder-only async decrypt request for "solved" flag
    function requestSolvedDecrypt(uint256 tokenId) external returns (bytes32 reqId) {
        require(_ownerOf(tokenId) == msg.sender, "not holder");
        // Allow holder to read; in practice you may use allow() policies
        reqId = TFHE.requestDecryption(solved[tokenId], uint256(uint160(msg.sender)));
        emit DecryptRequested(tokenId, reqId);
    }
}
