# Database Schema

**Stack:** Redis/PostgreSQL.

## Primary Stores

| Store | Description |
|-------|-------------|
| **sessions** | Nitrolite state channel session metadata (ERC-7824). |
| **transactions** | History of off-chain state transitions for audit and recovery. |
| **yield_logs** | Pro-rata profit distribution records (solver earnings distributed to users). |
| **session_keys** | Store Persistent Session Keys (EIP-712 delegations) with user addresses, expiry, and permission scopes (KMS-backed). |
| **vault_inventory** | Real-time tracking of physical assets across all supported chains (Yellow L3, Ethereum, Base for MVP). |
| **intent_logs** | Records of LI.FI fulfillments (ERC-7683) and captured spreads from JIT solver activities. |
| **user_balances** | Virtual Ledger: aggregated unified balances per user per asset (off-chain). |
| **withdrawal_requests** | Track pending withdrawals and whether they require Direct Exit or Sponsored Exit (Hybrid). |

## Key Requirements

- **State Persistence**: Latest signed Nitrolite state must be persisted to PostgreSQL to reduce user friction and support safe recovery flows.
- **Redundancy**: Critical data (session keys, latest state) should have redundant storage to prevent fund lock-ups.
- **Atomic Updates**: Ledger updates must be atomic to prevent double-spending or inconsistent state.
