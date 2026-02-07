# Project Context (Frontend)

Adapted from: `../../.context/project-context.md`

---

## Vision

Flywheel is a Web3 wallet that **unifies cross-chain liquidity** and **generates yield** from intent fulfillment while staying **non-custodial**. Users sign once (Session Key) to delegate; the Solver fulfills intents automatically.

**Tagline:** "Set Up. Forget. Grow."

---

## What the Frontend Is Responsible For

The Flywheel Wallet mobile app handles:

1. **Wallet connection** via WalletConnect (Reown AppKit).
2. **Delegation** — one-time EIP-712 signature to grant the Solver a Session Key.
3. **Unified balance view** — aggregated per-asset balance with optional per-chain breakdown.
4. **Send** — gasless L3 P2P transfers + cross-chain sends from unified balance.
5. **Unification** — consolidate fragmented balances into the vault.
6. **Withdrawal** — with Fast Exit Guarantee (Direct vs Sponsored/Hybrid).
7. **Real-time updates** — subscribe to ClearNode WebSocket `bu` events.
8. **Revocation** — revoke delegation from Settings.

---

## Core Concepts (Frontend Must Communicate)

### Delegation & Session Key

- User signs **once** (EIP-712) to grant the Flywheel Solver permission.
- Session Key is app-scoped with allowances and expiry.
- The Solver can fulfill intents without repeated wallet pop-ups.
- **The frontend must clearly explain:** what is being authorized, scope limits, how to revoke.

### Execution Guard

Funds are released only when:
1. Corresponding asset is confirmed (intent fulfillment / atomic behavior), or
2. Owner explicitly signs on-chain withdrawal.

**Frontend must show:** Progress steps that communicate this atomicity to the user.

### Force Withdrawal (Safety Net)

If backend/ClearNode is unavailable, user can present last signed state to the on-chain Adjudicator to claim funds.

**Frontend must:** Show connection status. If offline for extended period, provide guidance on Force Withdrawal.

### Rewards Model

- Intent fulfillment generates rewards.
- **50% to Users** (shown as yield in the wallet).
- **50% to Flywheel Treasury** (not shown to user, used as pool liquidity).
- User funds are **always protected** — never used for owner withdrawals.

**Frontend must show:** Yield badge, earned yield per asset, yield integrated into balance display.

---

## MVP Scope (Phase 1)

- **Chains:** Sepolia (11155111) + Base Sepolia (84532).
- **Yellow/Nitrolite:** Fully implemented (state channels, Custody, ClearNode).
- **LiFi:** All components mocked. Unification and cross-chain flows work with stub responses.
- **Focus:** Delegation, unified balance, real-time updates, withdrawal.

---

## Sub-Project Communication (Frontend Perspective)

| Frontend Talks To | Protocol | Purpose |
|-------------------|----------|---------|
| Backend/ClearNode | REST (HTTPS) | Delegation CRUD, balance queries, withdrawal requests, state queries |
| Backend/ClearNode | WebSocket (WSS) | Real-time `bu` (balance update) events, connection heartbeat |
| Wallet App | WalletConnect (Reown) | EIP-712 signature requests (delegation only) |
| lif-rust | REST (via backend or direct) | Quote estimation for Unification/Cross-chain (mocked Phase 1) |

---

## Integration Standards

1. **ABI sync:** After contract deployment, ABIs are exported. Frontend uses Viem for any ABI needs.
2. **State persistence:** Backend persists latest signed Nitrolite state for recovery. Frontend stores only Session Key metadata in SecureStore.
3. **Environment:** All config via `EXPO_PUBLIC_*` env vars. Never embed secrets in client bundle.
