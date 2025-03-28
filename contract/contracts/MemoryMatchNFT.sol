// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemoryMatchNFT is ERC1155, Ownable {
    uint256 public _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    function mintNFT(address to, string memory tokenURI) public returns (uint256) {
        _tokenIdCounter += 1;
        uint256 newTokenId = _tokenIdCounter;
        _mint(to, newTokenId, 1, "");
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        _tokenURIs[tokenId] = tokenURI;
    }
}