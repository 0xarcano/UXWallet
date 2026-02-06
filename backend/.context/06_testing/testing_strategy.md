# Testing Strategy

## Mock vs Real Policy

| Integration | Mode | Notes |
|---|---|---|
| **LiFi** | **Mocked** | `MockLifiClient` used everywhere; no real LiFi/lif-rust in tests or MVP runtime. |
| **Yellow / ClearNode** | **Real (testnet)** | Integration tests connect to Yellow sandbox (`wss://clearnet-sandbox.yellow.com/ws`). Yellow is never mocked. |
| **Prisma / Redis** | Mocked in unit & API integration tests | May use real DB in future full-stack integration tests. |

## Unit Testing (`pnpm test`)

- 100% coverage of critical logic: session key management, signature validation, spread calculations, inventory health checks.
- Test delegation lifecycle: creation, usage, expiration, revocation.
- Test scoped permissions: ensure session keys cannot authorize transfers to external addresses.
- **No network required.** Yellow, LiFi, Prisma, and Redis are not used (or mocked where needed).

## Integration Testing (`pnpm test:integration`)

- **Solver Logic:** Test the Flywheel Solver's pool fulfillment and reward allocation (50% User, 50% Treasury) with mocked LiFi.
- **State Channels:** Test Nitrolite (ERC-7824) state update flows against the **real Yellow testnet (sandbox)**.
- **ClearNode:** Test WebSocket connectivity and authentication against Yellow sandbox.
- **Withdrawal:** Test withdrawal flow and liquidity checks.
- **Yellow connectivity:** Validate connect/disconnect to ClearNode sandbox; optionally authenticate with solver signer.
- Requires network access to `wss://clearnet-sandbox.yellow.com/ws` (defaulted when `NODE_ENV=test`).

## Load Testing

- **ClearNode RPC:** Target 1000+ TPS for balance queries and state updates.
- **WebSocket:** Test concurrent connections (1000+ simultaneous users receiving `bu` notifications).

## End-to-End Testing

- Full flow: user delegates → solver fulfills intents from pool → balance updated → frontend receives `bu`.
- Full withdrawal flow: request → liquidity check → payout → completion.
