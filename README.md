# Flywheel

**A non-custodial wallet and aggregated liquidity protocol.** Users delegate assets to the Flywheel Wallet; the **Flywheel Solver** fulfills intents automatically using the **Aggregated Liquidity Pool** (user-delegated assets + Flywheel Treasury). Rewards from intent fulfillment are split **50% to Users** and **50% to the Flywheel Treasury**. User funds are always protected.

**Source of truth for flows:** [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md)

## Project Structure

```
Flywheel/
├── .context/              # Project-wide context; sequence-diagrams.md is canonical for flows
├── frontend/              # Flywheel Wallet UI (Next.js/React, TypeScript)
├── backend/               # ClearNode, Flywheel Solver, KMS (Node.js/TypeScript)
├── contracts/             # Smart contracts (Foundry) — Custody, Adjudicator
└── lif-rust/              # LiFi integration microservice (Rust)
```

## Architecture Overview

Flywheel aligns with **Yellow / Nitrolite (ERC-7824)** for state channels and custody. When the **liquidity layer can fulfill** (pool has funds on the target chain), transfers are settled from the pool; when it **cannot**, the system creates **intent orders in the LiFi marketplace** (funded from pool on source chains or sponsored by Flywheel Treasury).

- **Flywheel Wallet (App):** User-facing app for delegate, send, and withdraw. Users grant the Flywheel Solver permission via a **Session Key** (Yellow) so the Solver can fulfill intents without repeated signatures.
- **ClearNode:** Yellow Nitrolite session and state-channel coordination; real-time updates.
- **Flywheel Solver:** Fulfills intents using the Aggregated Liquidity Pool (LP + Treasury); registers credits; allocates rewards 50% Users / 50% Treasury. Uses LiFi when the pool cannot fulfill (cross-chain or same-chain).
- **Aggregated Liquidity Pool:** User-delegated assets + Flywheel Treasury. Pool liquidity is used for same-chain and cross-chain payouts when available.
- **Flywheel Treasury:** Receives 50% of intent-fulfillment rewards; part of available liquidity for the Solver; system owners may withdraw Treasury only—never user funds.

## Core Technologies

- **Yellow / Nitrolite (ERC-7824):** State channels, Custody Contract, Adjudicator (conclude / transfer).
- **Session Key (Yellow):** One-time user grant (EIP-712) so the Solver can fulfill intents automatically (app-scoped, allowances, expiry).
- **LiFi Marketplace:** Used when the liquidity layer cannot fulfill (e.g. no pool liquidity on destination chain); intent orders created and funded from pool on source chains or Treasury-sponsored.

## Development Plan (2 Phases)

### Phase 1: Protocol on Testnets, LiFi Mocked

- **Yellow / Nitrolite** implemented on **Sepolia** and **Arbitrum Sepolia** (state channels, Custody, Adjudicator, ClearNode).
- **LiFi system components mocked:** Cross-chain and same-chain flows that would use LiFi (when pool cannot fulfill) use mocks; no real LiFi API or solver integration.
- Goal: Validate delegation, deposit, pool fulfillment, reward split (50/50), and withdrawal; LiFi fallback paths exercised with mocks.

### Phase 2: Protocol on Mainnet, LiFi Integrated

- **Yellow / Nitrolite** implemented on **Ethereum mainnet** and **Arbitrum mainnet**.
- **LiFi system components implemented:** Real LiFi marketplace integration; intent orders created and funded from pool on source chains (or Treasury-sponsored for same-chain when pool has no liquidity).
- Goal: Production deployment with full liquidity-layer and LiFi fallback behavior as in [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md).

## Sub-Projects

### Frontend (Flywheel Wallet)

Next.js/React UI for the Flywheel Wallet.

**Tech Stack:** TypeScript, React, Next.js, TailwindCSS

**Key Features:** Delegate to pool (Session Key grant), unified balance, send (same-chain / cross-chain), withdraw, real-time updates via ClearNode.

**Docs:** `frontend/.context/`  
**Run:** `frontend/README.md`

### Backend

ClearNode, Flywheel Solver, and KMS.

**Tech Stack:** TypeScript, Node.js, PostgreSQL, Redis

**Key Components:** ClearNode (Nitrolite RPC/WebSocket), Flywheel Solver (intent fulfillment, pool + LiFi), KMS (Session Keys), state persistence.

**Docs:** `backend/.context/`  
**Run:** `backend/README.md`

### Contracts

Custody and Adjudicator (Nitrolite/ERC-7824); user and Treasury asset security.

**Tech Stack:** Solidity, Foundry

**Key Contracts:** Custody (Nitrolite), Adjudicator (Nitro), Force Withdrawal escape hatch.

**Docs:** `contracts/.context/`  
**Run:** `cd contracts && forge build && forge test`

### lif-rust

LiFi API integration and intent/order encoding for when the system creates LiFi intent orders (Phase 2; mocked in Phase 1).

**Tech Stack:** Rust, Axum, Alloy

**API:** `GET /health`, `POST /lifi/quote`, `POST /intent/build`, `POST /intent/calldata`

**Docs:** `lif-rust/README.md`, `lif-rust/ARCHITECTURE.md`  
**Run:** `cd lif-rust && cargo run`

## Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Frontend** | **Backend/ClearNode** | WebSocket + RPC |
| **Frontend** | **lif-rust** | REST (Phase 2; mocked in Phase 1) |
| **Frontend** | **Contracts** | JSON-RPC (viem/ethers) |
| **Backend** | **lif-rust** | REST (LiFi intent building) |
| **Backend** | **Contracts** | JSON-RPC |
| **lif-rust** | **LiFi API** | HTTPS (Phase 2) |

## Security Model

- **Non-custodial:** Users retain control; Force Withdrawal via last signed state to Adjudicator.
- **Session Key:** App-scoped, allowances, expiry; Solver can only fulfill intents per user grant.
- **User funds protected:** Only Treasury may be withdrawn by system owners; user funds never used for owner withdrawals.
- **Adjudicator:** Validates off-chain state and on-chain payouts (conclude / transfer).

## Documentation

- **Flows (canonical):** [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md)
- **Project context:** [`.context/project-context.md`](.context/project-context.md)
- **Diagrams:** [`.context/diagrams.md`](.context/diagrams.md)

Sub-projects have `.context/` folders with role definitions, system design, tech stack, security, and testing.

## License

TBD
