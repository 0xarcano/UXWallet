# Flywheel Wallet — Implementation Records

**Last Updated:** 2026-02-07
**Tracks:** [development-backlog.md](development-backlog.md)

---

## Progress Summary

| Epic | Title | Status | Tasks Done | Tasks Total | Notes |
|------|-------|--------|------------|-------------|-------|
| E-0 | Project Bootstrap | **Complete** | 12/12 | 12 | ADR-008 replaced gluestack with custom primitives |
| E-1 | Shared UI Components | **Complete** | 9/9 | 9 | Brand palette migrated, 16 components + 19 test files |
| E-2 | Core Infrastructure | Not started | 0/10 | 10 | |
| E-3 | Wallet Connection | Not started | 0/5 | 5 | |
| E-4 | EIP-712 Delegation | Not started | 0/7 | 7 | |
| E-5 | Onboarding Flow | Not started | 0/6 | 6 | |
| E-6 | Wallet Home & Unified Balance | Not started | 0/7 | 7 | |
| E-7 | Real-Time WebSocket Integration | Not started | 0/6 | 6 | |
| E-8 | Unification / Dust Sweep | Not started | 0/6 | 6 | |
| E-9 | Send (Gasless P2P + Cross-Chain) | Not started | 0/7 | 7 | |
| E-10 | Withdrawal / Fast Exit | Not started | 0/6 | 6 | |
| E-11 | Testing, Accessibility & Polish | Not started | 0/5 | 5 | |
| **Total** | | | **21/86** | **86** | **24% complete** |

---

## E-0 — Project Bootstrap

**Status:** Complete
**Date completed:** 2026-02-07
**ADRs created:** 8 (see `docs/adr/`)

### E-0-S1: Initialize Expo Project & Core Config

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-0-S1-T1 | Scaffold Expo SDK 52 project | Done | Scaffolded via `create-expo-app --template default@sdk-52` in temp dir, merged into existing `frontend/`. Customized `package.json` (name: `flywheel-wallet`), `app.json` (dark theme, `flywheel://` scheme, `#0F172A` bg, `supportsTablet: false`). Uses pnpm (ADR-005). |
| E-0-S1-T2 | Configure `tsconfig.json` strict mode + path aliases | Done | `strict: true`, `noUncheckedIndexedAccess: true`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`. Created `nativewind-env.d.ts`. |
| E-0-S1-T3 | Create `.env.example` | Done | 4 vars: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`, `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID`, `EXPO_PUBLIC_CHAIN_ENV`. |
| E-0-S1-T4 | Create `src/config/env.ts` | Done | Zod-validated accessor for all 4 env vars. Throws descriptive error on invalid/missing vars. Uses `z.enum(['testnet', 'mainnet'])` for chain env. |

**Acceptance Criteria:**
- [x] Expo SDK 52 project scaffolded and boots
- [x] TypeScript strict mode enabled
- [x] `app.json` configured with "Flywheel", `flywheel://`
- [ ] Verified on iOS simulator / Android emulator / Expo Go (pending manual verification)

### E-0-S2: Configure Styling, Fonts & UI Framework

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-0-S2-T1 | Install NativeWind 4.x + TailwindCSS 3.4 | Done | NativeWind 4.1.23, TailwindCSS 3.4.19. `babel.config.js` with NativeWind presets (disabled in test env to avoid reanimated/worklets issues). `metro.config.js` with `withNativeWind` wrapper. `global.css` with Tailwind directives. Note: `lightningcss` override was planned but not needed — `package.json` overrides object is empty. |
| E-0-S2-T2 | Add brand tokens to `tailwind.config.js` | Done | Colors: `brand-primary` (#6366F1), `brand-secondary` (#8B5CF6), `brand-success` (#22C55E), `brand-warning` (#F59E0B), `brand-error` (#EF4444), `brand-bg` (#0F172A), `brand-card` (#1E293B), `brand-text` (#F8FAFC), `brand-muted` (#94A3B8). Fonts: `mono` (JetBrainsMono), `sans` (Inter). **Updated in E-1:** migrated to official Flywheel brand palette (Electric Teal #00D4AA, Deep Space #0A1628, Warm Gold #FFB547, etc.). Added `brand-gold` and `brand-info` tokens. |
| E-0-S2-T3 | Load custom fonts via `expo-font` | Done | Installed `@expo-google-fonts/inter` (4 weights: Regular, Medium, SemiBold, Bold) and `@expo-google-fonts/jetbrains-mono` (3 weights: Regular, Medium, Bold). Loaded in `app/_layout.tsx` via `useFonts()` hook. Splash screen held until fonts ready. |
| E-0-S2-T4 | ~~gluestack-ui~~ → UI placeholder + Button pattern | Done | **ADR-008:** Decided against gluestack-ui. Created `src/components/ui/Button.tsx` as NativeWind reference pattern with 3 variants (primary, secondary, ghost). Created full `src/components/` directory structure for E-1. |

**Acceptance Criteria:**
- [x] NativeWind 4.x renders `className` props
- [x] `tailwind.config.js` includes all brand tokens
- [x] Inter and JetBrains Mono fonts configured
- [x] ~~gluestack-ui~~ Replaced by custom primitives (ADR-008)

**Deviations from backlog:**
- E-0-S2-T4 changed from gluestack-ui installation to custom UI primitives approach per ADR-008

### E-0-S3: Routing, Providers & Dev Tooling

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-0-S3-T1 | Set up expo-router 4.x directory structure | Done | Created: `app/_layout.tsx` (root with global CSS, fonts, providers), `app/index.tsx` (bootstrap screen), `app/(tabs)/_layout.tsx` (Home/Send/Settings tabs), `app/onboarding/_layout.tsx`, `app/send/_layout.tsx`, `app/withdraw/_layout.tsx`, `app/unify/_layout.tsx`, `app/+not-found.tsx`. Removed scaffolded template screens. |
| E-0-S3-T2 | Create `AppProviders.tsx` | Done | Provider hierarchy: `GestureHandlerRootView` > `QueryClientProvider` (staleTime: 5min, retry: 3) > `SafeAreaProvider`. Wagmi placeholder for E-3, WebSocket placeholder for E-7. No GluestackUIProvider (ADR-008). `ThemeProvider` with `DarkTheme` in `_layout.tsx` (ADR-007). |
| E-0-S3-T3 | Configure ESLint 9 + Prettier + husky + lint-staged | Done | ESLint 9.39.2 with flat config (`eslint.config.js`) + `eslint-config-expo/flat`. Prettier 3.4.2 (semi, singleQuote, trailingComma: all, printWidth: 100). Husky pre-commit hook at `UXWallet/.husky/pre-commit`. lint-staged: `*.{ts,tsx}` → eslint --fix + prettier, `*.{json,md}` → prettier. |
| E-0-S3-T4 | Configure Jest + Testing Library + MSW + smoke test | Done | Jest 29 with `jest-expo` preset. `@testing-library/react-native` 12.8. MSW 2.6. pnpm-compatible `transformIgnorePatterns` (includes `.pnpm` in allow list). Env vars set in `jest.config.js` (before Babel transform). 2 test suites, 3 tests passing. |

**Acceptance Criteria:**
- [x] expo-router file-based routing works
- [x] Provider hierarchy correct (adapted for no gluestack — see ADR-003, ADR-008)
- [x] ESLint + Prettier + husky + lint-staged configured
- [x] Jest + Testing Library + MSW configured, smoke tests pass

---

## Architecture Decision Records

Created in E-0 Phase 0, before any code was written.

| ADR | Title | Key Decision |
|-----|-------|-------------|
| [001](adr/001-scaffolding-strategy.md) | Scaffolding Strategy | Scaffold to temp dir + merge into existing `frontend/` |
| [002](adr/002-nativewind-v4-tailwind-3.4.md) | NativeWind v4 + TailwindCSS 3.4 | v4 stable for SDK 52; v5 requires SDK 54 |
| [003](adr/003-provider-hierarchy.md) | Provider Hierarchy | ErrorBoundary > GestureHandler > Query > Wagmi > WS > SafeArea |
| [004](adr/004-three-layer-state.md) | Three-Layer State | Ephemeral (React) → Client (Zustand) → Server (TanStack Query) |
| [005](adr/005-package-manager-pnpm.md) | Package Manager | pnpm for consistency with backend |
| [006](adr/006-eslint-9-flat-config.md) | ESLint 9 Flat Config | ESLint 9 + `eslint-config-expo/flat` |
| [007](adr/007-dark-first-theme.md) | Dark-First Theme | Dark mode only for Phase 1 |
| [008](adr/008-no-component-library.md) | No Component Library | Custom NativeWind primitives instead of gluestack-ui |

---

## Implementation Notes & Gotchas

Lessons learned during E-0 that may affect future epics:

### pnpm + Jest compatibility
- `jest-expo` preset's default `transformIgnorePatterns` assumes npm/yarn flat `node_modules`. With pnpm's `.pnpm/` structure, you must include `.pnpm` in the allow list: `node_modules/(?!(.pnpm|...))`.
- Environment variables prefixed with `EXPO_PUBLIC_` are inlined by `babel-preset-expo` at compile time. They must be set **before** Babel runs — set them at the top of `jest.config.js`, not in `setupFiles`.

### NativeWind + Babel in test environment
- `nativewind/babel` preset loads `react-native-reanimated/plugin` which requires `react-native-worklets` (not installed). `babel.config.js` conditionally disables NativeWind presets when `NODE_ENV === 'test'`. Uses `api.cache.using(() => process.env.NODE_ENV)` instead of `api.cache(true)` to support env-based branching.

### ESLint version
- `eslint-config-expo@10.0.0` requires `eslint/config` export which was added in ESLint 9.17+. The plan specified `~9.15` but was upgraded to `^9.17` (installed 9.39.2). ESLint 10.x is incompatible with current eslint-config-expo plugins.

### lightningcss override
- Originally planned to add `overrides.lightningcss: "1.30.1"` to prevent NativeWind deserialization errors. In practice, the override was not needed — `package.json` overrides object is empty and NativeWind 4.1.23 works without it.

---

## Verification Checklist (E-0)

- [x] `pnpm install` succeeds
- [x] `pnpm run typecheck` — zero errors
- [x] `pnpm run lint` — zero errors
- [x] `pnpm run test` — 3/3 tests pass (2 suites)
- [x] `@/*` path alias resolves in TypeScript
- [x] Husky pre-commit hook configured at `UXWallet/.husky/pre-commit`
- [x] `app/` structure matches architecture (7 route groups)
- [x] `src/` structure matches architecture (7 top-level dirs)
- [x] 8 ADRs in `docs/adr/`
- [x] `npx expo start --web` boots and renders correctly (verified 2026-02-07)
- [ ] `npx expo start --ios` boots on iOS simulator (pending manual verification)
- [ ] `npx expo start --android` boots on Android emulator (pending manual verification)
- [ ] NativeWind classes render visually on native (pending manual verification)
- [ ] Custom fonts display correctly on native (pending manual verification)

---

## File Manifest (E-0)

Files created or modified during E-0 bootstrap:

### Config files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, lint-staged, overrides |
| `app.json` | Expo config: Flywheel, dark theme, flywheel:// scheme |
| `tsconfig.json` | Strict TS, `@/*` → `./src/*` path alias |
| `babel.config.js` | NativeWind presets (disabled in test env) |
| `metro.config.js` | `withNativeWind` CSS processing wrapper |
| `tailwind.config.js` | NativeWind preset + brand tokens + fonts |
| `global.css` | Tailwind directives |
| `eslint.config.js` | ESLint 9 flat config + expo rules |
| `.prettierrc` | Prettier formatting rules |
| `.prettierignore` | Prettier ignore patterns |
| `jest.config.js` | Jest + jest-expo + pnpm transforms + env vars |
| `.env.example` | Template for required env vars |
| `.gitignore` | Expo + RN + IDE ignore rules |
| `nativewind-env.d.ts` | NativeWind TypeScript references |

### App routes
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root: global CSS, fonts, splash, ThemeProvider, AppProviders |
| `app/index.tsx` | Bootstrap screen (nav guards in E-5) |
| `app/+not-found.tsx` | 404 screen |
| `app/(tabs)/_layout.tsx` | Tab navigator: Home / Send / Settings |
| `app/(tabs)/home.tsx` | Home tab placeholder |
| `app/(tabs)/send.tsx` | Send tab placeholder |
| `app/(tabs)/settings.tsx` | Settings tab placeholder |
| `app/onboarding/_layout.tsx` | Onboarding stack navigator |
| `app/send/_layout.tsx` | Send flow stack navigator |
| `app/withdraw/_layout.tsx` | Withdraw flow stack navigator |
| `app/unify/_layout.tsx` | Unify flow stack navigator |

### Source code
| File | Purpose |
|------|---------|
| `src/config/env.ts` | Zod-validated env accessor |
| `src/providers/AppProviders.tsx` | Provider hierarchy (GestureHandler > Query > SafeArea) |
| `src/components/ui/Button.tsx` | NativeWind Button reference pattern |
| `src/test/msw/handlers.ts` | MSW health endpoint stub |
| `src/test/msw/server.ts` | MSW test server setup |

### Tests
| File | Purpose |
|------|---------|
| `__tests__/smoke.test.ts` | Pipeline + env vars verification |
| `__tests__/app-renders.test.tsx` | Component render smoke test |

### ADRs
| File | Purpose |
|------|---------|
| `docs/adr/README.md` | ADR index |
| `docs/adr/001-scaffolding-strategy.md` | Scaffold to temp + merge |
| `docs/adr/002-nativewind-v4-tailwind-3.4.md` | NativeWind v4 + Tailwind 3.4 |
| `docs/adr/003-provider-hierarchy.md` | Provider nesting order |
| `docs/adr/004-three-layer-state.md` | Ephemeral → Client → Server state |
| `docs/adr/005-package-manager-pnpm.md` | pnpm for monorepo consistency |
| `docs/adr/006-eslint-9-flat-config.md` | ESLint 9 flat config |
| `docs/adr/007-dark-first-theme.md` | Dark-only Phase 1 |
| `docs/adr/008-no-component-library.md` | Custom primitives over gluestack |

### Monorepo
| File | Purpose |
|------|---------|
| `UXWallet/.husky/pre-commit` | Husky hook: `cd frontend && npx lint-staged` |

---

## E-1 — Shared UI Components

**Status:** Complete
**Date completed:** 2026-02-07
**Branch:** `feat/ui-shared-components`

### E-1-S0: Brand Color Migration + Dependencies

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-1-S0-T1 | Migrate brand colors to Flywheel palette | Done | Replaced placeholder Indigo/Violet/Slate with official Electric Teal (#00D4AA), Deep Space (#0A1628), Warm Gold (#FFB547). Updated `tailwind.config.js`, `app.json`, `app/(tabs)/_layout.tsx`, `coding-standards.md`. Added `brand-gold` and `brand-info` tokens. |
| E-1-S0-T2 | Fix primary button contrast | Done | Changed primary button text from `text-white` to `text-brand-bg` (Deep Space) for WCAG contrast compliance on Electric Teal background. |
| E-1-S0-T3 | Install dependencies | Done | Added `lucide-react-native` ^0.563.0, `react-native-svg` 15.8.0, `expo-clipboard` ~7.0.1. |
| E-1-S0-T4 | Create utility pre-requisites | Done | `src/types/common.ts` (branded types `Uint256String`, `EthereumAddress` with validators), `src/lib/format.ts` (`formatBalance` using BigInt division — no floating-point, `truncateAddress`), `src/lib/errors.ts` (error code → user-facing message mapping), `src/lib/validation.ts` (Zod schemas). |
| E-1-S0-T5 | Configure Jest test infrastructure | Done | Added `src/test/setup.ts` with mocks for `react-native-reanimated`, `expo-clipboard`, `expo-haptics`, `lucide-react-native`, `react-native-gesture-handler`. Updated `jest.config.js` with `setupFiles` and extended `transformIgnorePatterns`. |

### E-1-S1: Layout & Navigation Components

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-1-S1-T1 | `ScreenContainer` | Done | `SafeAreaView` + optional `ScrollView` + `bg-brand-bg flex-1` + optional `px-4 pt-4`. |
| E-1-S1-T2 | `AddressDisplay` | Done | Truncates `0x1234...5678` (6+4). Copy via `expo-clipboard` + haptic feedback. `font-mono text-brand-muted`. |
| E-1-S1-T3 | `Header` | Done | Fixed bar with `AddressDisplay` pill, optional back arrow (lucide `ChevronLeft` + `router.back()`), connection dot, right action slot. |
| E-1-S1-T4 | `BottomSheet` | Done | Custom implementation using `react-native-reanimated` + `Modal`. Slide animation, dark backdrop with dismiss on press. Title bar with handle. |

### E-1-S2: Data Display Components

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-1-S2-T1 | `LoadingSkeleton` | Done | Pulsing opacity animation (0.3→0.7, 1s loop). `bg-brand-card`. Three variants: `text`, `card`, `circle`. Uses `DimensionValue` for type-safe sizing. |
| E-1-S2-T2 | `AmountDisplay` | Done | Uses `formatBalance()` from `src/lib/format.ts`. `font-mono`. Size maps: sm→text-sm, md→text-lg, lg→text-2xl, xl→text-4xl. |
| E-1-S2-T3 | `TokenRow` | Done | Row with first-letter circle icon, asset name, optional chain badge, `AmountDisplay` right-aligned. `Pressable` when onPress provided. Selection border via `border-brand-primary`. |
| E-1-S2-T4 | `YieldBadge` | Done | `bg-brand-success/20`, `text-brand-success`. Shows `↑ {amount} {asset}`. Gentle pulse animation. `TrendingUp` icon from lucide. Returns null when no yield. |
| E-1-S2-T5 | `ConnectionIndicator` | Done | 8px colored dot. connected=`bg-brand-success`, disconnected=`bg-brand-error`, reconnecting=`bg-brand-warning` + pulse animation. Accessibility labels. |

### E-1-S3: Feedback & Form Components

| ID | Task | Status | Implementation Notes |
|----|------|--------|---------------------|
| E-1-S3-T1 | `Toast` + `ToastContext` | Done | Slide-in from top (reanimated). Color-coded left border per type (success/error/info). Auto-dismiss with configurable duration. `useToast()` hook for imperative usage. Follows "Reassure → Explain → Resolve" pattern. |
| E-1-S3-T2 | `StepIndicator` | Done | Horizontal circles + connecting lines. Completed=checkmark (lucide `Check`) + success color, current=`bg-brand-primary`, future=`bg-brand-muted/30`. Labels below each step. |
| E-1-S3-T3 | `TransactionProgress` | Done | Vertical stepper. Lucide icons per status (Check/AlertTriangle/Loader). Vertical connecting line colored by completion. Optional txHash truncated + copyable via `AddressDisplay`. |
| E-1-S3-T4 | `ErrorState` | Done | Uses `getErrorMessage(code)` from `src/lib/errors.ts`. Inline=compact card with AlertTriangle, fullscreen=centered with large icon. Retry button uses existing `Button` component. |
| E-1-S3-T5 | `AmountInput` | Done | `TextInput` with `keyboardType="decimal-pad"`. MAX button fills maxAmount. Numeric-only regex filtering. Decimal precision enforcement based on token decimals. Error text below input. Controlled component (no RHF — deferred to E-9). |
| E-1-S3-T6 | `RecipientInput` | Done | Address `TextInput` with paste button (lucide `ClipboardPaste`). Reads clipboard via `expo-clipboard`. Validates `isValidEthereumAddress` on blur. `font-mono`. Controlled component. |
| E-1-S3-T7 | `ChainSelector` | Done | Button showing selected chain + `ChevronDown`. Opens `BottomSheet` with chain list. Default chains: Sepolia + Base Sepolia. Selection closes sheet + calls onChange. |

**Acceptance Criteria:**
- [x] `pnpm run typecheck` — zero errors
- [x] `pnpm run lint` — zero errors (6 warnings: `require()` in Jest mocks, expected)
- [x] `pnpm run test` — 96/96 tests pass (21 suites)
- [x] All 16 components created with tests
- [x] Brand colors match official Flywheel palette
- [x] Utilities (`format.ts`, `errors.ts`, `common.ts`, `validation.ts`) in final file locations

---

## Implementation Notes & Gotchas (E-1)

### Lucide mock in Jest
- `lucide-react-native` icons are React Native `View` class components, not functions. The mock must use `React.createElement(View, ...)` instead of calling `View(props)` directly, or you get "Cannot call a class as a function" errors.

### Animated.View accessibility
- `getByRole('alert')` and similar queries don't traverse `Animated.View` wrappers from `react-native-reanimated` in testing. Use `getByText` or `getByLabelText` instead.

### Button contrast on Electric Teal
- White text on `#00D4AA` (Electric Teal) has a contrast ratio of ~3:1 (fails WCAG AA). Primary buttons use `text-brand-bg` (#0A1628 Deep Space) for a contrast ratio of ~9.5:1.

### BigInt in Hermes
- Expo SDK 52 + React Native 0.76 Hermes engine supports `BigInt` natively. `formatBalance()` uses `BigInt` division for financial precision — no floating-point involved.

---

## Verification Checklist (E-1)

- [x] `pnpm install` succeeds (new deps: lucide-react-native, react-native-svg, expo-clipboard)
- [x] `pnpm run typecheck` — zero errors
- [x] `pnpm run lint` — zero errors
- [x] `pnpm run test` — 96/96 tests pass (21 suites, up from 3/3 in E-0)
- [x] Brand colors match `docs/flywheel-brand-strategy.md`
- [x] `app.json` backgroundColor uses Deep Space (#0A1628)
- [x] Tab bar uses Electric Teal (#00D4AA) active tint
- [ ] `npx expo start --web` visual verification (pending)
- [ ] `npx expo start --ios` visual verification on iOS simulator (pending)

---

## File Manifest (E-1)

### Files modified (5)
| File | Changes |
|------|---------|
| `tailwind.config.js` | Brand colors migrated, added `gold` + `info` tokens |
| `app/(tabs)/_layout.tsx` | 4 hardcoded hex values updated |
| `app.json` | 3 `backgroundColor` occurrences updated |
| `docs/architecture/coding-standards.md` | Color table updated |
| `jest.config.js` | `setupFiles` + extended `transformIgnorePatterns` |

### Utility files (4)
| File | Purpose |
|------|---------|
| `src/types/common.ts` | Branded types `Uint256String`, `EthereumAddress` with validators |
| `src/lib/format.ts` | `formatBalance()` (BigInt), `truncateAddress()` |
| `src/lib/errors.ts` | Error code → user-facing message mapping |
| `src/lib/validation.ts` | Zod schemas: `ethereumAddressSchema`, `uint256StringSchema`, `chainIdSchema` |

### Test infrastructure (1)
| File | Purpose |
|------|---------|
| `src/test/setup.ts` | Jest mocks for reanimated, expo-clipboard, expo-haptics, lucide, gesture-handler |

### Components (16)
| File | Category |
|------|----------|
| `src/components/shared/ScreenContainer.tsx` | Layout |
| `src/components/shared/AddressDisplay.tsx` | Layout |
| `src/components/shared/Header.tsx` | Layout |
| `src/components/ui/BottomSheet.tsx` | Layout |
| `src/components/shared/LoadingSkeleton.tsx` | Data Display |
| `src/components/shared/AmountDisplay.tsx` | Data Display |
| `src/components/shared/TokenRow.tsx` | Data Display |
| `src/components/wallet/YieldBadge.tsx` | Data Display |
| `src/components/wallet/ConnectionIndicator.tsx` | Data Display |
| `src/components/ui/Toast.tsx` | Feedback |
| `src/components/ui/ToastContext.tsx` | Feedback |
| `src/components/shared/StepIndicator.tsx` | Feedback |
| `src/components/shared/TransactionProgress.tsx` | Feedback |
| `src/components/shared/ErrorState.tsx` | Feedback |
| `src/components/shared/AmountInput.tsx` | Form |
| `src/components/shared/RecipientInput.tsx` | Form |
| `src/components/shared/ChainSelector.tsx` | Form |

### Component button update (1)
| File | Changes |
|------|---------|
| `src/components/ui/Button.tsx` | Primary text changed to `text-brand-bg` for contrast |

### Tests (19)
| File | Tests |
|------|-------|
| `src/types/__tests__/common.test.ts` | 10 |
| `src/lib/__tests__/format.test.ts` | 10 |
| `src/lib/__tests__/errors.test.ts` | 6 |
| `src/components/shared/__tests__/ScreenContainer.test.tsx` | 3 |
| `src/components/shared/__tests__/AddressDisplay.test.tsx` | 4 |
| `src/components/shared/__tests__/Header.test.tsx` | 5 |
| `src/components/ui/__tests__/BottomSheet.test.tsx` | 4 |
| `src/components/shared/__tests__/LoadingSkeleton.test.tsx` | 4 |
| `src/components/shared/__tests__/AmountDisplay.test.tsx` | 5 |
| `src/components/shared/__tests__/TokenRow.test.tsx` | 5 |
| `src/components/wallet/__tests__/YieldBadge.test.tsx` | 3 |
| `src/components/wallet/__tests__/ConnectionIndicator.test.tsx` | 3 |
| `src/components/ui/__tests__/Toast.test.tsx` | 5 |
| `src/components/shared/__tests__/StepIndicator.test.tsx` | 3 |
| `src/components/shared/__tests__/TransactionProgress.test.tsx` | 4 |
| `src/components/shared/__tests__/ErrorState.test.tsx` | 5 |
| `src/components/shared/__tests__/AmountInput.test.tsx` | 7 |
| `src/components/shared/__tests__/RecipientInput.test.tsx` | 5 |
| `src/components/shared/__tests__/ChainSelector.test.tsx` | 3 |

---

## Next Up: E-2 — Core Infrastructure

Unblocked. Dependencies satisfied by E-1 utilities (`format.ts`, `errors.ts`, `common.ts`).

| Story | Key Deliverables |
|-------|-----------------|
| E-2-S1 | Zustand stores (walletStore, delegationStore, onboardingStore, webSocketStore) |
| E-2-S2 | Typed HTTP client (`src/lib/api/client.ts`), API modules (delegation, balance, withdrawal, state, health) |
| E-2-S3 | TanStack Query hooks (useBalance, useDelegation, useWithdrawal, useSessions, useChannel, useHealth) |
| E-2-S4 | WebSocket client (`src/lib/ws/`) + Query cache sync |
| E-2-S5 | Expand utilities (format.ts, errors.ts) with additional helpers |
