# **Sequence Diagrams: Flywheel — Aggregated Liquidity Pool**

These workflows describe how a **User** uses the Flywheel Wallet to delegate assets to the aggregated pool. The user only interacts with the App to delegate and **grants the Flywheel Solver permission** (via a Session Key) to fulfill intents automatically; the Solver then registers credits and distributes rewards without further user signatures.

**Rewards & Flywheel Treasury:** Intent order fulfillment generates **rewards**. The system distributes them **50% to the User** (LPs) and **50% to the Flywheel Treasury**. The Treasury is part of the **available liquidity** the Solver can use to fulfill intents (together with user-delegated assets). System owners may withdraw Treasury funds; **User funds are always protected** and never used for owner withdrawals.

---

## **1. User Delegates Assets (Deposit & Channel Setup)**

The user interacts with the App to delegate assets only and grants the Flywheel Solver permission to fulfill intents automatically via a **Session Key** (Yellow). The App and infrastructure set up the channel and lock funds.

```mermaid
sequenceDiagram
    participant LP as User
    participant App as Flywheel Wallet
    participant CN as ClearNode
    participant SC as State Channel (ERC-7824)
    participant SA as Yellow Smart Account

    LP->>App: Open App & Connect Wallet
    App->>LP: Show "Delegate to Pool" / Deposit UI
    LP->>App: Choose amount (e.g. 1 ETH) & Confirm Delegate
    App->>CN: Initialize Session / NitroliteClient
    CN->>SC: Open State Channel
    SC-->>App: Channel Ready
    App->>LP: Sign Deposit (Smart Account)
    LP->>SA: Approve & Deposit 1 ETH (Base Sepolia)
    SA->>SA: Lock funds in Multisig
    SA-->>App: Deposit Confirmed

    Note over LP,CN: Grant Solver permission to fulfill intents automatically
    App->>LP: "Allow Flywheel Solver to fulfill intents?" (Session Key)
    LP->>App: Approve & Sign (EIP-712 auth / session key registration)
    App->>CN: Register Session Key (application, allowances, expires_at)
    CN-->>App: Session Key active (app-scoped, spending limits)
    App->>LP: "Delegation Active — Balance: 1.0 ETH. Solver authorized."
```

**Why Session Key (not App Session):** Per Yellow/Nitrolite docs, **Session Keys** let the user **sign once** and grant the app (and thus the Flywheel Solver) limited, app-scoped access with **allowances** and **expires_at**, so the Solver can fulfill intents automatically without a wallet prompt each time. **App Sessions** are for multi-party state (e.g. escrow, DAO) with quorum and weights—they require coordinated signatures for state updates and are not aimed at "user delegates to solver once, solver acts many times."

---

## **2. Flywheel Solver Fulfills Intents & Registers Credits (Automatic)**

No user action. The Flywheel Solver uses the user-granted **Session Key** and the aggregated pool (LP-delegated assets **and** Flywheel Treasury liquidity) to fulfill external intents, register credits, and allocate rewards (50% User, 50% Treasury). Releasing funds to the Intent User uses the Nitrolite Custody Contract and Adjudicator (ERC-7824) for on-chain settlement.

```mermaid
sequenceDiagram
    participant IU as Intent User
    participant S as Flywheel Solver
    participant SC as State Channel (ERC-7824)
    participant CE as Clearing Engine
    participant Pool as Aggregated Pool (LP + Treasury)
    participant Treasury as Flywheel Treasury
    participant Adj as Adjudicator (Nitro)
    participant Custody as Custody Contract (Nitrolite)

    IU->>S: Request 0.5 ETH on Base Sepolia
    Note over S: Authorized via User Session Key (Diagram 1)
    S->>SC: Check Pool Liquidity (LP-delegated + Treasury)
    S->>Pool: Use delegated liquidity (and Treasury if needed)
    S->>SC: Execute Off-chain Transfer (0.5 ETH)
    Note over SC: Signed state update: IU allocation = 0.5 ETH
    SC->>CE: Register Solver Credit (0.5 ETH)
    CE->>CE: Update State (Physical / Credit ledger)
    CE->>CE: Generate rewards from intent fulfillment
    CE->>CE: Allocate rewards 50% to LPs (Users), 50% to Flywheel Treasury
    CE->>Treasury: Credit Treasury share (50% of rewards)
    CE-->>SC: Credit Registered

    Note over S,Custody: Release 0.5 ETH to User (on-chain settlement)
    S->>Adj: conclude(channelId, stateHash) — finalize channel state
    Adj->>Adj: Validate state (e.g. SimpleConsensus / appDefinition)
    Adj->>Custody: Resolve final state (escrow in Custody)
    Adj->>Adj: transfer(assetIndex, channelId, outcomeBytes, stateHash, indices)
    Adj->>IU: Pay out allocation to IU address (0.5 ETH)
    IU->>IU: Receive 0.5 ETH in wallet

    Note over CE,Treasury: 50% rewards to Users, 50% to Treasury. Treasury is available liquidity for Solver.
```

**Release to user (Yellow/Nitrolite):** The Flywheel Solver finalizes the channel state on-chain via the **Adjudicator** (`conclude`). The **Custody Contract** (Nitrolite) holds the escrow; the Adjudicator's `transfer(assetIndex, channelId, outcomeBytes, stateHash, indices)` pays out the Intent User's allocation. Alternatively, `concludeAndTransferAllAssets` can finalize and transfer in one transaction (ERC-7824).

---

## **3. User Withdrawal & Reward Distribution**

The user interacts with the App to withdraw and claim. The Solver's registered credits are reconciled; **rewards from intent fulfillment** are split **50% to the User** (yield) and **50% to the Flywheel Treasury**. The user receives principal plus their 50% share of rewards. Treasury funds can be used by the system as liquidity for the Solver; system owners may withdraw from the Treasury—**User funds are always protected** and never used for owner withdrawals.

```mermaid
sequenceDiagram
    participant LP as User
    participant App as Flywheel Wallet
    participant CN as ClearNode
    participant CE as Clearing Engine
    participant Treasury as Flywheel Treasury
    participant SA as Yellow Smart Account

    LP->>App: Open App & View Balance / Yield
    App->>CN: Fetch LP state & accrued credits
    CN->>CE: Query credits & rewards for LP
    CE->>CE: Rewards = 50% to User (yield), 50% to Treasury
    CE-->>App: Principal + User yield (50% of rewards)
    App->>LP: Show "Withdraw 1.0 ETH + Yield (your 50% share)"
    LP->>App: Request Withdrawal & Confirm
    App->>CN: Request Withdrawal (1.0 ETH + User yield)
    CN->>CE: Finalize Credit Reconciliation
    CE->>CE: Solver settles debt (e.g. 0.5 ETH)
    CE->>CE: Allocate 50% rewards to LP, 50% to Treasury
    CE->>Treasury: Credit Treasury share (50% of rewards)
    CE->>SA: Trigger Batch Settlement (User funds only)
    SA->>LP: Release 1.0 ETH + User yield to Wallet
    CN->>App: Session / Channel updated
    App->>LP: "Withdrawal complete — Balance updated"

    Note over CE,Treasury: Treasury: used as Solver liquidity. Owners may withdraw Treasury only. User funds protected.
```
