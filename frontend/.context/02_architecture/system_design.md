# System Design

**Architecture:** Client-centric. Flywheel Wallet UI talks to **Backend/ClearNode** (Nitrolite RPC/WebSocket) for delegation, balance, and real-time updates. When the app uses the **LiFi path** (send when pool cannot fulfill), it calls **lif-rust** for quotes and calldata (Phase 2; mocked in Phase 1).

**Design:** User delegates once (EIP-712 Session Key) to authorize the Flywheel Solver; balance is unified; send and withdraw follow flows in [`.context/sequence-diagrams.md`](../../.context/sequence-diagrams.md).

**LiFi (when used):** Frontend may call lif-rust:
- `POST /lifi/quote` — Routing quote
- `POST /intent/calldata` — Calldata for LiFi-related transactions

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
