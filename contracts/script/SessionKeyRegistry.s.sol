// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script, console2} from "forge-std/Script.sol";
import {SessionKeyRegistry} from "../src/onboard/SessionKeyRegistry.sol";

contract SessionKeyRegistryScript is Script {
    function run() external returns (SessionKeyRegistry registry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        registry = new SessionKeyRegistry();
        vm.stopBroadcast();

        console2.log("SessionKeyRegistry deployed at:", address(registry));
    }
}
