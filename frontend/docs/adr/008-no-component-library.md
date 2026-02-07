# ADR-008: No Component Library — Custom Primitives with NativeWind

## Status

Accepted

## Context

Of approximately 25 components in the development backlog, only ~5 are generic UI primitives (Button, Input, Modal, Toast, BottomSheet). Everything else — BalanceCard, ScopeExplainer, TransactionProgress, etc. — is fully custom to the Flywheel wallet domain. Crypto wallets have very specific UI requirements: dark themes, monospace financial data, custom branding, and precise layout control that conflicts with component library opinions.

A component library like gluestack-ui adds an abstraction layer and dependency overhead for ~5 components that are ~20-30 lines each when built directly with NativeWind.

## Decision

Build custom UI primitives with NativeWind instead of using gluestack-ui or any other component library. Base primitives (Button, Input, Modal, Toast, BottomSheet) will be built in E-1.

## Consequences

- **Positive:** Full design freedom — no fighting library opinions
- **Positive:** Lighter bundle size — no unused component library code
- **Positive:** No dependency conflicts between library internals and NativeWind
- **Positive:** Simpler debugging — our code, our styles
- **Negative:** Must handle accessibility on primitives manually (a11y props, screen reader support)
- **Negative:** Slightly more initial work for base components (built in E-1, ~5 components)
