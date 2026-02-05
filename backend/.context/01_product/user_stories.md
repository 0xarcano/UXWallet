# User Stories

## Backend-Specific User Stories

- As a solver, I want to fulfill LI.FI intents (ERC-7683) using vault liquidity to generate profit, instantly using Persistent Session Keys without waiting for user signatures.
- As a user, I want my off-chain transactions to be co-signed by the ClearNode instantly using Yellow/Nitrolite (ERC-7824) state channels.
- As a ClearNode, I must store the latest signed state in a redundant DA layer (PostgreSQL) to prevent fund lock-ups and support safe recovery flows.
- As a developer, I want an RPC endpoint that provides the latest "Unified Balance" state proof.
- As a protocol, I want to trigger a "Hybrid Exit / Sponsored Exit" via LI.FI if a user's withdrawal request exceeds local chain vault liquidity, guaranteeing a fast exit without extra user fees.
- As a backend, I want to provide real-time balance updates via ClearNode WebSocket (`bu` notifications) to drive the frontend UI.
- As a JIT solver, I want to evaluate "Spread" vs. "Inventory Health" in the LI.FI marketplace to maximize yield while maintaining withdrawal guarantees.
- As a backend, I want to ensure the Persistent Session Key is scoped: it can authorize state updates within the vault network as result of an intent order fulfillment, but cannot authorize transfers to external addresses.

## Aligned with Frontend User Stories

- US-01: Support one-time delegation (EIP-712) and provide session key management with revocation capability.
- US-02: Provide real-time unified balance data via ClearNode WebSocket (`bu`).
- US-03: Support unification intents (ERC-7683 via LI.FI) with progress tracking.
- US-04: Implement "Fast Exit Guarantee" logic (Direct Exit vs Sponsored Exit).
- US-05: Enable gasless Yellow L3 P2P transfers via ClearNode.
- US-06: Support cross-chain transfers from unified balance with routed/hybrid flows.
