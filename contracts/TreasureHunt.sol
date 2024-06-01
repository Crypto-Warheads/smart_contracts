// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
 
contract MyContract is ERC2771Context { 
    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) {}
    
    
    
    function versionRecipient() external pure returns (string memory) {
        return "1";
    }
}