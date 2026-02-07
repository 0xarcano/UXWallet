// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title SessionKeyRegistry
/// @notice Minimal onchain registry for session keys + per-spend caps.
/// @dev This does not enforce caps itself; consuming contracts should query and enforce.
contract SessionKeyRegistry {
    bytes32 public constant REGISTER_SESSION_KEY_TYPEHASH = keccak256(
        "RegisterSessionKey(address user,address sessionKey,uint64 expiresAt,bytes32 tokensHash,bytes32 capsHash,uint256 nonce,uint256 deadline,address registry,uint256 chainId)"
    );

    struct SessionKeyConfig {
        uint64 expiresAt;
        bool active;
    }

    struct RegisterSessionKeyRequest {
        address user;
        address sessionKey;
        uint64 expiresAt;
        uint256 nonce;
        uint256 deadline;
    }

    mapping(address user => mapping(address sessionKey => SessionKeyConfig)) public sessionKeys;
    mapping(address user => mapping(address sessionKey => mapping(address token => uint256 capPerSpend))) public caps;
    mapping(address user => uint256 nonce) public nonces;

    event SessionKeyRegistered(address indexed user, address indexed sessionKey, uint64 expiresAt);
    event SessionKeyRevoked(address indexed user, address indexed sessionKey);
    event CapSet(address indexed user, address indexed sessionKey, address indexed token, uint256 capPerSpend);
    event SessionKeyRegisteredWithSig(
        address indexed user,
        address indexed relayer,
        address indexed sessionKey,
        uint256 nonce,
        uint64 expiresAt
    );

    error InvalidSessionKey();
    error InvalidExpiresAt();
    error LengthMismatch();
    error InvalidSignature();
    error InvalidNonce();
    error SignatureExpired();

    function registerSessionKey(
        address sessionKey,
        uint64 expiresAt,
        address[] calldata tokens,
        uint256[] calldata perSpendCaps
    ) external {
        _register(msg.sender, sessionKey, expiresAt, tokens, perSpendCaps);
    }

    function registerSessionKeyWithSig(
        RegisterSessionKeyRequest calldata req,
        address[] calldata tokens,
        uint256[] calldata perSpendCaps,
        bytes calldata signature
    ) external {
        if (block.timestamp > req.deadline) {
            revert SignatureExpired();
        }

        uint256 expectedNonce = nonces[req.user];
        if (req.nonce != expectedNonce) {
            revert InvalidNonce();
        }

        bytes32 digest = _registerDigest(req, tokens, perSpendCaps);
        address signer = ECDSA.recover(digest, signature);
        if (signer != req.user) {
            revert InvalidSignature();
        }

        nonces[req.user] = expectedNonce + 1;
        _register(req.user, req.sessionKey, req.expiresAt, tokens, perSpendCaps);
        emit SessionKeyRegisteredWithSig(req.user, msg.sender, req.sessionKey, req.nonce, req.expiresAt);
    }

    function setCap(address sessionKey, address token, uint256 capPerSpend) external {
        SessionKeyConfig memory config = sessionKeys[msg.sender][sessionKey];
        if (!config.active) {
            revert InvalidSessionKey();
        }
        caps[msg.sender][sessionKey][token] = capPerSpend;
        emit CapSet(msg.sender, sessionKey, token, capPerSpend);
    }

    function revokeSessionKey(address sessionKey) external {
        SessionKeyConfig memory config = sessionKeys[msg.sender][sessionKey];
        if (!config.active) {
            revert InvalidSessionKey();
        }
        sessionKeys[msg.sender][sessionKey].active = false;
        emit SessionKeyRevoked(msg.sender, sessionKey);
    }

    function isSessionKeyActive(address user, address sessionKey) external view returns (bool) {
        SessionKeyConfig memory config = sessionKeys[user][sessionKey];
        return config.active && config.expiresAt > uint64(block.timestamp);
    }

    function getCap(address user, address sessionKey, address token) external view returns (uint256) {
        return caps[user][sessionKey][token];
    }

    function registerSessionKeyDigest(
        RegisterSessionKeyRequest calldata req,
        address[] calldata tokens,
        uint256[] calldata perSpendCaps
    ) external view returns (bytes32) {
        return _registerDigest(req, tokens, perSpendCaps);
    }

    function _register(
        address user,
        address sessionKey,
        uint64 expiresAt,
        address[] calldata tokens,
        uint256[] calldata perSpendCaps
    ) internal {
        if (sessionKey == address(0)) {
            revert InvalidSessionKey();
        }
        if (expiresAt <= uint64(block.timestamp)) {
            revert InvalidExpiresAt();
        }
        if (tokens.length != perSpendCaps.length) {
            revert LengthMismatch();
        }

        sessionKeys[user][sessionKey] = SessionKeyConfig({
            expiresAt: expiresAt,
            active: true
        });
        emit SessionKeyRegistered(user, sessionKey, expiresAt);

        for (uint256 i = 0; i < tokens.length; i++) {
            caps[user][sessionKey][tokens[i]] = perSpendCaps[i];
            emit CapSet(user, sessionKey, tokens[i], perSpendCaps[i]);
        }
    }

    function _registerDigest(
        RegisterSessionKeyRequest calldata req,
        address[] calldata tokens,
        uint256[] calldata perSpendCaps
    ) internal view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                REGISTER_SESSION_KEY_TYPEHASH,
                req.user,
                req.sessionKey,
                req.expiresAt,
                keccak256(abi.encode(tokens)),
                keccak256(abi.encode(perSpendCaps)),
                req.nonce,
                req.deadline,
                address(this),
                block.chainid
            )
        );
        return MessageHashUtils.toEthSignedMessageHash(structHash);
    }
}
