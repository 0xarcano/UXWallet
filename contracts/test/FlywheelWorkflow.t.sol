// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";

import {SessionKeyRegistry} from "../src/onboard/SessionKeyRegistry.sol";
import {UXOriginSettler} from "../src/FlywheelSettler.sol";
import {LPVault} from "../src/flywheel/LPVault.sol";
import {TreasuryVault} from "../src/flywheel/TreasuryVault.sol";
import {CreditLedger} from "../src/flywheel/CreditLedger.sol";
import {WithdrawalRouter} from "../src/flywheel/WithdrawalRouter.sol";
import {NitroSettlementAdapter} from "../src/flywheel/NitroSettlementAdapter.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {GaslessCrossChainOrder, Output} from "../src/erc7683/Structs.sol";

contract MockAdjudicator {
    bytes32 public lastChannelId;
    bytes32 public lastStateHash;
    uint256 public concludeCount;

    function conclude(bytes32 channelId, bytes32 stateHash) external returns (bool) {
        lastChannelId = channelId;
        lastStateHash = stateHash;
        concludeCount += 1;
        return true;
    }
}

contract MockCustody {
    address public lastRecipient;
    uint256 public lastAmount;
    uint256 public releaseCount;

    function release(address recipient, uint256 amount) external returns (bool) {
        lastRecipient = recipient;
        lastAmount = amount;
        releaseCount += 1;
        return true;
    }
}

contract FlywheelWorkflowTest is Test {
    uint256 private constant USER_PK = 0xA11CE;
    uint256 private constant SESSION_KEY_PK = 0xB0B;

    address private immutable user = vm.addr(USER_PK);
    address private immutable sessionKey = vm.addr(SESSION_KEY_PK);
    address private solver = vm.addr(0x5150);
    address private rewardFunder = vm.addr(0x7777);
    address private treasuryOperator = vm.addr(0x8888);
    address private treasuryRecipient = vm.addr(0x9999);

    uint256 private constant PRINCIPAL_AMOUNT = 100 ether;
    uint256 private constant INTENT_AMOUNT = 40 ether;
    uint256 private constant REWARD_AMOUNT = 10 ether;
    uint256 private constant USER_REWARD = 5 ether;
    uint256 private constant TREASURY_REWARD = 5 ether;

    SessionKeyRegistry private registry;
    UXOriginSettler private settler;
    LPVault private lpVault;
    TreasuryVault private treasuryVault;
    CreditLedger private ledger;
    WithdrawalRouter private withdrawalRouter;
    NitroSettlementAdapter private nitroAdapter;

    MockERC20 private token;
    MockAdjudicator private adjudicator;
    MockCustody private custody;

    function setUp() public {
        token = new MockERC20("Mock Liquidity", "mLQ");
        registry = new SessionKeyRegistry();
        settler = new UXOriginSettler(address(this), address(0));
        settler.setSessionKeyRegistry(address(registry));

        lpVault = new LPVault(address(this));
        treasuryVault = new TreasuryVault(address(this));
        ledger = new CreditLedger(address(this));
        withdrawalRouter = new WithdrawalRouter(address(this), address(lpVault), address(ledger));

        adjudicator = new MockAdjudicator();
        custody = new MockCustody();
        nitroAdapter = new NitroSettlementAdapter(address(this), address(adjudicator), address(custody));

        lpVault.setRouter(address(withdrawalRouter), true);
        ledger.setRouter(address(withdrawalRouter), true);
        ledger.setTreasuryRole(treasuryOperator, true);
        withdrawalRouter.setRewardFunder(rewardFunder, true);
        treasuryVault.setRewardDistributor(treasuryOperator, true);
        ledger.grantRole(ledger.ENGINE_ROLE(), solver);
        nitroAdapter.grantRole(nitroAdapter.SETTLER_ROLE(), solver);

        token.mint(user, 1_000 ether);
        token.mint(rewardFunder, 100 ether);
        token.mint(treasuryOperator, 100 ether);
    }

    function testSolverAndRegister() public {
        _step1DepositAndDelegate();
        bytes32 intentId = _step2FulfillIntentAndRegisterAccounting();
        _step2SettleTreasuryAndNitro(intentId);
        _step3WithdrawAndDistribute();
    }

    function _step1DepositAndDelegate() internal {
        vm.startPrank(user);
        token.approve(address(lpVault), PRINCIPAL_AMOUNT);
        lpVault.deposit(address(token), PRINCIPAL_AMOUNT, user);
        vm.stopPrank();

        assertEq(lpVault.principalOf(user, address(token)), PRINCIPAL_AMOUNT);

        _registerSessionKeyWithSig(user, sessionKey, address(token), 50 ether);
        assertTrue(registry.isSessionKeyActive(user, sessionKey));
        assertEq(registry.getCap(user, sessionKey, address(token)), 50 ether);
    }

    function _step2FulfillIntentAndRegisterAccounting() internal returns (bytes32 intentId) {
        UXOriginSettler.UXDepositOrder memory uxOrder = _buildUxOrder(user, INTENT_AMOUNT);
        GaslessCrossChainOrder memory order = GaslessCrossChainOrder({
            originSettler: address(settler),
            user: user,
            nonce: uxOrder.nonce,
            originChainId: block.chainid,
            openDeadline: uint32(block.timestamp + 1 days),
            fillDeadline: uint32(block.timestamp + 1 days),
            orderDataType: settler.ORDER_DATA_TYPE(),
            orderData: abi.encode(uxOrder)
        });

        bytes memory sessionSig = _signOrder(order, SESSION_KEY_PK);
        vm.prank(solver);
        intentId = settler.openFor(order, sessionSig, "");

        assertTrue(settler.nonceUsed(user, uxOrder.nonce));

        vm.prank(solver);
        ledger.registerIntentAccounting(intentId, user, address(token), INTENT_AMOUNT, REWARD_AMOUNT);

        assertEq(ledger.userRewards(user, address(token)), USER_REWARD);
        assertEq(ledger.treasuryRewards(address(token)), TREASURY_REWARD);
    }

    function _step2SettleTreasuryAndNitro(bytes32) internal {
        vm.startPrank(treasuryOperator);
        ledger.consumeTreasuryReward(address(token), TREASURY_REWARD);
        token.approve(address(treasuryVault), TREASURY_REWARD);
        treasuryVault.creditTreasury(address(token), TREASURY_REWARD);
        vm.stopPrank();

        assertEq(treasuryVault.treasuryBalance(address(token)), TREASURY_REWARD);
        assertEq(ledger.treasuryRewards(address(token)), 0);

        bytes32 channelId = keccak256("channel-1");
        bytes32 stateHash = keccak256("final-state");
        bytes memory concludeCall = abi.encodeCall(MockAdjudicator.conclude, (channelId, stateHash));
        bytes memory releaseCall = abi.encodeCall(MockCustody.release, (user, INTENT_AMOUNT));

        vm.prank(solver);
        nitroAdapter.callAdjudicator(concludeCall);
        vm.prank(solver);
        nitroAdapter.callCustody(releaseCall);

        assertEq(adjudicator.concludeCount(), 1);
        assertEq(adjudicator.lastChannelId(), channelId);
        assertEq(adjudicator.lastStateHash(), stateHash);
        assertEq(custody.releaseCount(), 1);
        assertEq(custody.lastRecipient(), user);
        assertEq(custody.lastAmount(), INTENT_AMOUNT);
    }

    function _step3WithdrawAndDistribute() internal {
        vm.prank(rewardFunder);
        token.approve(address(withdrawalRouter), USER_REWARD);
        vm.prank(rewardFunder);
        withdrawalRouter.fundRewards(address(token), USER_REWARD);

        uint256 userBalanceBefore = token.balanceOf(user);
        vm.prank(user);
        withdrawalRouter.withdrawPrincipalAndRewards(address(token), PRINCIPAL_AMOUNT, USER_REWARD, user);

        assertEq(lpVault.principalOf(user, address(token)), 0);
        assertEq(ledger.userRewards(user, address(token)), 0);
        assertEq(token.balanceOf(user), userBalanceBefore + PRINCIPAL_AMOUNT + USER_REWARD);

        uint256 treasuryRecipientBefore = token.balanceOf(treasuryRecipient);
        treasuryVault.withdrawTreasury(address(token), TREASURY_REWARD, treasuryRecipient);
        assertEq(token.balanceOf(treasuryRecipient), treasuryRecipientBefore + TREASURY_REWARD);

        vm.expectRevert();
        lpVault.withdrawFor(user, address(token), 1 ether, treasuryRecipient);
    }

    function _registerSessionKeyWithSig(
        address owner,
        address key,
        address spendToken,
        uint256 cap
    ) internal {
        address[] memory tokens = new address[](1);
        tokens[0] = spendToken;

        uint256[] memory caps = new uint256[](1);
        caps[0] = cap;

        SessionKeyRegistry.RegisterSessionKeyRequest memory request = SessionKeyRegistry.RegisterSessionKeyRequest({
            user: owner,
            sessionKey: key,
            expiresAt: uint64(block.timestamp + 7 days),
            nonce: registry.nonces(owner),
            deadline: block.timestamp + 1 days
        });

        bytes32 digest = registry.registerSessionKeyDigest(request, tokens, caps);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(solver);
        registry.registerSessionKeyWithSig(request, tokens, caps, signature);
    }

    function _buildUxOrder(address user_, uint256 amount) internal view returns (UXOriginSettler.UXDepositOrder memory uxOrder) {
        Output[] memory outputs = new Output[](1);
        outputs[0] = Output({
            token: _toBytes32(address(token)),
            amount: amount,
            recipient: _toBytes32(user_),
            chainId: block.chainid
        });

        bytes[] memory destinationCallData = new bytes[](1);
        destinationCallData[0] = "";

        uxOrder = UXOriginSettler.UXDepositOrder({
            user: user_,
            inputToken: address(token),
            inputAmount: amount,
            outputs: outputs,
            destinationSettler: _toBytes32(address(0xBEEF)),
            destinationCallData: destinationCallData,
            nonce: 1,
            lifiCalldata: ""
        });
    }

    function _signOrder(GaslessCrossChainOrder memory order, uint256 signerPk) internal pure returns (bytes memory) {
        bytes32 orderHash = keccak256(
            abi.encode(
                order.originSettler,
                order.user,
                order.nonce,
                order.originChainId,
                order.openDeadline,
                order.fillDeadline,
                order.orderDataType,
                keccak256(order.orderData)
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", orderHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _toBytes32(address a) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(a)));
    }
}
