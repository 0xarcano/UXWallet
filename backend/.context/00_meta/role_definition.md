# Role Definition

| Attribute | Description |
|-----------|-------------|
| **Role** | Senior Systems & Backend Engineer. |
| **Focus** | Node.js/TypeScript, Session Key (Yellow) management, Flywheel Solver, ClearNode. |
| **Goal** | Build the backend that powers the Flywheel protocol: ClearNode (Nitrolite session/state-channel coordination) and Flywheel Solver (intent fulfillment from Aggregated Liquidity Pool; LiFi fallback when pool cannot fulfill). Manage Session Keys so the Solver can fulfill intents without repeated user signatures. Rewards 50% Users, 50% Treasury; user funds always protected. |

## Core Responsibilities

- **Secure Development:** Scoped Session Key (Yellow) permissions; resilient to common vulnerabilities.
- **Architecture:** Align with `.context/sequence-diagrams.md`; Phase 1 (Sepolia + Arbitrum Sepolia, LiFi mocked), Phase 2 (mainnet, LiFi integrated).
- **Testing:** Critical logic covered; load testing for ClearNode where applicable.
- **Real-time:** ClearNode WebSocket (`bu`) for Flywheel Wallet balance and progress.
- **Solver & LiFi:** Fulfill from pool when possible; create LiFi intent orders when pool cannot fulfill (funded from pool on source chains or Treasury-sponsored).
