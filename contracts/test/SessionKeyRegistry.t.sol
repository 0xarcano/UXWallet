// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {SessionKeyRegistry} from "../src/onboard/SessionKeyRegistry.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract MockSessionSpender {
    SessionKeyRegistry public immutable registry;

    error InactiveSessionKey();
    error SpendCapExceeded();

    constructor(address registry_) {
        registry = SessionKeyRegistry(registry_);
    }

    function spendFromUser(address user, address token, uint256 amount, address recipient) external {
        if (!registry.isSessionKeyActive(user, msg.sender)) {
            revert InactiveSessionKey();
        }

        uint256 cap = registry.getCap(user, msg.sender, token);
        if (cap == 0 || amount > cap) {
            revert SpendCapExceeded();
        }

        IERC20(token).transferFrom(user, recipient, amount);
    }
}

contract SessionKeyRegistryTest is Test {
    SessionKeyRegistry private registry;
    MockSessionSpender private spender;
    MockERC20 private tokenA;
    MockERC20 private tokenB;

    uint256 private constant USER_PK = 0xA11CE;
    address private user = vm.addr(USER_PK);
    address private sessionKey = vm.addr(0xB0B);
    address private recipient = address(0xCAFE);

    function setUp() public {
        registry = new SessionKeyRegistry();
        spender = new MockSessionSpender(address(registry));
        tokenA = new MockERC20("TokenA", "TKA");
        tokenB = new MockERC20("TokenB", "TKB");
    }

    function testRegisterSessionKeyWithSig() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);

        uint256[] memory caps = new uint256[](1);
        caps[0] = 5 ether;

        uint64 expiresAt = uint64(block.timestamp + 7 days);
        uint256 nonce = registry.nonces(user);
        uint256 deadline = block.timestamp + 1 days;
        SessionKeyRegistry.RegisterSessionKeyRequest memory request = SessionKeyRegistry.RegisterSessionKeyRequest({
            user: user,
            sessionKey: sessionKey,
            expiresAt: expiresAt,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = registry.registerSessionKeyDigest(request, tokens, caps);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        registry.registerSessionKeyWithSig(request, tokens, caps, signature);

        (uint64 storedExpiry, bool active) = registry.sessionKeys(user, sessionKey);
        assertEq(storedExpiry, expiresAt);
        assertTrue(active);
        assertEq(registry.getCap(user, sessionKey, address(tokenA)), 5 ether);
        assertEq(registry.nonces(user), 1);
    }

    function testRegisterSessionKeyWithSigRejectsReplay() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);

        uint256[] memory caps = new uint256[](1);
        caps[0] = 5 ether;

        uint64 expiresAt = uint64(block.timestamp + 7 days);
        uint256 nonce = registry.nonces(user);
        uint256 deadline = block.timestamp + 1 days;
        SessionKeyRegistry.RegisterSessionKeyRequest memory request = SessionKeyRegistry.RegisterSessionKeyRequest({
            user: user,
            sessionKey: sessionKey,
            expiresAt: expiresAt,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = registry.registerSessionKeyDigest(request, tokens, caps);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        registry.registerSessionKeyWithSig(request, tokens, caps, signature);

        vm.expectRevert(SessionKeyRegistry.InvalidNonce.selector);
        registry.registerSessionKeyWithSig(request, tokens, caps, signature);
    }

    function testSessionKeyCanSpendTwoAuthorizedTokens() public {
        uint256 approvalA = 50 ether;
        uint256 approvalB = 60 ether;
        uint256 spendA = 7 ether;
        uint256 spendB = 15 ether;

        tokenA.mint(user, 100 ether);
        tokenB.mint(user, 100 ether);

        vm.prank(user);
        tokenA.approve(address(spender), approvalA);
        vm.prank(user);
        tokenB.approve(address(spender), approvalB);

        address[] memory tokens = new address[](2);
        tokens[0] = address(tokenA);
        tokens[1] = address(tokenB);

        uint256[] memory caps = new uint256[](2);
        caps[0] = 10 ether;
        caps[1] = 20 ether;

        _registerWithSig(user, sessionKey, tokens, caps);

        console2.log("=== Session Key Setup ===");
        console2.log("TokenA approved to spender (tokens):", tokenA.allowance(user, address(spender)) / 1 ether);
        console2.log("TokenB approved to spender (tokens):", tokenB.allowance(user, address(spender)) / 1 ether);
        console2.log("TokenA cap in registry (tokens):", registry.getCap(user, sessionKey, address(tokenA)) / 1 ether);
        console2.log("TokenB cap in registry (tokens):", registry.getCap(user, sessionKey, address(tokenB)) / 1 ether);
        console2.log("TokenA user balance before (tokens):", tokenA.balanceOf(user) / 1 ether);
        console2.log("TokenB user balance before (tokens):", tokenB.balanceOf(user) / 1 ether);
        console2.log("TokenA recipient balance before (tokens):", tokenA.balanceOf(recipient) / 1 ether);
        console2.log("TokenB recipient balance before (tokens):", tokenB.balanceOf(recipient) / 1 ether);

        vm.prank(sessionKey);
        spender.spendFromUser(user, address(tokenA), spendA, recipient);
        vm.prank(sessionKey);
        spender.spendFromUser(user, address(tokenB), spendB, recipient);

        console2.log("=== After Spends ===");
        console2.log("TokenA spent amount (tokens):", spendA / 1 ether);
        console2.log("TokenB spent amount (tokens):", spendB / 1 ether);
        console2.log("TokenA allowance left (tokens):", tokenA.allowance(user, address(spender)) / 1 ether);
        console2.log("TokenB allowance left (tokens):", tokenB.allowance(user, address(spender)) / 1 ether);
        console2.log("TokenA user balance after (tokens):", tokenA.balanceOf(user) / 1 ether);
        console2.log("TokenB user balance after (tokens):", tokenB.balanceOf(user) / 1 ether);
        console2.log("TokenA recipient balance after (tokens):", tokenA.balanceOf(recipient) / 1 ether);
        console2.log("TokenB recipient balance after (tokens):", tokenB.balanceOf(recipient) / 1 ether);

        assertEq(tokenA.balanceOf(user), 93 ether);
        assertEq(tokenB.balanceOf(user), 85 ether);
        assertEq(tokenA.balanceOf(recipient), 7 ether);
        assertEq(tokenB.balanceOf(recipient), 15 ether);
    }

    function testSessionKeySpendRevertsWhenOverCap() public {
        tokenA.mint(user, 100 ether);
        vm.prank(user);
        tokenA.approve(address(spender), type(uint256).max);

        address[] memory tokens = new address[](1);
        tokens[0] = address(tokenA);

        uint256[] memory caps = new uint256[](1);
        caps[0] = 5 ether;

        _registerWithSig(user, sessionKey, tokens, caps);

        vm.prank(sessionKey);
        vm.expectRevert(MockSessionSpender.SpendCapExceeded.selector);
        spender.spendFromUser(user, address(tokenA), 6 ether, recipient);
    }

    function _registerWithSig(
        address owner,
        address ownerSessionKey,
        address[] memory tokens,
        uint256[] memory caps
    ) internal {
        uint64 expiresAt = uint64(block.timestamp + 7 days);
        uint256 nonce = registry.nonces(owner);
        uint256 deadline = block.timestamp + 1 days;
        SessionKeyRegistry.RegisterSessionKeyRequest memory request = SessionKeyRegistry.RegisterSessionKeyRequest({
            user: owner,
            sessionKey: ownerSessionKey,
            expiresAt: expiresAt,
            nonce: nonce,
            deadline: deadline
        });

        bytes32 digest = registry.registerSessionKeyDigest(request, tokens, caps);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(USER_PK, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        registry.registerSessionKeyWithSig(request, tokens, caps, signature);
    }
}
