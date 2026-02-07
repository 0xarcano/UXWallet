// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

/// @title TreasuryVault
/// @notice Holds treasury-owned balances only. Intended for owner-managed liquidity and withdrawals.
contract TreasuryVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant TREASURY_ADMIN_ROLE = keccak256("TREASURY_ADMIN_ROLE");
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    mapping(address asset => uint256 amount) public treasuryBalance;

    event TreasuryCredited(address indexed from, address indexed asset, uint256 amount);
    event TreasuryWithdrawn(address indexed to, address indexed asset, uint256 amount);
    event RewardDistributorUpdated(address indexed distributor, bool enabled);

    error InvalidAddress();
    error InvalidAmount();
    error InsufficientBalance();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TREASURY_ADMIN_ROLE, admin);
    }

    function setRewardDistributor(address distributor, bool enabled) external onlyRole(TREASURY_ADMIN_ROLE) {
        if (distributor == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(REWARD_DISTRIBUTOR_ROLE, distributor);
        } else {
            _revokeRole(REWARD_DISTRIBUTOR_ROLE, distributor);
        }
        emit RewardDistributorUpdated(distributor, enabled);
    }

    function creditTreasury(address asset, uint256 amount) external nonReentrant onlyRole(REWARD_DISTRIBUTOR_ROLE) {
        if (asset == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        treasuryBalance[asset] += amount;
        emit TreasuryCredited(msg.sender, asset, amount);
    }

    function withdrawTreasury(address asset, uint256 amount, address to) external nonReentrant onlyRole(TREASURY_ADMIN_ROLE) {
        if (asset == address(0) || to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        uint256 balance = treasuryBalance[asset];
        if (balance < amount) revert InsufficientBalance();

        unchecked {
            treasuryBalance[asset] = balance - amount;
        }
        IERC20(asset).safeTransfer(to, amount);

        emit TreasuryWithdrawn(to, asset, amount);
    }
}
