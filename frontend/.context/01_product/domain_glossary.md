# Domain Glossary

| Term | Definition |
|------|------------|
| **Flywheel Wallet** | The user-facing app (this frontend): delegate, unified balance, send, withdraw. |
| **Unified Balance** | Sum of user assets across supported chains, shown as a single value (with optional per-chain breakdown). |
| **Session Key (Yellow)** | One-time EIP-712 delegation so the Flywheel Solver can fulfill intents automatically; user grants in the app (application, allowances, expiry). |
| **Delegation Flow** | One-time onboarding: user signs EIP-712 to enable the Solver (Session Key registration). |
| **ClearNode** | Backend service providing Nitrolite session and real-time updates (e.g. WebSocket `bu`) for balance and progress. |
| **Flywheel Treasury** | Receives 50% of intent-fulfillment rewards; part of pool liquidity; user funds are always protected. |

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
