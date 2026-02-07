# CLAUDE.md — Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend sub-project.

## Project Status

**Planning/documentation phase** — architecture, standards, and specs are defined in `.context/` and `docs/` but no source code or `package.json` exists yet. When bootstrapping, follow the structure in `docs/architecture/architecture.md`.

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

- **Runtime:** Expo SDK 52, React Native 0.76, React 18.3
- **Language:** TypeScript 5.6 (strict mode, no `any`)
- **Navigation:** expo-router 4.x (file-based routing)
- **Server State:** TanStack React Query 5.x
- **Client State:** Zustand 5.x
- **Forms:** React Hook Form 7.x + Zod 3.x
- **Wallet:** Reown AppKit (WalletConnect) + Wagmi 2.x + Viem 2.x
- **EIP-712:** `@erc7824/nitrolite` for delegation typed-data
- **Styling:** NativeWind 4.x (TailwindCSS for React Native) + gluestack-ui 2.x
- **Icons:** lucide-react-native
- **Animations:** react-native-reanimated 3.x
- **Storage:** expo-secure-store (encrypted), AsyncStorage (preferences)
- **Testing:** Jest 29.x, Testing Library, MSW 2.x, Maestro (E2E)
- **Build:** EAS Build + EAS Submit

See `docs/architecture/tech-stack.md` for the full dependency matrix.

## Build & Development Commands

Commands to use once the project is bootstrapped:

```bash
npx expo install                # Install dependencies (Expo-managed versions)
npx expo start                  # Start dev server (Expo Go or dev client)
npx expo start --ios            # Start on iOS simulator
npx expo start --android        # Start on Android emulator
npm run lint                    # ESLint
npm run test                    # Jest unit tests
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

## Deployment

Build via EAS Build + EAS Submit. See `.context/03_standards/git_workflow.md` for branching workflow.
