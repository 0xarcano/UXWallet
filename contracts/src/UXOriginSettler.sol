// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {AccessControl} from "openzeppelin-contracts/access/AccessControl.sol";
import {ECDSA} from "openzeppelin-contracts/utils/cryptography/ECDSA.sol";

import {IOriginSettler} from "./interfaces/IOriginSettler.sol";
import {GaslessCrossChainOrder, OnchainCrossChainOrder, ResolvedCrossChainOrder, Output, FillInstruction} from "./erc7683/Structs.sol";
import {LifiAdapter} from "./LifiAdapter.sol";

contract UXOriginSettler is AccessControl, IOriginSettler {
    bytes32 public constant SETTLER_ADMIN_ROLE = keccak256("SETTLER_ADMIN_ROLE");
    // NOTE: Replace with the full EIP-712 typehash once the UXDepositOrder schema is finalized.
    bytes32 public constant ORDER_DATA_TYPE = keccak256("UXDepositOrder");

    struct UXDepositOrder {
        address user;
        address inputToken;
        uint256 inputAmount;
        Output[] outputs;
        bytes32 destinationSettler;
        bytes[] destinationCallData;
        uint256 nonce;
        bytes lifiCalldata;
    }

    mapping(address => mapping(uint256 => bool)) public nonceUsed;

    LifiAdapter public lifiAdapter;

    error InvalidSignature();
    error InvalidOrderDataType();
    error InvalidOrderOrigin();
    error InvalidArrays();
    error NonceAlreadyUsed();
    error OrderExpired();

    constructor(address admin, address lifiAdapter_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SETTLER_ADMIN_ROLE, admin);
        lifiAdapter = LifiAdapter(lifiAdapter_);
    }

    function setLifiAdapter(address lifiAdapter_) external onlyRole(SETTLER_ADMIN_ROLE) {
        lifiAdapter = LifiAdapter(lifiAdapter_);
    }

    function open(OnchainCrossChainOrder calldata order) external returns (bytes32 orderId) {
        if (order.orderDataType != ORDER_DATA_TYPE) {
            revert InvalidOrderDataType();
        }
        if (order.fillDeadline < block.timestamp) {
            revert OrderExpired();
        }

        UXDepositOrder memory uxOrder = _decode(order.orderData);
        if (uxOrder.user != msg.sender) {
            revert InvalidOrderOrigin();
        }
        _validateArrays(uxOrder.outputs, uxOrder.destinationCallData);

        _useNonce(uxOrder.user, uxOrder.nonce);
        orderId = _computeOrderId(uxOrder.user, block.chainid, order.orderDataType, order.orderData, uxOrder.nonce);

        _submitToLifi(uxOrder);

        ResolvedCrossChainOrder memory resolved = _resolve(
            uxOrder.user,
            block.chainid,
            uint32(block.timestamp),
            order.fillDeadline,
            order.orderDataType,
            order.orderData,
            orderId
        );
        emit Open(orderId, resolved);
    }

    function openFor(
        GaslessCrossChainOrder calldata order,
        bytes calldata signature,
        bytes calldata originFillerData
    ) external returns (bytes32 orderId) {
        if (order.orderDataType != ORDER_DATA_TYPE) {
            revert InvalidOrderDataType();
        }
        if (order.originSettler != address(this) || order.originChainId != block.chainid) {
            revert InvalidOrderOrigin();
        }
        if (order.openDeadline < block.timestamp || order.fillDeadline < block.timestamp) {
            revert OrderExpired();
        }

        _verifySignature(order, signature);

        UXDepositOrder memory uxOrder = _decode(order.orderData);
        if (uxOrder.user != order.user) {
            revert InvalidOrderOrigin();
        }
        _validateArrays(uxOrder.outputs, uxOrder.destinationCallData);

        _useNonce(order.user, order.nonce);
        orderId = _computeOrderId(order.user, order.originChainId, order.orderDataType, order.orderData, order.nonce);

        _submitToLifi(uxOrder);

        ResolvedCrossChainOrder memory resolved = _resolve(
            order.user,
            order.originChainId,
            order.openDeadline,
            order.fillDeadline,
            order.orderDataType,
            order.orderData,
            orderId
        );
        emit Open(orderId, resolved);

        originFillerData;
    }

    function resolve(
        GaslessCrossChainOrder calldata order,
        bytes calldata originFillerData
    ) external view returns (ResolvedCrossChainOrder memory resolvedOrder) {
        bytes32 orderId = _computeOrderId(order.user, order.originChainId, order.orderDataType, order.orderData, order.nonce);
        resolvedOrder = _resolve(
            order.user,
            order.originChainId,
            order.openDeadline,
            order.fillDeadline,
            order.orderDataType,
            order.orderData,
            orderId
        );
        originFillerData;
    }

    function resolve(
        OnchainCrossChainOrder calldata order,
        bytes calldata originFillerData
    ) external view returns (ResolvedCrossChainOrder memory resolvedOrder) {
        UXDepositOrder memory uxOrder = _decode(order.orderData);
        bytes32 orderId = _computeOrderId(uxOrder.user, block.chainid, order.orderDataType, order.orderData, uxOrder.nonce);
        resolvedOrder = _resolve(
            uxOrder.user,
            block.chainid,
            uint32(block.timestamp),
            order.fillDeadline,
            order.orderDataType,
            order.orderData,
            orderId
        );
        originFillerData;
    }

    function _resolve(
        address user,
        uint256 originChainId,
        uint32 openDeadline,
        uint32 fillDeadline,
        bytes32 orderDataType,
        bytes calldata orderData,
        bytes32 orderId
    ) internal view returns (ResolvedCrossChainOrder memory resolvedOrder) {
        if (orderDataType != ORDER_DATA_TYPE) {
            revert InvalidOrderDataType();
        }

        UXDepositOrder memory uxOrder = _decode(orderData);
        _validateArrays(uxOrder.outputs, uxOrder.destinationCallData);

        Output[] memory maxSpent = new Output[](uxOrder.outputs.length);
        for (uint256 i = 0; i < uxOrder.outputs.length; i++) {
            maxSpent[i] = uxOrder.outputs[i];
        }

        FillInstruction[] memory instructions = new FillInstruction[](uxOrder.outputs.length);
        for (uint256 i = 0; i < uxOrder.outputs.length; i++) {
            instructions[i] = FillInstruction({
                destinationChainId: uxOrder.outputs[i].chainId,
                destinationSettler: uxOrder.destinationSettler,
                originData: abi.encode(orderId, i, uxOrder.outputs[i], uxOrder.destinationCallData[i])
            });
        }

        Output[] memory minReceived = new Output[](0);

        resolvedOrder = ResolvedCrossChainOrder({
            user: user,
            originChainId: originChainId,
            openDeadline: openDeadline,
            fillDeadline: fillDeadline,
            orderId: orderId,
            maxSpent: maxSpent,
            minReceived: minReceived,
            fillInstructions: instructions
        });
    }

    function _decode(bytes calldata orderData) internal pure returns (UXDepositOrder memory uxOrder) {
        return abi.decode(orderData, (UXDepositOrder));
    }

    function _validateArrays(Output[] memory outputs, bytes[] memory destinationCallData) internal pure {
        if (outputs.length == 0 || outputs.length != destinationCallData.length) {
            revert InvalidArrays();
        }
    }

    function _useNonce(address user, uint256 nonce) internal {
        if (nonceUsed[user][nonce]) {
            revert NonceAlreadyUsed();
        }
        nonceUsed[user][nonce] = true;
    }

    function _computeOrderId(
        address user,
        uint256 originChainId,
        bytes32 orderDataType,
        bytes calldata orderData,
        uint256 nonce
    ) internal view returns (bytes32) {
        return keccak256(abi.encode(address(this), user, originChainId, nonce, orderDataType, keccak256(orderData)));
    }

    function _verifySignature(GaslessCrossChainOrder calldata order, bytes calldata signature) internal pure {
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

        // NOTE: This uses an eth-sign digest for now; move to EIP-712/Permit2 once finalized.
        bytes32 digest = ECDSA.toEthSignedMessageHash(orderHash);
        address signer = ECDSA.recover(digest, signature);
        if (signer != order.user) {
            revert InvalidSignature();
        }
    }

    function _submitToLifi(UXDepositOrder memory uxOrder) internal {
        if (address(lifiAdapter) == address(0)) {
            return;
        }
        if (uxOrder.lifiCalldata.length == 0) {
            return;
        }
        lifiAdapter.submit(uxOrder.lifiCalldata);
    }
}
