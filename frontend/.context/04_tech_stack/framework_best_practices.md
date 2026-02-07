# Framework Best Practices

Full dependency matrix in `../docs/architecture/tech-stack.md`.

## Expo / React Native

- Use Expo managed workflow (SDK 52) for native module bridge and OTA updates.
- Pin Expo-managed packages with `~` to stay within SDK's compatible range.
- Use `expo-router` for file-based routing (maps to `app/` directory).
- Use `expo-secure-store` for encrypted storage (iOS Keychain / Android Keystore).
- Use `EAS Build` for cloud-native builds; avoid local native builds unless necessary.

## State Management

- **Server state** (API data): TanStack React Query 5.x — caching, background refetch, optimistic updates.
- **Client state** (app state): Zustand 5.x — lightweight, persist to AsyncStorage.
- **Ephemeral state** (forms, modals): React state + React Hook Form.
- Never duplicate server state in Zustand — let TanStack Query own API data.

## Performance

- Minimize bundle size with lazy loading where possible.
- Use `react-native-reanimated` for animations (runs on UI thread).
- Avoid barrel files to reduce bundle size and prevent circular dependencies.
- Use `@/` path alias for cross-module imports; relative imports only within same feature directory.

## Provider Hierarchy

```
ErrorBoundary
└── GestureHandlerRootView
    └── GluestackUIProvider (theme)
        └── QueryClientProvider
            └── WagmiProvider + Reown AppKit
                └── WebSocketProvider (WS lifecycle + cache sync)
                    └── SafeAreaProvider
                        └── expo-router <Slot />
```
