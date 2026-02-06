// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";

import {UXOriginSettler} from "../src/UXOriginSettler.sol";
import {OnchainCrossChainOrder, Output, ResolvedCrossChainOrder, FillInstruction} from "../src/erc7683/Structs.sol";

contract UXOriginSettlerTest is Test {
    UXOriginSettler private settler;

    function setUp() public {
        settler = new UXOriginSettler(address(this), address(0));
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

        (address user, uint256 originChainId, , uint32 fillDeadline, bytes32 orderId, Output[] memory maxSpent,,) =
            _unpack(settler.resolve(order, ""));

        assertEq(user, address(this));
        assertEq(originChainId, block.chainid);
        assertEq(fillDeadline, order.fillDeadline);
        assertEq(maxSpent.length, uxOrder.outputs.length);
        assertEq(orderId, expectedOrderId);
    }

    function _buildOrder(address user) internal pure returns (UXOriginSettler.UXDepositOrder memory uxOrder) {
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
            user: user,
            inputToken: address(0x1234),
            inputAmount: 3 ether,
            outputs: outputs,
            destinationSettler: bytes32(uint256(uint160(address(0x2222)))),
            destinationCallData: destinationCallData,
            nonce: 1,
            lifiCalldata: ""
        });
    }

    function _unpack(ResolvedCrossChainOrder memory resolved)
        internal
        pure
        returns (
            address user,
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
