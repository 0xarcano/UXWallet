// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script, console2} from "forge-std/Script.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployMockERC20Script is Script {
    function run() external returns (MockERC20 token) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory name = vm.envString("TOKEN_NAME");
        string memory symbol = vm.envString("TOKEN_SYMBOL");
        address mintTo = vm.envAddress("MINT_TO");
        uint256 mintAmount = vm.envUint("MINT_AMOUNT");

        vm.startBroadcast(deployerPrivateKey);
        token = new MockERC20(name, symbol);
        token.mint(mintTo, mintAmount);
        vm.stopBroadcast();

        console2.log("MockERC20 deployed at:", address(token));
        console2.log("Minted to:", mintTo);
        console2.log("Mint amount:", mintAmount);
    }
}
