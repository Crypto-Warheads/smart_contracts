// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC6551Registry.sol";

/// @custom:security-contact contact@yashgoyal.dev
contract WarheadNft is ERC721, Ownable {
    ERC6551Registry public registry;
    address public erc6551AccountImplementation;

    constructor(address initialOwner, ERC6551Registry _registry, address _erc6551AccountImplementation)
        ERC721("WarheadNft", "WHN")
        Ownable(initialOwner)
    {
        registry = _registry;
        erc6551AccountImplementation = _erc6551AccountImplementation;
    }

    function assembleWarhead(address to, uint256 warheadId) public onlyOwner {
        _safeMint(to, warheadId);

        registry.createAccount(
            erc6551AccountImplementation,
            block.chainid,
            address(this),
            warheadId,
            0,
            ""
        );
    }

    function getWarheadAddress(uint256 warheadId) public view returns (address) {
        _requireOwned(warheadId);
        return registry.account(erc6551AccountImplementation, block.chainid, address(this), warheadId, 0);
    }
}