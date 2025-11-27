// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CodexRegistry {
    event ArtifactRegistered(uint256 id, address owner, string uri);

    uint256 private _id;
    mapping(uint256 => string) public uriOf;

    function register(string calldata uri) external returns (uint256) {
        _id += 1;
        uriOf[_id] = uri;
        emit ArtifactRegistered(_id, msg.sender, uri);
        return _id;
    }
}
