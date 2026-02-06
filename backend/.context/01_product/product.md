# Product

| Attribute | Description |
|-----------|-------------|
| **Name** | Flywheel Solver & ClearNode Backend. |
| **Purpose** | **ClearNode:** Nitrolite session and state-channel coordination; real-time WebSocket (e.g. `bu`) for the Flywheel Wallet. **Flywheel Solver:** Fulfills intents using the Aggregated Liquidity Pool (LP + Treasury); when the pool cannot fulfill, creates intent orders in the LiFi marketplace (funded from pool on source chains or Treasury-sponsored). Registers credits and allocates rewards 50% to Users, 50% to Flywheel Treasury. |
| **Target Users** | Web3 medium and advanced users (via Flywheel Wallet). |
| **Phases** | Phase 1: Yellow on Sepolia + Arbitrum Sepolia; LiFi mocked. Phase 2: Yellow on Ethereum mainnet + Arbitrum mainnet; LiFi integrated. |

## Core Value Proposition

- **For users:** One-time delegation (Session Key), unified balance, send/withdraw, 50% of intent-fulfillment rewards; user funds always protected.
- **For the protocol:** Flywheel Solver uses pool (LP + Treasury) to fulfill intents; 50% rewards to Treasury (liquidity + owner withdrawal only).

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
