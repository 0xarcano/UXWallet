# Flywheel Wallet — Implementation Records

**Last Updated:** 2026-02-07
**Tracks:** [development-backlog.md](development-backlog.md)

---

## Progress Summary

| Epic | Title | Status | Tasks Done | Tasks Total | Notes |
|------|-------|--------|------------|-------------|-------|
| E-0 | Project Bootstrap | **Complete** | 12/12 | 12 | ADR-008 replaced gluestack with custom primitives |
| E-1 | Shared UI Components | Not started | 0/9 | 9 | |
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
| **Total** | | | **12/86** | **86** | **14% complete** |

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
| E-0-S2-T2 | Add brand tokens to `tailwind.config.js` | Done | Colors: `brand-primary` (#6366F1), `brand-secondary` (#8B5CF6), `brand-success` (#22C55E), `brand-warning` (#F59E0B), `brand-error` (#EF4444), `brand-bg` (#0F172A), `brand-card` (#1E293B), `brand-text` (#F8FAFC), `brand-muted` (#94A3B8). Fonts: `mono` (JetBrainsMono), `sans` (Inter). |
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

## Next Up: E-1 — Shared UI Components

Unblocked. Dependencies satisfied by E-0-S2-T1 (NativeWind configured).

| Story | Key Deliverables |
|-------|-----------------|
| E-1-S1 | `ScreenContainer`, `Header`, `BottomSheet` |
| E-1-S2 | `AmountDisplay`, `AddressDisplay`, `TokenRow`, `LoadingSkeleton`, `YieldBadge`, `ConnectionIndicator` |
| E-1-S3 | `Toast`, `StepIndicator`, `TransactionProgress`, `ErrorState`, `AmountInput`, `RecipientInput`, `ChainSelector` |
