// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

/// @title CreditLedger
/// @notice Accounting ledger for solver credits and reward split (50% user, 50% treasury).
contract CreditLedger is AccessControl {
    bytes32 public constant ENGINE_ROLE = keccak256("ENGINE_ROLE");
    bytes32 public constant ROUTER_ROLE = keccak256("ROUTER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    struct IntentAccounting {
        address user;
        address asset;
        uint256 debt;
        uint256 rewardAmount;
        uint256 userReward;
        uint256 treasuryReward;
        bool registered;
    }

    mapping(bytes32 intentId => IntentAccounting accounting) public intents;
    mapping(address user => mapping(address asset => uint256 amount)) public userRewards;
    mapping(address asset => uint256 amount) public treasuryRewards;

    event IntentRegistered(
        bytes32 indexed intentId,
        address indexed user,
        address indexed asset,
        uint256 debt,
        uint256 rewardAmount,
        uint256 userReward,
        uint256 treasuryReward
    );
    event RouterRoleUpdated(address indexed router, bool enabled);
    event TreasuryRoleUpdated(address indexed treasury, bool enabled);
    event UserRewardConsumed(address indexed user, address indexed asset, uint256 amount, address indexed caller);
    event TreasuryRewardConsumed(address indexed asset, uint256 amount, address indexed caller);

    error InvalidAddress();
    error InvalidAmount();
    error IntentAlreadyRegistered();
    error InsufficientRewardBalance();

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ENGINE_ROLE, admin);
    }

    function setRouter(address router, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (router == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(ROUTER_ROLE, router);
        } else {
            _revokeRole(ROUTER_ROLE, router);
        }
        emit RouterRoleUpdated(router, enabled);
    }

    function setTreasuryRole(address treasury, bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (treasury == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(TREASURY_ROLE, treasury);
        } else {
            _revokeRole(TREASURY_ROLE, treasury);
        }
        emit TreasuryRoleUpdated(treasury, enabled);
    }

    function registerIntentAccounting(
        bytes32 intentId,
        address user,
        address asset,
        uint256 debt,
        uint256 rewardAmount
    ) external onlyRole(ENGINE_ROLE) {
        if (user == address(0) || asset == address(0)) revert InvalidAddress();
        if (debt == 0) revert InvalidAmount();
        if (intents[intentId].registered) revert IntentAlreadyRegistered();

        uint256 userReward = rewardAmount / 2;
        uint256 treasuryReward = rewardAmount - userReward;

        intents[intentId] = IntentAccounting({
            user: user,
            asset: asset,
            debt: debt,
            rewardAmount: rewardAmount,
            userReward: userReward,
            treasuryReward: treasuryReward,
            registered: true
        });

        if (userReward > 0) {
            userRewards[user][asset] += userReward;
        }
        if (treasuryReward > 0) {
            treasuryRewards[asset] += treasuryReward;
        }

        emit IntentRegistered(intentId, user, asset, debt, rewardAmount, userReward, treasuryReward);
    }

    function claimableUserReward(address user, address asset) external view returns (uint256) {
        return userRewards[user][asset];
    }

    function consumeUserReward(
        address user,
        address asset,
        uint256 amount
    ) external onlyRole(ROUTER_ROLE) {
        if (amount == 0) revert InvalidAmount();
        uint256 balance = userRewards[user][asset];
        if (balance < amount) revert InsufficientRewardBalance();
        unchecked {
            userRewards[user][asset] = balance - amount;
        }
        emit UserRewardConsumed(user, asset, amount, msg.sender);
    }

    function consumeTreasuryReward(address asset, uint256 amount) external onlyRole(TREASURY_ROLE) {
        if (amount == 0) revert InvalidAmount();
        uint256 balance = treasuryRewards[asset];
        if (balance < amount) revert InsufficientRewardBalance();
        unchecked {
            treasuryRewards[asset] = balance - amount;
        }
        emit TreasuryRewardConsumed(asset, amount, msg.sender);
    }
}
