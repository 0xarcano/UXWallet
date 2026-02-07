// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/// @title LPVault
/// @notice Custody for user principal. Owner/admin cannot arbitrarily withdraw user funds.
contract LPVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant VAULT_ADMIN_ROLE = keccak256("VAULT_ADMIN_ROLE");
    bytes32 public constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    mapping(address user => mapping(address asset => uint256 amount)) public principalOf;
    mapping(address asset => uint256 amount) public totalPrincipalByAsset;

    event Deposited(address indexed user, address indexed asset, uint256 amount, address indexed receiver);
    event Withdrawn(address indexed user, address indexed asset, uint256 amount, address indexed recipient);
    event RouterWithdrawal(address indexed router, address indexed user, address indexed asset, uint256 amount, address recipient);
    event RouterRoleUpdated(address indexed router, bool enabled);

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientPrincipal();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VAULT_ADMIN_ROLE, admin);
    }

    function setRouter(address router, bool enabled) external onlyRole(VAULT_ADMIN_ROLE) {
        if (router == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(ROUTER_ROLE, router);
        } else {
            _revokeRole(ROUTER_ROLE, router);
        }
        emit RouterRoleUpdated(router, enabled);
    }

    function deposit(address asset, uint256 amount, address receiver) external nonReentrant {
        if (asset == address(0) || receiver == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        principalOf[receiver][asset] += amount;
        totalPrincipalByAsset[asset] += amount;

        emit Deposited(msg.sender, asset, amount, receiver);
    }

    function withdraw(address asset, uint256 amount, address recipient) external nonReentrant {
        _debitPrincipal(msg.sender, asset, amount);
        IERC20(asset).safeTransfer(recipient, amount);

        emit Withdrawn(msg.sender, asset, amount, recipient);
    }

    function withdrawFor(
        address user,
        address asset,
        uint256 amount,
        address recipient
    ) external nonReentrant onlyRole(ROUTER_ROLE) {
        _debitPrincipal(user, asset, amount);
        IERC20(asset).safeTransfer(recipient, amount);

        emit RouterWithdrawal(msg.sender, user, asset, amount, recipient);
    }

    function _debitPrincipal(address user, address asset, uint256 amount) internal {
        if (asset == address(0) || user == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        uint256 principal = principalOf[user][asset];
        if (principal < amount) revert InsufficientPrincipal();

        unchecked {
            principalOf[user][asset] = principal - amount;
            totalPrincipalByAsset[asset] -= amount;
        }
    }
}
