# Library Patterns

Full dependency matrix in `../docs/architecture/tech-stack.md`.

| Library | Usage |
|---------|-------|
| **expo-router** | File-based routing in `app/` directory. Navigation guards in root `index.tsx`. |
| **TanStack React Query** | Server state: balances, delegation keys, sessions, withdrawals. Stale times: balance 30s, delegation 5min, health 60s. |
| **Zustand** | Client state: wallet connection, delegation status, WS status, onboarding progress. Persist via AsyncStorage. |
| **React Hook Form + Zod** | Form state and validation. Mirror backend Zod schemas for client-side validation. |
| **Wagmi + Viem** | Ethereum hooks (`useAccount`, `useSignTypedData`), address validation, ABI encoding. |
| **Reown AppKit** | WalletConnect modal and session management for wallet connection. |
| **@erc7824/nitrolite** | `EIP712AuthTypes` for delegation typed-data signing (primary type: `Policy`). |
| **NativeWind** | TailwindCSS for React Native via `className` prop. Brand tokens in `tailwind.config.js`. |
| **gluestack-ui** | Accessible component primitives (Button, Input, Modal, Toast, BottomSheet). |
| **lucide-react-native** | Consistent icon set across the app. |
| **react-native-reanimated** | Layout animations and gesture transitions (runs on UI thread). |
| **expo-secure-store** | Encrypted storage for Session Key metadata (address, scope, expiry, status). |
| **AsyncStorage** | Unencrypted storage for preferences, onboarding progress, non-sensitive UI state. |
| **MSW** | API mocking for integration tests. |
| **lif-rust API** | REST for LiFi quote fetching (`POST /lifi/quote`) and ERC-7683 order encoding. Mocked in Phase 1. |

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
