# Stack Security

## Session Key Security

- **Scoped Permissions:** Ensure the Persistent Session Key can ONLY authorize state updates within the vault network as result of an intent order fulfillment (checking that funds are delivered in another chain's smart contract vault by the intents protocol). It must NOT authorize transfers to external addresses.
- **Validation:** Validate all EIP-712 signatures before processing state updates; verify delegation is not expired or revoked.
- **Signature Guard:** Ensure the session key is only used for Nitrolite (ERC-7824) state updates and LI.FI (ERC-7683) intent fulfillments, never for direct `transfer()` calls to unknown addresses.

## State & Ledger Security

- **Atomicity:** Ensure atomicity in Virtual Ledger updates to prevent double-spending.
- **State Persistence:** Store latest signed Nitrolite state in PostgreSQL with redundancy to prevent fund lock-ups.
- **Replay Protection:** Use nonces/sequence numbers to prevent replay attacks on state updates.

## Solver Security

- **Inventory Health Checks:** Never fulfill an intent if it would break withdrawal guarantees ("Fast Exit Guarantee").
- **Spread Validation:** Ensure spread calculations account for all fees (gas, bridge, rebalancing) to prevent negative yields.
- **Rate Limiting:** Implement rate limiting on RPC endpoints to prevent DoS attacks.
