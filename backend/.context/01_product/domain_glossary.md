# Domain Glossary

| Term | Definition |
|------|------------|
| **ClearNode** | Yellow Nitrolite RPC/WebSocket server; coordinates session and state-channel updates; provides real-time updates (e.g. `bu`) to the Flywheel Wallet. |
| **Flywheel Solver** | Service that fulfills intents using the Aggregated Liquidity Pool (LP + Treasury). When the pool cannot fulfill (no liquidity on target chain), creates intent orders in the LiFi marketplace (funded from pool on source chains or Treasury-sponsored). Registers credits and allocates rewards 50% Users / 50% Treasury. |
| **Session Key (Yellow)** | App-scoped key from one-time EIP-712 delegation; used to co-sign state updates so the Solver can fulfill intents without repeated user signatures (allowances, expires_at). |
| **Aggregated Liquidity Pool** | User-delegated assets + Flywheel Treasury; used by the Solver to fulfill same-chain and cross-chain transfers when liquidity is available. |
| **Clearing Engine** | Off-chain ledger (physical/credit state); tracks balances, credits, and reward allocation (50% User, 50% Treasury). |
| **lif-rust** | Rust microservice for LiFi API integration; quote fetching, intent/order encoding. Used when pool cannot fulfill (Phase 2; mocked in Phase 1). |
| **Unified Balance** | Single per-asset balance shown to the user across supported chains. |
| **Flywheel Treasury** | Receives 50% of intent-fulfillment rewards; part of pool liquidity; system owners may withdraw Treasury only—never user funds. |

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
