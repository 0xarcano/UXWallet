# Error Handling

## Custom Error Pattern

- **Use custom error types** instead of `require` strings for gas efficiency (Solidity ^0.8.4+).
- **Pattern:** `if (condition) revert CustomError();`

## Error Naming Convention

- Prefix with contract name for clarity: `Custody__InsufficientBalance`, `SessionKeyRegistry__KeyExpired`.
- Use descriptive names that clearly indicate the failure reason.

## Common Error Patterns for Flywheel

```solidity
// Session Key errors
error SessionKeyRegistry__KeyExpired();
error SessionKeyRegistry__KeyRevoked();
error SessionKeyRegistry__InvalidSignature();
error SessionKeyRegistry__UnauthorizedKey();

// Vault errors
error Custody__InsufficientBalance();
error Custody__InsufficientLiquidity();
error Custody__InvalidAmount();
error Custody__TransferFailed();
error Custody__SolvencyInvariantViolated();

// Execution Guard errors
error ExecutionGuard__IntentNotFulfilled();
error ExecutionGuard__AtomicGuaranteeViolated();
error ExecutionGuard__InvalidProof();

// Adjudicator errors
error Adjudicator__InvalidStateTransition();
error Adjudicator__StaleNonce();
error Adjudicator__CheckpointAlreadyProcessed();
```

## Error Handling Best Practices

- **Fail fast:** Check preconditions at the start of functions; revert early if invalid.
- **Clear messages:** Error names should be self-explanatory; no additional strings needed.
- **Gas efficiency:** Custom errors are significantly cheaper than `require` with string messages.
- **Documentation:** Document expected errors in NatSpec `@dev` comments.
