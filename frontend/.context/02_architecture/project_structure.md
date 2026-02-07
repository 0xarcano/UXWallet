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
│   ├── components/               # Reusable UI components (16 shared, E-1 complete)
│   │   ├── ui/                   # Base components: Button, BottomSheet, Toast, ToastContext
│   │   ├── wallet/               # YieldBadge, ConnectionIndicator (+ BalanceCard, ChainBreakdown in E-6)
│   │   ├── delegation/           # DelegationModal, ScopeExplainer (E-4)
│   │   ├── send/                 # (E-9)
│   │   ├── withdraw/             # ExitTypeIndicator, WithdrawProgress (E-10)
│   │   └── shared/               # ScreenContainer, Header, AddressDisplay, AmountDisplay, TokenRow, LoadingSkeleton, StepIndicator, TransactionProgress, ErrorState, AmountInput, RecipientInput, ChainSelector
│   ├── hooks/                    # Custom React hooks
│   │   ├── useBalance.ts         # TanStack Query: GET /api/balance
│   │   ├── useDelegation.ts      # TanStack Query: delegation CRUD
│   │   ├── useWebSocket.ts       # WebSocket connection + subscription
│   │   ├── useWithdrawal.ts      # TanStack Query: withdrawal request + status
│   │   ├── useSessions.ts        # TanStack Query: GET /api/state/sessions
│   │   ├── useChannel.ts         # TanStack Query: GET /api/state/channel
│   │   └── useHealth.ts          # TanStack Query: GET /api/health
│   ├── lib/                      # Utilities and clients
│   │   ├── api/                  # Typed HTTP client (E-2)
│   │   ├── ws/                   # WebSocket client (E-7)
│   │   ├── eip712/               # EIP-712 delegation typed-data helpers (E-4)
│   │   ├── format.ts             # BigInt formatBalance(), truncateAddress() (E-1)
│   │   ├── errors.ts             # Error code → user message mapping (E-1)
│   │   └── validation.ts         # Zod schemas: address, uint256, chainId (E-1)
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
