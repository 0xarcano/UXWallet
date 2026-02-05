# UXWallet — Architecture & Flow Diagrams

This document contains Mermaid diagrams for the UXWallet system. They are aligned with `.context/project-context.md` and `frontend/docs/uxwallet-frontend-prd.md`.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph User["👤 User"]
        Wallet[Wallet / EOA]
    end

    subgraph Frontend["Frontend (Orchestrator UI)"]
        UI[UXWallet App]
        UI --> Delegation[Delegation Modal]
        UI --> Balance[Unified Balance View]
        UI --> Unify[Unify / Send / Withdraw]
    end

    subgraph External["External Services"]
        LIFI[LI.FI SDK\nERC-7683 Intents]
    end

    subgraph Backend["Backend / ClearNode"]
        WS[WebSocket\n e.g. bu events]
        RPC[RPC / State Queries]
        KMS[Session Key Storage]
    end

    subgraph Contracts["On-Chain (MVP: Yellow L3, Ethereum, Base)"]
        Vault["UXVault(s)"]
        Adjudicator[Adjudicator]
        Vault --> Adjudicator
    end

    subgraph Settlement["Settlement Layer"]
        Nitrolite[Nitrolite State Channels\nERC-7824 / Yellow]
    end

    Wallet <-->|Connect & Sign EIP-712| UI
    UI <-->|Real-time balance, progress| WS
    UI <-->|Handshake, state| RPC
    UI -->|"Intent (Unify, Exit)"| LIFI
    LIFI <-->|Route & Fulfill| Vault
    Backend <-->|Co-sign state updates| Nitrolite
    Backend -->|Monitor events, checkpoints| Vault
    KMS -.->|Persistent Session Key| Nitrolite
```

---

## 2. The Session Key & Delegation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as "Wallet (EOA)"
    participant F as Frontend
    participant B as "Backend / KMS"
    participant N as "Nitrolite (State Updates)"

    U->>F: Connect Wallet
    F->>W: Request connection
    W-->>F: Connected

    F->>F: "Show Delegation Modal (explain scope)"
    U->>F: Proceed to sign
    F->>W: "Request EIP-712 typed data (delegate)"
    W->>U: Sign once
    U->>W: Approve
    W-->>F: Signature

    F->>B: "Submit delegation (signature + payload)"
    B->>B: "Verify & store Session Key (scoped)"
    B-->>F: Delegation active

    Note over F,N: No further wallet pop-ups for internal ops

    loop Internal operations - rebalancing, solver fulfillment
        B->>N: "Co-sign state update (Session Key)"
        N-->>F: "State / balance update (e.g. via WebSocket bu)"
    end

    opt Revoke from Settings
        U->>F: Revoke delegation
        F->>B: Revoke request
        B->>B: Invalidate Session Key
        B-->>F: Revoked
    end
```

---

## 3. "The Happy Path": Cross-Chain Intent Fulfillment

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant LIFI as "LI.FI (ERC-7683)"
    participant Chains as "Chains (e.g. Base, Ethereum)"
    participant V as "UXVault(s)"
    participant N as Nitrolite
    participant CN as ClearNode

    U->>F: "Unify (e.g. dust from Base + Ethereum)"
    F->>F: "Build intent (sources, assets, amounts)"
    F->>LIFI: Submit intent via SDK

    LIFI->>Chains: Route & execute cross-chain
    Chains->>V: Assets arrive at protocol vaults

    Note over V: Execution Guard: release only on atomic arrival / owner withdrawal

    V->>N: "State update (claims / liability)"
    N->>N: Co-sign with user Session Key
    N->>CN: Notify new state / balance

    CN->>F: "WebSocket (bu) — balance updated"
    F->>F: Update Unified Balance UI
    F->>U: Show success + updated balance
```

---

## 4. The "Execution Guard" Logic (Flowchart)

```mermaid
flowchart TD
    Start([Request: Release funds from vault]) --> C1{Corresponding asset confirmed arriving on another protocol-owned vault? Atomic intent fulfillment.}

    C1 -->|Yes| Release([Release funds])
    C1 -->|No| C2{Owner explicitly signed on-chain withdrawal?}

    C2 -->|Yes| Release
    C2 -->|No| Deny([Deny release])

    style Release fill:#cfc
    style Deny fill:#fcc
```

---

## 5. Failure Mode & Recovery (The Adjudicator)

```mermaid
flowchart LR
    subgraph Normal["Normal operation"]
        B[Backend / ClearNode]
        B -->|State updates, bu| U[User sees balance]
    end

    subgraph Failure["Failure: Backend / ClearNode offline"]
        DOWN[Backend or ClearNode unavailable]
        DOWN --> USER[User still has last signed state update]
    end

    subgraph Recovery["Recovery path"]
        USER --> SUBMIT[User submits last signed state\nto on-chain Adjudicator]
        SUBMIT --> VERIFY[Adjudicator verifies signature\nand state]
        VERIFY --> CLAIM[User claims funds on-chain]
    end

    Normal -.->|If backend goes down| Failure
    Failure --> Recovery
```

---

*Diagrams are in Mermaid; render in GitHub, GitLab, or any Mermaid-capable viewer.*
