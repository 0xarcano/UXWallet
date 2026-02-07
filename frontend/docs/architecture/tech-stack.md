# Technology Stack & Dependencies

> Flywheel Wallet — React Native (Expo) mobile application.

## Stack Overview

| Category | Technology | Version | Status |
|----------|-----------|---------|--------|
| Runtime | Expo SDK | 52.0.49 | Installed |
| Framework | React Native | 0.76.9 | Installed |
| UI Library | React | 18.3.1 | Installed |
| Language | TypeScript | ^5.3.3 (resolved 5.9.3) | Installed |
| Navigation | expo-router | 4.0.22 | Installed |
| Server State | TanStack React Query | 5.62.16 | Installed |
| Client State | Zustand | 5.x | **Not yet installed** (E-2) |
| Forms | React Hook Form | 7.x | **Not yet installed** (E-9) |
| Validation | Zod | 3.23.8 | Installed |
| Wallet Connection | Reown AppKit (WalletConnect) | latest | **Not yet installed** (E-3) |
| Wallet Hooks | Wagmi | 2.x | **Not yet installed** (E-3) |
| Ethereum Utils | Viem | 2.x | **Not yet installed** (E-3) |
| EIP-712 Types | @erc7824/nitrolite | latest | **Not yet installed** (E-4) |
| Styling | NativeWind | 4.1.23 | Installed |
| UI Primitives | Custom NativeWind components | — | ADR-008 (replaces gluestack-ui) |
| Icons | lucide-react-native | latest | **Not yet installed** (E-1) |
| Animations | react-native-reanimated | 3.16.7 | Installed |
| Secure Storage | expo-secure-store | ~52.x | **Not yet installed** (E-2) |
| Async Storage | @react-native-async-storage/async-storage | 2.x | **Not yet installed** (E-2) |
| Build System | EAS Build + EAS Submit | latest | — |

## Dependency Matrix

### Core

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `expo` | ~52.0.49 | 52.0.49 | Managed workflow, OTA updates, native module bridge |
| `react-native` | 0.76.9 | 0.76.9 | Mobile UI framework |
| `react` | 18.3.1 | 18.3.1 | Component model, hooks |
| `typescript` | ^5.3.3 | 5.9.3 | Strict type safety |

### Navigation

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `expo-router` | ~4.0.22 | 4.0.22 | File-based routing (maps to `app/` directory) |
| `react-native-screens` | ~4.4.0 | 4.4.0 | Native navigation primitives |
| `react-native-safe-area-context` | 4.12.0 | 4.12.0 | Safe area insets |

### State Management

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `@tanstack/react-query` | ~5.62.16 | 5.62.16 | Server state, caching, background refetch, optimistic updates |
| `zustand` | ~5.0 | **Not yet** (E-2) | Lightweight client state (wallet, delegation, WS status) |

### Forms & Validation

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `react-hook-form` | ~7.54 | **Not yet** (E-9) | Performant form state (send, withdraw, unify) |
| `@hookform/resolvers` | ~3.9 | **Not yet** (E-9) | Zod integration for react-hook-form |
| `zod` | ~3.23.8 | 3.23.8 | Schema validation mirroring backend schemas |

### Wallet & Web3

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `@reown/appkit` | latest | **Not yet** (E-3) | WalletConnect modal, session management |
| `@reown/appkit-adapter-wagmi` | latest | **Not yet** (E-3) | Wagmi adapter for Reown AppKit |
| `wagmi` | ~2.14 | **Not yet** (E-3) | React hooks for Ethereum (useAccount, useSignTypedData) |
| `viem` | ~2.21 | **Not yet** (E-3) | Ethereum utilities (address validation, hex encoding, ABI) |
| `@erc7824/nitrolite` | latest | **Not yet** (E-4) | `EIP712AuthTypes` for delegation typed-data signing |

### UI & Styling

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `nativewind` | 4.1.23 | 4.1.23 | TailwindCSS for React Native (className prop) |
| `tailwindcss` | ~3.4.19 | 3.4.19 | Utility-first CSS framework (config only) |
| `lucide-react-native` | latest | **Not yet** (E-1) | Consistent icon set |
| `react-native-reanimated` | ~3.16.1 | 3.16.7 | Layout animations, gesture transitions |
| `react-native-gesture-handler` | ~2.20.2 | 2.20.2 | Touch gesture system |

> **ADR-008:** gluestack-ui was evaluated and rejected in favor of custom NativeWind primitives. See `docs/adr/008-no-component-library.md`.

### Storage

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `expo-secure-store` | ~52.0 | **Not yet** (E-2) | Encrypted key-value store (delegation metadata, session tokens) |
| `@react-native-async-storage/async-storage` | ~2.1 | **Not yet** (E-2) | Unencrypted key-value store (preferences, theme, onboarding state) |

### Networking

| Package | Version | Purpose |
|---------|---------|---------|
| Built-in `fetch` | — | REST API calls to backend |
| Built-in `WebSocket` | — | Real-time balance updates from ClearNode |

### Testing

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `jest` | ^29.2.1 | 29.7.0 | Test runner |
| `jest-expo` | ~52.0.6 | 52.0.6 | Expo-aware Jest preset |
| `@testing-library/react-native` | ~12.8.1 | 12.8.1 | Component testing with user-event simulation |
| `@testing-library/jest-native` | ~5.4.3 | 5.4.3 | Custom Jest matchers for React Native |
| `msw` | ~2.6.9 | 2.6.9 | API mocking for integration tests |
| `maestro` | latest | **Not yet** (E-11) | E2E testing (device-level interaction flows) |

### Dev Dependencies

| Package | Version | Installed | Purpose |
|---------|---------|-----------|---------|
| `eslint` | ~9.39.2 | 9.39.2 | Linting (ESLint 9 flat config, ADR-006) |
| `eslint-config-expo` | ^10.0.0 | 10.0.0 | Expo-specific ESLint rules |
| `prettier` | ~3.4.2 | 3.4.2 | Code formatting |
| `husky` | ~9.1.7 | 9.1.7 | Git hooks |
| `lint-staged` | ~15.2.11 | 15.2.11 | Pre-commit lint on staged files |
| `@types/react` | ~18.3.12 | 18.3.28 | React type definitions |
| `@types/react-native` | — | — | Provided by `@react-native/types` |

### Build & Deployment

| Tool | Purpose |
|------|---------|
| EAS Build | Cloud-native iOS/Android builds |
| EAS Submit | App Store / Google Play submission |
| Expo Dev Client | Custom dev builds with native modules |
| Expo Updates (OTA) | Over-the-air JS bundle updates |

## Target Platforms

| Platform | Priority | Notes |
|----------|----------|-------|
| iOS | Primary | iPhone 13+ (iOS 16+) |
| Android | Primary | API 28+ (Android 9+) |
| Web | Secondary | Expo web export (limited WalletConnect support) |

## TypeScript Configuration

```jsonc
// tsconfig.json (actual)
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```

## Environment Variables

Managed via `expo-constants` and `.env` files:

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend REST base URL | `http://localhost:3000/api` |
| `EXPO_PUBLIC_WS_URL` | WebSocket endpoint | `ws://localhost:3000/ws` |
| `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown/WalletConnect cloud project ID | `abc123...` |
| `EXPO_PUBLIC_CHAIN_ENV` | `testnet` or `mainnet` | `testnet` |

## Version Pinning Strategy

- **Expo SDK** pins React Native and core native modules. Always match Expo SDK version.
- Use `~` (tilde) for Expo-managed packages to stay within the SDK's compatible range.
- Use `~` for all other dependencies to allow patch updates only.
- Lock file (`pnpm-lock.yaml`) must be committed. Project uses pnpm (ADR-005).
- Upgrade Expo SDK as a dedicated task (not mixed with feature work).
