# Domain Glossary

| Term | Definition |
|------|------------|
| **ClearNode** | The server responsible for co-signing off-chain state updates and providing real-time WebSocket updates (e.g., `bu`) to the frontend. |
| **Persistent Session Key** | Session-scoped key created via one-time EIP-712 delegation, used to co-sign state updates within the vault network as result of intent order fulfillment; cannot authorize transfers to external addresses. |
| **Intent Listener** | A service that scans the LI.FI Marketplace for eligible orders (ERC-7683 intents). |
| **Settlement Engine** | The logic that determines when to batch off-chain updates to the UXVault using Yellow/Nitrolite (ERC-7824) state channels. |
| **Virtual Ledger** | The off-chain database tracking real-time user balance (part of ClearNode). |
| **Session Key Registry** | The backend's mapping of user addresses to authorized Persistent Session Keys with expiry and permission bits. |
| **Inventory Health** | A metric determining if a vault has enough liquidity to fulfill an order without breaking withdrawal guarantees ("Fast Exit Guarantee"). |
| **Profitability Algorithm** | Logic that calculates if a spread covers the potential "Rebalancing Reserve" cost. |
| **ClearNode RPC** | The Nitrolite interface for updating the off-chain ledger and querying state. |
| **Unified Balance** | A single aggregated per-asset balance shown to users regardless of where funds reside across supported chains. |
| **Hybrid Exit / Sponsored Exit** | Withdrawal mode where the protocol treasury sponsors LI.FI bridge fees when the local vault lacks sufficient liquidity, providing a "Fast Exit Guarantee". |
| **JIT Solver** | Just-In-Time solver bot running at off-chain speed using Yellow technology to fulfill LI.FI marketplace orders and generate yield. |
| **Execution Guard** | Safety layer ensuring vault funds are only released when a corresponding asset is confirmed arriving on another protocol-owned vault (atomic intent behavior), or the owner explicitly signs an on-chain withdrawal. |
| **lif-rust Service** | Rust microservice providing REST API for LI.FI integration; handles quote fetching, ERC-7683 order encoding, and calldata generation. Used by both frontend and backend. |
