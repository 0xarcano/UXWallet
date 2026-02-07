# Language Rules

Full details in `../docs/architecture/coding-standards.md`.

## TypeScript Strict Mode

```jsonc
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Rules

- **No `any`** — use `unknown` and narrow with type guards.
- **No `as` casts** unless narrowing from `unknown` after validation.
- **No non-null assertions (`!`)** — handle `null`/`undefined` explicitly.
- **No `@ts-ignore`** — use `@ts-expect-error` with a comment, only as last resort.
- **Explicit return types** on exported functions and hooks.
- **`interface`** for object shapes; **`type`** for unions, intersections, computed types.
- Functional components only — no class components.

## BigInt Convention

Monetary values from the backend arrive as `string` (`uint256String`). Use branded types:

```typescript
type Uint256String = string & { readonly __brand: 'Uint256String' };
type EthereumAddress = string & { readonly __brand: 'EthereumAddress' };
```

- **Never use `Number` or floating-point** for monetary values.
- Use `BigInt` for arithmetic, convert to `Uint256String` for API calls.
- Use `formatBalance(amount, decimals)` utility for display.
