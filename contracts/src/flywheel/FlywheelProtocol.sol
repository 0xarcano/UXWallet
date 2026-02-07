// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

import {SessionKeyRegistry} from "../onboard/SessionKeyRegistry.sol";
import {IntentSettler} from "../intents/IntentSettler.sol";
import {GaslessCrossChainOrder} from "../intents/erc7683/Structs.sol";
import {LPVault} from "./LPVault.sol";
import {TreasuryVault} from "./TreasuryVault.sol";
import {NitroSettlementAdapter} from "./NitroSettlementAdapter.sol";

/// @title FlywheelProtocol
/// @notice Facade contract coordinating deposits, session-key registration, solver fills and treasury actions.
/// @dev Underlying contracts must grant the required roles to this protocol contract.
contract FlywheelProtocol is AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant PROTOCOL_ADMIN_ROLE = keccak256("PROTOCOL_ADMIN_ROLE");
    bytes32 public constant SOLVER_ROLE = keccak256("SOLVER_ROLE");
    bytes32 public constant TREASURY_OPERATOR_ROLE = keccak256("TREASURY_OPERATOR_ROLE");

    SessionKeyRegistry public immutable sessionKeyRegistry;
    IntentSettler public immutable settler;
    LPVault public immutable lpVault;
    TreasuryVault public immutable treasuryVault;
    NitroSettlementAdapter public immutable nitroSettlementAdapter;
    mapping(address user => mapping(address asset => uint256 amount)) public pendingRewards;

    event SolverRoleUpdated(address indexed solver, bool enabled);
    event TreasuryOperatorUpdated(address indexed operator, bool enabled);
    event DelegatedToPool(address indexed user, address indexed asset, uint256 amount, address indexed receiver);
    event SessionKeyRegistered(address indexed user, address indexed sessionKey);
    event SessionKeyRevoked(address indexed user, address indexed sessionKey);
    event IntentFulfilled(bytes32 indexed intentId, address indexed solver, address indexed user);
    event TreasuryCredited(address indexed operator, address indexed asset, uint256 amount);
    event RewardsRegistered(
        address indexed operator,
        address indexed user,
        address indexed asset,
        uint256 totalReward,
        uint256 userShare,
        uint256 treasuryShare
    );
    event PrincipalWithdrawn(address indexed user, address indexed asset, uint256 amount, address indexed recipient);
    event RewardWithdrawn(address indexed user, address indexed asset, uint256 amount, address indexed recipient);
    event EmergencyWithdrawn(address indexed user, address indexed asset, uint256 amount, address indexed recipient);
    event TreasuryWithdrawn(address indexed operator, address indexed asset, uint256 amount, address indexed to);

    error InvalidAddress();
    error InvalidAmount();
    error InvalidSessionRequest();

    constructor(
        address admin,
        address sessionKeyRegistry_,
        address settler_,
        address lpVault_,
        address treasuryVault_,
        address nitroSettlementAdapter_
    ) {
        if (
            admin == address(0) ||
            sessionKeyRegistry_ == address(0) ||
            settler_ == address(0) ||
            lpVault_ == address(0) ||
            treasuryVault_ == address(0) ||
            nitroSettlementAdapter_ == address(0)
        ) revert InvalidAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PROTOCOL_ADMIN_ROLE, admin);

        sessionKeyRegistry = SessionKeyRegistry(sessionKeyRegistry_);
        settler = IntentSettler(settler_);
        lpVault = LPVault(lpVault_);
        treasuryVault = TreasuryVault(treasuryVault_);
        nitroSettlementAdapter = NitroSettlementAdapter(nitroSettlementAdapter_);
    }

    /// @notice Grant or revoke solver role. Solvers can fulfill intents and settle via Nitro.
    function setSolver(address solver, bool enabled) external onlyRole(PROTOCOL_ADMIN_ROLE) {
        if (solver == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(SOLVER_ROLE, solver);
        } else {
            _revokeRole(SOLVER_ROLE, solver);
        }
        emit SolverRoleUpdated(solver, enabled);
    }

    /// @notice Grant or revoke treasury operator role. Operators can credit/withdraw treasury funds.
    function setTreasuryOperator(address operator, bool enabled) external onlyRole(PROTOCOL_ADMIN_ROLE) {
        if (operator == address(0)) revert InvalidAddress();
        if (enabled) {
            _grantRole(TREASURY_OPERATOR_ROLE, operator);
        } else {
            _revokeRole(TREASURY_OPERATOR_ROLE, operator);
        }
        emit TreasuryOperatorUpdated(operator, enabled);
    }

    /// @notice Deposit assets to LPVault for delegation to the pool. User must approve tokens first.
    /// @dev Step 2 in onboarding: After approval, user deposits to LPVault.
    function delegateToPool(address asset, uint256 amount, address receiver) public {
        if (asset == address(0) || receiver == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        lpVault.depositFor(msg.sender, asset, amount, receiver);
        emit DelegatedToPool(msg.sender, asset, amount, receiver);
    }

    /// @notice Register a session key with EIP-712 signature. Grants solver permission to fulfill intents.
    /// @dev Step 3 in onboarding: App/relayer registers session key after user signs EIP-712 message.
    function registerSessionKeyWithSig(
        SessionKeyRegistry.RegisterSessionKeyRequest calldata req,
        address[] calldata tokens,
        uint256[] calldata caps,
        bytes calldata signature
    ) public {
        if (req.user == address(0) || req.sessionKey == address(0)) revert InvalidSessionRequest();
        sessionKeyRegistry.registerSessionKeyWithSig(req, tokens, caps, signature);
        emit SessionKeyRegistered(req.user, req.sessionKey);
    }

    /// @notice Revoke a previously registered session key.
    function revokeSessionKey(address sessionKey) external {
        sessionKeyRegistry.revokeSessionKey(sessionKey);
        emit SessionKeyRevoked(msg.sender, sessionKey);
    }

    /// @notice Combined deposit and session key registration in one transaction.
    /// @dev Convenience function for onboarding: delegate assets and register session key atomically.
    function delegateAndRegister(
        address asset,
        uint256 amount,
        address receiver,
        SessionKeyRegistry.RegisterSessionKeyRequest calldata req,
        address[] calldata tokens,
        uint256[] calldata caps,
        bytes calldata signature
    ) external {
        if (req.user != msg.sender) revert InvalidSessionRequest();
        delegateToPool(asset, amount, receiver);
        registerSessionKeyWithSig(req, tokens, caps, signature);
    }

    /// @notice Solver fulfills a cross-chain intent order. Opens the order in the settler.
    /// @dev Solver uses session key signature to fulfill intent on behalf of user.
    function fulfillIntent(
        GaslessCrossChainOrder calldata order,
        bytes calldata signature,
        bytes calldata originFillerData
    ) external onlyRole(SOLVER_ROLE) returns (bytes32 intentId) {
        intentId = settler.openFor(order, signature, originFillerData);
        emit IntentFulfilled(intentId, msg.sender, order.user);
    }

    /// @notice Solver calls Nitro Adjudicator to conclude channel state and finalize settlement.
    function settleViaAdjudicator(bytes calldata data) external onlyRole(SOLVER_ROLE) returns (bytes memory) {
        return nitroSettlementAdapter.callAdjudicator(data);
    }

    /// @notice Solver calls Nitro Custody contract to release funds to intent user.
    function settleViaCustody(bytes calldata data) external onlyRole(SOLVER_ROLE) returns (bytes memory) {
        return nitroSettlementAdapter.callCustody(data);
    }

    /// @notice Treasury operator credits treasury vault with rewards (50% of intent fulfillment rewards).
    /// @dev Transfers tokens from operator, approves treasury vault, then credits it.
    function creditTreasury(address asset, uint256 amount) external onlyRole(TREASURY_OPERATOR_ROLE) {
        if (asset == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        IERC20 token = IERC20(asset);
        token.safeTransferFrom(msg.sender, address(this), amount);
        token.forceApprove(address(treasuryVault), amount);
        treasuryVault.creditTreasury(asset, amount);
        token.forceApprove(address(treasuryVault), 0);

        emit TreasuryCredited(msg.sender, asset, amount);
    }

    /// @notice Register intent-fulfillment reward and split it 50/50 (user and treasury).
    /// @dev Pulls `totalReward` from operator and records user share for automatic payout on withdraw.
    function registerRewards(address user, address asset, uint256 totalReward) external onlyRole(TREASURY_OPERATOR_ROLE) {
        if (user == address(0) || asset == address(0)) revert InvalidAddress();
        if (totalReward == 0) revert InvalidAmount();

        uint256 userShare = totalReward / 2;
        uint256 treasuryShare = totalReward - userShare;
        IERC20 token = IERC20(asset);
        token.safeTransferFrom(msg.sender, address(this), totalReward);

        if (treasuryShare > 0) {
            token.forceApprove(address(treasuryVault), treasuryShare);
            treasuryVault.creditTreasury(asset, treasuryShare);
            token.forceApprove(address(treasuryVault), 0);
        }

        if (userShare > 0) {
            pendingRewards[user][asset] += userShare;
        }

        emit RewardsRegistered(msg.sender, user, asset, totalReward, userShare, treasuryShare);
    }

    /// @notice User withdraws principal and automatically receives any pending user rewards.
    function withdraw(address asset, uint256 amount, address recipient) public {
        if (asset == address(0) || recipient == address(0)) revert InvalidAddress();
        uint256 reward = pendingRewards[msg.sender][asset];
        if (amount == 0 && reward == 0) revert InvalidAmount();

        if (amount > 0) {
            lpVault.withdrawFor(msg.sender, asset, amount, recipient);
            emit PrincipalWithdrawn(msg.sender, asset, amount, recipient);
        }

        if (reward > 0) {
            pendingRewards[msg.sender][asset] = 0;
            IERC20(asset).safeTransfer(recipient, reward);
            emit RewardWithdrawn(msg.sender, asset, reward, recipient);
        }
    }

    /// @notice Backward-compatible alias for `withdraw`.
    function withdrawPrincipal(address asset, uint256 amount, address recipient) external {
        withdraw(asset, amount, recipient);
    }

    /// @notice Emergency withdraw: pulls full principal balance for a user/asset.
    function emergencyWithdrawAll(address asset, address recipient) external {
        if (asset == address(0) || recipient == address(0)) revert InvalidAddress();
        uint256 amount = lpVault.principalOf(msg.sender, asset);
        withdraw(asset, amount, recipient);
        emit EmergencyWithdrawn(msg.sender, asset, amount, recipient);
    }

    /// @notice Treasury operator withdraws treasury funds. Only treasury, never user funds.
    function withdrawTreasury(address asset, uint256 amount, address to) external onlyRole(TREASURY_OPERATOR_ROLE) {
        if (asset == address(0) || to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        treasuryVault.withdrawTreasury(asset, amount, to);
        emit TreasuryWithdrawn(msg.sender, asset, amount, to);
    }
}
