# Project Structure

Full structure details in `../docs/architecture/architecture.md`.

```text
frontend/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx               # Root layout: providers + error boundary
│   ├── index.tsx                 # Entry redirect (→ onboarding or tabs)
│   ├── onboarding/               # Onboarding stack
│   │   ├── _layout.tsx           # Stack navigator
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
│   ├── withdraw/                 # Withdrawal sub-stack (US-04)
│   └── unify/                    # Unification sub-stack (US-03)
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base components (gluestack wrappers)
│   │   ├── wallet/               # BalanceCard, ChainBreakdown, YieldBadge
│   │   ├── delegation/           # DelegationModal, ScopeExplainer
│   │   ├── send/                 # RecipientInput, AmountInput
│   │   ├── withdraw/             # ExitTypeIndicator, WithdrawProgress
│   │   └── shared/               # ScreenContainer, Header, AmountDisplay, etc.
│   ├── hooks/                    # Custom React hooks
│   │   ├── useBalance.ts         # TanStack Query: GET /api/balance
│   │   ├── useDelegation.ts      # TanStack Query: delegation CRUD
│   │   ├── useWebSocket.ts       # WebSocket connection + subscription
│   │   ├── useWithdrawal.ts      # TanStack Query: withdrawal request + status
│   │   ├── useSessions.ts        # TanStack Query: GET /api/state/sessions
│   │   ├── useChannel.ts         # TanStack Query: GET /api/state/channel
│   │   └── useHealth.ts          # TanStack Query: GET /api/health
│   ├── lib/                      # Utilities and clients
│   │   ├── api/                  # Typed HTTP client (client.ts, delegation.ts, balance.ts, etc.)
│   │   ├── ws/                   # WebSocket client (connection, reconnect, subscribe)
│   │   ├── eip712/               # EIP-712 delegation typed-data helpers
│   │   ├── format.ts             # BigInt ↔ display string conversions
│   │   └── errors.ts             # Error code → user message mapping
│   ├── stores/                   # Zustand stores
│   │   ├── walletStore.ts        # Wallet connection state
│   │   ├── delegationStore.ts    # Delegation status (active/expired/none)
│   │   ├── webSocketStore.ts     # WS connection state
│   │   └── onboardingStore.ts    # Onboarding step progress
│   ├── providers/                # React context providers
│   │   ├── AppProviders.tsx      # Composes all providers
│   │   ├── QueryProvider.tsx     # TanStack Query client config
│   │   ├── WagmiProvider.tsx     # Wagmi + Reown AppKit config
│   │   └── WebSocketProvider.tsx # WebSocket lifecycle + Query cache sync
│   ├── types/                    # Shared TypeScript types
│   └── config/                   # App configuration (env.ts, chains.ts)
├── assets/                       # Static assets (images, fonts)
├── __tests__/                    # Test files
├── e2e/                          # Maestro E2E test flows
├── app.json                      # Expo config
├── tailwind.config.js            # Tailwind config (NativeWind)
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

**Component architecture details:** `../docs/architecture/component-architecture.md`
