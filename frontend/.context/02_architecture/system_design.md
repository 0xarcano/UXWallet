# System Design

**Architecture:** Client-centric. Flywheel Wallet UI talks to **Backend/ClearNode** (Nitrolite RPC/WebSocket) for delegation, balance, and real-time updates. LiFi components are mocked for MVP.

**Design:** User delegates once (EIP-712 Session Key) to authorize the Flywheel Solver; balance is unified; withdraw follows flows in [`.context/sequence-diagrams.md`](../../.context/sequence-diagrams.md).

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
