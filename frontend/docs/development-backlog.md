# Flywheel Wallet — Frontend Development Backlog

**Version:** 1.0
**Created:** 2026-02-07
**Status:** Draft
**Derived from:** PRD v1.1, Architecture Docs, API Specification, Security Guidelines, Testing Strategy

---

## Legend

| Field | Meaning |
|-------|---------|
| **ID** | Hierarchical: `E-{epic}-S{story}-T{task}` |
| **Priority** | P0-Critical · P1-High · P2-Medium · P3-Low |
| **Complexity** | XS (< 2h) · S (2–4h) · M (4–8h) · L (1–2d) · XL (3–5d) |
| **Phase** | Pre-0 (bootstrap) · 0 (connect + delegation) · 1 (unified view) · 2 (unification) · 3 (send/withdraw) · All |

---

## Summary

| Epic | Title | Phase | Priority | Stories | Tasks |
|------|-------|-------|----------|---------|-------|
| E-0 | Project Bootstrap | Pre-Phase 0 | P0 | 3 | 12 |
| E-1 | Shared UI Components | Pre-Phase 0 | P0 | 3 | 9 |
| E-2 | Core Infrastructure | Pre-Phase 0 | P0 | 3 | 10 |
| E-3 | Wallet Connection | Phase 0 | P0 | 2 | 5 |
| E-4 | EIP-712 Delegation | Phase 0 | P0 | 2 | 7 |
| E-5 | Onboarding Flow | Phase 0 | P0 | 2 | 6 |
| E-6 | Wallet Home & Unified Balance | Phase 1 | P0 | 2 | 7 |
| E-7 | Real-Time WebSocket Integration | Phase 1 | P0 | 2 | 6 |
| E-8 | Unification / Dust Sweep | Phase 2 | P1 | 2 | 6 |
| E-9 | Send (Gasless P2P + Cross-Chain) | Phase 3 | P1 | 3 | 7 |
| E-10 | Withdrawal / Fast Exit | Phase 3 | P1 | 2 | 6 |
| E-11 | Testing, Accessibility & Polish | All | P1 | 2 | 5 |
| **Total** | | | | **28** | **86** |

---

## E-0 — Project Bootstrap

> Initialize the Expo project, configure TypeScript, NativeWind, routing, providers, testing infra, and CI.

### E-0-S1: Initialize Expo Project & Core Config

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] `npx create-expo-app` generates a working Expo SDK 52 project in `frontend/`
- [ ] TypeScript strict mode enabled per `tsconfig.json` spec in `tech-stack.md`
- [ ] App boots on iOS simulator, Android emulator, and Expo Go
- [ ] `app.json` configured with app name "Flywheel", scheme `flywheel://`

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-0-S1-T1 | Scaffold Expo SDK 52 project with TypeScript template | S | — | `npx create-expo-app frontend --template expo-template-blank-typescript`. Remove boilerplate. |
| E-0-S1-T2 | Configure `tsconfig.json` with strict mode and path aliases | XS | T1 | Extend `expo/tsconfig.base`. Set `strict: true`, `noUncheckedIndexedAccess: true`, `paths: { "@/*": ["./src/*"] }`. |
| E-0-S1-T3 | Create `.env.example` with all `EXPO_PUBLIC_*` variables | XS | T1 | Variables: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`, `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`, `EXPO_PUBLIC_CHAIN_ENV`. |
| E-0-S1-T4 | Create `src/config/env.ts` environment variable accessor | XS | T2 | Type-safe wrapper around `expo-constants`. Validate required vars at startup. |

### E-0-S2: Configure Styling, Fonts & UI Framework

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] NativeWind 4.x renders `className` props on React Native components
- [ ] `tailwind.config.js` includes all brand tokens (colors, fonts) from `coding-standards.md`
- [ ] JetBrains Mono and Inter fonts load correctly
- [ ] gluestack-ui primitives render with theme applied

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-0-S2-T1 | Install and configure NativeWind 4.x + TailwindCSS 3.4 | M | E-0-S1-T1 | Follow NativeWind docs for Expo SDK 52. Configure `babel.config.js` and `tailwind.config.js`. |
| E-0-S2-T2 | Add brand tokens to `tailwind.config.js` | S | T1 | Colors: `brand-primary` (#6366F1), `brand-bg` (#0F172A), `brand-card` (#1E293B), etc. Fonts: `font-mono` (JetBrainsMono), `font-sans` (Inter). |
| E-0-S2-T3 | Load custom fonts (JetBrains Mono, Inter) via `expo-font` | S | E-0-S1-T1 | Place in `assets/fonts/`. Use `useFonts` hook in root layout. |
| E-0-S2-T4 | Install and configure gluestack-ui 2.x with NativeWind integration | M | T1 | `GluestackUIProvider` wrapping the app. Configure dark mode as default. |

### E-0-S3: Routing, Providers & Dev Tooling

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] expo-router file-based routing works with the `app/` directory structure defined in `architecture.md`
- [ ] Provider hierarchy matches `component-architecture.md` (ErrorBoundary → Gluestack → Query → Wagmi → WS → SafeArea → Slot)
- [ ] ESLint + Prettier + husky + lint-staged configured per `coding-standards.md`
- [ ] Jest + Testing Library + MSW configured and a smoke test passes

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-0-S3-T1 | Set up expo-router 4.x with initial directory structure | M | E-0-S1-T1 | Create `app/_layout.tsx`, `app/index.tsx`, placeholder `app/onboarding/`, `app/(tabs)/`, `app/send/`, `app/withdraw/`, `app/unify/` directories with `_layout.tsx` files. |
| E-0-S3-T2 | Create `src/providers/AppProviders.tsx` composing all providers | M | E-0-S2-T4 | Compose in order: ErrorBoundary → GestureHandlerRootView → GluestackUIProvider → QueryClientProvider → WagmiProvider → WebSocketProvider (stub) → SafeAreaProvider. Wire into `app/_layout.tsx`. |
| E-0-S3-T3 | Configure ESLint 9 (flat config) + Prettier + husky + lint-staged | S | E-0-S1-T1 | Use `eslint-config-expo`. Rules: `no-explicit-any: error`, `no-non-null-assertion: error`, `no-console: warn`. Prettier: `semi: true`, `singleQuote: true`, `trailingComma: all`, `printWidth: 100`. |
| E-0-S3-T4 | Configure Jest 29 + Testing Library + MSW 2.x + smoke test | M | E-0-S1-T1 | Install `jest`, `@testing-library/react-native`, `@testing-library/jest-native`, `msw`. Create `jest.config.ts`. Write a smoke test that renders root layout. |

---

## E-1 — Shared UI Components

> Build the reusable component library before screen development begins. Every component defined in `component-architecture.md` § "Shared Reusable Components".

### E-1-S1: Layout & Navigation Components

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] `ScreenContainer` wraps content with SafeArea + optional scroll + consistent padding
- [ ] `Header` shows truncated wallet address pill + connection indicator + optional back button
- [ ] `BottomSheet` provides a reusable modal surface with configurable snap points

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-1-S1-T1 | Build `ScreenContainer` component | S | E-0-S2-T1 | `src/components/shared/ScreenContainer.tsx`. Props: `children`, `scroll?`, `padding?`. Uses `SafeAreaView` + `ScrollView`. NativeWind `className`. |
| E-1-S1-T2 | Build `Header` component | M | E-0-S2-T1 | `src/components/shared/Header.tsx`. Props: `title?`, `showBack?`, `rightAction?`. Shows `AddressDisplay` pill and `ConnectionIndicator`. |
| E-1-S1-T3 | Build `BottomSheet` component | M | E-0-S2-T4 | `src/components/ui/BottomSheet.tsx`. Wraps `react-native-gesture-handler` bottom sheet. Props: `isOpen`, `onClose`, `children`, `snapPoints?`. |

### E-1-S2: Data Display Components

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] `AmountDisplay` formats `uint256` strings to human-readable with correct decimals using JetBrains Mono
- [ ] `AddressDisplay` truncates addresses (`0x1234...5678`) with copy-to-clipboard
- [ ] `TokenRow` shows asset icon + name + balance, tappable
- [ ] `LoadingSkeleton` provides animated placeholder for loading states

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-1-S2-T1 | Build `AmountDisplay` component | S | E-0-S2-T3 | `src/components/shared/AmountDisplay.tsx`. Props: `amount: string`, `asset: string`, `decimals: number`, `size?`. Uses `formatBalance` utility (E-2). Uses `font-mono`. Never use floating-point for display conversion — use `BigInt` division. |
| E-1-S2-T2 | Build `AddressDisplay`, `TokenRow`, `LoadingSkeleton` | M | E-0-S2-T1 | `src/components/shared/AddressDisplay.tsx` (truncate + copy via `Clipboard`), `TokenRow.tsx` (asset icon + balance + onPress), `LoadingSkeleton.tsx` (reanimated shimmer). |
| E-1-S2-T3 | Build `YieldBadge` and `ConnectionIndicator` | S | E-0-S2-T1 | `src/components/wallet/YieldBadge.tsx` — green badge showing "+X.X%" yield. `src/components/wallet/ConnectionIndicator.tsx` — dot (green/red/yellow) for WS status. |

### E-1-S3: Feedback & Form Components

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] `Toast` follows Reassure → Explain → Resolve pattern with `success`, `error`, `info` variants
- [ ] `StepIndicator` and `TransactionProgress` display multi-step flow progress
- [ ] `ErrorState` renders inline or full-screen with retry
- [ ] `AmountInput` validates uint256, has MAX button; `RecipientInput` validates Ethereum addresses; `ChainSelector` renders chain dropdown

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-1-S3-T1 | Build `Toast` component | S | E-0-S2-T4 | `src/components/ui/Toast.tsx`. Props: `type`, `message`, `action?`. Follows Reassure → Explain → Resolve. Non-blocking. Use gluestack-ui Toast primitive. |
| E-1-S3-T2 | Build `StepIndicator`, `TransactionProgress`, `ErrorState` | M | E-0-S2-T1 | `StepIndicator` — horizontal dots/labels. `TransactionProgress` — vertical tracker with animated transitions (reanimated). `ErrorState` — full-screen or inline with retry button + error code mapping. |
| E-1-S3-T3 | Build `AmountInput`, `RecipientInput`, `ChainSelector` | M | E-0-S2-T4 | `AmountInput` — numeric input, MAX button, RHF `control` prop, validates against uint256 + max balance. `RecipientInput` — address input with paste. `ChainSelector` — bottom sheet dropdown for supported chains. All use React Hook Form integration. |

---

## E-2 — Core Infrastructure

> API client, Zustand stores, TanStack Query hooks, TypeScript types, format utilities, and EIP-712 helper.

### E-2-S1: TypeScript Types & Format Utilities

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] Branded types `Uint256String` and `EthereumAddress` with validation functions exist in `src/types/common.ts`
- [ ] API response types match `api-specification.md` exactly
- [ ] `formatBalance(amount, decimals)` converts uint256 string to display string using BigInt (no floating-point)
- [ ] `src/lib/errors.ts` maps all backend error codes to user-facing messages

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-2-S1-T1 | Create shared TypeScript types | S | E-0-S1-T2 | `src/types/common.ts` — `Uint256String`, `EthereumAddress` branded types with `toUint256String()`, `toEthereumAddress()` validators. `src/types/api.ts` — all API response shapes. `src/types/balance.ts`, `delegation.ts`, `withdrawal.ts` per `architecture.md`. |
| E-2-S1-T2 | Create `src/lib/format.ts` BigInt formatting utilities | S | T1 | `formatBalance(amount: Uint256String, decimals: number): string` — divide by 10^decimals using BigInt. `parseAmount(display: string, decimals: number): Uint256String` — inverse. No `Number()` or `parseFloat()`. |
| E-2-S1-T3 | Create `src/lib/errors.ts` error code → user message mapping | S | T1 | Map all codes from `api-specification.md`: `VALIDATION_ERROR`, `INSUFFICIENT_FUNDS`, `INSUFFICIENT_LIQUIDITY`, `RATE_LIMITED`, `SESSION_KEY_EXPIRED`, `SESSION_KEY_REVOKED`, `WITHDRAWAL_PENDING`, `CONNECTION_FAILED`, `TIMEOUT`, `INVALID_SIGNATURE`, `STALE_STATE`, etc. Each entry: `{ title, body, action? }`. |

### E-2-S2: API Client & Zod Validation Schemas

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] Typed HTTP client in `src/lib/api/client.ts` adds `Content-Type`, `X-Request-Id`, handles error response format
- [ ] Zod schemas mirror backend validation (addresses, uint256, chainId)
- [ ] API functions exist for all endpoints: delegation (register, revoke, keys), balance, withdrawal (request, status), state (channel, sessions), health

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-2-S2-T1 | Build typed HTTP client `src/lib/api/client.ts` | M | E-2-S1-T1, E-0-S1-T4 | Base `fetch` wrapper. Auto-adds `Content-Type: application/json`, generates `X-Request-Id` (uuid). Reads `EXPO_PUBLIC_API_URL` from env config. Parses error response `{ error: { code, message, details? } }`. Handles 429 with `Retry-After`. |
| E-2-S2-T2 | Create Zod validation schemas (client-side) | S | T1 | `src/lib/validation.ts`. Schemas: `ethereumAddress`, `uint256String`, `chainId`, `hexString`. Must mirror `backend/src/utils/validation.ts` exactly per `security.md` §3. |
| E-2-S2-T3 | Build API functions for all endpoints | M | T1 | `src/lib/api/delegation.ts` — `registerDelegation()`, `revokeDelegation()`, `getDelegationKeys()`. `src/lib/api/balance.ts` — `getBalance()`. `src/lib/api/withdrawal.ts` — `requestWithdrawal()`, `getWithdrawalStatus()`. `src/lib/api/state.ts` — `getChannel()`, `getSessions()`. `src/lib/api/health.ts` — `getHealth()`. All return typed responses. |

### E-2-S3: Zustand Stores, TanStack Query Hooks & EIP-712 Helper

> **Priority:** P0 · **Phase:** Pre-Phase 0

**Acceptance Criteria:**
- [ ] Zustand stores: `walletStore`, `delegationStore`, `webSocketStore`, `onboardingStore` — persisted to correct storage (SecureStore vs AsyncStorage per `security.md`)
- [ ] TanStack Query hooks match the hook → API mapping table in `component-architecture.md`
- [ ] EIP-712 helper builds delegation typed data using `@erc7824/nitrolite` `EIP712AuthTypes`
- [ ] `src/config/chains.ts` defines supported Wagmi chains

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-2-S3-T1 | Create Zustand stores with persistence | M | E-0-S1-T1 | `src/stores/walletStore.ts` — connection status, address. `delegationStore.ts` — delegation status (active/expired/none), persist to `expo-secure-store`. `webSocketStore.ts` — WS connected/disconnected/reconnecting. `onboardingStore.ts` — step progress, persist to AsyncStorage. |
| E-2-S3-T2 | Create TanStack Query hooks for all API endpoints | L | E-2-S2-T3 | `src/hooks/useBalance.ts` (staleTime: 30s), `useDelegation.ts` (staleTime: 5min, mutations for register/revoke), `useWithdrawal.ts` (polling every 5s until COMPLETED/FAILED), `useSessions.ts` (5min), `useChannel.ts` (5min), `useHealth.ts` (60s). Query keys per `architecture.md`. |
| E-2-S3-T3 | Create EIP-712 delegation typed-data builder | S | E-0-S1-T1 | `src/lib/eip712/delegation.ts`. Import `EIP712AuthTypes` from `@erc7824/nitrolite`. Build typed data: domain `{ name: "Flywheel" }`, primaryType `"Policy"`, message with `challenge: ''`, `scope`, `wallet`, `session_key`, `expires_at` (BigInt), `allowances`. |
| E-2-S3-T4 | Create `src/config/chains.ts` Wagmi chain definitions | XS | E-0-S1-T1 | Phase 1: Sepolia (11155111), Base Sepolia (84532). Phase 2: Ethereum (1), Arbitrum (42161). Read `EXPO_PUBLIC_CHAIN_ENV` to select testnet vs mainnet chains. |

---

## E-3 — Wallet Connection (Reown / WalletConnect)

> **PRD Reference:** US-08 (step 1), Functional Requirement §6.2
> Connect the user's external wallet via Reown AppKit / WalletConnect.

### E-3-S1: WalletConnect Provider & Modal

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] `WagmiProvider` + Reown AppKit configured with `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`
- [ ] WalletConnect modal opens, lists available wallets, and completes pairing
- [ ] Connected wallet address is available via `useAccount()` and persisted in `walletStore`
- [ ] Disconnect clears `walletStore` + delegation SecureStore data

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-3-S1-T1 | Install and configure Reown AppKit + Wagmi + Viem | M | E-0-S3-T2 | Install `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi`, `viem`. Create `src/providers/WagmiProvider.tsx`. Configure with chains from `src/config/chains.ts` and WalletConnect project ID from env. |
| E-3-S1-T2 | Wire wallet connection into `walletStore` | S | T1, E-2-S3-T1 | On `useAccount` state change: update `walletStore.address`, `walletStore.isConnected`. On disconnect: clear `walletStore`, clear SecureStore delegation data, reset `delegationStore`. |
| E-3-S1-T3 | Handle connection errors and edge cases | S | T1 | User rejects pairing → toast with retry. Network error → toast with connection status. Session expiry → auto-disconnect with prompt to reconnect. |

### E-3-S2: Connect Wallet Screen

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] `app/onboarding/connect.tsx` renders Flywheel logo + "Connect Wallet" button
- [ ] Tapping the button opens the Reown AppKit wallet modal
- [ ] On successful connection, navigates to `/onboarding/delegate`
- [ ] Screen is entry point for unauthenticated users

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-3-S2-T1 | Build `ConnectWalletScreen` (`app/onboarding/connect.tsx`) | M | E-3-S1-T1, E-1-S1-T1 | Layout: `ScreenContainer` + Flywheel logo + tagline + `<ConnectButton />` from Reown AppKit. Uses `useAccount()` to detect connection. Navigation: on `isConnected` → `router.replace('/onboarding/delegate')`. |
| E-3-S2-T2 | Configure `app/onboarding/_layout.tsx` stack navigator | S | E-0-S3-T1 | Stack navigator for onboarding screens. No back gesture on `connect.tsx` (entry point). Header hidden. |

---

## E-4 — EIP-712 Delegation (US-01)

> **PRD Reference:** US-01 (One-Time Delegation)
> The single most security-critical flow. User signs EIP-712 typed data to create a Persistent Session Key.

### E-4-S1: Delegation Signing Flow

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] Delegation screen explains what the user is authorizing: scope, allowances per asset, expiry, what Solver can/cannot do
- [ ] User taps "Delegate" → wallet app opens for EIP-712 signing
- [ ] Signature sent to `POST /api/delegation/register` → Session Key registered with `ACTIVE` status
- [ ] After delegation, no further wallet pop-ups for internal operations
- [ ] Session Key metadata stored in `expo-secure-store` (never the raw signature)
- [ ] If delegation fails (reject, network error), clear error toast with retry

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-4-S1-T1 | Build `ScopeExplainer` component | M | E-1-S1-T1 | `src/components/delegation/ScopeExplainer.tsx`. Shows: "Authorize Flywheel Solver" title, scope badge ("liquidity"), per-asset allowance list (human-readable amounts), expiry date, "What this allows" / "What this does NOT allow" sections, revocation note. Content per `security.md` §6 "Required UI Elements on Delegation Screen". |
| E-4-S1-T2 | Build `DelegationModal` component | M | E-1-S1-T3 | `src/components/delegation/DelegationModal.tsx`. Bottom sheet with signing progress states: idle → signing (waiting for wallet) → registering (API call) → success / error. Uses `useSignTypedData()` from Wagmi. |
| E-4-S1-T3 | Build `DelegateScreen` (`app/onboarding/delegate.tsx`) | L | T1, T2, E-2-S3-T3 | Screen flow: 1) Show `ScopeExplainer` with delegation details. 2) "Delegate" button → `DelegationModal` opens → calls `signTypedDataAsync()` with EIP-712 typed data from `src/lib/eip712/delegation.ts`. 3) On signature → `POST /api/delegation/register` via `useDelegation().register`. 4) On success → persist to `delegationStore` + SecureStore → navigate to `/onboarding/select-tokens`. |
| E-4-S1-T4 | Persist delegation metadata to SecureStore | S | T3, E-2-S3-T1 | On successful registration: store `sessionKeyAddress`, `scope`, `expiresAt`, `status: ACTIVE` in `expo-secure-store`. Never store the `signature` field. Clear on disconnect. |

### E-4-S2: Delegation Management (Settings)

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] Settings screen shows active delegation: scope, allowances, expiry, creation date
- [ ] "Revoke" button triggers `POST /api/delegation/revoke` with confirmation dialog
- [ ] Expired delegations show "Re-delegate" prompt
- [ ] After revocation, user is redirected to delegation screen

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-4-S2-T1 | Build `DelegationStatus` component | S | E-2-S3-T2 | `src/components/delegation/DelegationStatus.tsx`. Displays active key info from `useDelegation(addr).keys` query: scope, allowances, expiry (human-readable), creation date. Shows expired badge if past expiry. |
| E-4-S2-T2 | Build `RevokeDelegation` component | S | E-2-S3-T2 | Confirmation dialog ("Are you sure? You'll need to re-delegate to continue using Flywheel.") → calls `useDelegation().revoke` mutation → on success: clear SecureStore, reset `delegationStore`, navigate to `/onboarding/delegate`. |
| E-4-S2-T3 | Build `SettingsScreen` (`app/(tabs)/settings.tsx`) | M | T1, T2, E-1-S1-T1 | `ScreenContainer` + `Header`. Sections: Delegation status (`DelegationStatus`), Revoke button (`RevokeDelegation`), Wallet info (`AddressDisplay` + connected chain), WebSocket status (`ConnectionIndicator`). |

---

## E-5 — Onboarding Flow (US-08)

> **PRD Reference:** US-08 (Onboarding), US-09 (Add Liquidity entry)
> Guided onboarding: Connect → Delegate → Select Tokens → Unify preview.

### E-5-S1: Navigation Guards & Onboarding State

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] Root `app/index.tsx` redirects based on state: not connected → `/onboarding/connect`, not delegated → `/onboarding/delegate`, not completed onboarding → `/onboarding/select-tokens`, else → `/(tabs)/`
- [ ] Onboarding progress persisted in `AsyncStorage` via `onboardingStore`
- [ ] Onboarding can be skipped and resumed later

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-5-S1-T1 | Implement root redirect logic (`app/index.tsx`) | S | E-2-S3-T1, E-3-S1-T2 | Check `useAccount().isConnected`, `useDelegationStore().hasActiveDelegation`, `useOnboardingStore().hasCompletedOnboarding`. Redirect per `architecture.md` navigation guard pseudocode. |
| E-5-S1-T2 | Add skip + resume capability to onboarding | S | T1 | "Skip" button on `select-tokens` and `unify` screens. Persists current step in `onboardingStore`. On next app open, resumes at last incomplete step. |

### E-5-S2: Token Selection & Unification Preview

> **Priority:** P0 · **Phase:** 0

**Acceptance Criteria:**
- [ ] `select-tokens.tsx` displays detected balances per chain using `GET /api/balance`
- [ ] User selects which tokens/chains to include in the aggregated pool
- [ ] `unify.tsx` shows unification preview: source chains, estimated amounts, and executes intent
- [ ] On completion, navigates to `/(tabs)/` with unified balance visible

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-5-S2-T1 | Build `SelectTokensScreen` (`app/onboarding/select-tokens.tsx`) | M | E-2-S3-T2, E-1-S2-T2 | Fetch balances via `useBalance(userAddress)`. Render `TokenRow` per asset/chain combo with selection checkboxes. Local state for selection. "Continue" button passes selection to unify screen. |
| E-5-S2-T2 | Build `UnifyScreen` (`app/onboarding/unify.tsx`) | L | T1, E-1-S3-T2 | Preview: `AmountDisplay` + `ChainBreakdown` showing what will be unified. Progress: `TransactionProgress` tracker (pending → routing → confirming → complete). Phase 1: mock LiFi progress. On completion → `router.replace('/(tabs)/')`. Mark onboarding complete in `onboardingStore`. |
| E-5-S2-T3 | Configure `(tabs)/_layout.tsx` tab navigator | S | E-0-S3-T1 | Three tabs: Home (house icon), Send (arrow-up icon), Settings (gear icon). Use `lucide-react-native` icons. Tab bar styled with brand tokens. |
| E-5-S2-T4 | Add `StepIndicator` to onboarding screens | XS | E-1-S3-T2 | Show 4-step indicator (Connect → Delegate → Select Tokens → Unify) across all onboarding screens. Highlight current step. |

---

## E-6 — Wallet Home & Unified Balance (US-02, US-07)

> **PRD Reference:** US-02 (Unified Balance View), US-07 (Wallet Home)
> Aggregated balance display with per-chain breakdown, yield badge, and real-time updates.

### E-6-S1: Balance Cards & Aggregated View

> **Priority:** P0 · **Phase:** 1

**Acceptance Criteria:**
- [ ] Dashboard displays single aggregated balance per asset (e.g., "10.5 ETH" not "5 ETH on Base + 5.5 ETH on Ethereum")
- [ ] USD equivalent displayed alongside token amounts
- [ ] Optional per-chain breakdown toggle for advanced users
- [ ] Balance includes both available and locked amounts
- [ ] Pull-to-refresh triggers `refetch()` on balance query

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-6-S1-T1 | Build `BalanceCard` component | M | E-1-S2-T1 | `src/components/wallet/BalanceCard.tsx`. Props: `asset`, `totalBalance` (aggregated across chains), `chainBreakdown[]`, `yieldAmount?`. Shows `AmountDisplay` (total), expandable `ChainBreakdown`, `YieldBadge` if yield > 0. Uses `font-mono` for amounts. |
| E-6-S1-T2 | Build `ChainBreakdown` component | S | E-1-S2-T2 | `src/components/wallet/ChainBreakdown.tsx`. Expandable list showing per-chain balance for a single asset. Chain name + chain icon + balance. Animated expand/collapse with `reanimated`. |
| E-6-S1-T3 | Aggregate balance data in `useBalance` hook or derived computation | S | E-2-S3-T2 | Group raw balance array by asset. Sum balances per asset (BigInt addition). Compute USD equivalent (price feed TBD — use mock prices for Phase 1). Return both aggregated and per-chain data. |

### E-6-S2: Wallet Home Screen

> **Priority:** P0 · **Phase:** 1

**Acceptance Criteria:**
- [ ] `app/(tabs)/index.tsx` renders total portfolio value + per-asset `BalanceCard` list
- [ ] `YieldBadge` visible on assets with active yield (e.g., "↑ 1.56 ETH")
- [ ] `ConnectionIndicator` shows WebSocket status
- [ ] Wallet address + chain visible in header across all screens

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-6-S2-T1 | Build `WalletHomeScreen` (`app/(tabs)/index.tsx`) | L | E-6-S1-T1, E-6-S1-T3 | `ScreenContainer` + `Header` (address pill). Total portfolio value at top (`AmountDisplay`). `FlatList` of `BalanceCard` per asset. `ConnectionIndicator` in header. Pull-to-refresh on balance query. |
| E-6-S2-T2 | Implement yield display logic | S | T1, E-2-S3-T2 | Compute yield per asset: current balance minus deposited amount (from balance history or backend field). Show `YieldBadge` on `BalanceCard`. Display format: "1001.56 ETH (↑ 1.56 ETH)". |
| E-6-S2-T3 | Add empty state for zero balances | XS | T1 | When no balances: show illustration + "No assets yet" + "Add liquidity" CTA that navigates to unify flow. |
| E-6-S2-T4 | Ensure wallet address + ENS visible in header on all screens | XS | E-1-S1-T2 | `Header` component shows truncated address (or ENS when available). Visible on all tab screens per PRD §6.1. |

---

## E-7 — Real-Time WebSocket Integration (US-02)

> **PRD Reference:** US-02 (real-time balance updates), Functional Requirement §6.3
> WebSocket connection to ClearNode with `bu` event handling and TanStack Query cache sync.

### E-7-S1: WebSocket Client & Connection Management

> **Priority:** P0 · **Phase:** 1

**Acceptance Criteria:**
- [ ] WebSocket client connects to `EXPO_PUBLIC_WS_URL` and handles `ping`/`pong` heartbeat
- [ ] Subscribes to `bu` events for the connected user's address
- [ ] Reconnects with exponential backoff (1s → 2s → 4s → 8s → max 30s) on disconnect
- [ ] Re-subscribes and fetches fresh balances after reconnect

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-7-S1-T1 | Build WebSocket client (`src/lib/ws/client.ts`) | L | E-0-S1-T4 | Connect to `EXPO_PUBLIC_WS_URL`. Send `{ type: "ping" }` heartbeat. Send `{ type: "subscribe", userAddress }` on connect. Handle `pong`, `subscribed`, `bu`, and error messages. Validate all incoming messages against expected shape before processing (security.md §4). Drop malformed messages silently. |
| E-7-S1-T2 | Implement reconnection with exponential backoff | M | T1 | On disconnect: attempt reconnect at 1s, 2s, 4s, 8s, max 30s intervals. On reconnect: re-send all `subscribe` messages. Fetch fresh `GET /api/balance` to catch missed `bu` events. Update `webSocketStore` status throughout. |
| E-7-S1-T3 | Build `useWebSocket` hook | S | T1, T2, E-2-S3-T1 | `src/hooks/useWebSocket.ts`. Returns `{ status, subscribe, unsubscribe }`. Reads from `webSocketStore`. Provides status for `ConnectionIndicator`. |

### E-7-S2: Query Cache Sync & Provider

> **Priority:** P0 · **Phase:** 1

**Acceptance Criteria:**
- [ ] `WebSocketProvider` bridges `bu` events into TanStack Query cache via `queryClient.setQueryData()`
- [ ] Balance cards re-render instantly when `bu` events arrive (no polling needed)
- [ ] Provider connects only when wallet is connected (reads `userAddress` from Wagmi)

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-7-S2-T1 | Build `WebSocketProvider` (`src/providers/WebSocketProvider.tsx`) | L | E-7-S1-T1, E-2-S3-T2 | Provider lifecycle: connect WS when `useAccount().address` is available. On `bu` event → `queryClient.setQueryData(['balance', userAddress], updater)`. Update the specific asset+chain balance in the cached array. Disconnect WS when wallet disconnects. |
| E-7-S2-T2 | Wire `WebSocketProvider` into `AppProviders` | S | T1, E-0-S3-T2 | Insert `WebSocketProvider` after `WagmiProvider` in the provider hierarchy. Must be inside `QueryClientProvider` (writes to cache). |
| E-7-S2-T3 | Add last-updated timestamp to balance display | XS | T1, E-6-S2-T1 | Show "Updated X seconds ago" below balance when WS is connected. Show "Last updated at HH:MM" when WS is disconnected. Helps users understand data freshness per PRD §10 risk mitigation. |

---

## E-8 — Unification / Dust Sweep (US-03, US-09)

> **PRD Reference:** US-03 (Unification), US-09 (Add Liquidity)
> Standalone unification flow (outside onboarding) for consolidating fragmented balances.

### E-8-S1: Unification Selection & Preview

> **Priority:** P1 · **Phase:** 2

**Acceptance Criteria:**
- [ ] `app/unify/select.tsx` shows per-chain balances for each asset with selection checkboxes
- [ ] "Unify" button prominently displayed when fragmented balances are detected
- [ ] `app/unify/preview.tsx` shows source chains, assets, estimated amounts after fees, estimated time
- [ ] Fee estimate and ETA from `POST /lifi/quote` (mocked Phase 1, live Phase 2)
- [ ] Single confirmation triggers the unification intent

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-8-S1-T1 | Build `UnifySelectScreen` (`app/unify/select.tsx`) | M | E-2-S3-T2, E-1-S2-T2 | Fetch per-chain balances via `useBalance()`. Display `TokenRow` per chain-asset combo with checkboxes. Compute total preview from selection. Navigate to `/unify/preview` with selection data. |
| E-8-S1-T2 | Build `UnifyPreviewScreen` (`app/unify/preview.tsx`) | M | E-1-S2-T1, E-1-S3-T2 | Show `ChainBreakdown` (sources), `AmountDisplay` (target total), fee estimate, ETA. Phase 1: mocked LiFi quote. Phase 2: call `POST /lifi/quote` via lif-rust. "Confirm" button triggers intent execution. |
| E-8-S1-T3 | Add "Unify" CTA to Wallet Home when fragmented balances detected | S | E-6-S2-T1 | Show a banner/button on Wallet Home when user has balances on multiple chains for the same asset. Tapping navigates to `/unify/select`. |

### E-8-S2: Unification Progress

> **Priority:** P1 · **Phase:** 2

**Acceptance Criteria:**
- [ ] `app/unify/progress.tsx` shows real-time progress (pending → routing → executing → confirming → complete)
- [ ] Balance updates via WebSocket `bu` events on completion
- [ ] Failed unification shows safe error state: "Your funds are safe on the source chain" + retry
- [ ] Execution Guard status visible per US-03

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-8-S2-T1 | Build `UnifyProgressScreen` (`app/unify/progress.tsx`) | M | E-1-S3-T2, E-7-S2-T1 | `TransactionProgress` with steps: submitting → routing → executing → confirming → complete. Poll intent status (endpoint TBD — may be LiFi status or backend). On `bu` event: update balance display. On completion: navigate to `/(tabs)/`. |
| E-8-S2-T2 | Implement failure recovery UX | S | T1 | On failure: show `ErrorState` with Reassure → Explain → Resolve. "Your funds remain on [source chain]." Retry button re-submits intent. Back button returns to select screen. |
| E-8-S2-T3 | Configure `app/unify/_layout.tsx` stack navigator | XS | E-0-S3-T1 | Stack navigator for unify sub-flow. Prevent back navigation during progress (only allow cancel with confirmation). |

---

## E-9 — Send (Gasless P2P + Cross-Chain) (US-05, US-06)

> **PRD Reference:** US-05 (Gasless P2P), US-06 (Cross-chain Transfers)
> Send funds within Yellow L3 (gasless) or cross-chain from unified balance.

### E-9-S1: Send Entry & Recipient Screen

> **Priority:** P1 · **Phase:** 3

**Acceptance Criteria:**
- [ ] `app/(tabs)/send.tsx` is the entry point for send flows
- [ ] `app/send/recipient.tsx` accepts recipient address + amount with full validation
- [ ] Form validates: valid Ethereum address, amount ≤ balance, amount > 0
- [ ] User can select target chain (Yellow L3, Ethereum, Base)

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-9-S1-T1 | Build send tab entry (`app/(tabs)/send.tsx`) | S | E-5-S2-T3 | Entry screen with "Send" heading + "New Transfer" button navigating to `/send/recipient`. May show recent transfers in future. |
| E-9-S1-T2 | Build `RecipientScreen` (`app/send/recipient.tsx`) | M | E-1-S3-T3, E-2-S3-T2 | React Hook Form + Zod validation. `RecipientInput` for address. `AmountInput` for amount with MAX button. `ChainSelector` for target chain. Balance check via `useBalance()`. "Review" button navigates to `/send/confirm` with form data. |

### E-9-S2: Send Confirmation & Execution

> **Priority:** P1 · **Phase:** 3

**Acceptance Criteria:**
- [ ] `app/send/confirm.tsx` shows review: recipient, amount, chain, fee estimate, route type (direct/routed)
- [ ] Yellow L3 sends execute via ClearNode `send_transfer` (zero gas)
- [ ] Cross-chain sends show fee/ETA estimate (from `POST /lifi/quote` in Phase 2)
- [ ] Confirmation feedback: "Transfer complete — 0 gas fees" for L3 sends

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-9-S2-T1 | Build `ConfirmSendScreen` (`app/send/confirm.tsx`) | M | E-1-S2-T1 | Review layout: `AddressDisplay` (recipient), `AmountDisplay` (amount), chain badge, fee estimate (0 for L3, Phase 2 quote for cross-chain), route type indicator. "Confirm" button executes send. |
| E-9-S2-T2 | Implement gasless L3 send via ClearNode | M | T1, E-7-S1-T1 | Send `send_transfer` RPC via WebSocket (or REST, per backend API). Zero gas. Instant confirmation. Show "Transfer complete — 0 gas fees" toast. |
| E-9-S2-T3 | Implement cross-chain send (Phase 2 stub in Phase 1) | M | T1 | Phase 1: show "Cross-chain sends coming soon" or mock flow. Phase 2: call `POST /lifi/quote` for fee/ETA, build intent via `POST /intent/build`, execute. Track progress via status polling. |

### E-9-S3: Send Status & Progress

> **Priority:** P1 · **Phase:** 3

**Acceptance Criteria:**
- [ ] `app/send/status.tsx` shows transfer progress with `TransactionProgress` component
- [ ] L3 sends show instant completion
- [ ] Cross-chain sends show step-by-step progress (pending → routing → confirming → complete)
- [ ] Failure states are actionable and safe

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-9-S3-T1 | Build `SendStatusScreen` (`app/send/status.tsx`) | M | E-1-S3-T2 | `TransactionProgress` tracker. For L3: instant complete with confetti/success state. For cross-chain: poll status, show steps. On completion: show "Done" + "Return to Home" button. On failure: `ErrorState` with retry. |
| E-9-S3-T2 | Configure `app/send/_layout.tsx` stack navigator | XS | E-0-S3-T1 | Stack navigator for send sub-flow (recipient → confirm → status). Prevent back during status/progress. |

---

## E-10 — Withdrawal / Fast Exit (US-04)

> **PRD Reference:** US-04 (Fast Exit Guarantee)
> Withdraw from aggregated pool to any supported chain. Direct Exit vs Sponsored Exit (Hybrid).

### E-10-S1: Withdrawal Form & Confirmation

> **Priority:** P1 · **Phase:** 3

**Acceptance Criteria:**
- [ ] `app/withdraw/index.tsx` allows selecting asset, amount, and target chain
- [ ] `ExitTypeIndicator` shows "Direct Exit" (fast, vault has liquidity) vs "Sponsored Exit (Hybrid)" (slower, LiFi bridge)
- [ ] `app/withdraw/confirm.tsx` shows review with exit type, estimated time, and confirms no extra fee for hybrid
- [ ] Withdrawal request created via `POST /api/withdrawal/request`

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-10-S1-T1 | Build `WithdrawScreen` (`app/withdraw/index.tsx`) | M | E-1-S3-T3, E-2-S3-T2 | `TokenRow` list from `useBalance()` for asset selection. `AmountInput` for amount. `ChainSelector` for target chain. `ExitTypeIndicator` — determine exit type from pool liquidity signal (Phase 1: always direct; Phase 2: check via backend or estimate). |
| E-10-S1-T2 | Build `ExitTypeIndicator` component | S | E-1-S2-T2 | `src/components/withdraw/ExitTypeIndicator.tsx`. Props: `exitType: 'direct' | 'sponsored' | 'hybrid'`. Shows icon + label + estimated time. "Direct Exit" = green/fast. "Sponsored Exit" = yellow/slower with "No extra fee" note. |
| E-10-S1-T3 | Build `ConfirmWithdrawScreen` (`app/withdraw/confirm.tsx`) | M | T1, T2 | Review: `AmountDisplay`, chain badge, `ExitTypeIndicator`, estimated time. "Confirm" → `useWithdrawal().requestWithdrawal` mutation → `POST /api/withdrawal/request`. Handle `INSUFFICIENT_FUNDS`, `WITHDRAWAL_PENDING` errors. |

### E-10-S2: Withdrawal Progress

> **Priority:** P1 · **Phase:** 3

**Acceptance Criteria:**
- [ ] `app/withdraw/status.tsx` polls `GET /api/withdrawal/status/:id` until COMPLETED or FAILED
- [ ] Progress tracker shows: PENDING → PROCESSING → COMPLETED steps
- [ ] On completion: `bu` event updates balance; show `txHash` link
- [ ] On failure: safe error state with retry

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-10-S2-T1 | Build `WithdrawStatusScreen` (`app/withdraw/status.tsx`) | M | E-1-S3-T2, E-2-S3-T2 | `TransactionProgress` with steps: PENDING → PROCESSING → COMPLETED. Poll via `useWithdrawal(id).status` (every 5s). On COMPLETED: show success + txHash (link to block explorer). On FAILED: `ErrorState` with retry that creates a new withdrawal request. |
| E-10-S2-T2 | Build `WithdrawProgress` component | S | E-1-S3-T2 | `src/components/withdraw/WithdrawProgress.tsx`. Wraps `TransactionProgress` with withdrawal-specific step labels and estimated time display. Handles animated transitions between states. |
| E-10-S2-T3 | Configure `app/withdraw/_layout.tsx` stack navigator | XS | E-0-S3-T1 | Stack navigator for withdrawal sub-flow. Prevent back during status polling. |

---

## E-11 — Testing, Accessibility & Polish

> Cross-cutting quality: unit tests, E2E tests, accessibility audit, security review, and production hardening.

### E-11-S1: Testing Infrastructure & Coverage

> **Priority:** P1 · **Phase:** All

**Acceptance Criteria:**
- [ ] Unit/component test coverage: hooks 80%+, utilities 90%+, components 70%+
- [ ] MSW handlers mock all backend endpoints for integration tests
- [ ] Maestro E2E tests cover all critical happy paths: onboarding, delegation, balance view, send, withdraw
- [ ] CI pipeline runs lint + type check + unit tests + E2E tests

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-11-S1-T1 | Create MSW handlers for all backend endpoints | M | E-2-S2-T3 | `__tests__/mocks/handlers.ts`. Mock: `GET /api/health`, `POST /api/delegation/register`, `POST /api/delegation/revoke`, `GET /api/delegation/keys`, `GET /api/balance`, `POST /api/withdrawal/request`, `GET /api/withdrawal/status/:id`, `GET /api/state/channel/:id`, `GET /api/state/sessions`. Include error cases (400, 404, 429, 503). |
| E-11-S1-T2 | Write unit tests for hooks and utilities | L | All E-2 tasks | Test: `useBalance`, `useDelegation`, `useWithdrawal`, `useWebSocket`. Test: `formatBalance`, `parseAmount`, `toUint256String`, `toEthereumAddress`. Test: error mapping in `errors.ts`. Coverage targets per `testing_strategy.md`. |
| E-11-S1-T3 | Write Maestro E2E flows | L | All screen tasks | `e2e/onboarding.yaml` — full connect → delegate → select → unify flow. `e2e/send.yaml` — L3 gasless send happy path. `e2e/withdraw.yaml` — withdrawal happy path. Run against dev build with MSW mocks. |

### E-11-S2: Accessibility, Security & Production Hardening

> **Priority:** P1 · **Phase:** All

**Acceptance Criteria:**
- [ ] All interactive elements have accessibility labels/roles
- [ ] Screen reader navigation works through all critical flows
- [ ] Security checklist from `security.md` §10 passes
- [ ] Screenshot protection on delegation and transaction confirmation screens
- [ ] Production logging does not include sensitive data
- [ ] `npm audit` shows no high/critical vulnerabilities

| ID | Task | Complexity | Dependencies | Technical Notes |
|----|------|-----------|--------------|-----------------|
| E-11-S2-T1 | Accessibility audit and remediation | M | All screen tasks | Add `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` to all interactive components. Test with VoiceOver (iOS) and TalkBack (Android). Ensure focus order is logical for all flows. |
| E-11-S2-T2 | Implement runtime security measures | S | E-4-S1-T3, E-9-S2-T1, E-10-S1-T3 | Prevent screenshots on delegation and transaction confirm screens (iOS: `UIScreen.main.isCaptured` / Android: `FLAG_SECURE`). Redact balances in app switcher. Guard `__DEV__` flags. Per `security.md` §7. |

---

## Dependency Graph & Critical Path

```
Pre-Phase 0 (Bootstrap)
═══════════════════════
E-0-S1 (Expo init, TS, env)
  └─→ E-0-S2 (NativeWind, fonts, gluestack)
       └─→ E-0-S3 (routing, providers, linting, Jest)
            ├─→ E-1 (shared components)       ← parallel
            └─→ E-2 (core infrastructure)      ← parallel

Phase 0 (Connect + Delegate)
════════════════════════════
E-1 + E-2 complete
  └─→ E-3 (wallet connection)
       └─→ E-4 (EIP-712 delegation)
            └─→ E-5 (onboarding flow)

Phase 1 (Unified View + Real-Time)
══════════════════════════════════
E-5 complete
  ├─→ E-6 (wallet home + balance)    ← parallel
  └─→ E-7 (WebSocket integration)    ← parallel
       └─→ E-6 + E-7 integrated (bu events drive balance cards)

Phase 2 (Unification)
════════════════════
E-6 + E-7 complete
  └─→ E-8 (unify flow)

Phase 3 (Send + Withdraw)
═════════════════════════
E-6 + E-7 complete
  ├─→ E-9 (send)       ← parallel
  └─→ E-10 (withdraw)  ← parallel

All Phases
══════════
E-11 (testing, a11y, security) — continuous, tasks run in parallel with feature work
```

### Critical Path

```
E-0-S1 → E-0-S2 → E-0-S3 → E-2-S2 → E-3-S1 → E-4-S1 → E-5-S1 → E-6-S2 → E-7-S2 → E-8-S1 → E-9-S2 / E-10-S1
```

The longest sequential chain runs through bootstrap → core infra → wallet connection → delegation → onboarding → wallet home → WebSocket → unification → send/withdraw.

---

## Sprint Allocation Recommendation

Assuming **1-week sprints** with **2 developers**:

| Sprint | Focus | Epics | Deliverable |
|--------|-------|-------|-------------|
| 1 | Project scaffold | E-0-S1, E-0-S2 | Expo project boots with NativeWind + fonts |
| 2 | Routing + tooling + types | E-0-S3, E-2-S1 | Routing works, types defined, linting configured |
| 3 | API client + stores + shared components (layout) | E-2-S2, E-2-S3, E-1-S1 | API client, stores, hooks, layout components |
| 4 | Shared components (data + feedback + forms) | E-1-S2, E-1-S3 | Full shared component library |
| 5 | Wallet connection | E-3 | User can connect wallet via WalletConnect |
| 6 | Delegation signing | E-4-S1 | User can sign EIP-712 delegation |
| 7 | Delegation management + onboarding | E-4-S2, E-5 | Full onboarding flow: connect → delegate → select → unify |
| 8 | Wallet home | E-6 | Unified balance view with yield badges |
| 9 | WebSocket integration | E-7 | Real-time balance updates, connection indicator |
| 10 | Unification flow | E-8 | Dust sweep: select → preview → progress |
| 11 | Send flow | E-9 | Gasless L3 + cross-chain send |
| 12 | Withdraw flow | E-10 | Withdrawal with fast exit indicator |
| 13 | Testing + polish | E-11 | Full test suite, a11y audit, security hardening |

**Total: 13 sprints (~3.25 months with 2 developers)**

---

## User Story Coverage Matrix

Verification that all 9 PRD user stories are covered:

| User Story | Epic(s) | Key Tasks |
|------------|---------|-----------|
| **US-01**: One-Time Delegation | E-4 | E-4-S1-T1 (ScopeExplainer), E-4-S1-T3 (DelegateScreen), E-4-S2-T2 (RevokeDelegation) |
| **US-02**: Unified Balance View | E-6, E-7 | E-6-S1-T1 (BalanceCard), E-6-S1-T3 (aggregation), E-7-S2-T1 (WS cache sync) |
| **US-03**: Unification / Dust Sweep | E-8 | E-8-S1-T1 (select), E-8-S1-T2 (preview), E-8-S2-T1 (progress) |
| **US-04**: Fast Exit Guarantee | E-10 | E-10-S1-T1 (WithdrawScreen), E-10-S1-T2 (ExitTypeIndicator), E-10-S2-T1 (status) |
| **US-05**: Gasless P2P Yellow L3 | E-9 | E-9-S1-T2 (RecipientScreen), E-9-S2-T2 (L3 send via ClearNode) |
| **US-06**: Cross-chain Transfers | E-9 | E-9-S2-T3 (cross-chain send), E-9-S3-T1 (SendStatusScreen) |
| **US-07**: Wallet Home + Yield | E-6 | E-6-S2-T1 (WalletHomeScreen), E-6-S2-T2 (yield display) |
| **US-08**: Onboarding Flow | E-3, E-4, E-5 | E-3-S2-T1 (connect), E-4-S1-T3 (delegate), E-5-S2-T1 (select tokens), E-5-S2-T2 (unify) |
| **US-09**: Add Liquidity | E-5, E-8 | E-5-S2-T1 (onboarding token select), E-8-S1-T1 (standalone unify select) |

---

## API Endpoint Coverage

All endpoints from `api-specification.md` are covered:

| Endpoint | Hook / API Function | Tasks |
|----------|-------------------|-------|
| `GET /api/health` | `useHealth()` / `getHealth()` | E-2-S2-T3, E-2-S3-T2 |
| `POST /api/delegation/register` | `useDelegation().register` | E-2-S2-T3, E-4-S1-T3 |
| `POST /api/delegation/revoke` | `useDelegation().revoke` | E-2-S2-T3, E-4-S2-T2 |
| `GET /api/delegation/keys` | `useDelegation().keys` | E-2-S2-T3, E-4-S2-T1 |
| `GET /api/balance` | `useBalance()` | E-2-S2-T3, E-6-S1-T3 |
| `POST /api/withdrawal/request` | `useWithdrawal().request` | E-2-S2-T3, E-10-S1-T3 |
| `GET /api/withdrawal/status/:id` | `useWithdrawal(id).status` | E-2-S2-T3, E-10-S2-T1 |
| `GET /api/state/channel/:channelId` | `useChannel()` | E-2-S2-T3, E-2-S3-T2 |
| `GET /api/state/sessions` | `useSessions()` | E-2-S2-T3, E-2-S3-T2 |
| WebSocket `subscribe`/`bu` | `useWebSocket()` / `WebSocketProvider` | E-7-S1-T1, E-7-S2-T1 |
| `POST /lifi/quote` (lif-rust) | Direct API call (Phase 2) | E-8-S1-T2, E-9-S2-T3 |
| `POST /intent/build` (lif-rust) | Direct API call (Phase 2) | E-9-S2-T3 |
| `POST /intent/calldata` (lif-rust) | Direct API call (Phase 2) | E-9-S2-T3 |

---

## Tech Stack Bootstrap Coverage

All items from `tech-stack.md` are addressed in bootstrap tasks:

| Technology | Bootstrap Task |
|-----------|---------------|
| Expo SDK 52 | E-0-S1-T1 |
| React Native 0.76 | E-0-S1-T1 |
| TypeScript 5.6 (strict) | E-0-S1-T2 |
| expo-router 4.x | E-0-S3-T1 |
| TanStack React Query 5.x | E-0-S3-T2 (provider), E-2-S3-T2 (hooks) |
| Zustand 5.x | E-2-S3-T1 |
| React Hook Form 7.x + Zod 3.x | E-1-S3-T3 |
| Reown AppKit + Wagmi 2.x + Viem 2.x | E-3-S1-T1 |
| @erc7824/nitrolite | E-2-S3-T3 |
| NativeWind 4.x + TailwindCSS 3.4 | E-0-S2-T1, E-0-S2-T2 |
| gluestack-ui 2.x | E-0-S2-T4 |
| lucide-react-native | E-5-S2-T3 |
| react-native-reanimated 3.x | E-0-S2-T1 (installed with NativeWind) |
| expo-secure-store | E-2-S3-T1, E-4-S1-T4 |
| AsyncStorage | E-2-S3-T1 |
| Jest 29 + Testing Library + MSW 2.x | E-0-S3-T4 |
| Maestro | E-11-S1-T3 |
| ESLint 9 + Prettier 3.4 | E-0-S3-T3 |
| husky + lint-staged | E-0-S3-T3 |
| EAS Build + EAS Submit | Deployment (post-MVP) |

---

## Security Requirements Coverage

All items from `security.md` are addressed:

| Security Requirement | Section | Tasks |
|---------------------|---------|-------|
| Never store private keys | §1 | Architecture-wide — WalletConnect only |
| Session Key metadata in SecureStore | §1 | E-4-S1-T4 |
| Clear SecureStore on disconnect | §1 | E-3-S1-T2 |
| Never store raw signature | §1 | E-4-S1-T4 |
| Input validation mirrors backend Zod | §3 | E-2-S2-T2 |
| Typed HTTP client with headers | §4 | E-2-S2-T1 |
| WebSocket validation + reconnect | §4 | E-7-S1-T1, E-7-S1-T2 |
| Deep link security | §5 | E-5-S1-T1 (navigation guards) |
| Delegation scope communication | §6 | E-4-S1-T1 (ScopeExplainer) |
| Screenshot protection | §7 | E-11-S2-T2 |
| Sensitive screen redaction | §7 | E-11-S2-T2 |
| `__DEV__` flag guards | §7 | E-11-S2-T2 |
| Dependency security | §8 | E-0-S3-T3 (audit in CI) |
| Error handling (no stack traces) | §9 | E-2-S1-T3 (error mapping) |
| Pre-release security checklist | §10 | E-11-S2-T2 |

---

## Critical Reference Files

| File | Purpose |
|------|---------|
| `frontend/docs/flywheel-frontend-prd.md` | Product requirements, user stories US-01–US-09 |
| `frontend/docs/architecture/architecture.md` | Project structure, navigation, state management, data flows |
| `frontend/docs/architecture/component-architecture.md` | Screen → component → hook → API mapping |
| `frontend/docs/architecture/api-specification.md` | REST + WebSocket + EIP-712 contract |
| `frontend/docs/architecture/coding-standards.md` | TypeScript rules, naming, styling, git workflow, testing |
| `frontend/docs/architecture/tech-stack.md` | Full dependency matrix with versions |
| `frontend/docs/architecture/security.md` | Storage boundaries, input validation, network security, delegation scope |
| `frontend/.context/06_testing/testing_strategy.md` | Coverage targets, testing patterns |
| `frontend/.context/06_testing/testing_tools.md` | Test tooling versions |
| `frontend/CLAUDE.md` | Build commands, env vars, key architecture decisions |
