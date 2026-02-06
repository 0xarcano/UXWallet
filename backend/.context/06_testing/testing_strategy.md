# Testing Strategy

## Unit Testing

- 100% coverage of critical logic: session key management, signature validation, spread calculations, inventory health checks.
- Test delegation lifecycle: creation, usage, expiration, revocation.
- Test scoped permissions: ensure session keys cannot authorize transfers to external addresses.

## Integration Testing

- **Solver Logic:** Test the JIT solver's decision-making (spread vs. inventory health) against mocked LI.FI marketplace data.
- **State Channels:** Test Nitrolite (ERC-7824) state update flows with mocked Yellow SDK.
- **ClearNode:** Test WebSocket (`bu`) notifications and RPC endpoints for state queries.
- **Hybrid Exit:** Test Direct Exit vs Sponsored Exit logic based on vault liquidity.

## Load Testing

- **ClearNode RPC:** Target 1000+ TPS for balance queries and state updates.
- **WebSocket:** Test concurrent connections (1000+ simultaneous users receiving `bu` notifications).

## End-to-End Testing

- Full unification flow: user delegates → fragments detected → intent created → solver fulfills → balance updated → frontend receives `bu`.
- Full withdrawal flow: request → check liquidity → Direct or Sponsored Exit → completion.
