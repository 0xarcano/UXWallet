// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {LPVault} from "./LPVault.sol";

/// @title WithdrawalRouter
/// @notice User-facing withdrawal entrypoint. Rewards are tracked off-chain in the database.
contract WithdrawalRouter is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ROUTER_ADMIN_ROLE = keccak256("ROUTER_ADMIN_ROLE");

    LPVault public immutable lpVault;

    event WithdrawalProcessed(
        address indexed user,
        address indexed asset,
        uint256 principalAmount,
        address indexed recipient
    );

    error InvalidAddress();
    error InvalidAmount();
    error NothingToWithdraw();

    constructor(address admin, address lpVault_) {
        if (admin == address(0) || lpVault_ == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ROUTER_ADMIN_ROLE, admin);
        lpVault = LPVault(lpVault_);
    }

    function claimable(address user, address asset) external view returns (uint256 principal) {
        principal = lpVault.principalOf(user, asset);
    }

    function withdrawPrincipal(
        address asset,
        uint256 principalAmount,
        address recipient
    ) external nonReentrant {
        if (asset == address(0) || recipient == address(0)) revert InvalidAddress();
        if (principalAmount == 0) revert NothingToWithdraw();

        lpVault.withdrawFor(msg.sender, asset, principalAmount, recipient);
        emit WithdrawalProcessed(msg.sender, asset, principalAmount, recipient);
    }
}
