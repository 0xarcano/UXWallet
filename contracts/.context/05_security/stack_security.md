# Stack Security

## Session Key & Delegation Security

- **Scoped Permissions:** Ensure Persistent Session Keys can ONLY authorize state updates within the vault network as result of intent order fulfillment (checking that funds are delivered in another chain's smart contract vault). They must NOT authorize direct transfers to external addresses.
- **Expiry & Revocation:** Support instant on-chain revocation of session keys; enforce expiry timestamps; reject expired or revoked keys.
- **Signature Validation:** Validate all EIP-712 signatures; ensure correct domain separator per chain; verify signer is the authorized session key.

## State Channel Security (ERC-7824)

- **Nonce Monotonicity:** Ensure the Adjudicator logic cannot be bypassed by stale signatures (use strictly increasing nonces/sequence numbers).
- **Replay Protection:** Track processed checkpoints to prevent replay attacks across chains or within same chain.
- **State Verification:** Validate state transitions are valid (e.g., balance changes match signed state deltas).

## Vault & Withdrawal Security

- **Force Withdrawal Safety:** Verify that "Force Withdrawal" doesn't allow for double-claiming across chains; use checkpoint finalization to prevent.
- **Escape Hatch:** Ensure `forceWithdraw` bypasses the session key entirely, requiring the owner's primary signature (not delegated key).
- **Solvency Invariant:** Enforce `totalVaultLiquidity ≥ totalUserClaims` at all times; revert if violated.

## Execution Guard Security

- **Atomic Guarantee:** Fuzz test the ExecutionGuard to ensure no scenario allows funds to be drained via spoofed intents or fake confirmations.
- **Intent Validation:** Verify LI.FI (ERC-7683) intent fulfillment before releasing funds; check proof of arrival in destination vault.
- **Reentrancy Protection:** Use OpenZeppelin ReentrancyGuard on all fund-releasing functions.

## Multi-chain Security

- **Cross-chain Consistency:** Ensure contract behavior is consistent across Phase 1 (Sepolia, Arbitrum Sepolia) and Phase 2 (Ethereum mainnet, Arbitrum mainnet); account for chain reorgs and finality differences.
- **Bridge Security:** Validate bridge messages/proofs when coordinating Hybrid Exits across chains.
