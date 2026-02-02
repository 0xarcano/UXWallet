# User Stories

- As a solver, I want to fulfill LI.FI intents using vault liquidity to generate profit, instantly using delegated keys without waiting for user signatures.
- As a user, I want my off-chain transactions to be co-signed by the ClearNode instantly.
- As a ClearNode, I must store the latest signed state in a redundant DA layer (PostgreSQL) to prevent fund lock-ups.
- As a developer, I want an RPC endpoint that provides the latest "Unified" state proof.
- As a protocol, I want to trigger a "Hybrid Exit" via LI.FI if a user's withdrawal request exceeds local vault liquidity.
