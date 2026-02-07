# ADR-003: Provider Hierarchy

## Status

Accepted

## Context

React Native apps require multiple context providers wrapping the application root. The order matters because inner providers depend on outer ones. Per `component-architecture.md`, QueryClient must wrap WebSocket (WS events write to the query cache). Wagmi must wrap anything using `useAccount`. We chose not to use gluestack-ui (see ADR-008), simplifying the hierarchy.

## Decision

Provider nesting order (outermost to innermost):

```
ErrorBoundary
  └── GestureHandlerRootView
      └── QueryClientProvider
          └── WagmiProvider (E-3)
              └── WebSocketProvider (E-7)
                  └── SafeAreaProvider
                      └── {children} (Slot)
```

ErrorBoundary is outermost to catch any crash in the provider tree. GestureHandler wraps everything that might receive gestures. QueryClient wraps WebSocket so WS events can call `queryClient.setQueryData()`. Wagmi wraps WebSocket so connection status is available.

## Consequences

- **Positive:** Correct dependency order — each provider can access its parent's context
- **Positive:** 6 levels of nesting (simpler than with a UI library provider)
- **Negative:** ErrorBoundary theming must use NativeWind directly (no theme provider above it)
