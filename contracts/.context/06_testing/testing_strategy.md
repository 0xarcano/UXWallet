# Testing Strategy

## Unit Testing

- **100% branch coverage** for all critical contracts: UXVault.sol, SessionKeyRegistry.sol, ExecutionGuard.sol, Adjudicator.sol.
- Test all state transitions and edge cases.
- Test delegation lifecycle: creation (EIP-712), validation, expiration, revocation.
- Test scoped permissions: ensure session keys cannot authorize transfers to external addresses.
- Test error conditions and reverts with `vm.expectRevert`.

## Fuzz Testing

- **Delegation logic:** Fuzz test session key expiry and revocation; ensure expired/revoked keys are rejected.
- **Execution Guard:** Fuzz test with random intents, spoofed confirmations, and edge cases; ensure no path allows fund drainage.
- **State updates:** Fuzz test Nitrolite state transitions with random nonces, signatures, and state deltas.
- **Balance accounting:** Fuzz test deposit/withdraw with random amounts; verify solvency invariant holds.

## Invariant Testing

- **Solvency Invariant:** `totalVaultLiquidity ≥ totalUserClaims` across all tokens and chains must ALWAYS hold.
- **Session Key Scope:** No test case should allow a session key to transfer funds to external addresses.
- **State Monotonicity:** State channel nonces must strictly increase; no replay or rollback.
- Use Echidna for continuous invariant checking.

## Integration Testing

- **Unification Flow (ERC-7683):** Full flow: user signs intent → solver fulfills → funds arrive in vault → balance updated.
- **Withdrawal Flow:** Test Direct Exit (sufficient liquidity) vs Sponsored Exit (insufficient liquidity, treasury sponsors).
- **Force Withdrawal:** Test escape hatch: user presents last signed state → Adjudicator validates → funds released.
- **Cross-chain Coordination:** Test vault interactions across Yellow L3, Ethereum, and Base (using Foundry multi-chain testing).

## Security Testing

- **Reentrancy:** Test all fund-releasing functions for reentrancy vulnerabilities.
- **Replay Attacks:** Test checkpoint replay protection across chains and within chain.
- **Front-running:** Test scenarios where malicious actors try to front-run state updates or withdrawals.
- **Slither:** Run static analysis and address all findings.

## Gas Optimization Testing

- Benchmark gas costs for common operations (deposit, withdraw, state update, session key validation).
- Optimize hot paths; target reasonable gas costs for MVP chains.
