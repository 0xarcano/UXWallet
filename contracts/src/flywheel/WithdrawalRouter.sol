// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

import {LPVault} from "./LPVault.sol";
import {CreditLedger} from "./CreditLedger.sol";

/// @title WithdrawalRouter
/// @notice User-facing withdrawal + reward claim entrypoint.
contract WithdrawalRouter is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ROUTER_ADMIN_ROLE = keccak256("ROUTER_ADMIN_ROLE");
    bytes32 public constant REWARD_FUNDER_ROLE = keccak256("REWARD_FUNDER_ROLE");

    LPVault public immutable lpVault;
    CreditLedger public immutable creditLedger;

    event RewardsFunded(address indexed from, address indexed asset, uint256 amount);
    event WithdrawalProcessed(
        address indexed user,
        address indexed asset,
        uint256 principalAmount,
        uint256 rewardAmount,
        address indexed recipient
    );
    event RewardFunderUpdated(address indexed funder, bool enabled);

    error InvalidAddress();
    error InvalidAmount();
    error NothingToWithdraw();

    constructor(address admin, address lpVault_, address creditLedger_) {
        if (admin == address(0) || lpVault_ == address(0) || creditLedger_ == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ROUTER_ADMIN_ROLE, admin);
        lpVault = LPVault(lpVault_);
        creditLedger = CreditLedger(creditLedger_);
    }

    function setRewardFunder(address funder, bool enabled) external onlyRole(ROUTER_ADMIN_ROLE) {
        if (funder == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(REWARD_FUNDER_ROLE, funder);
        } else {
            _revokeRole(REWARD_FUNDER_ROLE, funder);
        }
        emit RewardFunderUpdated(funder, enabled);
    }

    function fundRewards(address asset, uint256 amount) external nonReentrant onlyRole(REWARD_FUNDER_ROLE) {
        if (asset == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsFunded(msg.sender, asset, amount);
    }

    function claimable(address user, address asset) external view returns (uint256 principal, uint256 rewards) {
        principal = lpVault.principalOf(user, asset);
        rewards = creditLedger.userRewards(user, asset);
    }

    function withdrawPrincipalAndRewards(
        address asset,
        uint256 principalAmount,
        uint256 rewardAmount,
        address recipient
    ) external nonReentrant {
        if (asset == address(0) || recipient == address(0)) revert InvalidAddress();
        if (principalAmount == 0 && rewardAmount == 0) revert NothingToWithdraw();

        if (principalAmount > 0) {
            lpVault.withdrawFor(msg.sender, asset, principalAmount, recipient);
        }

        if (rewardAmount > 0) {
            creditLedger.consumeUserReward(msg.sender, asset, rewardAmount);
            IERC20(asset).safeTransfer(recipient, rewardAmount);
        }

        emit WithdrawalProcessed(msg.sender, asset, principalAmount, rewardAmount, recipient);
    }
}
