# Framework Best Practices

## Foundry Testing

- **vm.expectRevert:** Use for negative tests to ensure errors are thrown correctly.
- **vm.prank / vm.startPrank:** Use to simulate different callers; remember to call `vm.stopPrank()`.
- **vm.roll / vm.warp:** Use to simulate time progression (block numbers, timestamps) for testing expiry logic.
- **Cheatcodes:** Use sparingly in production-bound tests; clearly document any non-standard testing approaches.
- **Fuzz Testing:** Use `forge test --fuzz-runs 10000` or higher for critical functions.
- **Invariant Testing:** Use Foundry's invariant testing for continuous property checking.

## Test Organization

- Separate tests by type: `unit/`, `integration/`, `fuzz/`.
- Use descriptive test names: `test_withdrawSuccess_whenSufficientBalance()`, `testFail_withdrawReverts_whenInsufficientBalance()`.
- Use setUp() for common test initialization.
- Use helper functions for repeated test patterns (e.g., `_createSessionKey()`, `_depositFunds()`).

## Deployment Scripts

- Use Foundry scripts for deterministic deployments.
- Store deployment addresses and ABIs in version-controlled artifacts.
- Use environment variables for sensitive data (private keys, RPC URLs).
- Test deployment scripts on testnets before mainnet.

## Gas Profiling

- Use `forge test --gas-report` to monitor gas costs.
- Use `forge snapshot` to track gas cost changes over time.
- Optimize hot paths (deposit, withdraw, state update) for reasonable gas costs.

## OpenZeppelin Best Practices

- **ReentrancyGuard:** Use on all functions that release funds.
- **AccessControl:** Use for role-based permissions; prefer over `Ownable` for multi-role systems.
- **Pausable:** Use for emergency pause functionality.
- **SafeERC20:** Always use for token transfers.
- **ECDSA:** Use for signature verification; ensure proper domain separator usage (EIP-712).
