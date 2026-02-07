# Wallet Connection Architecture

> Reown AppKit + Wagmi integration for the Flywheel Wallet. Implemented in E-3.

## Overview

The Flywheel Wallet is **non-custodial** — it never stores private keys. All signing happens in the user's external wallet (MetaMask, Rainbow, Trust, etc.) via WalletConnect. The integration uses:

| Library | Version | Role |
|---------|---------|------|
| `@reown/appkit-react-native` | 2.0.1 | WalletConnect modal UI, connection lifecycle, `useAppKit`/`useAccount` hooks |
| `@reown/appkit-wagmi-react-native` | 2.0.1 | Wagmi adapter bridge — creates wagmi config from AppKit networks |
| `wagmi` | 2.19.5 | React hooks for Ethereum (`useAccount`, `useSignTypedData`, `WagmiProvider`) |
| `viem` | 2.45.1 | Ethereum utilities (chain definitions, address validation, ABI encoding) |

### Why Wagmi 2.x (not 3.x)

`@reown/appkit-wagmi-react-native@2.0.1` has a peer dependency: `wagmi >=2 <3.0.0`. Wagmi 3.x changes the internal config API and breaks the adapter. Pin to `^2.19.5` until Reown publishes a v3-compatible adapter.

---

## Provider Hierarchy

Providers are composed in `src/providers/AppProviders.tsx`:

```
GestureHandlerRootView
└── WagmiProvider (wagmiAdapter.wagmiConfig)
    └── QueryClientProvider (TanStack Query)
        └── AppKitProvider (instance={appkit})
            └── WalletSync (side-effect component)
                └── SafeAreaProvider
                    └── children (expo-router <Slot />)
```

**Ordering rationale:**
- `WagmiProvider` wraps everything because wagmi hooks (`useAccount`) need the config context
- `QueryClientProvider` is inside WagmiProvider (wagmi uses TanStack Query internally in v2)
- `AppKitProvider` provides the modal context and AppKit hooks (`useAppKit`, `useAccount` from Reown)
- `WalletSync` runs inside both providers to sync connection state to Zustand

### Polyfill Requirements

Two imports **must** appear at the very top of `app/_layout.tsx`, before all other imports:

```typescript
import 'react-native-get-random-values';  // crypto.getRandomValues polyfill
import '@walletconnect/react-native-compat'; // React Native compatibility shims
```

These are required by WalletConnect's crypto operations on React Native.

---

## Configuration

### `src/config/wagmi.ts`

This file creates and exports three things:

1. **`wagmiAdapter`** — `WagmiAdapter` instance with project ID and chain networks
2. **`appkit`** — Singleton `AppKit` instance (created via `createAppKit()`)
3. **`networks`** — Chain array selected by `EXPO_PUBLIC_CHAIN_ENV`

```typescript
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { createAppKit } from '@reown/appkit-react-native';
import { sepolia, baseSepolia, mainnet, arbitrum } from 'wagmi/chains';

// Networks switch on env
const networks = env.EXPO_PUBLIC_CHAIN_ENV === 'testnet'
  ? [sepolia, baseSepolia]
  : [mainnet, arbitrum];

// Adapter creates internal wagmi config
const wagmiAdapter = new WagmiAdapter({ networks, projectId });

// AppKit singleton — IMPORTANT: config is ignored on subsequent calls
const appkit = createAppKit({
  projectId, metadata, networks, adapters: [wagmiAdapter],
  storage: appKitStorage, defaultNetwork: networks[0], themeMode: 'dark',
});
```

**Key constraint:** `createAppKit` uses a singleton pattern. Once created, subsequent calls return the existing instance and **ignore** the config parameter. To change config, the app must be fully reloaded.

### `src/lib/appkit/storage.ts`

Reown AppKit requires a `Storage` adapter for persisting connection state (recent wallets, deep link choices, active namespace). This adapter wraps `AsyncStorage`:

```typescript
interface Storage {
  getKeys(): Promise<string[]>;
  getEntries<T>(): Promise<[string, T][]>;
  getItem<T>(key: string): Promise<T | undefined>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

The adapter filters keys by `@appkit/` and `WALLETCONNECT_` prefixes in `getKeys()`/`getEntries()` to avoid leaking unrelated AsyncStorage data.

---

## Chain Configuration

| Env | Chains | Chain IDs |
|-----|--------|-----------|
| `testnet` | Sepolia, Base Sepolia | 11155111, 84532 |
| `mainnet` | Ethereum, Arbitrum One | 1, 42161 |

Chains are imported from `wagmi/chains` (re-exported from `viem/chains`). These are `Chain` objects with full RPC URLs, block explorers, and native currency metadata.

The existing `src/config/chains.ts` provides a simpler `ChainConfig` type for non-wagmi contexts (UI display, etc.). Both use the same `EXPO_PUBLIC_CHAIN_ENV` switch.

---

## Hooks

### `useAppKit()` (from `@reown/appkit-react-native`)

Controls the Reown modal:

```typescript
const { open, close, disconnect, switchNetwork } = useAppKit();

// Open the WalletConnect modal
open();

// Disconnect current wallet
disconnect();
```

### `useAccount()` (from `@reown/appkit-react-native`)

Reads current connection state:

```typescript
const { address, isConnected, chainId } = useAccount();
```

**Important:** Use `useAccount` from `@reown/appkit-react-native`, not from `wagmi`. The Reown version is aware of the AppKit connection lifecycle and provides consistent state.

### `useWalletSync()` (custom — `src/hooks/useWalletSync.ts`)

A side-effect hook that bridges `useAccount()` into the Zustand `walletStore`:

```
useAccount().isConnected → walletStore.setConnected(address)
useAccount() disconnects → walletStore.disconnect()
                         → delegationStore.clear()
                         → SecureStore.deleteItemAsync('flywheel-delegation')
```

**Security:** On disconnect, all delegation data is wiped from both Zustand and the encrypted SecureStore. This ensures no stale session keys persist after wallet disconnection.

### `useSignTypedData()` (from `wagmi` — used in E-4)

For EIP-712 delegation signing:

```typescript
import { useSignTypedData } from 'wagmi';

const { signTypedDataAsync } = useSignTypedData();

const signature = await signTypedDataAsync({
  domain: { name: 'Flywheel' },
  types: EIP712AuthTypes,
  primaryType: 'Policy',
  message: { /* delegation params */ },
});
```

---

## Navigation Flow

### Boot Sequence (`app/index.tsx`)

```
App launches
    │
    ▼
Hydrate persisted stores (delegationStore, onboardingStore)
    │
    ▼
Check connection state
    │
    ├── Not connected → /onboarding/connect
    ├── Connected, no delegation → /onboarding/delegate
    ├── Connected + delegated, onboarding incomplete → /onboarding/select-tokens
    └── Fully onboarded → /(tabs)/home
```

### Connect Screen (`app/onboarding/connect.tsx`)

```
User taps "Connect Wallet"
    │
    ▼
useAppKit().open()  →  Reown modal appears
    │                       │
    │                  User selects wallet
    │                       │
    │                  WalletConnect handshake
    │                       │
    ▼                       ▼
useAccount().isConnected becomes true
    │
    ▼
useWalletSync syncs address to walletStore
    │
    ▼
useEffect navigates to /onboarding/delegate
```

### Disconnect Flow (`app/(tabs)/settings.tsx`)

```
User taps "Disconnect Wallet"
    │
    ▼
useAppKit().disconnect()
    │
    ▼
useAccount().isConnected becomes false
    │
    ▼
useWalletSync detects disconnect:
  - walletStore.disconnect()
  - delegationStore.clear()
  - SecureStore.deleteItemAsync('flywheel-delegation')
    │
    ▼
Navigation guard redirects to /onboarding/connect
```

---

## iOS Configuration

`app.json` includes `LSApplicationQueriesSchemes` under `ios.infoPlist`:

```json
["metamask", "trust", "safe", "rainbow", "uniswap"]
```

This allows iOS to detect which wallet apps are installed via `canOpenURL()`. Required for WalletConnect deep linking on iOS.

**Android does not need this** — intent resolution handles wallet detection automatically.

---

## Babel Configuration

`babel.config.js` includes `unstable_transformImportMeta: true` in both test and non-test environments. This is required because `valtio` (a transitive dependency of Reown AppKit) uses `import.meta`, which is not natively supported by Metro/Babel.

---

## Testing

### Jest Mocks (`src/test/setup.ts`)

All Reown/Wagmi modules are mocked globally:

| Module | Mock Strategy |
|--------|--------------|
| `@reown/appkit-react-native` | Mock `useAppKit`, `useAccount`, `AppKitProvider`, `AppKit`, `createAppKit` |
| `@reown/appkit-wagmi-react-native` | Mock `WagmiAdapter` constructor |
| `wagmi` | Mock `WagmiProvider`, `useAccount`, `useSignTypedData` |
| `wagmi/chains` | Mock chain objects with `id` and `name` |
| `@walletconnect/react-native-compat` | Empty mock |
| `react-native-get-random-values` | Empty mock |
| `@react-native-community/netinfo` | Mock `addEventListener`, `fetch` |
| `expo-application` | Mock `applicationId` |
| `@/config/wagmi` | Mock `wagmiAdapter`, `appkit`, `networks` |

The `useAppKit` and `useAccount` mocks are defined as `jest.fn()` at module scope, allowing individual tests to override return values:

```typescript
import { useAccount } from '@reown/appkit-react-native';

const mockUseAccount = useAccount as jest.Mock;

mockUseAccount.mockReturnValue({
  address: '0x1234...',
  isConnected: true,
});
```

### Test Coverage

| Test File | Tests | What It Covers |
|-----------|-------|---------------|
| `src/config/__tests__/wagmi.test.ts` | 4 | Config exports, network selection |
| `src/hooks/__tests__/useWalletSync.test.ts` | 4 | Store sync on connect/disconnect, SecureStore clearing |
| `app/onboarding/__tests__/connect.test.tsx` | 5 | Screen rendering, button press opens modal, navigation on connect |
| `app/__tests__/index.test.tsx` | 5 | Navigation guard redirects for all 4 states |

---

## Troubleshooting

### `unstable_transformImportMeta` errors

If you see `Cannot use 'import.meta' outside a module`, ensure `babel.config.js` has `unstable_transformImportMeta: true` in the `babel-preset-expo` options for **both** test and non-test environments.

### Typed routes errors after adding new screens

Expo's `typedRoutes` feature caches route types in `.expo/types/router.d.ts`. After adding new route files:

```bash
npx expo customize tsconfig.json
```

This regenerates the typed route definitions.

### Wagmi version mismatch

If `pnpm install` pulls wagmi 3.x, the Reown adapter will log peer dependency warnings and may fail at runtime. Ensure `package.json` pins `"wagmi": "^2.19.5"`.

### WalletConnect project ID

The `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` env var must contain a valid project ID from [Reown Dashboard](https://cloud.reown.com/). Without it, the modal will not load wallet listings.

### AppKit singleton

`createAppKit()` is a singleton. If you need to change config during development, restart the app completely (not just hot reload). The first call wins.
