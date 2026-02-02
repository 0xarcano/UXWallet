# Stack Security

- Validate all EIP-712 signatures before processing state updates.
- Ensure atomicity in ledger updates to prevent double-spending.
- **Signature Guard:** Ensure the session key is only used for Nitrolite state updates, never for direct `transfer()` calls to unknown addresses.
