# Development Standards

> Coding conventions, naming rules, patterns, and workflow for the Flywheel Wallet frontend.

## TypeScript

### Strict Mode

```jsonc
// tsconfig.json compilerOptions
{
  "strict": true,
  "noUncheckedIndexedAccess": true
}
```

### Rules

- **No `any`** — use `unknown` and narrow with type guards
- **No `as` casts** unless narrowing from `unknown` after validation
- **No non-null assertions (`!`)** — handle `null`/`undefined` explicitly
- **No `@ts-ignore`** — use `@ts-expect-error` with a comment explaining why, and only as a last resort
- **Explicit return types** on exported functions and hooks
- **`interface` for object shapes**, `type` for unions, intersections, and computed types

### BigInt Convention

Monetary values from the backend arrive as `string` (e.g., `"1500000000000000000"`). Use a branded type:

```typescript
// src/types/common.ts
type Uint256String = string & { readonly __brand: 'Uint256String' };
type EthereumAddress = string & { readonly __brand: 'EthereumAddress' };

// Validation + branding
function toUint256String(value: string): Uint256String {
  if (!/^\d+$/.test(value)) throw new Error('Invalid uint256 string');
  return value as Uint256String;
}

function toEthereumAddress(value: string): EthereumAddress {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) throw new Error('Invalid address');
  return value.toLowerCase() as EthereumAddress;
}
```

### Financial Arithmetic

- **Never use `Number` or floating-point** for monetary values
- Use `BigInt` for arithmetic, convert to `Uint256String` for API calls
- Use the `formatBalance(amount: Uint256String, decimals: number): string` utility for display

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `BalanceCard.tsx` |
| Hooks | camelCase, `use` prefix | `useBalance.ts` |
| Utilities | camelCase | `formatBalance.ts` |
| Stores | camelCase, `Store` suffix | `walletStore.ts` |
| Types/Interfaces | PascalCase | `DelegationRequest` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Directories | kebab-case | `components/shared/` |
| Route files | kebab-case | `select-tokens.tsx` |
| Test files | `*.test.ts(x)` | `BalanceCard.test.tsx` |
| Environment variables | SCREAMING_SNAKE, `EXPO_PUBLIC_` prefix | `EXPO_PUBLIC_API_URL` |

---

## Component Conventions

### Structure

```typescript
// src/components/wallet/BalanceCard.tsx

import { View, Text } from 'react-native';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import type { Balance } from '@/types/balance';

interface BalanceCardProps {
  balance: Balance;
  onPress?: () => void;
}

export function BalanceCard({ balance, onPress }: BalanceCardProps): JSX.Element {
  return (
    <View className="bg-card rounded-xl p-4" onTouchEnd={onPress}>
      <AmountDisplay
        amount={balance.balance}
        asset={balance.asset}
        decimals={balance.decimals}
      />
    </View>
  );
}
```

### Rules

- **Functional components only** — no class components
- **Named exports** — no `export default`
- **Explicit props interface** — defined above the component, suffixed with `Props`
- **No `React.FC`** — use plain function with explicit return type
- **One component per file** — collocate small helpers only if tightly coupled
- **Props destructured in signature** — not in the body

### Hook Structure

```typescript
// src/hooks/useBalance.ts

import { useQuery } from '@tanstack/react-query';
import { getBalance } from '@/lib/api/balance';
import type { BalanceResponse } from '@/types/api';

const STALE_TIME = 30_000; // 30 seconds

export function useBalance(userAddress: string, asset?: string) {
  return useQuery<BalanceResponse>({
    queryKey: asset
      ? ['balance', userAddress, asset]
      : ['balance', userAddress],
    queryFn: () => getBalance(userAddress, asset),
    staleTime: STALE_TIME,
    enabled: Boolean(userAddress),
  });
}
```

---

## Error Handling

### API Error Mapping

Every API error code maps to a user-facing message. The mapping lives in `src/lib/errors.ts`:

```typescript
const USER_MESSAGES: Record<string, { title: string; body: string; action?: string }> = {
  INSUFFICIENT_FUNDS: {
    title: 'Insufficient Funds',
    body: 'Your balance is too low for this transaction.',
    action: 'Adjust the amount and try again.',
  },
  RATE_LIMITED: {
    title: 'Slow Down',
    body: 'Too many requests. Please wait a moment.',
  },
  SESSION_KEY_EXPIRED: {
    title: 'Delegation Expired',
    body: 'Your session key has expired.',
    action: 'Re-delegate from Settings.',
  },
  // ...
};
```

### Toast Pattern: Reassure → Explain → Resolve

```
┌──────────────────────────────────────┐
│ ✓ Your funds are safe.               │  ← Reassure
│                                      │
│ The withdrawal couldn't complete     │  ← Explain
│ because the pool is temporarily      │
│ low on liquidity.                    │
│                                      │
│ [Try Again]                          │  ← Resolve
└──────────────────────────────────────┘
```

### Error Boundaries

- Root `ErrorBoundary` in `app/_layout.tsx` catches unhandled render errors
- Shows a "Something went wrong" screen with a "Restart" button
- Per-screen error states use the `ErrorState` component with retry

### Network Errors

- Distinguish between server errors (5xx) and client errors (4xx)
- Show `ConnectionIndicator` in offline state
- TanStack Query retries failed requests 3 times with exponential backoff
- WebSocket reconnects independently (see `security.md`)

---

## Styling

### NativeWind (Tailwind for React Native)

All styling uses NativeWind `className` props. No inline `style` objects except for dynamic values that Tailwind cannot express.

### Brand Tokens

```javascript
// tailwind.config.js (extend)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',    // Indigo-500 — primary action
          secondary: '#8B5CF6',  // Violet-500 — secondary elements
          success: '#22C55E',    // Green-500 — confirmations, yield
          warning: '#F59E0B',    // Amber-500 — caution states
          error: '#EF4444',      // Red-500 — errors, destructive
          bg: '#0F172A',         // Slate-900 — dark background
          card: '#1E293B',       // Slate-800 — card surfaces
          text: '#F8FAFC',       // Slate-50 — primary text
          muted: '#94A3B8',      // Slate-400 — secondary text
        },
      },
      fontFamily: {
        mono: ['JetBrainsMono'],  // Financial data, addresses, amounts
        sans: ['Inter'],          // UI text
      },
    },
  },
};
```

### Dark Mode

Dark mode is the **primary** theme. The app defaults to dark; light mode support is optional/deferred.

### Typography Rules

| Use Case | Font | Class |
|----------|------|-------|
| Balances, amounts | JetBrains Mono | `font-mono` |
| Addresses | JetBrains Mono | `font-mono text-sm` |
| Body text | Inter (system) | `font-sans` |
| Headings | Inter (system) | `font-sans font-bold` |

---

## File Organization

### Import Order

```typescript
// 1. React / React Native
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

// 3. Internal modules (absolute imports via @/ alias)
import { useBalance } from '@/hooks/useBalance';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import type { Balance } from '@/types/balance';

// 4. Relative imports (within same feature)
import { formatChainName } from './utils';
```

Use path aliases (`@/`) for all cross-module imports. Use relative imports only within the same feature directory.

### Barrel Exports

Avoid barrel files (`index.ts` re-exports) — they increase bundle size and create circular dependency risks. Import directly from the source file.

---

## Git Workflow

### Branch Naming

```
feat/ui-<component-or-feature>    # New feature
fix/ui-<description>              # Bug fix
refactor/ui-<description>         # Code refactoring
docs/ui-<description>             # Documentation only
```

Examples: `feat/ui-delegation-modal`, `fix/ui-balance-formatting`, `refactor/ui-hook-structure`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(delegation): add EIP-712 signing flow
fix(balance): handle zero-balance display correctly
refactor(hooks): extract WebSocket reconnect logic
test(withdrawal): add status polling tests
style(home): adjust card spacing on small screens
```

Scope is the feature area: `delegation`, `balance`, `send`, `withdraw`, `onboarding`, `hooks`, `home`, `settings`.

### Pre-Commit Hooks

Enforced via `husky` + `lint-staged`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### Pull Request Rules

- One feature/fix per PR
- PR title follows conventional commit format
- Description includes: Summary, Test plan, Screenshots (for UI changes)
- Must pass CI (lint + type check + tests) before merge
- Squash merge to keep history clean

---

## Testing Standards

### Unit & Component Tests (Jest + Testing Library)

- Test file lives next to the source: `BalanceCard.tsx` → `BalanceCard.test.tsx`
- Or in `__tests__/` directory at the same level
- Test behavior, not implementation — query by role/text, not by test ID
- Mock API calls with `msw` (Mock Service Worker)
- Mock Wagmi hooks at the module level

```typescript
// BalanceCard.test.tsx
import { render, screen } from '@testing-library/react-native';
import { BalanceCard } from './BalanceCard';

test('displays formatted balance', () => {
  render(
    <BalanceCard
      balance={{ asset: 'ETH', balance: '1500000000000000000', chainId: 11155111 }}
    />,
  );
  expect(screen.getByText('1.5')).toBeTruthy();
  expect(screen.getByText('ETH')).toBeTruthy();
});
```

### E2E Tests (Maestro)

- Test critical user flows: onboarding, delegation, send, withdraw
- Run against a dev build with mocked backend
- Maestro YAML flows live in `e2e/` directory

### Coverage Targets

| Category | Target |
|----------|--------|
| Hooks | 80%+ |
| Utility functions | 90%+ |
| Components | 70%+ (behavior-focused) |
| E2E critical flows | 100% of happy paths |

---

## ESLint Configuration

```javascript
// eslint.config.js (flat config)
module.exports = [
  ...require('eslint-config-expo/flat'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      'react/react-in-jsx-scope': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true
}
```
