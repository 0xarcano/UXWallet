// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

/// @title NitroSettlementAdapter
/// @notice Role-gated passthrough adapter for Nitro adjudicator/custody calls.
/// @dev Uses raw calldata to avoid hard-coding app-specific Nitro ABIs in MVP.
contract NitroSettlementAdapter is AccessControl {
    bytes32 public constant SETTLER_ROLE = keccak256("SETTLER_ROLE");
    bytes32 public constant ADAPTER_ADMIN_ROLE = keccak256("ADAPTER_ADMIN_ROLE");

    address public adjudicator;
    address public custody;

    event AdjudicatorUpdated(address indexed adjudicator);
    event CustodyUpdated(address indexed custody);
    event AdjudicatorCall(bytes4 indexed selector, bytes data, bytes response);
    event CustodyCall(bytes4 indexed selector, bytes data, bytes response);

    error InvalidAddress();
    error ExternalCallFailed(bytes returnData);

    constructor(address admin, address adjudicator_, address custody_) {
        if (admin == address(0) || adjudicator_ == address(0) || custody_ == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADAPTER_ADMIN_ROLE, admin);
        _grantRole(SETTLER_ROLE, admin);
        adjudicator = adjudicator_;
        custody = custody_;
    }

    function setAdjudicator(address adjudicator_) external onlyRole(ADAPTER_ADMIN_ROLE) {
        if (adjudicator_ == address(0)) revert InvalidAddress();
        adjudicator = adjudicator_;
        emit AdjudicatorUpdated(adjudicator_);
    }

    function setCustody(address custody_) external onlyRole(ADAPTER_ADMIN_ROLE) {
        if (custody_ == address(0)) revert InvalidAddress();
        custody = custody_;
        emit CustodyUpdated(custody_);
    }

    function callAdjudicator(bytes calldata data) external onlyRole(SETTLER_ROLE) returns (bytes memory response) {
        response = _call(adjudicator, data);
        emit AdjudicatorCall(_selector(data), data, response);
    }

    function callCustody(bytes calldata data) external onlyRole(SETTLER_ROLE) returns (bytes memory response) {
        response = _call(custody, data);
        emit CustodyCall(_selector(data), data, response);
    }

    function _call(address target, bytes calldata data) internal returns (bytes memory response) {
        (bool ok, bytes memory returnData) = target.call(data);
        if (!ok) revert ExternalCallFailed(returnData);
        return returnData;
    }

    function _selector(bytes calldata data) internal pure returns (bytes4 sig) {
        if (data.length < 4) {
            return bytes4(0);
        }
        sig = bytes4(data[:4]);
    }
}
