// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Script, console2} from "forge-std/Script.sol";

import {SessionKeyRegistry} from "../src/onboard/SessionKeyRegistry.sol";
import {IntentSettler} from "../src/intents/IntentSettler.sol";
import {LPVault} from "../src/flywheel/LPVault.sol";
import {TreasuryVault} from "../src/flywheel/TreasuryVault.sol";
import {NitroSettlementAdapter} from "../src/flywheel/NitroSettlementAdapter.sol";
import {FlywheelProtocol} from "../src/flywheel/FlywheelProtocol.sol";

contract MockAdjudicator {
    function conclude(bytes32, bytes32) external pure returns (bool) {
        return true;
    }
}

contract MockCustody {
    function release(address, uint256) external pure returns (bool) {
        return true;
    }
}

contract DeployFlywheelProtocolScript is Script {
    error InvalidAdmin();

    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        address admin = vm.envOr("PROTOCOL_ADMIN", vm.addr(deployerPk));
        address adjudicator = vm.envOr("ADJUDICATOR_ADDRESS", address(0));
        address custody = vm.envOr("CUSTODY_ADDRESS", address(0));
        address solver = vm.envOr("SOLVER_ADDRESS", address(0));
        address treasuryOperator = vm.envOr("TREASURY_OPERATOR_ADDRESS", address(0));

        vm.startBroadcast(deployerPk);
        _deploy(admin, adjudicator, custody, solver, treasuryOperator);
        vm.stopBroadcast();
    }

    /// @notice Single-input deployment entrypoint: pass only protocol admin.
    /// @dev Adjudicator/custody mocks are auto-deployed. Solver and treasury operator default to admin.
    function run(address admin) external {
        if (admin == address(0)) revert InvalidAdmin();
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPk);
        _deploy(admin, address(0), address(0), admin, admin);
        vm.stopBroadcast();
    }

    function _deploy(
        address admin,
        address adjudicator,
        address custody,
        address solver,
        address treasuryOperator
    ) internal {
        if (admin == address(0)) revert InvalidAdmin();

        if (adjudicator == address(0)) {
            adjudicator = address(new MockAdjudicator());
        }
        if (custody == address(0)) {
            custody = address(new MockCustody());
        }

        SessionKeyRegistry registry = new SessionKeyRegistry();
        IntentSettler settler = new IntentSettler(admin, address(0));
        LPVault lpVault = new LPVault(admin);
        TreasuryVault treasuryVault = new TreasuryVault(admin);
        NitroSettlementAdapter nitroAdapter = new NitroSettlementAdapter(admin, adjudicator, custody);
        FlywheelProtocol protocol = new FlywheelProtocol(
            admin,
            address(registry),
            address(settler),
            address(lpVault),
            address(treasuryVault),
            address(nitroAdapter)
        );

        settler.setSessionKeyRegistry(address(registry));
        lpVault.setRouter(address(protocol), true);
        treasuryVault.setRewardDistributor(address(protocol), true);
        treasuryVault.grantRole(treasuryVault.TREASURY_ADMIN_ROLE(), address(protocol));
        nitroAdapter.grantRole(nitroAdapter.SETTLER_ROLE(), address(protocol));

        if (solver != address(0)) {
            protocol.setSolver(solver, true);
        }
        if (treasuryOperator != address(0)) {
            protocol.setTreasuryOperator(treasuryOperator, true);
        }

        console2.log("SessionKeyRegistry:", address(registry));
        console2.log("IntentSettler:", address(settler));
        console2.log("LPVault:", address(lpVault));
        console2.log("TreasuryVault:", address(treasuryVault));
        console2.log("Adjudicator:", adjudicator);
        console2.log("Custody:", custody);
        console2.log("NitroSettlementAdapter:", address(nitroAdapter));
        console2.log("FlywheelProtocol:", address(protocol));
    }
}
