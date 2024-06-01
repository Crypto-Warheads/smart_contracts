// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "./WarheadNft.sol";

/// @custom:security-contact contact@yashgoyal.dev
contract WarheadFactory is ERC2771Context, IERC721Receiver { 
    struct Coord {
        int256 lat;
        int256 long;
    }

    struct WarheadObject {
        address dropper;
        bool isLaunched;
        Coord target;
        uint256 impactTime;
        address claimer;
        bool isClaimed;
        uint256 claimedAt;
    }

    mapping(uint256 => WarheadObject) internal _warheads;
    uint256 totalWarheads = 0;
    WarheadNft public warheadNft;

    event WarheadCreated(uint256 warheadId, address dropper);
    event WarheadDropped(uint256 warheadId, Coord target, uint256 impactTime);
    event WarheadClaimed(uint256 warheadId, address claimer, uint256 claimedAt);

    modifier checkWarhead(uint256 warheadId) {
        require(warheadId < totalWarheads, "Warhead does not exist");
        require(_warheads[warheadId].isLaunched, "Warhead is not yet launched");
        require(!_warheads[warheadId].isClaimed, "Warhead is already claimed");       
        require(_warheads[warheadId].impactTime < block.timestamp, "Warhead has not landed yet");
        _;
    }
    
    constructor(address _trustedForwarder, WarheadNft _warheadNft) ERC2771Context(_trustedForwarder) {
        warheadNft = _warheadNft;
    }
    
    function versionRecipient() external pure returns (string memory) {
        return "1";
    }

    function createWarhead() external {
        uint256 warheadId = totalWarheads++;

        warheadNft.assembleWarhead(address(this), warheadId);

        _warheads[warheadId] = WarheadObject({
            dropper: _msgSender(),
            isLaunched: false,
            target: Coord(0, 0),
            impactTime: 0,
            claimer: address(0),
            isClaimed: false,
            claimedAt: 0
        });

        emit WarheadCreated(warheadId, _msgSender());
    }

    function dropWarhead(uint256 warheadId, Coord memory coord, uint256 impactTime) external {
        require(warheadId < totalWarheads, "Warhead does not exist");
        require(_warheads[warheadId].dropper == _msgSender(), "Cannot drop someone else's warhead");
        require(!_warheads[warheadId].isLaunched, "Warhead is already launched");
        require(impactTime > block.timestamp, "Impact time should be in the future");

        WarheadObject storage s_warhead = _warheads[warheadId];
        s_warhead.isLaunched = true;
        s_warhead.target = coord;
        s_warhead.impactTime = impactTime;

        emit WarheadDropped(warheadId, coord, impactTime);
    }

    function claim(Coord calldata location, uint256 warheadId) external checkWarhead(warheadId) {
        WarheadObject memory warhead = _warheads[warheadId];
        require(warhead.dropper != _msgSender(), "Cannot claim your own warhead");

        uint256 distance = _distance(warhead.target, location);
        require(distance <= 400, "Location is too far from target"); 

        WarheadObject storage s_warhead = _warheads[warheadId];
        s_warhead.claimer = _msgSender();
        s_warhead.isClaimed = true;
        s_warhead.claimedAt = block.timestamp;

        // transfer the warhead nft to the claimer
        warheadNft.safeTransferFrom(address(this), _msgSender(), warheadId);
        
        emit WarheadClaimed(warheadId, _msgSender(), block.timestamp);
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _distance(Coord memory coord1, Coord memory coord2) internal pure returns (uint256) {
        return sqrt(uint256((coord1.lat - coord2.lat) ** 2 + (coord1.long - coord2.long) ** 2));
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function fetchWarheadInfo(uint256 warheadId) public view returns (WarheadObject memory) {
        require(warheadId < totalWarheads, "Warhead does not exist");
        return _warheads[warheadId];
    }
}
