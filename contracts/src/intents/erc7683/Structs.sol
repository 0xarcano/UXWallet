// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

struct GaslessCrossChainOrder {
    address originSettler;
    address user;
    uint256 nonce;
    uint256 originChainId;
    uint32 openDeadline;
    uint32 fillDeadline;
    bytes32 orderDataType;
    bytes orderData;
}

struct OnchainCrossChainOrder {
    uint32 fillDeadline;
    bytes32 orderDataType;
    bytes orderData;
}

struct Output {
    bytes32 token;
    uint256 amount;
    bytes32 recipient;
    uint256 chainId;
}

struct FillInstruction {
    uint256 destinationChainId;
    bytes32 destinationSettler;
    bytes originData;
}

struct ResolvedCrossChainOrder {
    address user;
    uint256 originChainId;
    uint32 openDeadline;
    uint32 fillDeadline;
    bytes32 orderId;
    Output[] maxSpent;
    Output[] minReceived;
    FillInstruction[] fillInstructions;
}
