# lif-rust Integration (Flywheel)

## Summary

`lif-rust` is the microservice that integrates with the **LiFi API** for the Flywheel protocol. For the MVP, **all LiFi system components are mocked**; callers use lif-rust with mock responses so flows are testable without the real LiFi API. See [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md) for flows.

## Role in Flywheel

- **MVP:** LiFi components are **mocked**. lif-rust may be stubbed or called with mock responses (Sepolia + Base Sepolia).

**Consumers:** Backend Flywheel Solver (when creating LiFi intent orders; mocked at callers for MVP).

## Communication

### Backend (Flywheel Solver) → lif-rust

- `POST /lifi/quote` — Get routing quote (mocked)
- `POST /intent/build` — Build order for LiFi marketplace (mocked)

### lif-rust → LiFi API

- Mocked in MVP.

## Design Principles

- **Stateless:** No session state; horizontally scalable
- **Idempotent:** Same input → same output
- **Separation of concerns:** LiFi integration only; custody and settlement remain Yellow/Nitrolite

## Documentation

- **Canonical flows:** [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md)
- **Project context:** [`.context/project-context.md`](.context/project-context.md)
- **lif-rust details:** `lif-rust/README.md`, `lif-rust/ARCHITECTURE.md`
