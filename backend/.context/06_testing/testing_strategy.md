# Testing Strategy

## Unit Testing

- 100% coverage of critical logic: session key management, signature validation, spread calculations, inventory health checks.
- Test delegation lifecycle: creation, usage, expiration, revocation.
- Test scoped permissions: ensure session keys cannot authorize transfers to external addresses.

## Integration Testing

- **Solver Logic:** Test the Flywheel Solver's pool fulfillment and reward allocation (50% User, 50% Treasury) with mocked LiFi.
- **State Channels:** Test Nitrolite (ERC-7824) state update flows with mocked Yellow SDK.
- **ClearNode:** Test WebSocket (`bu`) notifications and RPC endpoints for state queries.
- **Withdrawal:** Test withdrawal flow and liquidity checks.

## Load Testing

- **ClearNode RPC:** Target 1000+ TPS for balance queries and state updates.
- **WebSocket:** Test concurrent connections (1000+ simultaneous users receiving `bu` notifications).

## End-to-End Testing

- Full flow: user delegates → solver fulfills intents from pool → balance updated → frontend receives `bu`.
- Full withdrawal flow: request → liquidity check → payout → completion.
