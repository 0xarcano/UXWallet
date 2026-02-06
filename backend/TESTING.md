# Testing

## First-time setup

Before running tests, install dependencies and generate the Prisma client:

```bash
pnpm install
pnpm db:generate
```

**Configuration from `.env`:** Both unit and integration tests load `.env` before running (via the Vitest config). All configuration (e.g. `CLEARNODE_WSS_URL`, `CLEARNODE_APPLICATION`, `DATABASE_URL`) is read from `.env`; there is no hardcoded config in the test code. Copy `.env.example` to `.env` and adjust as needed. If `.env` is missing or a variable is unset, test-time defaults apply (e.g. Yellow sandbox URL when `NODE_ENV=test`).

Integration tests need network access to the Yellow sandbox; no database or Redis is required (they are mocked in tests).

## Mock vs Real Policy

| Integration | Mode | Details |
|---|---|---|
| **LiFi** | Mocked | `MockLifiClient` is always used. No real LiFi / lif-rust calls in tests or MVP runtime. |
| **Yellow / ClearNode** | Real (testnet) | Integration tests connect to Yellow sandbox. Yellow is **never** mocked. |
| **Prisma / Redis** | Mocked in unit & API integration tests | May use real DB in future full-stack integration tests. |

## Unit Tests

Fast, offline tests that cover core business logic (delegation, profitability, validation, retry, etc.). No network access needed.

```bash
pnpm test
```

- Config: `vitest.config.ts` (runs `tests/unit/**/*.test.ts`)
- No env vars required beyond what the mocks provide.

## Integration Tests

Tests that exercise API routes, Yellow/ClearNode connectivity, and solver flows. Yellow integration tests communicate with the **real Yellow sandbox** (`wss://clearnet-sandbox.yellow.com/ws`).

```bash
pnpm test:integration
```

- Config: `vitest.integration.config.ts` (runs `tests/integration/**/*.test.ts`)
- `NODE_ENV` is set to `test` automatically by the Vitest config, which defaults `CLEARNODE_WSS_URL` to Yellow sandbox.

### Required Environment

| Variable | Required? | Default (when `NODE_ENV=test`) | Notes |
|---|---|---|---|
| `CLEARNODE_WSS_URL` | No | `wss://clearnet-sandbox.yellow.com/ws` | Override to point at a different ClearNode. |
| `CLEARNODE_APPLICATION` | No | `Flywheel` | Application name for Yellow auth. |
| `SOLVER_PRIVATE_KEY` | For auth tests | (none) | Hex private key with `0x` prefix. Required if running tests that call `authenticate()`. If unset, an ephemeral key is generated for dev. |

### Overriding the ClearNode URL

To explicitly target a specific ClearNode:

```bash
CLEARNODE_WSS_URL=wss://clearnet-sandbox.yellow.com/ws pnpm test:integration
```

## All Tests

```bash
pnpm test && pnpm test:integration
```

## Yellow Network component coverage

These components perform processes related to the Yellow Network and are (or are not) tested against the real Yellow sandbox:

| Component | What it does | Tested against Yellow sandbox? | Notes |
|-----------|----------------|---------------------------------|-------|
| **YellowClient** (`src/integrations/yellow/client.ts`) | WebSocket connect/disconnect, auth (EIP-712), RPC: createAppSession, submitAppState, getLedgerBalances, getChannels, closeAppSession | **Partially** | Connect/disconnect and (when `SOLVER_PRIVATE_KEY` set) authenticate + getChannels are integration-tested. createAppSession, submitAppState, closeAppSession, getLedgerBalances are not yet covered by integration tests. |
| **ClearNodeService** (`src/services/clearnode/index.ts`) | Orchestrates YellowClient: initializeSession (connect + auth + createAppSession), submitStateUpdate, getLedgerBalances, closeSession | **No** | No HTTP route calls it yet; when routes are added, add integration tests that run these flows against the sandbox. |
| **Delegation verification** (`src/services/delegation/verification.ts`) | Off-chain EIP-712 (Nitrolite Policy) signature verification | **No** (unit only, mocked) | Verification logic is unit-tested with mocks; does not open a Yellow connection. |

To run the full Yellow integration suite (including auth and RPC), set `SOLVER_PRIVATE_KEY` in `.env` (hex with `0x`). Auth and RPC tests are skipped when it is unset so CI without a key still passes.

## Summary

- **LiFi** is always mocked (`MockLifiClient`).
- **Yellow** is never mocked; integration tests hit the real Yellow sandbox testnet.
- Unit tests are offline and fast; integration tests require network access to Yellow sandbox.
