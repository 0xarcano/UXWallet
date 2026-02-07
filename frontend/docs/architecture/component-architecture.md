# Screen & Component Architecture

> Complete breakdown of screens, components, hooks, and API mappings for the Flywheel Wallet.

## Provider Hierarchy

Providers are composed in `src/providers/AppProviders.tsx` and wrapped in `app/_layout.tsx`:

**Current (E-0 bootstrap):**
```
GestureHandlerRootView
└── QueryClientProvider (TanStack Query)
    └── SafeAreaProvider
        └── expo-router <Slot />
```

**Target (after E-3 / E-7):**
```
ErrorBoundary
└── GestureHandlerRootView
    └── QueryClientProvider (TanStack Query)
        └── WagmiProvider + Reown AppKit          ← E-3
            └── WebSocketProvider (WS lifecycle)   ← E-7
                └── SafeAreaProvider
                    └── expo-router <Slot />
```

**Rationale for ordering:**
- `ErrorBoundary` is outermost to catch any provider initialization errors (to be added)
- `QueryClientProvider` must wrap `WebSocketProvider` (WS provider writes to query cache)
- `WagmiProvider` must wrap any component using `useAccount` or `useSignTypedData`
- `WebSocketProvider` connects after wallet is available (reads `userAddress` from Wagmi)

> **ADR-008:** GluestackUIProvider was removed from the hierarchy. Custom NativeWind primitives are used instead — no provider needed for styling.

---

## Shared Reusable Components

> **Status:** All 16 shared components implemented in E-1. See `docs/implementation-records.md` for details.

### Layout Components

| Component | Location | Props | Description |
|-----------|----------|-------|-------------|
| `ScreenContainer` | `shared/` | `children`, `scroll?`, `padding?`, `className?` | SafeAreaView + optional ScrollView, `bg-brand-bg flex-1`, optional `px-4 pt-4` |
| `Header` | `shared/` | `title?`, `showBack?`, `rightAction?`, `walletAddress?`, `connectionStatus?` | Top bar with AddressDisplay pill, back arrow (lucide ChevronLeft), connection dot, right action slot |
| `BottomSheet` | `ui/` | `isOpen`, `onClose`, `children`, `snapPoints?`, `title?` | Custom modal using reanimated slide animation + dark backdrop. Handle bar + optional title. |

### Data Display Components

| Component | Location | Props | Description |
|-----------|----------|-------|-------------|
| `AmountDisplay` | `shared/` | `amount: string`, `asset: string`, `decimals: number`, `size?: 'sm'\|'md'\|'lg'\|'xl'`, `showSymbol?`, `className?` | Formats uint256 string via `formatBalance()` (BigInt). `font-mono`. Size maps to Tailwind text classes. |
| `AddressDisplay` | `shared/` | `address: string`, `truncate?`, `copyable?`, `className?` | Truncated address (0x1234...5678, 6+4). Copy via `expo-clipboard` + haptic feedback. `font-mono text-brand-muted`. |
| `YieldBadge` | `wallet/` | `yieldAmount?: string`, `asset?: string`, `className?` | `bg-brand-success/20` badge with `TrendingUp` icon. Shows `↑ {amount} {asset}`. Gentle pulse animation. Returns null when no yield. |
| `TokenRow` | `shared/` | `asset`, `balance`, `decimals`, `chainName?`, `onPress?`, `selected?`, `className?` | Row with first-letter circle icon, name, chain badge, AmountDisplay right-aligned. Pressable when onPress provided. |
| `ConnectionIndicator` | `wallet/` | `status: 'connected' \| 'disconnected' \| 'reconnecting'` | 8px dot: connected=green, disconnected=red, reconnecting=yellow+pulse. Accessibility labels. |
| `LoadingSkeleton` | `shared/` | `width?`, `height?`, `variant?: 'text'\|'card'\|'circle'`, `className?` | Pulsing opacity animation (0.3→0.7). `bg-brand-card`. Variant controls shape/size defaults. |
| `ChainBreakdown` | — | `balances: Balance[]` | **Not yet implemented** (E-6). Expandable per-chain breakdown. |

### Form Components

| Component | Location | Props | Description |
|-----------|----------|-------|-------------|
| `AmountInput` | `shared/` | `value`, `onChangeText`, `asset`, `decimals`, `maxAmount?`, `error?`, `label?` | Numeric-only `TextInput` with MAX button, decimal precision enforcement. Controlled component (RHF wrapper in E-9). |
| `RecipientInput` | `shared/` | `value`, `onChangeText`, `error?`, `label?` | Address input with paste button (expo-clipboard). Validates `isValidEthereumAddress` on blur. `font-mono`. |
| `ChainSelector` | `shared/` | `selectedChainId`, `onChange`, `chains?` | Button + ChevronDown opens BottomSheet with chain list. Defaults: Sepolia + Base Sepolia. |

### Feedback Components

| Component | Location | Props | Description |
|-----------|----------|-------|-------------|
| `Toast` | `ui/` | `type: 'success'\|'error'\|'info'`, `message`, `title?`, `action?`, `visible`, `onDismiss?` | Slide-in from top (reanimated). Color-coded left border. Follows Reassure → Explain → Resolve pattern. |
| `ToastContext` | `ui/` | Provider + `useToast()` hook | `ToastProvider` wraps app. `useToast().showToast()` for imperative usage with auto-dismiss. |
| `StepIndicator` | `shared/` | `steps: string[]`, `currentStep: number` | Horizontal circles + connecting lines. Completed=checkmark+success, current=primary, future=muted. Labels below. |
| `TransactionProgress` | `shared/` | `steps: Array<{ label, description?, status }>`, `txHash?` | Vertical stepper with status icons (Check/AlertTriangle/Loader). Connecting line. Optional copyable txHash. |
| `ErrorState` | `shared/` | `code?`, `message?`, `title?`, `onRetry?`, `inline?` | Maps error codes via `getErrorMessage()`. Inline=compact card, fullscreen=centered. Retry button. |

---

## Screen Components by Flow

### Onboarding Flow (US-08)

#### `ConnectWalletScreen` — `app/onboarding/connect.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Wallet modal | Reown AppKit `<ConnectButton />` | WalletConnect protocol |
| Connection status | `useAccount()` (wagmi) | — |
| Navigation guard | `useOnboardingStore` | — |

**Behavior:** Opens WalletConnect modal. On successful connection, navigates to `/onboarding/delegate`. Persists connection in Zustand → AsyncStorage.

#### `DelegateScreen` — `app/onboarding/delegate.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Scope explanation | `ScopeExplainer` | — |
| Delegation modal | `DelegationModal` | — |
| EIP-712 signing | `useSignTypedData()` (wagmi) | WalletConnect |
| Registration | `useDelegation().register` | `POST /api/delegation/register` |

**Behavior:**
1. Displays what delegation authorizes (scope, allowances, expiry)
2. User taps "Delegate" → wallet app opens for EIP-712 signing
3. Signature sent to backend → Session Key registered
4. On success, navigates to `/onboarding/select-tokens`

**Subcomponents:**

| Component | Purpose |
|-----------|---------|
| `ScopeExplainer` | Visual explanation of delegation scope (what the Solver can/cannot do) |
| `DelegationModal` | Bottom sheet with signing progress + error handling |

#### `SelectTokensScreen` — `app/onboarding/select-tokens.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Token list | `TokenRow` (multiple) | `GET /api/balance` via `useBalance()` |
| Selection state | React state (local) | — |

**Behavior:** Displays available tokens with balances. User selects which tokens to include in the aggregated pool. Selection is passed to the unify step.

#### `UnifyScreen` — `app/onboarding/unify.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Preview | `AmountDisplay`, `ChainBreakdown` | — |
| Progress | `TransactionProgress` | Withdrawal/intent status polling |
| Completion | Navigation to `/(tabs)/` | — |

**Behavior:** Shows unification preview (assets being aggregated), executes intent, shows progress, then navigates to the main tab view.

---

### Wallet Home (US-02, US-07)

#### `WalletHomeScreen` — `app/(tabs)/index.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Total balance | `AmountDisplay` | Computed from `useBalance()` |
| Yield badge | `YieldBadge` | Computed from balance history |
| Balance cards | `BalanceCard` (list) | `GET /api/balance` via `useBalance()` |
| Chain breakdown | `ChainBreakdown` (expandable) | Same data, grouped by chain |
| Real-time updates | `useWebSocket()` | WebSocket `bu` events |
| Pull-to-refresh | Built-in | `refetch()` on `useBalance()` |
| Connection status | `ConnectionIndicator` | `useWebSocket().status` |

**Subcomponents:**

| Component | Props | Purpose |
|-----------|-------|---------|
| `BalanceCard` | `asset`, `totalBalance`, `chainBreakdown[]`, `yieldAmount?` | Card per asset showing total + optional chain drill-down |

---

### Send Flow (US-05, US-06)

#### `RecipientScreen` — `app/send/recipient.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Recipient input | `RecipientInput` | — |
| Amount input | `AmountInput` | — |
| Form validation | React Hook Form + Zod | — |
| Balance check | `useBalance()` | `GET /api/balance` |

#### `ConfirmSendScreen` — `app/send/confirm.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Review details | `AmountDisplay`, `AddressDisplay` | — |
| Fee estimate | (Phase 2: lif-rust quote) | `POST /lifi/quote` (mocked Phase 1) |
| Confirm button | React state | Triggers send |

#### `SendStatusScreen` — `app/send/status.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Progress tracker | `TransactionProgress` | Status polling |
| Completion | `StepIndicator` | — |

---

### Unification Flow (US-03)

Standalone unification (outside onboarding) for users who want to consolidate fragmented balances after initial setup.

#### `UnifySelectScreen` — `app/unify/select.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Fragmented balances | `TokenRow` (per chain) | `GET /api/balance` via `useBalance()` |
| Selection checkboxes | React state (local) | — |
| Total preview | `AmountDisplay` | Computed from selection |

**Behavior:** Displays per-chain balances for each asset. User selects which chain-specific balances to consolidate into the unified pool. Navigates to `/unify/preview`.

#### `UnifyPreviewScreen` — `app/unify/preview.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Source breakdown | `ChainBreakdown` | — |
| Target summary | `AmountDisplay` | Computed total |
| Fee estimate | (Phase 2: lif-rust) | `POST /lifi/quote` (mocked Phase 1) |
| ETA estimate | Display only | Derived from quote |
| Confirm button | React state | Triggers unification intent |

**Behavior:** Shows a preview of the unification: source chains/amounts, estimated fees, ETA. User confirms to start the intent execution.

#### `UnifyProgressScreen` — `app/unify/progress.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Step tracker | `TransactionProgress` | Intent status polling |
| Balance update | `useWebSocket()` | `bu` event on completion |
| Completion | Navigation back to `/(tabs)/` | — |

**Behavior:** Shows real-time progress of the unification intent (steps: submitting, routing, executing, confirming). Updates via WebSocket `bu` events. On completion, navigates to Wallet Home with updated unified balance.

---

### Withdrawal Flow (US-04)

#### `WithdrawScreen` — `app/withdraw/index.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Asset selector | `TokenRow` list | `GET /api/balance` via `useBalance()` |
| Amount input | `AmountInput` | — |
| Chain selector | `ChainSelector` | — |
| Exit type | `ExitTypeIndicator` | Derived from pool liquidity |

**Subcomponents:**

| Component | Props | Purpose |
|-----------|-------|---------|
| `ExitTypeIndicator` | `exitType: 'direct' \| 'sponsored' \| 'hybrid'` | Shows whether funds exit via vault (fast) or via LiFi (slower) |

#### `ConfirmWithdrawScreen` — `app/withdraw/confirm.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Review | `AmountDisplay`, `ChainSelector` | — |
| Confirm | `useWithdrawal().requestWithdrawal` | `POST /api/withdrawal/request` |

#### `WithdrawStatusScreen` — `app/withdraw/status.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Progress | `TransactionProgress` | `GET /api/withdrawal/status/:id` via polling |
| Balance update | `useWebSocket()` | `bu` event after completion |

---

### Settings

#### `SettingsScreen` — `app/(tabs)/settings.tsx`

| Element | Component/Hook | API |
|---------|---------------|-----|
| Delegation status | `DelegationStatus` | `GET /api/delegation/keys` via `useDelegation()` |
| Revoke button | `RevokeDelegation` | `POST /api/delegation/revoke` via `useDelegation().revoke` |
| Wallet info | `AddressDisplay` | `useAccount()` (wagmi) |
| WS status | `ConnectionIndicator` | `useWebSocket().status` |

**Subcomponents:**

| Component | Purpose |
|-----------|---------|
| `DelegationStatus` | Shows active key: scope, expiry, allowances, creation date |
| `RevokeDelegation` | Confirmation dialog + revoke API call |

---

## Hook → API Mapping

| Hook | TanStack Query Key | API Endpoint | Stale Time | Notes |
|------|--------------------|-------------|------------|-------|
| `useBalance(addr)` | `['balance', addr]` | `GET /api/balance?userAddress=` | 30s | Invalidated by WS `bu` events |
| `useBalance(addr, asset)` | `['balance', addr, asset]` | `GET /api/balance?userAddress=&asset=` | 30s | Filtered variant |
| `useDelegation(addr).keys` | `['delegation', 'keys', addr]` | `GET /api/delegation/keys?userAddress=` | 5 min | Rarely changes |
| `useDelegation().register` | Mutation | `POST /api/delegation/register` | — | Invalidates keys query |
| `useDelegation().revoke` | Mutation | `POST /api/delegation/revoke` | — | Invalidates keys query |
| `useWithdrawal().request` | Mutation | `POST /api/withdrawal/request` | — | Returns withdrawal ID |
| `useWithdrawal(id).status` | `['withdrawal', id]` | `GET /api/withdrawal/status/:id` | 5s | Polls until COMPLETED/FAILED |
| `useSessions(addr)` | `['state', 'sessions', addr]` | `GET /api/state/sessions?userAddress=` | 5 min | |
| `useChannel(id)` | `['state', 'channel', id]` | `GET /api/state/channel/:channelId` | 5 min | |
| `useHealth()` | `['health']` | `GET /api/health` | 60s | Background refetch |

---

## PRD User Story → Component Coverage Matrix

| User Story | Phase | Primary Screen(s) | Key Components |
|------------|-------|-------------------|----------------|
| US-01: One-time delegation | 0 | `delegate.tsx` | DelegationModal, ScopeExplainer |
| US-02: Unified balance | 1 | `(tabs)/index.tsx` | BalanceCard, ChainBreakdown, ConnectionIndicator |
| US-03: Unification | 2 | `unify/select.tsx`, `preview.tsx`, `progress.tsx` | TokenRow, TransactionProgress |
| US-04: Fast Exit | 3 | `withdraw/index.tsx`, `confirm.tsx`, `status.tsx` | ExitTypeIndicator, WithdrawProgress |
| US-05: Gasless L3 P2P | 3 | `send/recipient.tsx`, `confirm.tsx`, `status.tsx` | RecipientInput, AmountInput |
| US-06: Cross-chain transfers | 3 | `send/recipient.tsx`, `confirm.tsx`, `status.tsx` | ChainSelector, TransactionProgress |
| US-07: Wallet Home | 1 | `(tabs)/index.tsx` | BalanceCard, YieldBadge |
| US-08: Onboarding | 0 | `onboarding/*` | StepIndicator, ConnectWalletScreen |
| US-09: Add liquidity | 2 | `onboarding/select-tokens.tsx`, `onboarding/unify.tsx` | TokenRow, AmountInput, TransactionProgress |
