// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @custom:security-contact contact@yashgoyal.dev
contract MyContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("CHECKPOINTER_ROLE");

    struct Checkpoint {
        int256 lat;
        int256 long;
    }

    mapping(address => mapping(uint256 => Checkpoint)) public checkpoints;

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function addCheckpoint(address user, uint256 id, int256 lat, int256 long) public onlyRole(MINTER_ROLE) {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        checkpoints[user][id] = Checkpoint(lat, long);
    }
}
