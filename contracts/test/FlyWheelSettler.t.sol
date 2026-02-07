// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

import {UXOriginSettler} from "../src/FlywheelSettler.sol";
import {SessionKeyRegistry} from "../src/onboard/SessionKeyRegistry.sol";
import {GaslessCrossChainOrder, OnchainCrossChainOrder, Output, ResolvedCrossChainOrder, FillInstruction} from "../src/erc7683/Structs.sol";

contract UXOriginSettlerTest is Test {
    UXOriginSettler private settler;
    SessionKeyRegistry private registry;

    uint256 private constant USER_PK = 0xA11CE;
    uint256 private constant SESSION_PK = 0xB0B;
    address private user = vm.addr(USER_PK);
    address private sessionKey = vm.addr(SESSION_PK);

    function setUp() public {
        settler = new UXOriginSettler(address(this), address(0));
        registry = new SessionKeyRegistry();
        settler.setSessionKeyRegistry(address(registry));
    }

    function testOpenMarksNonce() public {
        UXOriginSettler.UXDepositOrder memory uxOrder = _buildOrder(address(this));
        OnchainCrossChainOrder memory order = OnchainCrossChainOrder({
            fillDeadline: uint32(block.timestamp + 1 days),
            orderDataType: settler.ORDER_DATA_TYPE(),
            orderData: abi.encode(uxOrder)
        });

        bytes32 orderId = settler.open(order);

        assertTrue(settler.nonceUsed(address(this), uxOrder.nonce));
        assertTrue(orderId != bytes32(0));
    }

    function testResolveBuildsFillInstructions() public view {
        UXOriginSettler.UXDepositOrder memory uxOrder = _buildOrder(address(this));
        OnchainCrossChainOrder memory order = OnchainCrossChainOrder({
            fillDeadline: uint32(block.timestamp + 2 days),
            orderDataType: settler.ORDER_DATA_TYPE(),
            orderData: abi.encode(uxOrder)
        });

        bytes32 expectedOrderId = keccak256(
            abi.encode(address(settler), address(this), block.chainid, uxOrder.nonce, order.orderDataType, keccak256(order.orderData))
        );

        (address resolvedUser, uint256 originChainId, , uint32 fillDeadline, bytes32 orderId, Output[] memory maxSpent,,) =
            _unpack(settler.resolve(order, ""));

        assertEq(resolvedUser, address(this));
        assertEq(originChainId, block.chainid);
        assertEq(fillDeadline, order.fillDeadline);
        assertEq(maxSpent.length, uxOrder.outputs.length);
        assertEq(orderId, expectedOrderId);
    }

    function testOpenForAllowsSessionKeyWithinCap() public {
        _registerSessionKeyWithSig(user, USER_PK, sessionKey, address(0x1234), 4 ether);

        UXOriginSettler.UXDepositOrder memory uxOrder = _buildOrder(user);
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

        bytes memory signature = _signOrder(order, SESSION_PK);
        bytes32 orderId = settler.openFor(order, signature, "");

        assertTrue(orderId != bytes32(0));
        assertTrue(settler.nonceUsed(user, uxOrder.nonce));
    }

    function testOpenForRevertsWhenSessionKeyExceedsCap() public {
        _registerSessionKeyWithSig(user, USER_PK, sessionKey, address(0x1234), 2 ether);

        UXOriginSettler.UXDepositOrder memory uxOrder = _buildOrder(user);
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

        bytes memory signature = _signOrder(order, SESSION_PK);
        vm.expectRevert(UXOriginSettler.SpendCapExceeded.selector);
        settler.openFor(order, signature, "");
    }

    function _buildOrder(address userAddress) internal pure returns (UXOriginSettler.UXDepositOrder memory uxOrder) {
        Output[] memory outputs = new Output[](2);
        outputs[0] = Output({
            token: bytes32(uint256(uint160(address(0xBEEF)))),
            amount: 1 ether,
            recipient: bytes32(uint256(uint160(address(0xCAFE)))),
            chainId: 8453
        });
        outputs[1] = Output({
            token: bytes32(uint256(uint160(address(0xD00D)))),
            amount: 2 ether,
            recipient: bytes32(uint256(uint160(address(0xF00D)))),
            chainId: 42161
        });

        bytes[] memory destinationCallData = new bytes[](2);
        destinationCallData[0] = abi.encodePacked(uint8(1));
        destinationCallData[1] = abi.encodePacked(uint8(2));

        uxOrder = UXOriginSettler.UXDepositOrder({
            user: userAddress,
            inputToken: address(0x1234),
            inputAmount: 3 ether,
            outputs: outputs,
            destinationSettler: bytes32(uint256(uint160(address(0x2222)))),
            destinationCallData: destinationCallData,
            nonce: 1,
            lifiCalldata: ""
        });
    }

    function _registerSessionKeyWithSig(address owner, uint256 ownerPk, address key, address token, uint256 cap) internal {
        address[] memory tokens = new address[](1);
        tokens[0] = token;

        uint256[] memory caps = new uint256[](1);
        caps[0] = cap;

        uint64 expiresAt = uint64(block.timestamp + 7 days);
        uint256 nonce = registry.nonces(owner);
        uint256 deadline = block.timestamp + 1 days;
        SessionKeyRegistry.RegisterSessionKeyRequest memory request = SessionKeyRegistry.RegisterSessionKeyRequest({
            user: owner,
            sessionKey: key,
            expiresAt: expiresAt,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = registry.registerSessionKeyDigest(request, tokens, caps);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPk, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        registry.registerSessionKeyWithSig(request, tokens, caps, signature);
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

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(orderHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function _unpack(ResolvedCrossChainOrder memory resolved)
        internal
        pure
        returns (
            address resolvedUser,
            uint256 originChainId,
            uint32 openDeadline,
            uint32 fillDeadline,
            bytes32 orderId,
            Output[] memory maxSpent,
            Output[] memory minReceived,
            FillInstruction[] memory fillInstructions
        )
    {
        return (
            resolved.user,
            resolved.originChainId,
            resolved.openDeadline,
            resolved.fillDeadline,
            resolved.orderId,
            resolved.maxSpent,
            resolved.minReceived,
            resolved.fillInstructions
        );
    }
}
