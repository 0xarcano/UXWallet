# Testing Strategy

- 100% branch coverage for UXVault.sol.
- **Invariant Testing:** Total assets across all chains must always >= Total user claims.
- **Fuzz Testing:** Test delegation expiry and revocation logic.
- Symbolic execution (optional) for withdrawal logic.
