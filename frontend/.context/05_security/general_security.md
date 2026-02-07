# General Security

Full details in `../docs/architecture/security.md`.

## Core Principle: Non-Custodial

The Flywheel Wallet **never holds, stores, or transmits private keys**. All cryptographic signing happens in the user's external wallet app (MetaMask, Rainbow, etc.) via WalletConnect.

## What the App NEVER Does

- Store private keys or seed phrases.
- Generate wallets or key material.
- Sign transactions directly.
- Log signatures or key material (even in debug builds).

## What the App DOES

- Request EIP-712 typed-data signatures via WalletConnect (delegation only).
- Store Session Key **metadata** (scope, expiry, status) in `expo-secure-store` — never the raw signature.
- Provide clear UI for delegation revocation.

## Input Validation

- Mirror backend Zod schemas client-side to reject invalid input before network requests.
- Validate all API responses before rendering (runtime type checks).
- Sanitize addresses to lowercase before comparison.
- Never use `eval()`, `new Function()`, or dynamic code execution.

## Network Security

- All REST calls go through a single typed HTTP client (`src/lib/api/client.ts`).
- Use `wss://` in production; validate all incoming WebSocket messages against expected shape.
- Never embed secrets in the client bundle (`EXPO_PUBLIC_*` vars are compile-time embedded).
- Drop malformed WebSocket messages silently (log in dev only).

## Deep Link Security

- Only allow navigation to known routes defined in `app/`.
- Never auto-execute transactions from deep links.
- Display a warning banner when a screen was opened via deep link.
- Validate that `userAddress` in deep link params matches the connected wallet.
