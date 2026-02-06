# Product

| Attribute | Description |
|-----------|-------------|
| **Name** | Flywheel Smart Contracts (Custody & Settlement). |
| **Purpose** | Secure custody and rule enforcement for the aggregated liquidity protocol. Holds user and Treasury assets; integrates with **Yellow / Nitrolite (ERC-7824)** (Custody Contract, Adjudicator) for state-channel settlement. **User funds are always protected**; only **Flywheel Treasury** may be withdrawn by system owners. Supports Force Withdrawal escape hatch. |
| **Target Users** | Web3 medium and advanced users (via Flywheel Wallet). |
| **Chains** | Phase 1: Sepolia + Arbitrum Sepolia. Phase 2: Ethereum mainnet + Arbitrum mainnet. |

## Core Value Proposition

- **Secure custody:** Protocol-owned custody (Nitrolite Custody Contract) holds user and pool assets with trustless execution.
- **Non-custodial:** Users retain ultimate control via Force Withdrawal (present last signed state to Adjudicator).
- **Fast settlement:** Off-chain state via Nitrolite; on-chain payout via Adjudicator `conclude` / `transfer` (or `concludeAndTransferAllAssets`).
- **Execution Guard:** Funds only released on atomic intent fulfillment or explicit user withdrawal.
- **Treasury:** Flywheel Treasury is separate; owners may withdraw Treasury only—never user funds.

**Source of truth for flows:** `../.context/sequence-diagrams.md` (project root).
