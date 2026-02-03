---
name: yellow
description: >
  Yellow Network SDK integration and development guide for building dApps using
  the Nitrolite state channel protocol, ClearNodes, and the @erc7824/nitrolite SDK.
  Use when working with: (1) Yellow Network integration - state channels, ClearNodes,
  Nitrolite protocol, ERC-7824, (2) The @erc7824/nitrolite NPM package - NitroliteRPC,
  NitroliteClient, (3) WebSocket connections to clearnet.yellow.com, (4) Channel
  management - create, close, resize, challenge, checkpoint, (5) Off-chain transfers
  and unified balances, (6) App sessions (multi-party state channels) with weighted
  quorum, (7) Session keys for delegated signing, (8) EIP-712 authentication with
  ClearNodes, (9) $YELLOW token economics and staking, (10) Yellow Network architecture
  questions or cross-chain/chain abstraction via ClearNodes.
---

# Yellow Network SDK

## Quick Reference

| Item | Value |
|------|-------|
| **NPM Package** | `@erc7824/nitrolite` |
| **Production WS** | `wss://clearnet.yellow.com/ws` |
| **Sandbox WS** | `wss://clearnet-sandbox.yellow.com/ws` |
| **Protocol** | NitroRPC/0.4 (current) |
| **Message format** | `[requestId, method, params, timestamp]` |
| **Standard** | ERC-7824 |

## Core Integration Flow

```
1. Install: npm install @erc7824/nitrolite
2. Connect: WebSocket to clearnet endpoint
3. Auth: EIP-712 challenge → sign → JWT
4. Channel: create_channel → on-chain deposit → ACTIVE
5. Operate: send_transfer / create_app_session (off-chain)
6. Close: close_channel → on-chain settlement
```

## Minimal Example

```typescript
import { NitroliteRPC } from '@erc7824/nitrolite';

const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');
const rpc = new NitroliteRPC({ ws, signer: walletClient });

// Auth
const challenge = await rpc.authRequest();
const sig = await walletClient.signTypedData(challenge);
await rpc.authVerify(sig);

// Channel
const ch = await rpc.createChannel({
  token: '0xUSDC...', amount: '1000000', chainId: 8453
});

// Transfer (off-chain, instant)
await rpc.sendTransfer({ to: '0xRecipient', asset: 'usdc', amount: '500000' });

// Close
await rpc.closeChannel({ channelId: ch.channelId });
```

## Key SDK Methods

| Category | Methods |
|----------|---------|
| **Auth** | `authRequest()`, `authVerify(sig)` |
| **Channels** | `createChannel()`, `closeChannel()`, `resizeChannel()` |
| **Transfers** | `sendTransfer()` |
| **App Sessions** | `createAppSession()`, `submitAppState()`, `closeAppSession()` |
| **Queries** | `getBalances()`, `getChannels()`, `getAppSessions()`, `getLedgerEntries()`, `getLedgerTransactions()`, `getConfig()` |
| **Events** | `on('bu', handler)` (balance update), `on('cu', handler)` (channel update) |
| **Session Keys** | `generateSessionKey()`, `registerSessionKey()` |

## Channel States

`VOID` -> `INITIAL` (create) -> `ACTIVE` (join) -> `FINAL` (close)

From ACTIVE: `challenge()` -> `DISPUTE` -> `FINAL` (after timeout)

## Magic Numbers

| Name | Value | Purpose |
|------|-------|---------|
| CHANOPEN | 7877 (0x1EC5) | Initial funding state |
| CHANCLOSE | 7879 (0x1EC7) | Final closing state |

## Supported Chains

Ethereum (1), Base (8453), Arbitrum (42161), Polygon (137), BNB (56), Linea (59144)

## Reference Documentation

Load these files as needed based on the specific task:

- **[overview.md](references/overview.md)** — Yellow Network ecosystem, components, team, roadmap. Read when answering general questions about Yellow Network.
- **[architecture.md](references/architecture.md)** — Three-layer design (on-chain, off-chain, application), fund flow, ClearNode mechanics, chain abstraction. Read when designing system architecture or understanding how layers interact.
- **[nitrolite-protocol.md](references/nitrolite-protocol.md)** — Protocol specification, glossary, on-chain contracts (IChannel, IDeposit), data structures (Channel, State, Allocation), communication flows (auth, channel creation, transfer, close). Read when implementing protocol-level interactions or debugging RPC messages.
- **[state-channels.md](references/state-channels.md)** — State channel lifecycle, opening/closing flows, resize protocol, checkpointing, challenge-response dispute resolution. Read when implementing channel management or dispute handling.
- **[sdk-quickstart.md](references/sdk-quickstart.md)** — Step-by-step integration guide, complete code examples, session keys usage, WebSocket handling, full payment app example. Read when starting a new integration or writing SDK code.
- **[api-reference.md](references/api-reference.md)** — All RPC methods with params/responses, NitroliteRPC class API, TypeScript type definitions, error codes, constants. Read when looking up specific method signatures or types.
- **[app-sessions.md](references/app-sessions.md)** — Multi-party sessions, AppDefinition structure, weighted quorum, OPERATE/DEPOSIT/WITHDRAW intents, use cases (escrow, gaming, DAO, swaps). Read when implementing multi-party interactions.
- **[tokenomics.md](references/tokenomics.md)** — $YELLOW token details, utility, staking, governance, payment abstraction, strategic reserve. Read when answering token or economics questions.
- **[security.md](references/security.md)** — Security model, session keys deep dive, challenge-response mechanism, fund recovery scenarios, audit info, risk mitigations. Read when implementing security features or session key delegation.

## Critical Implementation Notes

1. **Always store the latest co-signed state** — required for dispute resolution
2. **Use sandbox endpoint for development** — `wss://clearnet-sandbox.yellow.com/ws`
3. **Session keys need tight allowances and short expirations** — minimize exposure
4. **OPERATE intent**: allocation sum must remain constant
5. **DEPOSIT/WITHDRAW intents**: allocation sum changes (NitroRPC/0.4 only)
6. **Challenge period default**: 86400 seconds (24 hours)
7. **Participant index 0 = Creator (user), index 1 = ClearNode**
8. **All state updates require co-signing by all channel participants**
