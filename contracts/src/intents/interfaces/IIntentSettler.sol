// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {GaslessCrossChainOrder, OnchainCrossChainOrder, ResolvedCrossChainOrder} from "../erc7683/Structs.sol";

interface IIntentSettler {
    event Open(bytes32 indexed orderId, ResolvedCrossChainOrder resolvedOrder);

    function open(OnchainCrossChainOrder calldata order) external returns (bytes32 orderId);

    function openFor(
        GaslessCrossChainOrder calldata order,
        bytes calldata signature,
        bytes calldata originFillerData
    ) external returns (bytes32 orderId);

    function resolve(
        GaslessCrossChainOrder calldata order,
        bytes calldata originFillerData
    ) external view returns (ResolvedCrossChainOrder memory resolvedOrder);

    function resolve(
        OnchainCrossChainOrder calldata order,
        bytes calldata originFillerData
    ) external view returns (ResolvedCrossChainOrder memory resolvedOrder);
}
