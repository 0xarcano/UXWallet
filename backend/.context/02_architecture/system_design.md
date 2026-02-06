# System Design

## Architecture Overview

Flywheel backend operates as **ClearNode** (Nitrolite session/state-channel coordination) and **Flywheel Solver** (intent fulfillment). When the **Aggregated Liquidity Pool** has liquidity on the target chain, the Solver fulfills from the pool. Rewards from intent fulfillment: **50% Users, 50% Flywheel Treasury**. User funds are always protected.

**Source of truth for flows:** `../../.context/sequence-diagrams.md`

### MVP (Testnets, LiFi Mocked)

- Yellow/Nitrolite on **Sepolia** and **Base Sepolia**.
- LiFi components **mocked**; flows that would use LiFi use mocks.

## System Components

1. **ClearNode:** Nitrolite RPC/WebSocket; session and state-channel updates; real-time (`bu`) to Flywheel Wallet.
2. **Flywheel Solver:** Fulfills intents using pool (LP + Treasury); registers credits; allocates rewards 50/50.
3. **KMS:** Manages Session Keys (Yellow); signs state updates with scoped permissions.
4. **State Persistence:** Stores latest signed Nitrolite state (e.g. PostgreSQL) for recovery.
5. **lif-rust:** REST API for LiFi (quote, intent build/calldata); mocked at callers for MVP.

## Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Backend** | **Frontend / ClearNode** | WebSocket (`bu`), RPC |
| **Backend** | **lif-rust** | REST (POST /lifi/quote, POST /intent/build, etc.; mocked) |
| **Backend** | **Contracts** | JSON-RPC (events, checkpoints, state) |
