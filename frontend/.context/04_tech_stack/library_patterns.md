# Library Patterns

Full dependency matrix in `docs/architecture/tech-stack.md`.
Wallet connection details in `docs/architecture/wallet-connection.md`.

| Library | Status | Usage |
|---------|--------|-------|
| **expo-router** 4.0.22 | Installed | File-based routing in `app/` directory. Navigation guards in root `index.tsx`. |
| **TanStack React Query** 5.62.16 | Installed | Server state: balances, delegation keys, sessions, withdrawals. Stale times: balance 30s, delegation 5min, health 60s. |
| **NativeWind** 4.1.23 | Installed | TailwindCSS for React Native via `className` prop. Brand tokens in `tailwind.config.js`. |
| **react-native-reanimated** 3.16.7 | Installed | Layout animations and gesture transitions (runs on UI thread). |
| **Zod** 3.23.8 | Installed | Schema validation (env config now, backend schema mirroring later). |
| **MSW** 2.6.9 | Installed | API mocking for integration tests. |
| **Zustand** 5.0.11 | Installed (E-2) | Client state: wallet connection, delegation status, WS status, onboarding progress. Persist via SecureStore/AsyncStorage. |
| **Reown AppKit** 2.0.1 | Installed (E-3) | WalletConnect modal, connection lifecycle, `useAppKit()`/`useAccount()` hooks. |
| **Wagmi** 2.19.5 | Installed (E-3) | React hooks for Ethereum (`useSignTypedData`), `WagmiProvider`. Must be v2 (Reown peer dep). |
| **Viem** 2.45.1 | Installed (E-3) | Chain definitions (`wagmi/chains`), address validation, ABI encoding. |
| **@erc7824/nitrolite** 0.5.3 | Installed (E-2) | `EIP712AuthTypes` for delegation typed-data signing (primary type: `Policy`). |
| **lucide-react-native** 0.563.0 | Installed (E-1) | Consistent icon set across the app. |
| **expo-secure-store** 15.0.8 | Installed (E-2) | Encrypted storage for Session Key metadata (address, scope, expiry, status). |
| **AsyncStorage** 2.2.0 | Installed (E-2) | Unencrypted storage for preferences, onboarding progress, non-sensitive UI state. |
| **Custom NativeWind primitives** | Installed (E-1) | 16 accessible UI components (replaces gluestack-ui — ADR-008). |
| **React Hook Form + Zod** | **(planned — E-9)** | Form state and validation. Mirror backend Zod schemas for client-side validation. |
| **lif-rust API** | **(planned — Phase 2)** | REST for LiFi quote fetching (`POST /lifi/quote`) and ERC-7683 order encoding. Mocked in Phase 1. |

---

## Reown AppKit + Wagmi Patterns

### Opening the WalletConnect Modal

```typescript
import { useAppKit } from '@reown/appkit-react-native';

function ConnectButton() {
  const { open } = useAppKit();
  return <Button title="Connect Wallet" onPress={() => open()} />;
}
```

### Reading Connection State

Always use `useAccount` from `@reown/appkit-react-native` (not from `wagmi`):

```typescript
import { useAccount } from '@reown/appkit-react-native';

function WalletInfo() {
  const { address, isConnected, chainId } = useAccount();
  if (!isConnected) return <Text>Not connected</Text>;
  return <AddressDisplay address={address} />;
}
```

### Disconnecting

```typescript
import { useAppKit } from '@reown/appkit-react-native';

function DisconnectButton() {
  const { disconnect } = useAppKit();
  return <Button title="Disconnect" onPress={() => disconnect()} />;
}
```

The `useWalletSync` hook automatically handles clearing `walletStore`, `delegationStore`, and SecureStore on disconnect.

### Wallet Sync Pattern

`useWalletSync()` is a side-effect hook mounted once via the `<WalletSync />` component inside `AppProviders`. It bridges Reown's connection state into Zustand:

```
useAccount() → { address, isConnected }
    │
    ├── connect: walletStore.setConnected(address)
    └── disconnect: walletStore.disconnect()
                    delegationStore.clear()
                    SecureStore.delete('flywheel-delegation')
```

### Provider Initialization

The `src/config/wagmi.ts` module is imported once by `AppProviders.tsx`. It executes at module load time:

1. `new WagmiAdapter({ networks, projectId })` — creates internal wagmi config
2. `createAppKit({ adapters: [wagmiAdapter], ... })` — creates singleton AppKit instance
3. Both are exported and used by `WagmiProvider` and `AppKitProvider` respectively

**Gotcha:** `createAppKit` is a singleton. The first call wins. Config changes require full app restart.

---

## Zustand Store Patterns

### Persistence Adapters

| Store | Adapter | Reason |
|-------|---------|--------|
| `walletStore` | None (ephemeral) | Connection re-established via WalletConnect session restore |
| `delegationStore` | `expo-secure-store` | Contains session key address, scope, expiry — sensitive data |
| `onboardingStore` | `AsyncStorage` | Non-sensitive progress tracking |
| `webSocketStore` | None (ephemeral) | Connection state is transient |

Persisted stores use `skipHydration: true`. Hydration happens in `app/index.tsx`:

```typescript
await Promise.all([
  useDelegationStore.persist.rehydrate(),
  useOnboardingStore.persist.rehydrate(),
]);
```

---

## WebSocket → Query Cache Sync

The `WebSocketProvider` (E-7) bridges real-time `bu` events into TanStack Query cache:

```
WebSocket "bu" event → WebSocketProvider.onMessage()
  → queryClient.setQueryData(['balance', userAddress], updater)
  → Components re-render with fresh balance
```

---

## EIP-712 Delegation Signing

```typescript
import { useSignTypedData } from 'wagmi';
import { EIP712AuthTypes } from '@erc7824/nitrolite';

const signature = await signTypedDataAsync({
  domain: { name: 'Flywheel' },
  types: EIP712AuthTypes,
  primaryType: 'Policy',
  message: { challenge: '', scope: 'liquidity', wallet: userAddress,
             session_key: sessionKeyAddress, expires_at: BigInt(expiresAt),
             allowances: selectedAllowances },
});
```
