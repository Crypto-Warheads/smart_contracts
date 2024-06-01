// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC6551Registry.sol";

/// @custom:security-contact contact@yashgoyal.dev
contract NFTWallet is ERC721, Ownable {
    uint256 private _nextTokenId;
    ERC6551Registry public registry;
    address public erc6551AccountImplementation;

    constructor(address initialOwner, ERC6551Registry _registry, address _erc6551AccountImplementation)
        ERC721("NFTWallet", "NW")
        Ownable(initialOwner)
    {
        registry = _registry;
        erc6551AccountImplementation = _erc6551AccountImplementation;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        registry.createAccount(
            erc6551AccountImplementation,
            block.chainid,
            address(this),
            tokenId,
            0,
            ""
        );
    }

    function getAccountAddress(uint256 tokenId) public view returns (address) {
        return registry.account(erc6551AccountImplementation, block.chainid, address(this), tokenId, 0);
    }
}