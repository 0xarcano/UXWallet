# Flow Diagrams (Frontend Perspective)

Adapted from the canonical source: `../../.context/sequence-diagrams.md`
System architecture diagrams: `../../.context/diagrams.md`

---

## 1. Delegation Flow (US-01 + US-08)

The user connects their wallet, delegates assets, and grants the Flywheel Solver a Session Key. This is the **only wallet signature** required — all subsequent Solver operations are automatic.

```mermaid
sequenceDiagram
    participant User
    participant App as Flywheel Wallet App
    participant WC as WalletConnect (Reown)
    participant Backend as Backend / ClearNode

    User->>App: Open App
    App->>App: Check: isConnected? hasDelegation?

    Note over App: Onboarding Guard (app/index.tsx)
    App->>User: Show Connect Wallet screen

    User->>App: Tap "Connect Wallet"
    App->>WC: Open WalletConnect modal
    WC-->>App: Wallet connected (address)
    App->>App: walletStore.setConnected(address)

    App->>User: Show Delegation screen (ScopeExplainer)
    Note over App: Explains: scope, allowances, expiry, revocation

    User->>App: Tap "Delegate"
    App->>App: Build EIP-712 typed data
    Note over App: domain: {name: "Flywheel"}<br/>types: EIP712AuthTypes (@erc7824/nitrolite)<br/>primaryType: "Policy"
    App->>WC: signTypedDataAsync(typedData)
    WC->>User: Review & sign in wallet app
    User->>WC: Approve signature
    WC-->>App: signature (0x...)

    App->>Backend: POST /api/delegation/register
    Note over App: { userAddress, sessionKeyAddress,<br/>application, scope, allowances,<br/>expiresAt, signature }
    Backend->>Backend: verifyTypedData() → persist SessionKey
    Backend-->>App: { key: { status: "ACTIVE", ... } }

    App->>App: delegationStore.setActive(key)
    App->>App: SecureStore.save(keyMetadata)
    App->>User: "Delegation active" → Navigate to Select Tokens
```

---

## 2. Real-Time Balance Updates (US-02 + US-07)

After delegation, balance updates arrive in real-time via WebSocket. The `WebSocketProvider` syncs events directly into the TanStack Query cache.

```mermaid
sequenceDiagram
    participant Backend as Backend Services
    participant Redis
    participant WS as WebSocket Server
    participant App as Flywheel Wallet App
    participant QC as TanStack Query Cache
    participant UI as UI Components

    Note over App: On mount: WebSocketProvider connects
    App->>WS: Connect to wss://api.flywheel.xyz/ws
    WS-->>App: Connected

    App->>WS: { type: "subscribe", userAddress: "0x..." }
    WS-->>App: { type: "subscribed", userAddress: "0x..." }

    Note over Backend: Solver fulfills intent, balance changes
    Backend->>Redis: Publish "bu" event to flywheel:bu
    Redis->>WS: Forward to subscribed clients
    WS->>App: { type: "bu", data: { userAddress, asset, balance, chainId } }

    App->>QC: setQueryData(['balance', userAddress], updater)
    QC->>UI: Re-render BalanceCard, YieldBadge
    UI->>UI: Display updated balance instantly

    Note over App: Reconnection on disconnect
    App--xWS: Connection lost
    App->>App: Exponential backoff (1s → 2s → 4s → 8s → max 30s)
    App->>WS: Reconnect
    App->>WS: Re-subscribe all addresses
    App->>Backend: GET /api/balance (catch missed events)
```

---

## 3. Withdrawal Flow (US-04)

User requests withdrawal. Backend processes it. The app polls for status updates. Fast Exit Guarantee ensures withdrawal even when local vault is dry.

```mermaid
sequenceDiagram
    participant User
    participant App as Flywheel Wallet App
    participant Backend as Backend / ClearNode
    participant WS as WebSocket

    User->>App: Navigate to Withdraw
    App->>Backend: GET /api/balance?userAddress=0x...
    Backend-->>App: { balances: [...] }
    App->>User: Show asset selector + amount input

    User->>App: Select ETH, enter amount, choose chain
    App->>App: Validate (Zod: uint256String, ≤ balance, > 0)

    Note over App: Show ExitTypeIndicator
    App->>User: "Direct Exit" or "Sponsored Exit (Hybrid)"

    User->>App: Tap "Confirm Withdrawal"
    App->>Backend: POST /api/withdrawal/request
    Note over App: { userAddress, asset, amount, chainId }
    Backend-->>App: { withdrawal: { id, status: "PENDING" } }

    App->>User: Show TransactionProgress screen

    loop Poll until COMPLETED or FAILED
        App->>Backend: GET /api/withdrawal/status/:id
        Backend-->>App: { status: "PROCESSING" }
        App->>User: Update progress steps
    end

    Backend-->>App: { status: "COMPLETED", txHash }
    WS->>App: { type: "bu", data: { updated balance } }
    App->>User: "Withdrawal complete" → Navigate to Home
```

---

## 4. Send Flow — Gasless L3 P2P (US-05)

Within Yellow L3, transfers are off-chain and gasless via ClearNode.

```mermaid
sequenceDiagram
    participant User
    participant App as Flywheel Wallet App
    participant Backend as Backend / ClearNode
    participant WS as WebSocket

    User->>App: Navigate to Send
    User->>App: Enter recipient address + amount
    App->>App: Validate (Zod: ethereumAddress, uint256String ≤ balance)

    User->>App: Tap "Confirm Send"
    App->>Backend: Execute off-chain transfer via ClearNode
    Backend->>Backend: State channel update (signed by Session Key)
    Backend-->>App: Transfer confirmed

    WS->>App: { type: "bu" } (sender balance updated)
    App->>User: "Transfer complete — 0 gas fees"
```

---

## 5. Unification Flow (US-03 + US-09)

User consolidates fragmented balances from multiple chains into the unified vault. Uses ERC-7683 intents via LiFi (mocked in Phase 1).

```mermaid
sequenceDiagram
    participant User
    participant App as Flywheel Wallet App
    participant Backend as Backend / ClearNode
    participant LiFi as lif-rust (mocked Phase 1)
    participant WS as WebSocket

    User->>App: Navigate to Unify
    App->>Backend: GET /api/balance?userAddress=0x...
    Backend-->>App: Per-chain balances
    App->>User: Show fragmented balances per chain

    User->>App: Select balances to unify
    App->>LiFi: POST /lifi/quote (fee + ETA estimate)
    LiFi-->>App: Quote response (mocked)
    App->>User: Show preview (sources, fees, ETA)

    User->>App: Tap "Confirm Unification"
    App->>Backend: Submit unification intent

    loop Track progress
        App->>User: Update TransactionProgress
        Note over App: submitting → routing → executing → confirming
    end

    WS->>App: { type: "bu" } (unified balance updated)
    App->>User: "Unification complete" → Navigate to Home
```

---

## 6. Failure Mode & Recovery

If the backend/ClearNode goes offline, the user can recover funds via the on-chain Adjudicator.

```mermaid
flowchart LR
    subgraph Normal["Normal Operation"]
        B[Backend / ClearNode]
        B -->|WebSocket bu events| U[App shows balance]
    end

    subgraph Failure["Backend/ClearNode Offline"]
        DOWN[Unavailable]
        DOWN --> USER[User has last signed state]
    end

    subgraph Recovery["Force Withdrawal"]
        USER --> SUBMIT[Submit state to Adjudicator]
        SUBMIT --> VERIFY[Adjudicator verifies & concludes]
        VERIFY --> CLAIM[User claims funds on-chain]
    end

    Normal -.->|If offline| Failure
    Failure --> Recovery
```

**Frontend responsibility:** Display connection status via `ConnectionIndicator`. If disconnected for extended period, show guidance about Force Withdrawal option.
