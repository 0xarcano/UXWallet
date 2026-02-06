# Language Rules

## Solidity Version

- Use Solidity **^0.8.20** or latest stable version for security features and gas optimizations.

## Code Patterns

- **Check-Effects-Interactions (CEI):** Mandatory for all state-changing functions to prevent reentrancy.
- **Fail Fast:** Validate inputs and preconditions at the start of functions; revert early if invalid.
- **Gas Optimization:** Optimize loops and storage access to minimize gas costs.

## Specific Rules

- **Storage vs Memory:** Use `memory` for temporary data; minimize `storage` reads/writes.
- **Storage Packing:** Pack related state variables to fit in 32-byte slots.
- **Immutable:** Use `immutable` for values set once at deployment (e.g., deployment timestamp, chain ID).
- **Constant:** Use `constant` for compile-time constants.
- **Unchecked:** Use `unchecked` blocks only when overflow/underflow is impossible or acceptable.
- **Function Visibility:** Be explicit with visibility (public, external, internal, private); prefer `external` for functions called only externally (saves gas).
- **Pure vs View:** Use `pure` for functions with no state access; `view` for read-only state access.

## Safety Rules for Flywheel

- **No direct transfers:** All token transfers must use SafeERC20 wrappers.
- **Session key scope enforcement:** Never allow session keys to authorize transfers to addresses outside the protocol vault network.
- **Invariant assertions:** Assert solvency invariant (`totalVaultLiquidity ≥ totalUserClaims`) after balance-changing operations.
- **Nonce management:** Use strictly increasing nonces for all state updates to prevent replay attacks.
