# System Design

## Architecture Overview

Flywheel backend operates as **ClearNode** (Nitrolite session/state-channel coordination) and **Flywheel Solver** (intent fulfillment). When the **Aggregated Liquidity Pool** has liquidity on the target chain, the Solver fulfills from the pool; when it does not, the system creates **intent orders in the LiFi marketplace** (funded from pool on source chains or Treasury-sponsored). Rewards from intent fulfillment: **50% Users, 50% Flywheel Treasury**. User funds are always protected.

**Source of truth for flows:** `../../.context/sequence-diagrams.md`

### Phase 1 (Testnets, LiFi Mocked)

- Yellow/Nitrolite on **Sepolia** and **Arbitrum Sepolia**.
- LiFi components **mocked**; flows that would use LiFi use mocks.

### Phase 2 (Mainnet, LiFi Integrated)

- Yellow/Nitrolite on **Ethereum mainnet** and **Arbitrum mainnet**.
- **LiFi integrated:** Real intent orders in LiFi marketplace; lif-rust for quotes and order encoding.

## System Components

1. **ClearNode:** Nitrolite RPC/WebSocket; session and state-channel updates; real-time (`bu`) to Flywheel Wallet.
2. **Flywheel Solver:** Fulfills intents using pool (LP + Treasury); when pool cannot fulfill, creates LiFi intent orders (pool on source chains or Treasury-sponsored); registers credits; allocates rewards 50/50.
3. **KMS:** Manages Session Keys (Yellow); signs state updates with scoped permissions.
4. **State Persistence:** Stores latest signed Nitrolite state (e.g. PostgreSQL) for recovery.
5. **lif-rust:** REST API for LiFi (quote, intent build/calldata). Phase 2 real; Phase 1 mocked at callers.

## Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Backend** | **Frontend / ClearNode** | WebSocket (`bu`), RPC |
| **Backend** | **lif-rust** | REST (POST /lifi/quote, POST /intent/build, etc.) |
| **Backend** | **Contracts** | JSON-RPC (events, checkpoints, state) |
| **lif-rust** | **LiFi API** | HTTPS (Phase 2) |
