# Domain Glossary

| Term | Definition |
|------|------------|
| **Flywheel Wallet** | The user-facing mobile app (this frontend): delegate, unified balance, send, withdraw. |
| **Unified Balance** | Sum of user assets across supported chains, shown as a single value per asset (with optional per-chain breakdown). |
| **Session Key (Yellow)** | One-time EIP-712 delegation so the Flywheel Solver can fulfill intents automatically; user grants in the app (application, scope, allowances, expiry). Registered on-chain via `SessionKeyRegistry` contract with per-token spend caps. |
| **SessionKeyRegistry** | On-chain contract that stores session key registrations, per-token spend caps, expiry, and revocation state. UXOriginSettler validates session keys against this registry before executing delegated orders. |
| **Delegation Flow** | One-time onboarding: user signs EIP-712 typed data → backend calls `SessionKeyRegistry.registerSessionKeyWithSig()` to register on-chain → Session Key enables autonomous Solver operations with enforced spend limits. |
| **ClearNode** | Backend service providing Nitrolite session management and real-time updates (WebSocket `bu` events) for balance and progress. |
| **Flywheel Solver** | Just-In-Time bot that fulfills intents using the Aggregated Liquidity Pool; falls back to LiFi marketplace when pool cannot fulfill. |
| **Flywheel Treasury** | Receives 50% of intent-fulfillment rewards; part of pool liquidity; only withdrawable by system owners. User funds are always protected. |
| **Aggregated Liquidity Pool** | Combined user-delegated assets + Flywheel Treasury used by the Solver to fulfill intents. |
| **Unification Intent** | Intent-based action (via LiFi / ERC-7683) that consolidates fragmented balances into the vault. |
| **Fast Exit / Hybrid Exit** | Withdrawal mode where Flywheel Treasury sponsors LiFi bridge fees when local vault lacks sufficient liquidity. |
| **Custody Contract** | On-chain contract (Yellow Smart Account / Nitrolite) where delegated funds are locked. |
| **Adjudicator** | On-chain contract for dispute resolution and Force Withdrawal. |
| **Force Withdrawal** | Safety mechanism: user presents last signed state to Adjudicator to claim funds when backend/ClearNode is unavailable. |
| **ERC-7683** | Intent-based cross-chain actions standard (used via LiFi). |
| **ERC-7824** | State-channel / settlement standard (Yellow / Nitrolite). |

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
