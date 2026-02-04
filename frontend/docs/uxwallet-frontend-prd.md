# UXWallet Protocol Frontend — Product Requirements Document

**Version:** 1.0
**Last Updated:** 2026-02-03
**Status:** Draft
**Owner:** Frontend Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Success Metrics](#3-success-metrics)
4. [User Personas](#4-user-personas)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Functional Requirements](#6-functional-requirements)
7. [Out of Scope](#7-out-of-scope)
8. [Technical Constraints](#8-technical-constraints)
9. [MVP Phasing](#9-mvp-phasing)
10. [Risk Assessment](#10-risk-assessment)
11. [Dependencies & Blockers](#11-dependencies--blockers)
12. [Appendix](#12-appendix)

---

## 1. Executive Summary

UXWallet is the state-of-the-art UX-focused web3 wallet, unify your fragmented liquidity and start generating yield automatically keeping assets available for the day-to-day transactions anytime.

The frontend serves as a **Non-custodial Aggregated Liquidity Orchestrator** UI: it keeps the security boundary behind a single delegation signature, hides the complexity of bridging/gas/chain-switching, and presents the user with a unified yield-bearing balance. The goal is to make common transactions simple and atomic from the user’s perspective (one-step).

### Target Users

Web3 medium and advanced users.

## Solution.
A bear-yielding non-custodial wallet that abstracts the complexity of the most common cross-chain transactions to give a true Web3 experience to the users while generate yield using a novel Non-custodial Liquidity Layer as yield engine.

## Core Innovation.
Convert the most common used tool in Web3, the wallet, to a friction-less and non-custodial entry-point to a novel Non-custodial Aggregated Liquidity Protocol that generates yield for the user without compromising assets custody.

## The Aggregated Liquidity Protocol.
A Just-In-Time Solver Bot running at off-chain speed using Yellow Technology for the LI.FI's marketplace plus the Community Liquidity Pool (user's liquidity deposited across multiple chains in the Yellow Margin Accounts) working together to generate the needed yield to keep all the protocol working as an efficient "economic flywheel".

## Wallet.
Non-custodial, one-step liquidity unification,  automated bear-yielding, one-step gasless Yellow L3 transactions, one-step cross-chain transactions with the best fee rates on the market.

## How it works.

1. **Inbound Gateway (LI.FI / ERC-7683):** Users "Unify" fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits.
2. **Settlement Engine (Yellow / ERC-7824):** Asset movement is virtualized through Nitrolite State Channels, co-signed by a Persistent Session Key.
3. **Hybrid Exit Strategy:** Withdrawals from chains with empty local vaults are sponsored by the protocol treasury via LI.FI, guaranteeing a "Fast Exit."

### MVP Chains

Yellow L3 + Ethereum + Base.

---

## 2. Problem Statement

Web3 wallets today impose unacceptable friction on users. UXWallet addresses six core pain points:

| # | Pain Point | Impact | UXWallet Solution |
|---|-----------|--------|-------------------|
| 1 | **Fragmented balances** | Users see different balances on every chain, losing track of total holdings | Single Unified Balance aggregated across all supported chains |
| 2 | **Gas complexity** | Users must hold native tokens on each chain and understand gas mechanics | Gasless transactions within Yellow L3, sponsored by staked $YELLOW |
| 3 | **Bridge anxiety** | Bridging is slow, expensive, and risky; users fear losing funds | LI.FI-powered Unification Intent abstracts bridging into a single step |
| 4 | **Signature fatigue** | Every action requires a wallet pop-up, disrupting flow | One-time EIP-712 delegation enables autonomous operations via Session Key |
| 5 | **No passive yield** | Idle assets in wallets earn nothing | Solver activities generate yield distributed pro-rata (configurable percentage to users) |
| 6 | **Chain-switching friction** | Manually switching networks, adding RPCs, and confirming chain changes | Chain-agnostic UI; the protocol handles all cross-chain routing |

---

## 3. Success Metrics

The following metrics define “success” for the frontend MVP. Targets should be finalized once instrumentation and baselines exist.

### Activation & Flow Completion

- **Delegation completion time** (p50 / p90): p50 ≤ 30s, p90 ≤ 90s
- **Time to unified balance visible** after connect (p50 / p90): p50 ≤ 2s, p90 ≤ 5s

### UX Friction Reduction
- **Median number of wallet pop-ups per active session** (MVP): ≤ 2
  - One-time delegation + explicit user-initiated actions only (e.g., send / withdraw confirmation)
---


## 4. User Personas

### Primary Persona: "Alex" — The medium experience user

| Attribute | Detail |
|-----------|--------|
| **Age** | 25–35 |
| **Crypto Experience** | 6–12 months; holds assets on 1–2 chains |
| **Frustrations** | Confused by gas tokens, scared of bridges, overwhelmed by chain switching |
| **Goals** | "I just want my crypto to grow without me babysitting it" |
| **Wallet Usage** | MetaMask or Coinbase Wallet; checks balances weekly |
| **Technical Comfort** | Can sign a transaction but doesn't understand what EIP-712 means |
| **Key Behavior** | Will abandon any flow that requires more than 2 wallet pop-ups |

**Alex's ideal experience:**
1. Connect wallet
2. Sign once
3. See a single balance going up over time
4. Send money to friends without thinking about gas or chains

### Secondary Persona: "Morgan" — The DeFi Power User

| Attribute | Detail |
|-----------|--------|
| **Age** | 28–40 |
| **Crypto Experience** | 3+ years; actively yield farms across 4+ chains |
| **Frustrations** | Managing liquidity across chains is time-consuming; bridge fees eat into profits |
| **Goals** | "I want a single dashboard showing all my yield, with one-click rebalancing" |
| **Wallet Usage** | Multiple wallets, hardware signer for large holdings |
| **Technical Comfort** | Understands state channels, reads contract code |
| **Key Behavior** | Will use Force Withdrawal if anything looks wrong; monitors on-chain state |

**Morgan's ideal experience:**
1. Deposit large sums across chains via Unification
2. Monitor real-time yield in a dashboard
3. Trust the delegation but verify via on-chain checkpoints
4. Withdraw to any chain instantly, even if the local vault is empty

---

## 5. User Stories & Acceptance Criteria

### US-01: One-Time Delegation

> As a user, I want to sign once (delegate) and have my funds earn yield without further pop-ups.

**Acceptance Criteria:**

- [ ] After wallet connection, the Delegation Modal presents a clear explanation of what the user is authorizing
- [ ] The user signs a single EIP-712 typed data message to create a Persistent Session Key
- [ ] After delegation, no further wallet pop-ups are required for internal operations (rebalancing, solver fulfillment)
- [ ] The Session Key is scoped: it can only authorize state updates within the protocol's vault network, not transfers to external addresses
- [ ] A "Revoke Delegation" option is always accessible from Settings
- [ ] If delegation fails (user rejects, network error), a clear error toast is shown with retry option

### US-02: Unified Balance View

> As a user, I want to see one ETH balance regardless of which chain my funds are actually on.

**Acceptance Criteria:**

- [ ] The dashboard displays a single aggregated balance per asset (e.g., "10.5 ETH" not "5 ETH on Base + 5.5 ETH on Ethereum")
- [ ] Balance updates in real-time via ClearNode WebSocket `bu` notifications
- [ ] An optional "breakdown" toggle shows per-chain distribution for advanced users
- [ ] Balance includes both available and locked amounts (locked in app sessions)
- [ ] USD equivalent is displayed alongside token amounts

### US-03: Unification ("Dust Sweep")

> As a user, I want to unify my "dust" from Base and Ethereum into the vault in one click.

**Acceptance Criteria:**

- [ ] A "Unify" button is prominently displayed when the user has detected fragmented balances
- [ ] The Unification flow shows: source chains, assets, estimated amounts after fees, and estimated time
- [ ] A single confirmation triggers an ERC-7683 intent via LI.FI SDK
- [ ] Progress tracking shows real-time status of the intent fulfillment (pending → routing → confirming → complete)
- [ ] If unification fails mid-way, assets remain safe on the source chain and an error state is shown
- [ ] Execution Guard status is visible, confirming atomic arrival of funds

### US-04: Fast Exit Guarantee

> As a user, I want a "Fast Exit Guarantee" even if the vault on my target chain is dry.

**Acceptance Criteria:**

- [ ] The withdrawal flow allows the user to select any supported target chain
- [ ] If the local vault is empty, a Hybrid Withdrawal is triggered automatically
- [ ] If the local vault has sufficient liquidity, withdrawal is processed directly (instant via state channel close)
- [ ] The user sees a clear indicator: "Direct Exit" vs. "Sponsored Exit (Hybrid)"
- [ ] Hybrid Exit shows the estimated additional time and confirms no extra fee to the user
- [ ] The protocol treasury sponsors the LI.FI bridge fee transparently

### US-05: Gasless P2P Yellow L3 Transfers

> As a user, I want to send funds to a friend within the Yellow L3 instantly without worrying about gas fees.

**Acceptance Criteria:**

- [ ] A "Send" action accepts a recipient address (or ENS in future) and amount
- [ ] Transfer executes off-chain via ClearNode `send_transfer` — zero gas cost
- [ ] Transfer confirmation appears within milliseconds
- [ ] Recipient sees their balance update in real-time (`bu` notification)
- [ ] Clear feedback: "Transfer complete — 0 gas fees"
- [ ] Error handling for insufficient balance, invalid address, or ClearNode unavailability

### US-06: Cross-chain Transfers (from Unified Balance)

> As a user, I want to send funds from my unified balance to an external address on a supported chain without manually bridging, managing gas, or switching networks.

**Acceptance Criteria:**

- [ ] The "Send" flow allows selecting a target chain (Ethereum/Base/Yellow L3 for MVP)
- [ ] The user can enter a recipient address and amount
- [ ] The UI shows an estimate before confirming: fees, ETA, and route type (direct vs routed/hybrid)
- [ ] The user does not need to manually switch networks in their wallet to complete the flow
- [ ] Clear progress states are shown (pending → routing → confirming → complete)
- [ ] Failure states are actionable and safe (funds remain in user control); the UI shows what happened and next steps

### US-07: Wallet Home (Unified Balance + Yield)

> As a user, I want to see the assets in my virtual unified balance with the generated yield information.

**Acceptance Criteria:**

- [ ] A minimal wallet home screen showing: current balance by token, available earned yield by token.
- [ ] A "Yield Badge" is visible on the main balance when yield is actively being generated

### US-08: Onboarding Flow

> As a new user, I want a guided onboarding that explains UXWallet and gets me set up quickly.

**Acceptance Criteria:**

- [ ] First-time visitors see a guided onboarding: (1) Connect Wallet, (2) Delegate Session Key, (3) Select Tokens, (4) Unify
- [ ] The onboarding can be skipped and resumed later
- [ ] Progress is persisted in LocalStorage so the user doesn't restart on refresh
- [ ] After completing onboarding, the user lands on the Dashboard with their Unified Balance

### US-09: Add Liquidity (Deposit / Unify Entry)

> As a user, I want to add liquidity into UXWallet (deposit/unify) with a clear preview of amounts, fees, and outcomes.

**Acceptance Criteria:**

- [ ] The user can select tokens and source chains for Unification
- [ ] The UI shows a preview: estimated received amount after fees, estimated time, and the route/intent details
- [ ] A single confirmation triggers the Unification intent (ERC-7683 via LI.FI SDK)
- [ ] The user can monitor status until completion, with retry/help options on failure
- [ ] On completion, unified balances update automatically (via `bu` notifications)

---

## 6. Functional Requirements

This section translates the product intent and user stories into concrete frontend requirements for the MVP.

### 6.1 Navigation & Core Screens

Wallet address + ENS always on the top in all screens.

- **Onboarding/Sign in**
  - Show UXWallet logo and connect button.
  - **Unify form (Deposit)**
  - List of detected fragmented balances across supported chains.
  - Show sources, fees, ETA, and progress tracking
- **Wallet Home**
  - By Token: Unified balance + Yield balance. 
  - E.g. Deposited 1000 ETH then the balance after sometime in the wallet must be showed -> 1001.56 ETH (↑ 1.56 ETH)
- **Send**
  - Yellow L3 gasless P2P transfer
  - Cross-chain send from unified balance with routed/hybrid progress UI
- **Withdraw**
  - Select token and amount 
- **Settings**
  - Revoke delegation/session

### 6.2 Wallet Connection & Delegation

- Delegation must be an explicit, well-explained EIP-712 typed data signature.
- Delegation status must be visible and auditable in the UI (what was authorized, when, and how to revoke).

### 6.3 Real-time Updates

- The UI must subscribe to ClearNode WebSocket updates and reflect balance changes promptly.

### 6.4 Transaction / Intent Progress UX

- Any operation that can take time (unify, cross-chain send, hybrid exit) must present:
  - current step
  - ETA estimate (best-effort)
  - safe failure messaging (funds safety + retry paths)

### 6.5 Error Handling & Safety UX

- Errors must be actionable: show what failed, whether funds moved, and what the user can do next.
- Common cases: user rejected signature, insufficient balance, invalid address, provider unavailable, ClearNode unreachable, intent failure.

---

## 8. Technical Constraints

- **Frontend stack**: React + Next.js (per project standards).
- **Non-custodial**: the frontend must not custody or escrow user funds.
- **Delegation model**: one-time EIP-712 typed data delegation creating a Persistent Session Key; provide revoke controls.
- **Solver scope:** The delegated permisions granted byt the Persistent Session Key is to use the liquidity to fill LI.FI markeplace orders only taking care that the liquidity do not go to other wallets just change their chain localization by the intent order fulfillment but the ownership is guaranteed to the original user.
- **MVP chains**: Yellow L3 + Ethereum + Base.
- **Cross-chain / bridging**: intent-based flow via LI.FI SDK (ERC-7683).
- **Settlement**: Yellow / ERC-7824 via Nitrolite state channels; UI must reflect state-channel-driven states.
- **Realtime**: ClearNode WebSocket events (e.g., `bu`) must drive balance updates and progress where applicable.

---

## 9. MVP Phasing

This phased plan is derived directly from the user stories and MVP constraints in this PRD.

### Phase 0 — Foundation (connect + delegation)

- Wallet connect entry point (Onboarding/Sign in).
- One-time delegation flow (US-01):
  - EIP-712 typed-data signature with clear explanation.
  - Persist delegation/session status in UI.
  - Settings entry to revoke delegation.
- Baseline error handling for connect/sign/reject flows.

### Phase 1 — Core wallet experience (unified view + real-time)

- Wallet Home (US-07):
  - Unified balance + Earned yield by token 
  - Yield badge when yield is actively being generated.
- Unified Balance View (US-02):
  - Aggregated per-asset balance, USD equivalent.
  - Optional per-chain breakdown toggle.
  - Real-time updates driven by ClearNode WebSocket `bu`.

### Phase 2 — Liquidity unification and progress UX

- Unification (“Dust Sweep”) (US-03) and Add Liquidity (US-09):
  - Detected fragmented balances across supported chains.
  - Single confirmation triggers ERC-7683 intent via LI.FI SDK.
  - End-to-end progress tracking (pending → routing → confirming → complete).
  - Safe failure states with actionable messaging.

### Phase 3 — Send / Withdraw with fast-exit behavior

- Gasless Yellow L3 P2P Transfers (US-05).
- Cross-chain Transfers (US-06) from unified balance with routed/hybrid progress UX.
- Withdraw + Fast Exit Guarantee (US-04):
  - “Direct Exit” vs “Sponsored Exit (Hybrid)” indicator.
  - Best-effort ETA and clear user messaging.

---

## 10. Risk Assessment

Risks are based on the architecture and flows described in this PRD, especially delegation, intents, and real-time settlement UX.

### Product / UX risks

- **Progress uncertainty**: Intent-based routing and hybrid exits can feel “stuck” without strong progress UX.
  - Mitigation (frontend): explicit stepper states, best-effort ETA, “funds safety” messaging, and retry/help guidance.

### Technical / integration risks

- **ClearNode availability / WebSocket reliability**: If `bu` notifications are delayed or disconnected, balances and progress may appear incorrect.
  - Mitigation (frontend): reconnect logic, clear offline/limited mode indicator, and last-updated timestamps where applicable.
- **LI.FI routing variability**: Fees/ETA/route type can change; failed routes must be handled safely and understandably.
  - Mitigation (frontend): show estimates as estimates, provide safe failure states, and preserve user control messaging.
- **State-channel driven states are hard to model**: Users may see off-chain confirmed states that differ from on-chain expectations.
  - Mitigation (frontend): label “off-chain / state channel” confirmations vs on-chain finality where applicable; keep terminology consistent.

### Security / trust risks (frontend boundary)

- **Session key scope perception**: Even if scoped, users may assume the session key can move funds externally.
  - Mitigation (frontend): explicitly state scope constraints as written in US-01 acceptance criteria; keep revocation always accessible.

---

## 11. Dependencies & Blockers

This list is constrained to dependencies explicitly referenced by the flows in this PRD.

### Protocol / backend dependencies

- **ClearNode WebSocket**: documented event formats (including `bu`) and reliability guarantees; dev/staging endpoints.
- **Yellow / ERC-7824 settlement**: state-channel lifecycle states that the UI must represent (open/update/close, etc.).
- **Delegation / Persistent Session Key**: typed-data schema, verification, and revocation mechanism exposed to the frontend.
- **Vault liquidity signals**: ability to determine “Direct Exit” vs “Sponsored Exit (Hybrid)” conditions for withdrawals.

### Third-party dependencies

- **LI.FI SDK** (ERC-7683 intents): API access, supported routes for MVP chains, and status tracking hooks for intent progress.

### Product / design dependencies

- Copy for Delegation Modal and safety messaging (must explain authorization, scope, and revocation).
- Final UX for progress tracking (step names, failure states, retry affordances).

---

## 12. Appendix

### 12.1 Glossary (as used in this PRD)

- **Unified Balance**: A single aggregated per-asset balance shown to the user regardless of where funds reside across supported chains.
- **Delegation (EIP-712)**: One-time typed-data signature that creates a **Persistent Session Key** enabling autonomous protocol operations without repeated wallet pop-ups.
- **Persistent Session Key**: Session-scoped key used to co-sign state updates within the vault network; should not authorize transfers to external addresses (per US-01).
- **Unification Intent (ERC-7683)**: Intent-based action (via LI.FI) that unifies fragmented balances into UXWallet vaults.
- **ClearNode**: Real-time transport layer providing WebSocket updates (e.g., `bu`) used to drive balance and progress updates in the UI.
- **Hybrid Exit / Sponsored Exit**: Withdrawal mode where the protocol treasury sponsors LI.FI bridge fees when the local vault is not enough to fulfill the requested amount in the selected token, providing a “Fast Exit Guarantee”.
- **Nitrolite State Channels (ERC-7824)**: Settlement mechanism used to virtualize asset movement with off-chain speed and UI-visible state-driven transitions.

### 12.2 Referenced protocols / standards

- **ERC-7683**: Intent-based cross-chain actions (used via LI.FI).
- **ERC-7824**: State-channel / settlement related flow (Yellow / Nitrolite).
