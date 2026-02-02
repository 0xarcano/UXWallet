# Coding Style

| Area | Rule |
|------|------|
| **Version** | Solidity ^0.8.20. |
| **Naming** | PascalCase for Contracts, camelCase for functions, UPPER_CASE for constants. |
| **Safety** | Use SafeERC20 for all transfers. Use AccessControl for protocol-level roles. |
| **Pattern** | "Check-Effects-Interactions" is mandatory. |
| **Session Keys** | Scoped permissions: a session key can ONLY authorize move intents, not withdraw to external addresses. |
