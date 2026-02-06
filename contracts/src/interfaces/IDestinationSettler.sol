// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {ResolvedCrossChainOrder} from "../erc7683/Structs.sol";

interface IDestinationSettler {
    function fill(
        bytes32 orderId,
        bytes calldata originData,
        bytes calldata fillerData
    ) external returns (ResolvedCrossChainOrder memory resolvedOrder);
}
