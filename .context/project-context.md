# Flywheel: General Project Context

**A non-custodial wallet and aggregated liquidity protocol.** Users delegate assets via the **Flywheel Wallet**; the **Flywheel Solver** fulfills intents using the **Aggregated Liquidity Pool** (user-delegated assets + Flywheel Treasury). Rewards from intent fulfillment are split **50% to Users** and **50% to the Flywheel Treasury**. User funds are always protected.

**Canonical flows:** [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md)

---

## 1. Vision & Product Perspective

Flywheel is a Web3 wallet that **unifies cross-chain liquidity** and **generates yield** from intent fulfillment while staying **non-custodial**. Users sign once (Session Key) to delegate; the Solver fulfills intents automatically. When the **pool has liquidity** on the target chain, the liquidity layer fulfills (best fee); when it does not, the system creates **intent orders in the LiFi marketplace** (funded from pool on source chains or Treasury-sponsored).

### Target Users

- Web3 medium and advanced users

### Value Proposition

- **For users:** One-time delegation, unified balance, send (same-chain / cross-chain), withdraw, 50% of intent-fulfillment rewards; user funds always protected.
- **For the protocol:** Flywheel Solver uses the Aggregated Liquidity Pool (LP + Treasury) to fulfill intents; 50% of rewards go to the Flywheel Treasury (used as liquidity; owners may withdraw Treasury only).

### Core Technologies

- **Yellow / Nitrolite (ERC-7824):** State channels, Custody Contract, Adjudicator.
- **Session Key (Yellow):** App-scoped delegation (EIP-712) so the Solver can fulfill intents without repeated wallet prompts.
- **LiFi Marketplace:** Fallback when the liquidity layer cannot fulfill; intent orders funded from pool on source chains or Treasury-sponsored.

---

## 2. What the Frontend Is Responsible For

The frontend is the **Flywheel Wallet** UI:

- Delegate to pool and grant Solver permission (Session Key).
- Unified balance (per asset, optional per-chain breakdown).
- Send (same-chain / cross-chain) and Withdraw with clear progress and error states.
- Subscribe to **ClearNode** (e.g. WebSocket) for real-time balance/updates.
- Revocation of delegation in Settings.

---

## 3. Technical Architecture (aligned with sequence-diagrams.md)

- **Layer 1 – Delegation & pool:** User delegates assets; App + ClearNode set up Nitrolite session/channel; funds locked in Custody (Yellow Smart Account / Nitrolite). User grants Session Key so Flywheel Solver can fulfill intents.
- **Layer 2 – Settlement (Yellow/Nitrolite):** Off-chain state updates (Clearing Engine, state channel); on-chain payout via Adjudicator `conclude` / `transfer` (Custody). Rewards 50% User, 50% Treasury.
- **Layer 3 – When pool cannot fulfill:** System creates intent orders in the **LiFi marketplace**. Funds to complete the order come from **pool on source chains** (release to LiFi solver) or **Flywheel Treasury** (sponsored same-chain). User balance debited; third party receives on target chain.

---

## 4. Core Concepts & Security

### Delegation & Session Key (Yellow, EIP-712)

- User signs **once** (EIP-712) to grant the Flywheel Solver permission (Session Key: application, allowances, expires_at).
- Solver can then fulfill intents without repeated wallet pop-ups; scope and limits per Yellow Session Key docs.
- Delegation auditable and revocable in the app.

### Execution Guard

Funds are released only when:

1. Corresponding asset is confirmed (intent fulfillment / atomic behavior), or  
2. Owner explicitly signs on-chain withdrawal.

### Force Withdrawal

If backend/ClearNode is unavailable, user can present last signed state to the on-chain **Adjudicator** to claim funds.

### User Funds vs Treasury

- **User funds:** Never used for owner withdrawals; always protected.
- **Treasury:** Receives 50% of rewards; part of pool liquidity; **only** Treasury may be withdrawn by system owners.

---

## 5. Development Plan (2 Phases)

### Phase 1: Protocol on Testnets, LiFi Mocked

- **Yellow / Nitrolite** on **Sepolia** and **Arbitrum Sepolia** (state channels, Custody, Adjudicator, ClearNode).
- **LiFi components mocked:** Flows that would use LiFi (when pool cannot fulfill) use mocks; no real LiFi API.
- Focus: Delegation, deposit, pool fulfillment, 50/50 reward split, withdrawal; LiFi paths exercised with mocks.

### Phase 2: Protocol on Mainnet, LiFi Integrated

- **Yellow / Nitrolite** on **Ethereum mainnet** and **Arbitrum mainnet**.
- **LiFi implemented:** Real LiFi marketplace; intent orders created and funded from pool on source chains or Treasury-sponsored.
- Focus: Production behavior as in [`.context/sequence-diagrams.md`](.context/sequence-diagrams.md).

---

## 6. Sub-Project Integration

### Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Frontend** | **Backend/ClearNode** | WebSocket (e.g. `bu`) + RPC |
| **Frontend** | **lif-rust** | REST (LiFi quote/calldata; Phase 2 or mocked) |
| **Backend** | **lif-rust** | REST (intent build for LiFi orders) |
| **Backend** | **Contracts** | JSON-RPC (events, checkpoints, state) |
| **Contracts** | **Frontend/Backend** | ABIs, deployment artifacts |
| **lif-rust** | **LiFi API** | HTTPS (Phase 2) |

### Integration Standards

1. **Shared environment:** Root `.env.example` for chain IDs, RPC URLs, API keys (including lif-rust).
2. **ABI sync:** After deployment, export ABIs to frontend/backend (and lif-rust where needed).
3. **State persistence:** Backend persists latest signed Nitrolite state (e.g. PostgreSQL) for recovery.
4. **lif-rust:** Stateless LiFi integration; in Phase 1 LiFi is mocked at callers.
