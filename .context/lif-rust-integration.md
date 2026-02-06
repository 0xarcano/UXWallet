# lif-rust Integration (Flywheel)

## Summary

`lif-rust` is the microservice that integrates with the **LiFi API** for the Flywheel protocol. It is used when the **liquidity layer cannot fulfill** a transfer (e.g. pool has no funds on the destination chain, or on the requested chain for same-chain send). The system then **creates intent orders in the LiFi marketplace**; funds to complete those orders come from the **pool on source chains** (released to the LiFi solver) or from **Flywheel Treasury** (sponsored same-chain). See [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md) for flows.

## Role in Flywheel

- **When pool can fulfill:** Same-chain or cross-chain transfer is fulfilled from the Aggregated Liquidity Pool; no LiFi, no lif-rust.
- **When pool cannot fulfill:** Flywheel Solver creates an intent order in the LiFi marketplace. lif-rust is used to:
  - Fetch LiFi routing quotes
  - Build/encode order data (e.g. ERC-7683) and calldata for the solver/contract side

**Consumers:** Frontend (for user-initiated send when LiFi path is used), Backend Flywheel Solver (when creating LiFi intent orders).

## Development Phases

- **Phase 1 (Testnets, LiFi mocked):** Yellow on Sepolia + Arbitrum Sepolia; **LiFi system components mocked**. lif-rust may be stubbed or called with mock responses so flows are testable without the real LiFi API.
- **Phase 2 (Mainnet, LiFi integrated):** Yellow on Ethereum mainnet + Arbitrum mainnet; **LiFi implemented**. lif-rust talks to the real LiFi API; intent orders are created and funded from pool on source chains or Treasury-sponsored as in sequence-diagrams.md.

## Communication

### Frontend → lif-rust

- `POST /lifi/quote` — Get routing quote
- `POST /intent/calldata` — Get transaction calldata (when LiFi path is used)

### Backend (Flywheel Solver) → lif-rust

- `POST /lifi/quote` — Get routing quote
- `POST /intent/build` — Build order for LiFi marketplace

### lif-rust → LiFi API

- HTTPS (Phase 2; mocked in Phase 1)

## Design Principles

- **Stateless:** No session state; horizontally scalable
- **Idempotent:** Same input → same output
- **Separation of concerns:** LiFi integration only; custody and settlement remain Yellow/Nitrolite

## Documentation

- **Canonical flows:** [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md)
- **Project context:** [`.context/project-context.md`](.context/project-context.md)
- **lif-rust details:** `lif-rust/README.md`, `lif-rust/ARCHITECTURE.md`
