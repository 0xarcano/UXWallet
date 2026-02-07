# CLAUDE.md — Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend sub-project.

## Project Status

**E-0 (Project Bootstrap) complete** — Expo SDK 52 project scaffolded with routing, styling, providers, testing, and dev tooling.

**E-1 (Shared UI Components) complete** — 16 reusable components built with tests (96 tests, 21 suites). Brand colors migrated to official Flywheel palette. Utilities created: `format.ts`, `errors.ts`, `common.ts`, `validation.ts`. Dependencies added: `lucide-react-native`, `react-native-svg`, `expo-clipboard`.

**E-2 (Core Infrastructure) complete** — TypeScript types for all API responses, typed HTTP client (`src/lib/api/`), 4 Zustand stores with persistence (`src/stores/`), 6 TanStack Query hooks (`src/hooks/`), EIP-712 delegation builder (`src/lib/eip712/`), chain config (`src/config/chains.ts`). 212 tests, 37 suites. Dependencies added: `zustand`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `@erc7824/nitrolite`.

See `docs/implementation-records.md` for full status. Remaining dependencies (Wagmi, Reown, etc.) are planned — they will be added as their respective epics begin.

## Context Files

Before writing any code, you MUST review:
- `../.context/` — project-wide context (sequence diagrams, best practices, lif-rust integration)
- `.context/` — frontend-specific architecture, standards, security, testing, flow diagrams, and lif-rust integration docs
- `docs/architecture/` — detailed architecture, API spec, component design, coding standards, security (authoritative source)
- `docs/flywheel-frontend-prd.md` — product requirements and user stories

## Priority Rules

1. **Architecture:** Follow the patterns defined in `docs/architecture/architecture.md` and `.context/02_architecture/`.
2. **Style:** Adhere strictly to `docs/architecture/coding-standards.md` and `.context/03_standards/coding_style.md`.
3. **Error handling:** Follow `.context/03_standards/error_handling.md`.
4. **Git workflow:** Follow `.context/03_standards/git_workflow.md`.
5. **Security:** Review `docs/architecture/security.md` and `.context/05_security/` before writing sensitive logic.
6. **Testing:** All new code must be accompanied by tests as defined in `.context/06_testing/`.
7. **API contract:** All backend calls must match `docs/architecture/api-specification.md`.

## Tech Stack

- **Runtime:** Expo SDK 52.0.49, React Native 0.76.9, React 18.3.1
- **Language:** TypeScript ^5.3.3 (installed 5.9.3, strict mode, no `any`)
- **Navigation:** expo-router 4.0.22 (file-based routing)
- **Server State:** TanStack React Query 5.62.16
- **Client State:** Zustand 5.x *(planned — E-2)*
- **Forms:** React Hook Form 7.x + Zod 3.23.8 *(RHF planned — E-9)*
- **Wallet:** Reown AppKit (WalletConnect) + Wagmi 2.x + Viem 2.x *(planned — E-3)*
- **EIP-712:** `@erc7824/nitrolite` for delegation typed-data *(planned — E-4)*
- **Styling:** NativeWind 4.1.23 (TailwindCSS 3.4.19 for React Native) — custom primitives (ADR-008, no gluestack-ui)
- **Icons:** lucide-react-native *(planned — E-1)*
- **Animations:** react-native-reanimated 3.16.7
- **Storage:** expo-secure-store (encrypted), AsyncStorage (preferences) *(planned — E-2)*
- **Testing:** Jest 29.7.0, Testing Library 12.8.1, MSW 2.6.9, Maestro (E2E, planned)
- **Build:** EAS Build + EAS Submit

See `docs/architecture/tech-stack.md` for the full dependency matrix.

## Build & Development Commands

Commands to use once the project is bootstrapped:

```bash
npx expo install                # Install dependencies (Expo-managed versions)
npx expo start                  # Start dev server (Expo Go or dev client)
npx expo start --ios            # Start on iOS simulator
npx expo start --android        # Start on Android emulator
pnpm run lint                    # ESLint
pnpm run test                    # Jest unit tests
npx maestro test e2e/           # E2E tests (requires dev build)
eas build --platform ios        # Cloud build for iOS
eas build --platform android    # Cloud build for Android
```

## Environment Variables

Managed via `expo-constants` and `.env` files. Prefix with `EXPO_PUBLIC_`:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend REST base URL |
| `EXPO_PUBLIC_WS_URL` | WebSocket endpoint |
| `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown/WalletConnect project ID |
| `EXPO_PUBLIC_CHAIN_ENV` | `testnet` or `mainnet` |

## Target Platforms

| Platform | Priority |
|----------|----------|
| iOS | Primary (iPhone 13+, iOS 16+) |
| Android | Primary (API 28+, Android 9+) |
| Web | Secondary (Expo web export) |

## Key Architecture Decisions

- **Non-custodial:** App never stores private keys. All signing via WalletConnect.
- **Three-layer state:** Ephemeral (React state) → Client (Zustand) → Server (TanStack Query)
- **Real-time:** WebSocket `bu` events sync directly into TanStack Query cache
- **Phase boundaries:** Phase 1 = testnet (Sepolia + Base Sepolia), LiFi mocked. Phase 2 = mainnet, full LiFi.
- **On-chain delegation:** Session keys are registered on-chain via `SessionKeyRegistry` contract (EIP-712 signature, per-token spend caps, expiry/revocation). The frontend triggers registration through backend delegation APIs.

## Deployment

Build via EAS Build + EAS Submit. See `.context/03_standards/git_workflow.md` for branching workflow.
