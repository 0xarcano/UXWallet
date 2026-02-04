// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/access/AccessControl.sol";

contract LifiAdapter is AccessControl {
    bytes32 public constant SETTLER_ROLE = keccak256("SETTLER_ROLE");

    address public lifiInputSettler;

    error LifiCallFailed();

    constructor(address admin, address lifiInputSettler_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SETTLER_ROLE, admin);
        lifiInputSettler = lifiInputSettler_;
    }

    function setLifiInputSettler(address lifiInputSettler_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lifiInputSettler = lifiInputSettler_;
    }

    function submit(bytes calldata lifiCalldata) external onlyRole(SETTLER_ROLE) returns (bytes memory result) {
        (bool ok, bytes memory data) = lifiInputSettler.call(lifiCalldata);
        if (!ok) {
            revert LifiCallFailed();
        }
        return data;
    }
}
