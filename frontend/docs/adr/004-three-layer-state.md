# ADR-004: Three-Layer State Management

## Status

Accepted

## Context

Per `architecture.md`, the app needs clear state management boundaries. Server state (balances, transactions, delegation status) must stay in sync with the backend. Client state (UI preferences, selected network) must persist across sessions. Ephemeral state (form inputs, modal visibility) should not outlive the component.

## Decision

Three-layer state architecture:

1. **Ephemeral** — React `useState`, React Hook Form. Dies with the component.
2. **Client** — Zustand stores with `persist` middleware (via `expo-secure-store` or `AsyncStorage`). Survives app restarts.
3. **Server** — TanStack React Query. Single source of truth for all backend data.

Key rules:
- Never duplicate server state in Zustand
- WebSocket `bu` (balance update) events write directly to TanStack Query cache via `queryClient.setQueryData()`
- Zustand stores are small and focused (auth, preferences, delegation)

## Consequences

- **Positive:** Clear separation of concerns — each layer has one job
- **Positive:** Real-time updates without polling (WebSocket → query cache)
- **Positive:** Stale-while-revalidate pattern for server data
- **Negative:** Requires discipline to keep layers separate (code review enforcement)
