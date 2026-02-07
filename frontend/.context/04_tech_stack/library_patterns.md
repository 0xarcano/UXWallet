# Library Patterns

Full dependency matrix in `../docs/architecture/tech-stack.md`.

> Libraries marked **(planned)** are documented for future epics but not yet installed.

| Library | Status | Usage |
|---------|--------|-------|
| **expo-router** 4.0.22 | Installed | File-based routing in `app/` directory. Navigation guards in root `index.tsx`. |
| **TanStack React Query** 5.62.16 | Installed | Server state: balances, delegation keys, sessions, withdrawals. Stale times: balance 30s, delegation 5min, health 60s. |
| **NativeWind** 4.1.23 | Installed | TailwindCSS for React Native via `className` prop. Brand tokens in `tailwind.config.js`. |
| **react-native-reanimated** 3.16.7 | Installed | Layout animations and gesture transitions (runs on UI thread). |
| **Zod** 3.23.8 | Installed | Schema validation (env config now, backend schema mirroring later). |
| **MSW** 2.6.9 | Installed | API mocking for integration tests. |
| **Zustand** | **(planned — E-2)** | Client state: wallet connection, delegation status, WS status, onboarding progress. Persist via AsyncStorage. |
| **React Hook Form + Zod** | **(planned — E-9)** | Form state and validation. Mirror backend Zod schemas for client-side validation. |
| **Wagmi + Viem** | **(planned — E-3)** | Ethereum hooks (`useAccount`, `useSignTypedData`), address validation, ABI encoding. |
| **Reown AppKit** | **(planned — E-3)** | WalletConnect modal and session management for wallet connection. |
| **@erc7824/nitrolite** | **(planned — E-4)** | `EIP712AuthTypes` for delegation typed-data signing (primary type: `Policy`). |
| **Custom NativeWind primitives** | In progress | Accessible UI components built with NativeWind (replaces gluestack-ui — ADR-008). |
| **lucide-react-native** | **(planned — E-1)** | Consistent icon set across the app. |
| **expo-secure-store** | **(planned — E-2)** | Encrypted storage for Session Key metadata (address, scope, expiry, status). |
| **AsyncStorage** | **(planned — E-2)** | Unencrypted storage for preferences, onboarding progress, non-sensitive UI state. |
| **lif-rust API** | **(planned — Phase 2)** | REST for LiFi quote fetching (`POST /lifi/quote`) and ERC-7683 order encoding. Mocked in Phase 1. |

## WebSocket → Query Cache Sync

The `WebSocketProvider` bridges real-time `bu` events into TanStack Query cache:

```
WebSocket "bu" event → WebSocketProvider.onMessage()
  → queryClient.setQueryData(['balance', userAddress], updater)
  → Components re-render with fresh balance
```

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
