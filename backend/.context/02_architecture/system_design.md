# System Design

## Architecture Overview

UXWallet backend operates within a **3-layer technical architecture** to provide an "Invisible Cross-Chain" experience:

### Layer 1: Inbound Gateway (LI.FI / ERC-7683)
- **Mechanism**: Users "Unify" fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits.
- **Backend Role**: Listen to LI.FI marketplace for eligible ERC-7683 intents; act as JIT solver to fulfill orders using vault liquidity.

### Layer 2: Settlement Engine (Yellow / ERC-7824 via Nitrolite)
- **Mechanism**: Once assets are in vaults, movement is virtualized; claims are updated via Nitrolite State Channels.
- **Backend Role**: Co-sign off-chain liability exchanges using Persistent Session Keys; provide ClearNode WebSocket (`bu`) for real-time UI updates.

### Layer 3: Hybrid Exit Strategy ("Fast Exit Guarantee")
- **Mechanism**: If a user withdraws on a chain where the local vault is insufficient, the protocol triggers a Hybrid / Sponsored Exit.
- **Backend Role**: Detect insufficient vault liquidity; trigger LI.FI intent/bridge to pull liquidity from another chain; treasury sponsors the fee.

## System Components

**Design:** Event-driven microservice architecture.

1. **Solver Engine**: Identifies profitable opportunities in the LI.FI marketplace by evaluating spread vs. inventory health.
2. **Inventory Manager**: Checks if a trade is safe and maintains withdrawal guarantees across all chains.
3. **KMS (Key Management Service)**: Manages Persistent Session Keys; signs state updates with scoped permissions.
4. **ClearNode**: Updates the Virtual Ledger (off-chain); provides RPC and WebSocket (`bu`) for real-time balance updates.
5. **Rebalancer**: Coordinates cross-chain liquidity movement when needed (e.g., Hybrid Exits).
6. **State Persistence**: Stores latest signed Nitrolite state in PostgreSQL to support safe recovery flows.
7. **lif-rust Service**: Rust-based microservice providing REST API for LI.FI integration; handles quote fetching, ERC-7683 order encoding, and calldata generation for UXOriginSettler contract interactions.

## Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Backend** | **Frontend / ClearNode** | WebSocket (`bu`) for real-time updates; RPC for state queries/handshake. |
| **Backend** | **lif-rust** | REST API (POST /lifi/quote, POST /intent/build, POST /intent/calldata). |
| **Backend** | **Contracts** | Monitor events (deposits/withdrawals) & submit checkpoints/state where required. |
| **lif-rust** | **LI.FI API** | External HTTPS requests for routing and quote data. |
