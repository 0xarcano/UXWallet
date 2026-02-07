# System Design & Project Structure

> Flywheel Wallet — Expo/React Native mobile app architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Flywheel Wallet App                    │
│                  (Expo / React Native)                   │
├─────────────────────────────────────────────────────────┤
│  expo-router   │  Zustand  │  TanStack Query  │  Wagmi  │
└──────┬──────────────┬──────────────┬──────────────┬─────┘
       │              │              │              │
       │         REST (HTTPS)   WebSocket (WSS)    │
       │              │              │              │
       │    ┌─────────▼──────────────▼─────────┐   │
       │    │     Backend / ClearNode           │   │
       │    │   (Fastify + Redis + PostgreSQL)  │   │
       │    └─────────┬──────────────┬─────────┘   │
       │              │              │              │
       │         JSON-RPC       REST (Phase 2)     │
       │              │              │              │
       │    ┌─────────▼─────┐ ┌─────▼──────────┐  │
       │    │   Contracts   │ │   lif-rust      │  │
       │    │   (On-Chain)  │ │   (LiFi API)    │  │
       │    └───────────────┘ └────────────────┘   │
       │                                           │
       └──── WalletConnect (EIP-712 signing) ──────┘
```

### Communication Paths

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| App | Backend | REST (HTTPS) | Delegation, balance, withdrawal, state queries |
| App | Backend | WebSocket (WSS) | Real-time `bu` (balance update) events |
| App | Wallet App | WalletConnect (Reown) | EIP-712 signature requests |
| Backend | Contracts | JSON-RPC (Viem) | On-chain settlement, custody |
| Backend | lif-rust | REST | Intent building (Phase 2, mocked Phase 1) |
| lif-rust | LiFi API | HTTPS | Cross-chain quotes (Phase 2) |

### Phase Boundaries

| Component | Phase 1 (Testnet) | Phase 2 (Mainnet) |
|-----------|-------------------|-------------------|
| Delegation (EIP-712) | Fully implemented | Fully implemented |
| Balance API + WebSocket | Fully implemented | Fully implemented |
| Withdrawal | Fully implemented | Fully implemented |
| lif-rust integration | Mocked responses | Live LiFi API |
| Cross-chain transfers | Stub UI | Full LiFi routing |
| Chains | Sepolia (11155111), Base Sepolia (84532) | Ethereum (1), Arbitrum (42161) |

---

## Project Folder Structure

```
frontend/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # Root layout: providers + error boundary
│   ├── index.tsx                 # Entry redirect (→ onboarding or tabs)
│   ├── onboarding/               # Onboarding stack
│   │   ├── _layout.tsx           # Stack navigator for onboarding
│   │   ├── connect.tsx           # US-08: Wallet connection
│   │   ├── delegate.tsx          # US-01: EIP-712 delegation signing
│   │   ├── select-tokens.tsx     # US-09: Token/allowance selection
│   │   └── unify.tsx             # US-03: Unification preview + execution
│   ├── (tabs)/                   # Tab navigator (authenticated)
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Home / Wallet Home (US-07)
│   │   ├── send.tsx              # Send entry point (US-05, US-06)
│   │   └── settings.tsx          # Settings / Delegation management
│   ├── send/                     # Send sub-stack
│   │   ├── recipient.tsx         # Recipient input
│   │   ├── confirm.tsx           # Confirm send details
│   │   └── status.tsx            # Transaction progress
│   ├── withdraw/                 # Withdrawal sub-stack (US-04)
│   │   ├── index.tsx             # Select asset + amount
│   │   ├── confirm.tsx           # Confirm withdrawal
│   │   └── status.tsx            # Withdrawal progress
│   └── unify/                    # Unification sub-stack (US-03)
│       ├── select.tsx            # Select fragmented balances
│       ├── preview.tsx           # Preview unification intent
│       └── progress.tsx          # Unification progress
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base components (gluestack wrappers)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── BottomSheet.tsx
│   │   ├── wallet/               # Wallet-specific components
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── ChainBreakdown.tsx
│   │   │   ├── YieldBadge.tsx
│   │   │   └── ConnectionIndicator.tsx
│   │   ├── delegation/           # Delegation flow components
│   │   │   ├── DelegationModal.tsx
│   │   │   ├── ScopeExplainer.tsx
│   │   │   └── DelegationStatus.tsx
│   │   ├── send/                 # Send flow components
│   │   │   ├── RecipientInput.tsx
│   │   │   └── AmountInput.tsx
│   │   ├── withdraw/             # Withdrawal components
│   │   │   ├── ExitTypeIndicator.tsx
│   │   │   └── WithdrawProgress.tsx
│   │   └── shared/               # Cross-cutting components
│   │       ├── ScreenContainer.tsx
│   │       ├── Header.tsx
│   │       ├── AmountDisplay.tsx
│   │       ├── AddressDisplay.tsx
│   │       ├── TokenRow.tsx
│   │       ├── ChainSelector.tsx
│   │       ├── StepIndicator.tsx
│   │       ├── TransactionProgress.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       └── ErrorState.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useBalance.ts         # TanStack Query: GET /api/balance
│   │   ├── useDelegation.ts      # TanStack Query: delegation CRUD
│   │   ├── useWebSocket.ts       # WebSocket connection + subscription
│   │   ├── useWithdrawal.ts      # TanStack Query: withdrawal request + status
│   │   ├── useSessions.ts        # TanStack Query: GET /api/state/sessions
│   │   ├── useChannel.ts         # TanStack Query: GET /api/state/channel
│   │   └── useHealth.ts          # TanStack Query: GET /api/health
│   ├── lib/                      # Utilities and clients
│   │   ├── api/                  # Typed HTTP client
│   │   │   ├── client.ts         # Base fetch wrapper with error handling
│   │   │   ├── delegation.ts     # Delegation API functions
│   │   │   ├── balance.ts        # Balance API functions
│   │   │   ├── withdrawal.ts     # Withdrawal API functions
│   │   │   └── state.ts          # State API functions
│   │   ├── ws/                   # WebSocket client
│   │   │   └── client.ts         # Connection, reconnect, subscribe/unsubscribe
│   │   ├── eip712/               # EIP-712 helpers
│   │   │   └── delegation.ts     # Build typed data for delegation signing
│   │   ├── format.ts             # BigInt ↔ display string conversions
│   │   └── errors.ts             # Error code → user message mapping
│   ├── stores/                   # Zustand stores
│   │   ├── walletStore.ts        # Wallet connection state
│   │   ├── delegationStore.ts    # Delegation status (active/expired/none)
│   │   ├── webSocketStore.ts     # WS connection state (connected/disconnected)
│   │   └── onboardingStore.ts    # Onboarding step progress
│   ├── providers/                # React context providers
│   │   ├── AppProviders.tsx      # Composes all providers in correct order
│   │   ├── QueryProvider.tsx     # TanStack Query client config
│   │   ├── WagmiProvider.tsx     # Wagmi + Reown AppKit config
│   │   └── WebSocketProvider.tsx # WebSocket lifecycle + Query cache sync
│   ├── types/                    # Shared TypeScript types
│   │   ├── api.ts                # API response types
│   │   ├── balance.ts            # Balance-related types
│   │   ├── delegation.ts         # Delegation-related types
│   │   ├── withdrawal.ts         # Withdrawal-related types
│   │   └── common.ts             # Shared primitives (EthereumAddress, Uint256String)
│   └── config/                   # App configuration
│       ├── env.ts                # Environment variable access
│       └── chains.ts             # Wagmi chain definitions (Sepolia, Base Sepolia)
├── assets/                       # Static assets (images, fonts)
│   └── fonts/
│       └── JetBrainsMono/        # Monospace font for financial data
├── docs/                         # Documentation
│   └── architecture/             # Architecture documents (this folder)
├── __tests__/                    # Test files
├── app.json                      # Expo config
├── babel.config.js               # Babel config (NativeWind)
├── tailwind.config.js            # Tailwind config (NativeWind)
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── .env.example                  # Environment variable template
```

---

## Navigation Architecture

### Route Map

```
app/
├── _layout.tsx          → Root: AppProviders wrapper
├── index.tsx            → Redirect logic:
│                            if (!connected) → /onboarding/connect
│                            if (!delegated) → /onboarding/delegate
│                            else → /(tabs)/
├── onboarding/
│   ├── _layout.tsx      → Stack navigator (no back on connect)
│   ├── connect.tsx      → WalletConnect modal
│   ├── delegate.tsx     → EIP-712 signing screen
│   ├── select-tokens.tsx → Allowance selection
│   └── unify.tsx        → Unification execution
├── (tabs)/
│   ├── _layout.tsx      → Tab bar (Home, Send, Settings)
│   ├── index.tsx        → Wallet Home (balance cards + yield)
│   ├── send.tsx         → Send entry
│   └── settings.tsx     → Delegation status + revoke
├── send/
│   ├── recipient.tsx    → Address/ENS input
│   ├── confirm.tsx      → Review + sign
│   └── status.tsx       → Progress tracker
├── withdraw/
│   ├── index.tsx        → Asset + amount selection
│   ├── confirm.tsx      → Review + confirm
│   └── status.tsx       → Withdrawal progress
└── unify/
    ├── select.tsx       → Select fragmented balances
    ├── preview.tsx      → Preview intent
    └── progress.tsx     → Execution progress
```

### Navigation Guards

The root `index.tsx` acts as a navigation guard:

```typescript
// app/index.tsx (pseudocode)
function RootRedirect() {
  const { isConnected } = useAccount();
  const { hasActiveDelegation } = useDelegationStore();
  const { hasCompletedOnboarding } = useOnboardingStore();

  if (!isConnected) return <Redirect href="/onboarding/connect" />;
  if (!hasActiveDelegation) return <Redirect href="/onboarding/delegate" />;
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding/select-tokens" />;
  return <Redirect href="/(tabs)/" />;
}
```

---

## State Management Architecture

### Three-Layer Model

```
┌───────────────────────────────────────────────────────┐
│                   Ephemeral State                      │
│        React component state + React Hook Form         │
│     (form inputs, modals, animations, local UI)        │
├───────────────────────────────────────────────────────┤
│                    Client State                        │
│                      Zustand                           │
│   walletStore │ delegationStore │ webSocketStore │ ... │
│  (connection  │  (delegation    │  (WS connected/│     │
│   status,     │   status,       │   disconnected)│     │
│   address)    │   active keys)  │                │     │
├───────────────────────────────────────────────────────┤
│                   Server State                         │
│                  TanStack Query                        │
│   balances │ sessions │ delegation keys │ withdrawals  │
│  (cached,  │ (cached, │  (cached,       │ (cached,     │
│   refetch) │  refetch)│   refetch)      │  refetch)    │
└───────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Tool | What Lives Here | Persistence |
|-------|------|-----------------|-------------|
| Server State | TanStack Query | API data (balances, keys, sessions, withdrawals) | Query cache (in-memory, 5 min stale time) |
| Client State | Zustand | App state (wallet connection, delegation status, WS status, onboarding progress) | Zustand persist → AsyncStorage |
| Ephemeral State | React state / RHF | Form inputs, modal open/close, animation state | None (component lifecycle) |

### TanStack Query Keys

```typescript
const queryKeys = {
  balance: (userAddress: string) => ['balance', userAddress] as const,
  balanceByAsset: (userAddress: string, asset: string) => ['balance', userAddress, asset] as const,
  delegationKeys: (userAddress: string) => ['delegation', 'keys', userAddress] as const,
  sessions: (userAddress: string) => ['state', 'sessions', userAddress] as const,
  channel: (channelId: string) => ['state', 'channel', channelId] as const,
  withdrawal: (id: string) => ['withdrawal', id] as const,
  health: () => ['health'] as const,
};
```

### WebSocket → Query Cache Sync

The `WebSocketProvider` bridges real-time events into the TanStack Query cache:

```
WebSocket "bu" event
       │
       ▼
WebSocketProvider.onMessage()
       │
       ▼
queryClient.setQueryData(
  ['balance', userAddress],
  (old) => updateBalance(old, event.data)
)
       │
       ▼
Components re-render with fresh balance
```

This ensures balance cards update instantly without polling.

---

## Data Flow Diagrams

### Delegation Flow (US-01)

```
User            App                   Wallet App          Backend
 │               │                        │                  │
 │  tap "Delegate"│                       │                  │
 │───────────────>│                       │                  │
 │               │  build EIP-712 typed data                 │
 │               │  (domain: {name: "Flywheel"})             │
 │               │                        │                  │
 │               │  signTypedDataAsync()  │                  │
 │               │───────────────────────>│                  │
 │               │                        │                  │
 │               │  review & sign         │                  │
 │               │<───────────────────────│                  │
 │               │  (signature: 0x...)    │                  │
 │               │                        │                  │
 │               │  POST /api/delegation/register            │
 │               │───────────────────────────────────────────>│
 │               │                                           │
 │               │  verifyTypedData() → persist SessionKey    │
 │               │<───────────────────────────────────────────│
 │               │  { key: { status: "ACTIVE", ... } }       │
 │               │                        │                  │
 │  "Delegation active"                   │                  │
 │<───────────────│                       │                  │
```

### Balance Update Flow (US-02)

```
Backend publishes      WebSocket Server        App
"bu" to Redis               │                   │
       │                    │                   │
       │  Redis pub/sub     │                   │
       │───────────────────>│                   │
       │                    │                   │
       │                    │  forward to        │
       │                    │  subscribed client │
       │                    │──────────────────>│
       │                    │  { type: "bu",    │
       │                    │    data: { ... } } │
       │                    │                   │
       │                    │   setQueryData()  │
       │                    │   → re-render     │
       │                    │                   │
```

### Withdrawal Flow (US-04)

```
User            App                          Backend
 │               │                              │
 │  select asset │                              │
 │  + amount     │                              │
 │───────────────>│                             │
 │               │                              │
 │               │  POST /api/withdrawal/request │
 │               │─────────────────────────────>│
 │               │                              │
 │               │  { withdrawal: { id, status: "PENDING" } }
 │               │<─────────────────────────────│
 │               │                              │
 │  show progress│                              │
 │<───────────────│                             │
 │               │                              │
 │               │  poll GET /api/withdrawal/status/:id
 │               │─────────────────────────────>│
 │               │  { status: "PROCESSING" }    │
 │               │<─────────────────────────────│
 │               │                              │
 │               │  poll GET /api/withdrawal/status/:id
 │               │─────────────────────────────>│
 │               │  { status: "COMPLETED", txHash }
 │               │<─────────────────────────────│
 │               │                              │
 │  "Withdrawal  │                              │
 │   complete"   │                              │
 │<───────────────│                             │
```

---

## Error Handling Strategy

### API Error → User Message

All API errors arrive as `{ error: { code, message, details? } }`. The client maps error codes to user-friendly messages:

```typescript
// src/lib/errors.ts
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  INSUFFICIENT_FUNDS: 'You don\'t have enough funds for this transaction.',
  INSUFFICIENT_LIQUIDITY: 'The pool is temporarily low on liquidity. Try again shortly.',
  RATE_LIMITED: 'Too many requests. Please wait a moment.',
  SESSION_KEY_EXPIRED: 'Your delegation has expired. Please re-delegate.',
  SESSION_KEY_REVOKED: 'Your delegation was revoked. Please re-delegate.',
  WITHDRAWAL_PENDING: 'A withdrawal is already in progress.',
  CONNECTION_FAILED: 'Unable to reach the server. Check your connection.',
  TIMEOUT: 'The request timed out. Please try again.',
};
```

### Toast Pattern

Toasts follow the **Reassure → Explain → Resolve** pattern:

1. **Reassure:** "Your funds are safe."
2. **Explain:** "The withdrawal couldn't complete because..."
3. **Resolve:** "Tap to retry" or "Contact support"
