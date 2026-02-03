# UXWallet Frontend — Product Requirements Document

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

UXWallet is a "Set and Forget" cross-chain wallet targeting crypto newcomers who want a real Web3 wallet without the complexity. The frontend serves as an **Aggregated Liquidity Orchestrator UI** that hides all bridging, gas management, and chain-switching behind a single delegation signature, presenting the user with a unified, yield-bearing balance.

**Core value proposition:** One-time delegation gives users a UX-centric, non-custodial, cross-chain, yield-bearing wallet with gasless transactions within the Yellow L3.

**How it works:**

1. **Inbound Gateway (LI.FI / ERC-7683):** Users "Unify" fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits.
2. **Settlement Engine (Yellow / ERC-7824):** Asset movement is virtualized through Nitrolite State Channels, co-signed by a Persistent Session Key.
3. **Hybrid Exit Strategy:** Withdrawals from chains with empty local vaults are sponsored by the protocol treasury via LI.FI, guaranteeing a "Fast Exit."

**MVP Chains:** Yellow L3 + Base.

---

## 2. Problem Statement

Web3 wallets today impose unacceptable friction on users, especially newcomers. UXWallet addresses six core pain points:

| # | Pain Point | Impact | UXWallet Solution |
|---|-----------|--------|-------------------|
| 1 | **Fragmented balances** | Users see different balances on every chain, losing track of total holdings | Single Unified Balance aggregated across all supported chains |
| 2 | **Gas complexity** | Users must hold native tokens on each chain and understand gas mechanics | Gasless transactions within Yellow L3, sponsored by staked $YELLOW |
| 3 | **Bridge anxiety** | Bridging is slow, expensive, and risky; users fear losing funds | LI.FI-powered Unification Intent abstracts bridging into a single step |
| 4 | **Signature fatigue** | Every action requires a wallet pop-up, disrupting flow | One-time EIP-712 delegation enables autonomous operations via Session Key |
| 5 | **No passive yield** | Idle assets in wallets earn nothing | Solver activities generate yield distributed pro-rata (50% to users) |
| 6 | **Chain-switching friction** | Manually switching networks, adding RPCs, and confirming chain changes | Chain-agnostic UI; the protocol handles all cross-chain routing |

---

## 3. Success Metrics

### Primary KPIs (TVL & Yield Focused)

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Total Value Locked (TVL)** | $500K within 6 months post-launch | Sum of all assets in UXVault contracts across supported chains |
| **Average Yield per User** | 3–5% APY | `(total_solver_profit * 0.5) / total_user_deposits` annualized |
| **Solver Profit Margin** | > 0.1% per fulfilled intent | `(spread_captured - rebalancing_cost) / intent_value` |

### Secondary KPIs

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Delegation Completion Rate** | > 80% of connected wallets | `delegations_completed / wallets_connected` |
| **Unification Success Rate** | > 95% | `successful_unifications / total_unification_attempts` |
| **Time to First Unified Balance** | < 3 minutes from wallet connect | Timestamp delta: `wallet_connected → unified_balance_visible` |
| **Monthly Active Users (MAU)** | 1,000 within 6 months | Unique wallets with at least one state channel interaction per month |
| **P2P Transfer Volume** | $100K/month within 6 months | Sum of all `send_transfer` amounts per month |
| **Hybrid Withdrawal Success Rate** | > 98% | `successful_hybrid_exits / total_hybrid_exit_attempts` |

---

## 4. User Personas

### Primary Persona: "Alex" — The Crypto Newcomer

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
- [ ] If the local vault has sufficient liquidity, withdrawal is processed directly (instant via state channel close)
- [ ] If the local vault is empty, a Hybrid Withdrawal is triggered automatically
- [ ] The user sees a clear indicator: "Direct Exit" vs. "Sponsored Exit (Hybrid)"
- [ ] Hybrid Exit shows the estimated additional time and confirms no extra fee to the user
- [ ] The protocol treasury sponsors the LI.FI bridge fee transparently

### US-05: Gasless P2P Transfers

> As a user, I want to send funds to a friend within the Yellow L3 instantly without worrying about gas fees.

**Acceptance Criteria:**

- [ ] A "Send" action accepts a recipient address (or ENS in future) and amount
- [ ] Transfer executes off-chain via ClearNode `send_transfer` — zero gas cost
- [ ] Transfer confirmation appears within milliseconds
- [ ] Recipient sees their balance update in real-time (`bu` notification)
- [ ] Clear feedback: "Transfer complete — 0 gas fees"
- [ ] Error handling for insufficient balance, invalid address, or ClearNode unavailability

### US-06: Yield Dashboard

> As a user, I want to see the yield value credited to my virtual balance.

**Acceptance Criteria:**

- [ ] A Yield Dashboard section shows: current APY, total yield earned (lifetime), and yield earned this period
- [ ] A "Yield Badge" is visible on the main balance when yield is actively being generated
- [ ] Yield history is displayed as a chart (daily/weekly/monthly view)
- [ ] Yield credits are reflected in the Unified Balance in real-time
- [ ] A tooltip explains how yield is generated: "Your deposits power the Community Solver, which captures spreads in the LI.FI marketplace. 50% of profits are distributed to depositors."

### US-07: Onboarding Flow

> As a new user, I want a guided onboarding that explains UXWallet and gets me set up quickly.

**Acceptance Criteria:**

- [ ] First-time visitors see a 3-step onboarding: (1) Connect Wallet, (2) Delegate, (3) Unify
- [ ] Each step has a brief, jargon-free explanation
- [ ] The onboarding can be skipped and resumed later
- [ ] Progress is persisted in LocalStorage so the user doesn't restart on refresh
- [ ] After completing onboarding, the user lands on the Dashboard with their Unified Balance

---

## 6. Functional Requirements

### FR-01: Wallet Connection & Onboarding

#### FR-01.1: Wallet Connection

- Support MetaMask, Coinbase Wallet, WalletConnect, and injected providers
- Use a standard wallet connection library (wagmi/RainbowKit or similar)
- After connection, detect the user's balances on Yellow L3 and Base
- Store wallet connection state for session persistence

#### FR-01.2: Onboarding Wizard

- **Step 1 — Connect:** Wallet selection and connection
- **Step 2 — Delegate:** EIP-712 Session Key signing (see FR-02)
- **Step 3 — Unify:** Optional first Unification (see FR-04)
- Visual progress indicator (step 1/3, 2/3, 3/3)
- Skip/resume capability with LocalStorage persistence

#### FR-01.3: Returning User Flow

- Auto-reconnect wallet on page load if previously connected
- Verify delegation is still active (session key not expired/revoked)
- If delegation expired, prompt re-delegation before dashboard access

**Edge Cases:**
- User switches wallet account mid-session → reset delegation state, prompt re-delegation
- User on unsupported network → show "Switch to Base" prompt
- Wallet extension not installed → deep-link to install page

**Error Handling:**
- Connection timeout → toast: "Connection timed out. Please try again."
- User rejects connection → toast: "Wallet connection cancelled."
- RPC error → toast: "Network error. Check your internet connection."

---

### FR-02: Delegation Flow (Session Key + EIP-712)

#### FR-02.1: Session Key Generation

- Generate a cryptographic session key pair in the browser
- The session key is scoped to Nitrolite state updates only (cannot call `transfer()` to arbitrary addresses)
- Key material is handled securely: never logged, never stored in plaintext

#### FR-02.2: EIP-712 Delegation Signature

- Present the user with a clear, human-readable delegation request in the wallet signing prompt
- EIP-712 typed data includes:
  - Session key public address
  - Permitted operations (state channel updates only)
  - Expiration timestamp
  - Protocol vault addresses (scope)
- Single wallet pop-up for the entire delegation

#### FR-02.3: Delegation Submission

- After user signs, submit the delegation to the Backend via Nitrolite RPC (`auth_request` → `auth_verify` flow)
- Backend stores the session key in KMS
- Frontend receives JWT session token for subsequent requests
- Frontend discards the session key private material after delegation (backend KMS manages it)

#### FR-02.4: Delegation Status

- Dashboard shows delegation status: Active / Expired / Revoked
- Expiration countdown visible in Settings
- "Renew Delegation" flow triggers a new EIP-712 signature before expiry

#### FR-02.5: Revocation

- "Revoke Delegation" button in Settings
- Revocation is immediate and on-chain (calls `SessionKeyRegistry` on the smart contract)
- After revocation, all autonomous operations stop; user must re-delegate to resume

**Edge Cases:**
- User closes browser during signing → delegation not completed; prompt on next visit
- Session key expires while user is active → show non-blocking notification with "Renew" button
- Backend KMS unreachable → show "Delegation pending" state, retry with exponential backoff

**Error Handling:**
- EIP-712 signing rejected → toast: "Delegation cancelled. You can delegate later from Settings."
- Invalid signature (tampering) → toast: "Signature verification failed. Please try again."
- Network congestion (on-chain revocation) → show pending state with tx hash link

---

### FR-03: Unified Balance Display

#### FR-03.1: Aggregated View

- Display total balance per asset as a single number (e.g., "12.45 ETH")
- Show USD equivalent using real-time price feeds
- Supported assets: ETH, USDC, USDT, DAI, WBTC (MVP)

#### FR-03.2: Real-Time Updates

- Connect to ClearNode via WebSocket (`wss://clearnet.yellow.com/ws`)
- Subscribe to `bu` (balance update) notifications
- Optimistic UI: show pending amounts during unification with a "Pending" badge
- Animate balance changes (count-up animation on increase)

#### FR-03.3: Balance Breakdown (Advanced)

- Toggle to expand per-chain breakdown: "5 ETH on Base, 7.45 ETH on Yellow L3"
- Show locked vs. available amounts
- Show yield accrual badge inline

#### FR-03.4: Empty State

- New users with no deposits see: "Connect and deposit to get started"
- Users with detected external balances see: "You have X ETH on Base — Unify it now"

**Edge Cases:**
- ClearNode WebSocket disconnects → show "Updating..." indicator, reconnect with backoff
- Price feed unavailable → show token amounts only, hide USD values
- Zero balance across all assets → show empty state with CTA to deposit

**Error Handling:**
- WebSocket connection failure → fallback to polling every 30 seconds
- Stale balance data (>60s without update) → show "Last updated X seconds ago" indicator

---

### FR-04: Unification Intent (LI.FI)

#### FR-04.1: Source Detection

- On wallet connection, scan Base for user's token balances
- Display detected assets with amounts and USD values
- Allow user to select which assets and how much to unify

#### FR-04.2: Quote & Preview

- Use `@lifi/sdk` to fetch a route quote for the selected assets
- Display: source chain, destination (Yellow L3 vault), estimated output, fees, estimated time
- Show slippage tolerance (configurable, default 0.5%)

#### FR-04.3: Intent Execution

- On user confirmation, create an ERC-7683 open intent via LI.FI
- Single on-chain approval + deposit transaction from the user
- Frontend tracks intent status via LI.FI status API

#### FR-04.4: Progress Tracking

- Multi-step progress indicator:
  1. "Submitting intent..." (tx sent)
  2. "Routing..." (solver picked up the intent)
  3. "Confirming on destination..." (funds arriving at UXVault)
  4. "Complete" (Unified Balance updated)
- Execution Guard: show confirmation that atomic arrival is verified

#### FR-04.5: Partial Unification

- Allow users to unify a portion of their balance (not necessarily all)
- Minimum amount threshold to avoid dust-on-dust scenarios

**Edge Cases:**
- Intent not picked up by solver within timeout (5 min) → show "Retrying..." then "Intent expired — funds safe on source chain"
- Partial fill → show partially unified amount, prompt to retry remainder
- Price movement during routing → if slippage exceeds tolerance, revert and notify user
- User has insufficient balance for gas on source chain → show "You need ~$0.50 in ETH on Base for the initial deposit"

**Error Handling:**
- LI.FI SDK unavailable → toast: "Routing service temporarily unavailable. Try again shortly."
- Transaction reverted on-chain → toast: "Transaction failed" with link to block explorer
- Intent fulfillment timeout → toast: "Unification is taking longer than expected. Your funds are safe."

---

### FR-05: Yield Dashboard

#### FR-05.1: Current Yield Display

- Show current APY estimate based on recent solver activity
- Display total yield earned: lifetime and current period (daily/weekly/monthly)
- Show yield per asset

#### FR-05.2: Yield Badge

- A persistent badge on the main balance card when yield is actively being generated
- Badge shows real-time increment (e.g., "+$0.003 today")

#### FR-05.3: Yield History Chart

- Interactive chart showing yield over time
- Configurable time range: 7d, 30d, 90d, All
- Hover tooltips with exact amounts and dates

#### FR-05.4: Yield Explanation

- Accessible tooltip or expandable section explaining the yield mechanism:
  - "Your deposits fuel the Community Solver"
  - "The Solver captures spreads in the LI.FI marketplace"
  - "50% of solver profit is distributed pro-rata to depositors"
  - "The remaining 50% funds the protocol treasury (rebalancing, gasless credits, operations)"

#### FR-05.5: Revenue Split Transparency

- Show the protocol's revenue split: 50% User Yield / 50% Treasury
- Treasury breakdown: 30% Rebalancing Reserve, 30% $YELLOW Staking (Gasless Credits), 20% Operations

**Edge Cases:**
- No yield generated yet (new user, no solver activity) → show "$0.00 earned — yield begins when the solver captures its first spread"
- Negative solver period (loss) → yield display shows $0 for that period (protocol absorbs losses from treasury)
- Very small yield amounts (<$0.01) → show actual amount, not rounded to $0.00

**Error Handling:**
- Yield data fetch failure → show last cached values with "Data may be outdated" indicator
- Chart rendering failure → fallback to tabular data

---

### FR-06: P2P Transfers (Gasless)

#### FR-06.1: Send Flow

- "Send" button accessible from the dashboard
- Input fields: recipient address, asset, amount
- Real-time validation: address format, sufficient balance

#### FR-06.2: Transfer Execution

- Execute via ClearNode `send_transfer` RPC call
- Off-chain transfer — zero gas, instant
- Session key authorizes the transfer (no wallet pop-up)

#### FR-06.3: Transfer Confirmation

- Success state: "Sent 5 USDC to 0xAbc...def — 0 gas fees"
- Update sender's Unified Balance immediately
- Show transfer in transaction history

#### FR-06.4: Transaction History

- List of all transfers (sent and received) with:
  - Direction (sent/received)
  - Amount and asset
  - Counterparty address (truncated)
  - Timestamp
  - Status (completed/pending)
- Data sourced from ClearNode `get_ledger_transactions`

**Edge Cases:**
- Recipient not on Yellow Network → show "Recipient must have a UXWallet account. Share your invite link."
- Transfer to self → prevent with validation: "Cannot send to your own address"
- Concurrent transfers exceeding balance → second transfer fails gracefully: "Insufficient balance"

**Error Handling:**
- ClearNode offline → toast: "Transfer service temporarily unavailable"
- Transfer rejected by ClearNode → toast with reason: "Transfer failed: [reason]"

---

### FR-07: Hybrid Withdrawal

#### FR-07.1: Withdrawal Initiation

- "Withdraw" button accessible from the dashboard
- User selects: asset, amount, and target chain (Yellow L3 or Base for MVP)

#### FR-07.2: Withdrawal Routing

- Check local vault liquidity on the target chain
- **Direct Exit:** Vault has sufficient funds → process via state channel close
- **Hybrid Exit:** Vault is empty or insufficient → trigger LI.FI-sponsored bridge from another chain

#### FR-07.3: Direct Exit Flow

- Present the latest signed state to the on-chain Adjudicator
- Funds released from UXVault to user's wallet
- Confirmation with tx hash and block explorer link

#### FR-07.4: Hybrid Exit Flow

- Show user: "Local vault on [chain] has insufficient liquidity. We're routing your withdrawal through [other chain]. No extra fees — the protocol covers bridging costs."
- Progress tracking similar to Unification (FR-04.4)
- Treasury sponsors the LI.FI intent fee

#### FR-07.5: Force Withdrawal (Safety Net)

- Accessible from Settings > Advanced
- Allows user to bypass the backend entirely
- User presents their last signed state update directly to the on-chain Adjudicator contract
- Triggers a challenge period (default 24 hours)
- Prominent warning: "Force Withdrawal triggers a challenge period. Use only if the backend is unresponsive."

**Edge Cases:**
- Withdrawal amount exceeds total Unified Balance → validation error
- Backend goes offline during withdrawal → show Force Withdrawal option
- Challenge period in progress → show countdown timer with status
- Concurrent withdrawal requests → queue and process sequentially

**Error Handling:**
- On-chain transaction failure → toast: "Withdrawal transaction failed" with retry option
- Hybrid Exit solver timeout → fall back to Force Withdrawal suggestion
- Insufficient treasury funds for sponsorship → notify user of potential delay

---

### FR-08: Settings & Preferences

#### FR-08.1: Delegation Management

- View current delegation status (active/expired/revoked)
- Renew delegation (new EIP-712 signature)
- Revoke delegation (on-chain transaction)
- View session key permissions and scope

#### FR-08.2: Preferences

- Theme: light/dark mode (persisted in LocalStorage)
- Default withdrawal chain preference
- Slippage tolerance for Unification (default 0.5%)
- Notification preferences (balance updates, yield alerts)

#### FR-08.3: Security

- Connected wallet address display (with copy and block explorer link)
- Active sessions list (state channels and app sessions)
- Force Withdrawal access (FR-07.5)
- "Disconnect Wallet" to clear all local state

#### FR-08.4: About & Support

- Protocol version information
- Links to documentation and support channels
- Contract addresses for verification

---

## 7. Out of Scope

The following are explicitly excluded from the MVP and near-term roadmap:

| Item | Rationale |
|------|-----------|
| **Multi-chain beyond Base** | MVP focuses on Yellow L3 + Base; Arbitrum, Ethereum, and others deferred to Phase 2 |
| **ENS / Name resolution** | Not critical for MVP; recipient addresses are sufficient |
| **Mobile native app** | Web-first approach; mobile-responsive PWA is in scope, native app is not |
| **Fiat on-ramp** | Requires regulatory compliance; users must already hold crypto |
| **NFT support** | UXWallet focuses on fungible token liquidity |
| **Governance UI** | $YELLOW governance is a separate product; no voting interface in UXWallet |
| **Advanced trading interface** | UXWallet is not a DEX; no order books, limit orders, or charting |
| **Multi-wallet support** | One connected wallet per session; multi-wallet management deferred |
| **Push notifications** | Browser notifications deferred; in-app notifications only for MVP |
| **Referral / invite system** | Growth features deferred to post-MVP |

---

## 8. Technical Constraints

### Performance

| Metric | Target | Enforcement |
|--------|--------|-------------|
| **Largest Contentful Paint (LCP)** | < 2.5 seconds | Lighthouse CI in pipeline |
| **First Input Delay (FID)** | < 100ms | React profiler monitoring |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Visual regression testing |
| **JS Bundle Size (initial)** | < 300KB gzipped | Webpack bundle analyzer; lazy-load LI.FI SDK and heavy dependencies |
| **WebSocket Reconnect Time** | < 3 seconds | Exponential backoff with jitter |
| **Balance Update Latency** | < 500ms from ClearNode event | Direct WebSocket subscription |

### Security

| Constraint | Implementation |
|-----------|---------------|
| **No plaintext key storage** | Session keys are never stored in plaintext; delegated to backend KMS after signing |
| **EIP-712 for all signatures** | All Nitrolite state updates use EIP-712 typed data signing |
| **Scoped session keys** | Session keys can only authorize vault-internal state updates; cannot call external `transfer()` |
| **CSRF protection** | All backend API calls include CSRF tokens |
| **Input sanitization** | All external data sanitized; address inputs validated against checksum format |
| **No private key exposure** | Frontend never handles or stores wallet private keys; all signing through wallet provider |
| **Content Security Policy** | Strict CSP headers; no inline scripts |

### Integration

| System | Protocol | Constraint |
|--------|----------|-----------|
| **ClearNode** | WebSocket (`wss://clearnet.yellow.com/ws`) | Must handle reconnection, JWT refresh, and message queuing during disconnects |
| **LI.FI SDK** | `@lifi/sdk` | Lazy-loaded to minimize initial bundle; used for Unification (FR-04) and Hybrid Exit (FR-07) routing |
| **Yellow SDK** | `@erc7824/nitrolite` | NitroliteRPC for auth, channel management, transfers, and balance queries |
| **On-chain contracts** | Viem / Ethers.js | ABI-synced from `contracts/` after deployment; used for deposits, withdrawals, and Force Withdrawal |
| **Backend RPC** | Nitrolite RPC over WebSocket | Session handshake, state queries, delegation submission |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14+ (App Router), TypeScript (strict, no `any`) |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Icons** | Lucide React |
| **State Management** | React hooks + context; Nitrolite session in memory |
| **Client Storage** | LocalStorage for preferences, theme, cached session metadata |
| **Form Validation** | Zod + React Hook Form |
| **Testing** | Vitest (unit), React Testing Library (component), Playwright (E2E), Storybook (visual) |
| **Deployment** | Vercel |

---

## 9. MVP Phasing

### Phase 1: MVP (Sprints 1–5)

Core "Set and Forget" experience on Yellow L3 + Base.

#### Sprint 1: Foundation

- Project scaffolding (Next.js 14, Tailwind, Shadcn UI)
- Wallet connection (MetaMask, Coinbase Wallet, WalletConnect)
- Basic layout: Dashboard shell, navigation, Settings page
- LocalStorage persistence for preferences

#### Sprint 2: Delegation & Authentication

- EIP-712 Session Key generation and signing flow
- ClearNode authentication (`auth_request` → `auth_verify`)
- Delegation Modal with human-readable explanation
- JWT session management
- Delegation status display

#### Sprint 3: Unified Balance & WebSocket

- ClearNode WebSocket connection with reconnection logic
- `bu` / `cu` notification handling
- Unified Balance display (aggregated per asset)
- USD price conversion
- Balance breakdown toggle
- Empty state and CTA for new users

#### Sprint 4: Unification & Transfers

- LI.FI SDK integration (lazy-loaded)
- Unification flow: source detection, quote, execution, progress tracking
- Execution Guard status display
- P2P transfer flow: send, confirm, history
- Transaction history view (`get_ledger_transactions`)

#### Sprint 5: Withdrawals & Yield

- Withdrawal flow: direct exit and hybrid exit
- Force Withdrawal (advanced settings)
- Yield Dashboard: current APY, total earned, history chart
- Yield Badge on balance card
- Revenue split transparency
- Onboarding wizard (3-step flow)
- Settings: delegation management, preferences, security

### Phase 2: Expansion (Post-MVP)

- Additional chains: Arbitrum, Ethereum mainnet, Linea
- Enhanced yield analytics and projections
- Advanced transaction filtering and export
- Performance optimizations based on real usage data
- Accessibility audit and improvements (WCAG 2.1 AA)

### Phase 3: Platform Maturity

- Mobile-responsive PWA optimization
- Push notification support
- ENS and name resolution
- Multi-language support (i18n)
- Plugin/extension architecture for third-party integrations

---

## 10. Risk Assessment

| # | Risk | Severity | Likelihood | Impact | Mitigation |
|---|------|----------|------------|--------|-----------|
| 1 | **ClearNode downtime** | High | Medium | Users cannot transact; balances appear frozen | Implement robust reconnection logic; show degraded state with Force Withdrawal option; backend implements redundant ClearNode deployment |
| 2 | **LI.FI SDK breaking changes** | Medium | Medium | Unification and Hybrid Exit flows break | Pin SDK version; comprehensive E2E tests for Unification flow; monitor LI.FI changelog |
| 3 | **Session key compromise** | Critical | Low | Attacker could authorize state updates using the stolen key | Keys scoped to vault-internal operations only (cannot withdraw to external addresses); immediate revocation via on-chain `SessionKeyRegistry`; session expiry limits exposure window |
| 4 | **Smart contract vulnerability** | Critical | Low | Funds at risk in UXVault | Formal audits (Hacken/Zokyo); invariant testing (total assets >= total claims); emergency pause functionality; bug bounty program |
| 5 | **Bridge/solver failure during Unification** | Medium | Medium | User funds stuck in limbo between chains | LI.FI intent architecture ensures atomicity — funds return to source on failure; clear error states in UI; timeout-based automatic cancellation |
| 6 | **WebSocket message loss** | Medium | Medium | Missed balance updates, stale UI | Message sequence tracking; periodic balance refresh via polling fallback; reconnection with state resync |
| 7 | **Treasury depletion (Hybrid Exit sponsorship)** | High | Low | Cannot sponsor Hybrid Exits; users stuck on wrong chain | Treasury monitoring dashboard; automated alerts at low thresholds; fallback: user pays bridge fee directly |
| 8 | **Regulatory changes (token classification)** | Medium | Medium | May require UI changes for compliance | Modular UI architecture; no direct fiat touchpoints in MVP; legal counsel engaged |
| 9 | **Low solver activity (no yield)** | Medium | Medium | Users disappointed by zero/low yield; churn | Set realistic yield expectations in UI; show "yield begins when solver activity increases"; diversify solver strategies |

---

## 11. Dependencies & Blockers

### External Dependencies

| # | Dependency | Owner | Status | Risk | Resolution Plan |
|---|-----------|-------|--------|------|----------------|
| 1 | **ClearNode Production Endpoint** | Yellow Network | Required for all off-chain operations | High | Use sandbox (`clearnet-sandbox.yellow.com`) for development; coordinate launch timeline with Yellow team |
| 2 | **LI.FI SDK (`@lifi/sdk`)** | LI.FI | Required for Unification and Hybrid Exit | Medium | Pin stable version; mock for testing; maintain abstraction layer for potential replacement |
| 3 | **Yellow SDK (`@erc7824/nitrolite`)** | Yellow Network | Required for auth, channels, transfers | High | Pin stable version; contribute upstream fixes if needed |
| 4 | **Base L2 RPC** | Coinbase / providers | Required for on-chain interactions on Base | Low | Use multiple RPC providers (Alchemy, Infura, public) with failover |

### Internal Dependencies

| # | Dependency | Owner | Status | Blocks |
|---|-----------|-------|--------|--------|
| 1 | **UXVault contract deployment (Base)** | Contracts team | Required for deposits/withdrawals | FR-04, FR-07 |
| 2 | **Adjudicator contract deployment** | Contracts team | Required for state verification and Force Withdrawal | FR-07.5 |
| 3 | **SessionKeyRegistry contract deployment** | Contracts team | Required for on-chain delegation and revocation | FR-02.5 |
| 4 | **Backend Nitrolite RPC server** | Backend team | Required for auth, state queries, solver operations | FR-02, FR-03, FR-06 |
| 5 | **Backend KMS integration** | Backend team | Required for session key storage | FR-02.3 |
| 6 | **ABI synchronization pipeline** | DevOps/Contracts | Required for frontend contract interaction | FR-04, FR-07 |
| 7 | **Treasury contract deployment** | Contracts team | Required for Hybrid Exit sponsorship | FR-07.4 |

### Resolution Plans

- **ABI sync:** After contract deployment, ABIs are exported to `frontend/src/abi/` and `backend/src/abi/`. Automate via CI script.
- **Shared environment:** Root `.env.example` synchronizes Chain IDs, RPC URLs, and API keys across all sub-projects.
- **Contract address registry:** Maintain a shared contract address config updated post-deployment.
- **Integration testing:** End-to-end integration tests run against sandbox ClearNode and testnet contracts.

---

## 12. Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| **Unified Balance** | The sum of all user assets across supported chains, presented as a single value |
| **Unification Intent** | The user action of triggering an ERC-7683 intent to move fragmented funds into the UXVault |
| **Yield Badge** | A UI element indicating active profit generation from Community Solver activities |
| **Gasless Mode** | A state where transactions are sponsored by the protocol's staked $YELLOW |
| **Persistent Session Key** | A locally generated key delegated to the backend to authorize autonomous rebalancing |
| **Delegation Flow** | The one-time onboarding process where a user signs an EIP-712 message to enable the solver |
| **Hybrid Withdrawal** | An exit strategy where the protocol sponsors a LI.FI bridge fee if the local vault is empty |
| **Execution Guard** | The UI-level status tracking of atomic asset arrivals during intent fulfillment |
| **ClearNode** | Yellow Network's decentralized web service node providing chain abstraction and off-chain settlement |
| **Nitrolite** | Lightweight state-channel framework powering the Yellow Network (ERC-7824) |
| **Adjudicator** | On-chain smart contract that verifies off-chain state updates and resolves disputes |
| **Force Withdrawal** | Escape hatch allowing users to claim funds directly from the on-chain contract without backend cooperation |
| **Checkpoint** | An on-chain proof of off-chain state, creating a save point without closing the channel |
| **UXVault** | The on-chain vault contract holding user assets on each supported chain |
| **Session Key Registry** | On-chain mapping of Owner → SessionKey with expiry and permission bits |
| **Solver** | Backend engine that fulfills LI.FI intents using aggregated vault liquidity to capture spreads |
| **Challenge Period** | Time window (default 24h) during which a counterparty can contest a unilateral channel closure |

### B. References

| Document | Location |
|----------|----------|
| Project Context | `/.context/project-context.md` |
| Best Practices | `/.context/best-practices.md` |
| Frontend Product Definition | `/frontend/.context/01_product/product.md` |
| Frontend Architecture | `/frontend/.context/02_architecture/` |
| Frontend Coding Standards | `/frontend/.context/03_standards/` |
| Frontend Security | `/frontend/.context/05_security/` |
| Backend Product Definition | `/backend/.context/01_product/product.md` |
| Contracts Product Definition | `/contracts/.context/01_product/product.md` |
| Yellow Network Overview | `/frontend/references/yellow-docs/01-overview.md` |
| Yellow Architecture | `/frontend/references/yellow-docs/02-architecture.md` |
| Nitrolite Protocol | `/frontend/references/yellow-docs/03-nitrolite-protocol.md` |
| State Channels | `/frontend/references/yellow-docs/04-state-channels.md` |
| SDK Quick Start | `/frontend/references/yellow-docs/05-sdk-quickstart.md` |
| API Reference | `/frontend/references/yellow-docs/06-api-reference.md` |
| App Sessions | `/frontend/references/yellow-docs/07-app-sessions.md` |

### C. API Contracts (Frontend ↔ Backend)

#### Authentication

```
Frontend → ClearNode: auth_request [walletAddress]
ClearNode → Frontend: auth_challenge (EIP-712 typed data)
Frontend → ClearNode: auth_verify [signature]
ClearNode → Frontend: { jwt, expiresAt }
```

#### Balance Queries

```
Frontend → ClearNode: get_balances
ClearNode → Frontend: [{ asset, amount, available, locked }]
```

#### Transfers

```
Frontend → ClearNode: send_transfer { to, asset, amount }
ClearNode → Frontend: { id, status }
```

#### Channel Management

```
Frontend → ClearNode: create_channel { token, amount, chainId }
Frontend → ClearNode: close_channel { channelId }
Frontend → ClearNode: resize_channel { channelId, amount, action }
```

#### Notifications (Server → Client)

```
ClearNode → Frontend: bu { asset, amount, available, locked }
ClearNode → Frontend: cu { channelId, status, version, allocations }
```

### D. Component Inventory (Planned)

| Component | Route/Location | Description |
|-----------|---------------|-------------|
| `DelegationModal` | `/components/DelegationModal` | EIP-712 signing flow with human-readable explanation |
| `UnifiedBalance` | `/components/UnifiedBalance` | Main balance card with aggregation and breakdown toggle |
| `YieldDashboard` | `/components/YieldDashboard` | Yield metrics, chart, and revenue split display |
| `UnificationFlow` | `/components/UnificationFlow` | LI.FI-powered multi-chain deposit wizard |
| `WithdrawalFlow` | `/components/WithdrawalFlow` | Direct and Hybrid Exit interface |
| `SendTransfer` | `/components/SendTransfer` | P2P gasless transfer form |
| `TransactionHistory` | `/components/TransactionHistory` | Ledger transaction list |
| `OnboardingWizard` | `/components/OnboardingWizard` | 3-step guided setup |
| `YieldBadge` | `/components/YieldBadge` | Inline yield indicator |
| `ExecutionGuard` | `/components/ExecutionGuard` | Atomic arrival status tracker |
| `ForceWithdrawal` | `/components/ForceWithdrawal` | Emergency withdrawal interface |

#### Hooks

| Hook | Purpose |
|------|---------|
| `useSessionKey` | Manage session key lifecycle (generate, delegate, revoke, status) |
| `useLifi` | LI.FI SDK wrapper for routing quotes and intent execution |
| `useNitrolite` | ClearNode WebSocket connection, RPC calls, notification subscriptions |
| `useUnifiedBalance` | Real-time balance aggregation from `bu` notifications |
| `useYield` | Yield data fetching and computation |

#### Routes (App Router)

| Route | Page |
|-------|------|
| `/` | Dashboard (Unified Balance + Yield Badge + Quick Actions) |
| `/onboarding` | Onboarding Wizard |
| `/send` | Send Transfer |
| `/unify` | Unification Flow |
| `/withdraw` | Withdrawal Flow |
| `/history` | Transaction History |
| `/yield` | Yield Dashboard (detailed) |
| `/settings` | Settings & Preferences |

---

*End of document.*
