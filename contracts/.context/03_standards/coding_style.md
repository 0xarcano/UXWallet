# Coding Style

| Area | Rule |
|------|------|
| **Version** | Solidity ^0.8.20. Use latest stable version for security features. |
| **Naming** | PascalCase for Contracts and Interfaces, camelCase for functions and variables, UPPER_CASE for constants. |
| **Safety** | Use SafeERC20 for all token transfers. Use OpenZeppelin AccessControl for protocol-level roles. |
| **Pattern** | "Check-Effects-Interactions" (CEI) pattern is mandatory for all state-changing functions. |
| **Session Keys** | Scoped permissions: a Persistent Session Key can ONLY authorize state updates within the vault network as result of intent order fulfillment, NOT withdraw to external addresses (enforced by Execution Guard). |
| **Error Handling** | Use custom `error` types instead of `require` strings for gas efficiency. |
| **Comments** | Use NatSpec (`@notice`, `@dev`, `@param`, `@return`) for all public/external functions. |
| **Modifiers** | Keep modifiers simple; complex logic should be in internal functions. |
| **Gas Optimization** | Minimize storage writes; use `memory` over `storage` where possible; pack storage variables efficiently. |

## Specific Rules for Flywheel Contracts

- **Execution Guard**: Every function that releases vault funds must call `_executeWithGuard()` to ensure atomic behavior.
- **Session Key Validation**: Every state update signed by a session key must validate: (1) key is not expired, (2) key is not revoked, (3) nonce is correct, (4) signature is valid.
- **Invariant Checks**: After any state change affecting balances, assert `totalVaultLiquidity ≥ totalUserClaims`.
- **Multi-chain Consistency**: Ensure contract logic works identically across Phase 1 (Sepolia, Arbitrum Sepolia) and Phase 2 (Ethereum mainnet, Arbitrum mainnet); account for chain-specific quirks like gas costs.
