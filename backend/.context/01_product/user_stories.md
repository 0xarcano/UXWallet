# User Stories

## Backend-Specific User Stories

- As the **Flywheel Solver**, I want to fulfill intents using the Aggregated Liquidity Pool (LP + Treasury) so users earn yield, and when the pool cannot fulfill, create intent orders in the LiFi marketplace (funded from pool on source chains or Treasury-sponsored).
- As a user, I want my off-chain state updates to be coordinated by the ClearNode using Yellow/Nitrolite (ERC-7824) state channels and Session Key (Yellow).
- As ClearNode, I must store the latest signed state (e.g. PostgreSQL) to support recovery and prevent lock-ups.
- As a developer, I want an RPC endpoint that provides the latest Unified Balance state.
- As the protocol, I want to use the Flywheel Treasury to sponsor LiFi intent orders when the pool has no liquidity on the requested chain (same-chain or cross-chain), so the user's transfer still completes.
- As the backend, I want to provide real-time balance updates via ClearNode WebSocket (`bu`) to the Flywheel Wallet.
- As the Flywheel Solver, I want to use pool liquidity when available (best fee) and fall back to LiFi when the pool cannot fulfill.
- As the backend, I want the Session Key (Yellow) to be app-scoped with allowances and expiry, authorizing only intent-fulfillment state updates.

## Aligned with Flows (sequence-diagrams.md)

- Delegate: one-time EIP-712 Session Key; revocation in app.
- Fulfill intents: Solver uses pool (LP + Treasury); rewards 50% User, 50% Treasury.
- Send: same-chain or cross-chain; pool fulfills when it has liquidity; LiFi when it does not (pool on source chains or Treasury-sponsored).
- Withdraw: user receives principal + 50% reward share; Treasury receives 50%; user funds only for user payout.
