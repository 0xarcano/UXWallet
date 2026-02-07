# Error Handling

Full details in `../docs/architecture/coding-standards.md` and `../docs/architecture/architecture.md`.

## API Error Mapping

Every backend error code maps to a user-facing message via `src/lib/errors.ts`. Errors arrive as `{ error: { code, message, details? } }`.

Key error codes: `VALIDATION_ERROR`, `INSUFFICIENT_FUNDS`, `INSUFFICIENT_LIQUIDITY`, `RATE_LIMITED`, `SESSION_KEY_EXPIRED`, `SESSION_KEY_REVOKED`, `WITHDRAWAL_PENDING`, `CONNECTION_FAILED`, `TIMEOUT`, `INVALID_SIGNATURE`.

## Toast Pattern: Reassure → Explain → Resolve

1. **Reassure:** "Your funds are safe."
2. **Explain:** "The withdrawal couldn't complete because..."
3. **Resolve:** "Tap to retry" or "Contact support"

## Error Boundaries

- Root `ErrorBoundary` in `app/_layout.tsx` catches unhandled render errors.
- Shows a "Something went wrong" screen with a "Restart" button.
- Per-screen error states use the `ErrorState` component with retry.

## Network Errors

- Distinguish between server errors (5xx) and client errors (4xx).
- Show `ConnectionIndicator` in offline/disconnected state.
- TanStack Query retries failed requests 3 times with exponential backoff.
- WebSocket reconnects independently (1s → 2s → 4s → 8s → max 30s); re-subscribe and fetch fresh balances after reconnect.

## Input Validation

- Mirror backend Zod schemas client-side (`ethereumAddress`, `uint256String`, `chainId`, `hexString`).
- Validate via React Hook Form + `@hookform/resolvers/zod`.
- Never use `JSON.parse` on untrusted data without try/catch.
