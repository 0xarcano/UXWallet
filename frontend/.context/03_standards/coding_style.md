# Coding Style

Full standards in `../docs/architecture/coding-standards.md`.

| Area | Rule |
|------|------|
| **Runtime** | Expo SDK 52, React Native 0.76. |
| **Language** | TypeScript 5.6, strict mode (`"strict": true`, `"noUncheckedIndexedAccess": true`). |
| **Styling** | NativeWind 4.x (`className` prop). No inline `style` objects except for dynamic values Tailwind cannot express. |
| **UI Components** | gluestack-ui 2.x (Button, Input, Modal, Toast, BottomSheet). |
| **Icons** | lucide-react-native. |
| **UX Rule** | "One-Click Approval" philosophy. No manual chain-switching after initial delegation. |

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
| Env vars | `EXPO_PUBLIC_` prefix | `EXPO_PUBLIC_API_URL` |

## Component Rules

- Functional components only — no class components.
- Named exports — no `export default`.
- Explicit props interface suffixed with `Props`.
- No `React.FC` — use plain function with explicit return type.
- One component per file.
- Props destructured in signature, not in body.

## Import Order

```typescript
// 1. React / React Native
import { useState } from 'react';
import { View, Text } from 'react-native';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

// 3. Internal modules (absolute imports via @/ alias)
import { useBalance } from '@/hooks/useBalance';
import type { Balance } from '@/types/balance';

// 4. Relative imports (within same feature)
import { formatChainName } from './utils';
```

Avoid barrel files (`index.ts` re-exports) — import directly from source files.
