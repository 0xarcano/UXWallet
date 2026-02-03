# State Channels Deep Dive

> **Sources**: [MiCA White Paper v1.2](./YELLOW_MiCA_White_Paper_v.1.2.pdf) (Part H), [docs.yellow.org/learn/state-channels-vs-l1-l2](https://docs.yellow.org/docs/learn/state-channels-vs-l1-l2), [GitHub layer-3/docs](https://github.com/layer-3/docs)

## What Are State Channels?

State channels are a Layer-2/Layer-3 scaling technique where participants conduct transactions **off-chain** while retaining the ability to settle disputes **on-chain**. Only the opening and closing of channels requires blockchain transactions; all intermediate state updates happen peer-to-peer.

In the Yellow Network context, state channels form the backbone of the Nitrolite protocol, enabling:

- **Instant finality** — State updates are final as soon as all parties co-sign
- **Zero gas for in-app actions** — Off-chain interactions cost nothing
- **Privacy** — Intermediate states are not published on-chain
- **Unlimited throughput** — Channels can process millions of updates per second

## State Channels vs L1/L2

| Metric | L1 (Ethereum) | L2 (Optimistic Rollups) | L2 (ZK Rollups) | State Channels (Yellow) |
|--------|---------------|------------------------|------------------|------------------------|
| **Throughput** | ~15 TPS | ~2,000 TPS | ~2,000 TPS | **Millions TPS** (per channel) |
| **Latency** | 12-15 seconds | 2-5 seconds | 2-10 seconds | **Milliseconds** |
| **Cost per tx** | $0.50-$50 | $0.01-$0.50 | $0.01-$0.10 | **~$0** (off-chain) |
| **Finality** | ~12 minutes | 7 days (fraud proof) | Minutes (validity proof) | **Instant** (co-signed) |
| **Privacy** | Public | Public | Public | **Private** (off-chain) |
| **On-chain footprint** | Every tx | Batched | Batched | **Open + Close only** |
| **Custody** | Self-custody | Smart contract | Smart contract | **Self-custody** (on-chain escrow) |

### Key Advantages of State Channels

1. **True instant finality** — No waiting for block confirmations; state is final when co-signed
2. **No data availability concerns** — Participants hold their own state
3. **Perfect for bilateral/multi-party interactions** — Trading, gaming, micropayments
4. **Chain-agnostic** — ClearNodes abstract away the underlying chain

### Limitations

1. **Participants must be online** — Or delegate to a watchtower/ClearNode
2. **Fixed participant set** — Channel participants are defined at creation
3. **Capital lockup** — Funds must be locked in the channel
4. **Not suitable for global state** — Best for bilateral/small-group interactions

## Channel Lifecycle

### State Machine

```
   ┌──────┐    create()     ┌─────────┐    join()      ┌────────┐
   │ VOID │ ──────────────> │ INITIAL │ ─────────────> │ ACTIVE │
   └──────┘                 └─────────┘                └────────┘
                                                          │    │
                                              challenge() │    │ close()
                                                          v    │ (mutual)
                                                    ┌─────────┐│
                                                    │ DISPUTE ││
                                                    └─────────┘│
                                                          │    │
                                               timeout +  │    │
                                               close()    │    │
                                                          v    v
                                                       ┌───────┐
                                                       │ FINAL │
                                                       └───────┘
```

### States

| State | Description | Transitions |
|-------|-------------|-------------|
| **VOID** | Channel does not exist yet | → INITIAL (via `create()`) |
| **INITIAL** | Creator has locked funds; waiting for ClearNode to join | → ACTIVE (via `join()`) |
| **ACTIVE** | Both parties have locked funds; off-chain updates in progress | → FINAL (via mutual `close()`) or → DISPUTE (via `challenge()`) |
| **DISPUTE** | Challenge has been initiated; waiting for challenge period | → FINAL (via `close()` after timeout) |
| **FINAL** | Channel is closed; funds have been distributed | Terminal state |

## Opening a Channel

### Prerequisites

1. User has funds in their on-chain wallet
2. User is authenticated with a ClearNode (JWT session)
3. User knows which token and amount to lock

### Process

1. **Request**: Client sends `create_channel` to ClearNode
2. **Configuration**: ClearNode constructs channel config (participants, adjudicator, challenge period, nonce)
3. **Initial State**: ClearNode prepares initial funding state with `CHANOPEN` magic number (7877)
4. **Client Signs**: Client signs the initial state (signature at index 0)
5. **On-Chain Create**: Client calls `Custody.create(channel, state, sigs)` on blockchain
6. **Funds Locked**: Blockchain locks Creator's funds in custody contract
7. **ClearNode Joins**: ClearNode observes the on-chain event and calls `Custody.join()`
8. **Channel Active**: Both parties' funds are locked; channel enters ACTIVE state

### Initial State Structure

```javascript
{
  intent: INITIALIZE,
  version: 0,
  data: "0x1EC5",  // CHANOPEN magic number
  allocations: [
    { destination: creatorAddress, token: tokenAddress, amount: creatorAmount },
    { destination: clearnodeAddress, token: tokenAddress, amount: clearnodeAmount }
  ]
}
```

## Off-Chain State Updates

Once a channel is ACTIVE, participants exchange signed state updates off-chain:

1. One party proposes a new state (incremented `version`, updated `allocations`)
2. The other party verifies and co-signs
3. Both parties store the latest co-signed state
4. **No blockchain interaction** — Just peer-to-peer message exchange

### State Update Rules

- `version` must be strictly increasing
- Sum of all `allocations.amount` must remain constant (unless RESIZE)
- All participants must sign the new state
- The adjudicator must accept the state transition

## Closing a Channel

### Cooperative Close (Mutual)

The preferred method when both parties agree on the final state:

1. Either party proposes closure
2. Final state is prepared with `CHANCLOSE` magic number (7879)
3. Both parties sign the final state
4. One party submits the signed state to `Custody.close()` on-chain
5. Smart contract verifies signatures and distributes funds per final allocations
6. Channel enters FINAL state

**Gas cost**: Single on-chain transaction.

### Challenge-Response (Unilateral) Close

Used when the counterparty is unresponsive or disputes the state:

1. **Challenge**: The initiator submits their latest signed state to `Custody.challenge()`
2. **Challenge Period**: A timer starts (configurable, typically 24 hours)
3. **Response Window**: The counterparty can submit a newer signed state via `Custody.checkpoint()`
4. **Resolution**:
   - If a newer state is posted, it replaces the challenged state
   - If no response within the challenge period, the challenged state becomes final
5. **Finalize**: After timeout, `Custody.close()` is called to distribute funds

**Challenge Period Values**:
- Default: 86,400 seconds (24 hours)
- Minimum recommended: 3,600 seconds (1 hour)
- Maximum recommended: 604,800 seconds (7 days)

## Resize Protocol

Channels can be resized (funds added or removed) without closing:

### Adding Funds

1. Client sends `resize_channel` request to ClearNode
2. Both parties sign a RESIZE state
3. On-chain `resize()` is called to add funds to the custody contract
4. Channel allocations are updated

### Removing Funds

1. Client requests withdrawal of partial funds
2. Both parties agree on new reduced allocations
3. On-chain `resize()` releases excess funds
4. Channel continues operating with reduced capacity

## Checkpointing

Recording a state on-chain without entering dispute mode:

1. Both parties sign the current state
2. One party submits to `Custody.checkpoint()`
3. State is recorded on-chain
4. Channel remains ACTIVE

### Benefits of Checkpointing

- **Shortens effective challenge history** — Only need to prove state newer than last checkpoint
- **On-chain proof of state** — Useful for long-running channels
- **Does not start challenge period** — No disruption to channel operations
- **Creates save points** — Like saving progress in a game

## Challenge-Response Dispute Resolution

The challenge-response mechanism is the security backbone of state channels. It ensures that even if a counterparty tries to cheat by submitting an old state, the honest party can prove the correct state.

### How It Works

```
Time ─────────────────────────────────────────────────────>

│ Challenge       │ Challenge Period │ Finalize        │
│ submitted       │ (24h default)    │                 │
│                 │                  │                 │
├─────────────────┤──────────────────┤─────────────────┤
                  │                  │
                  │ Response window  │
                  │ - Submit newer   │
                  │   state if any   │
                  │ - Or do nothing  │
```

### Security Properties

1. **Latest state always wins** — Higher `version` number takes precedence
2. **Cryptographic proof** — All states are signed by all participants
3. **Economic incentive** — Attempting fraud costs gas and delays settlement
4. **Timeout protection** — Challenge period ensures all parties have time to respond
5. **On-chain enforceability** — Smart contract is the final arbiter

### Attack Scenarios and Defenses

| Attack | Defense |
|--------|---------|
| Submit old state | Counterparty submits newer signed state during challenge period |
| Never respond to close | Initiator uses challenge-response with timeout |
| Submit invalid state | Adjudicator contract rejects invalid transitions |
| Double-spend across channels | Each channel is independent with its own locked funds |

## State Channels in Yellow Network

In the Yellow Network, state channels have additional capabilities through ClearNodes:

### Unified Balance

ClearNodes aggregate channel balances across multiple chains, providing a single "unified balance" view. A user with channels on Ethereum and Base sees one combined balance.

### Cross-Chain Transfers

Transfers between users on different chains happen off-chain through ClearNode routing. The ClearNode manages liquidity pools across chains.

### App Sessions

Sub-channels (app sessions) can be created within existing channels for specific applications (trading, gaming, etc.) without additional on-chain transactions.

## Best Practices

1. **Always store the latest signed state** — This is your proof for dispute resolution
2. **Use appropriate challenge periods** — Shorter for fast-moving applications, longer for high-value channels
3. **Checkpoint periodically** — For long-running channels, checkpoint creates on-chain save points
4. **Monitor channel events** — Watch for challenge events to respond promptly
5. **Implement session key rotation** — Limit exposure of signing keys

## Further Reading

- [02 - Architecture](./02-architecture.md)
- [03 - Nitrolite Protocol](./03-nitrolite-protocol.md)
- [05 - SDK & Quick Start](./05-sdk-quickstart.md)
- [09 - Security](./09-security.md)
