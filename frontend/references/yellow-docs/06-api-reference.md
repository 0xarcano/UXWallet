# API Reference

> **Sources**: [docs.yellow.org/api-reference](https://docs.yellow.org/docs/api-reference), [GitHub layer-3/docs](https://github.com/layer-3/docs) (communication-flows.mdx, glossary.mdx)

## Overview

The Yellow Network API is accessed via WebSocket connections to ClearNode endpoints using the **NitroRPC** protocol. All messages use compact JSON array format.

### Endpoints

| Environment | URL |
|-------------|-----|
| Production | `wss://clearnet.yellow.com/ws` |
| Sandbox | `wss://clearnet-sandbox.yellow.com/ws` |

### Message Format

```
Request:  [requestId, method, params, timestamp]
Response: [requestId, result, error, timestamp]
```

## Authentication Methods

### `auth_request`

Request an authentication challenge.

**Params**: `[walletAddress]`

**Response**: EIP-712 typed data challenge object

```json
[1, "auth_request", ["0xUserWallet..."], 1706000000]
```

### `auth_verify`

Verify a signed authentication challenge and receive a JWT session token.

**Params**: `[signature]`

**Response**: `{ jwt: string, expiresAt: number }`

```json
[2, "auth_verify", ["0xSignature..."], 1706000001]
```

## Channel Management Methods

### `create_channel`

Create a new payment channel with a ClearNode.

**Params**:
```json
{
  "token": "0xTokenAddress",
  "amount": "1000000",
  "chainId": 8453
}
```

**Response**:
```json
{
  "channelId": "0x...",
  "participants": ["0xCreator", "0xClearNode"],
  "adjudicator": "0xAdjudicatorAddress",
  "challenge": 86400,
  "nonce": 1706000000000,
  "status": "INITIAL"
}
```

### `close_channel`

Request cooperative closure of a channel.

**Params**: `{ channelId: string }`

**Response**: Final state with allocations and settlement confirmation.

### `resize_channel`

Add or remove funds from an active channel.

**Params**:
```json
{
  "channelId": "0x...",
  "amount": "500000",
  "action": "deposit" | "withdraw"
}
```

## Transfer Methods

### `send_transfer`

Send an off-chain transfer to another user.

**Params**:
```json
{
  "to": "0xRecipientAddress",
  "asset": "usdc",
  "amount": "500000"
}
```

**Response**: Transfer confirmation with ID and updated balance.

### `get_ledger_entries`

Query ledger entries (double-entry bookkeeping records).

**Params**:
```json
{
  "account_id": "0xUserAddress",
  "asset": "usdc",
  "limit": 50,
  "offset": 0
}
```

**Response**: Array of ledger entries:
```json
[
  {
    "id": "entry_123",
    "account_id": "0xUser...",
    "asset": "usdc",
    "credit": "1000000",
    "debit": "0",
    "created_at": 1706000000
  }
]
```

### `get_ledger_transactions`

Query user-facing transaction records.

**Response**: Array of transactions:
```json
[
  {
    "id": "tx_456",
    "type": "transfer",
    "from": "0xSender",
    "to": "0xRecipient",
    "asset": "usdc",
    "amount": "500000",
    "timestamp": 1706000000
  }
]
```

**Transaction Types**: `transfer`, `deposit`, `withdrawal`, `app_deposit`, `app_withdrawal`

## App Session Methods

### `create_app_session`

Create a multi-party application session.

**Params**:
```json
{
  "appDefinition": {
    "protocol": "simple-consensus",
    "participants": ["0xAlice", "0xBob", "0xJudge"],
    "weights": [40, 40, 50],
    "quorum": 80
  },
  "allocations": [
    { "participant": "0xAlice", "token": "usdc", "amount": "5000000" },
    { "participant": "0xBob", "token": "usdc", "amount": "5000000" }
  ]
}
```

**Response**:
```json
{
  "appSessionId": "0x...",
  "status": "active",
  "participants": ["0xAlice", "0xBob", "0xJudge"],
  "allocations": [...]
}
```

### `submit_app_state`

Submit a state update to an app session.

**Params**:
```json
{
  "appSessionId": "0x...",
  "intent": "OPERATE" | "DEPOSIT" | "WITHDRAW",
  "allocations": [
    { "participant": "0xAlice", "token": "usdc", "amount": "7000000" },
    { "participant": "0xBob", "token": "usdc", "amount": "3000000" }
  ],
  "signatures": ["0xSig1", "0xSig2"]
}
```

**Intent Types**:

| Intent | Description | Allocation Rule |
|--------|-------------|-----------------|
| `OPERATE` | Redistribute existing funds | Sum must remain unchanged |
| `DEPOSIT` | Add funds from unified balance | Sum increases |
| `WITHDRAW` | Remove funds to unified balance | Sum decreases |

### `close_app_session`

Close an app session and release funds back to unified balances.

**Params**: `{ appSessionId: string }`

## Query Methods

### `get_balances`

Get the user's unified balance across all chains.

**Response**:
```json
[
  { "asset": "usdc", "amount": "10000000", "available": "8000000", "locked": "2000000" },
  { "asset": "eth", "amount": "1000000000000000000", "available": "1000000000000000000", "locked": "0" }
]
```

### `get_channels`

List all channels for the authenticated user.

**Response**:
```json
[
  {
    "channelId": "0x...",
    "status": "ACTIVE",
    "participants": ["0xUser", "0xClearNode"],
    "chainId": 8453,
    "token": "0xUSDC...",
    "version": 42
  }
]
```

### `get_app_sessions`

List all app sessions for the authenticated user.

### `get_config`

Get ClearNode configuration including supported chains, tokens, and fee schedules.

## Notification Methods (Server → Client)

These are pushed by the ClearNode to connected clients:

### `cu` — Channel Update

Sent when a channel's state changes.

```json
{
  "channelId": "0x...",
  "status": "ACTIVE",
  "version": 43,
  "allocations": [...]
}
```

### `bu` — Balance Update

Sent when the user's unified balance changes.

```json
{
  "asset": "usdc",
  "amount": "9500000",
  "available": "7500000",
  "locked": "2000000"
}
```

## NitroliteRPC Functions (SDK)

The `@erc7824/nitrolite` SDK provides typed wrappers around the RPC methods:

### NitroliteRPC Class

```typescript
class NitroliteRPC {
  constructor(options: { ws: WebSocket; signer: WalletClient });

  // Authentication
  authRequest(): Promise<Challenge>;
  authVerify(signature: string): Promise<Session>;

  // Channels
  createChannel(params: CreateChannelParams): Promise<Channel>;
  closeChannel(params: CloseChannelParams): Promise<CloseResult>;
  resizeChannel(params: ResizeChannelParams): Promise<ResizeResult>;

  // Transfers
  sendTransfer(params: TransferParams): Promise<TransferResult>;

  // App Sessions
  createAppSession(params: AppSessionParams): Promise<AppSession>;
  submitAppState(params: AppStateParams): Promise<StateResult>;
  closeAppSession(params: CloseAppSessionParams): Promise<CloseResult>;

  // Queries
  getBalances(): Promise<Balance[]>;
  getChannels(): Promise<Channel[]>;
  getAppSessions(): Promise<AppSession[]>;
  getLedgerEntries(params?: LedgerQueryParams): Promise<LedgerEntry[]>;
  getLedgerTransactions(params?: LedgerQueryParams): Promise<LedgerTransaction[]>;
  getConfig(): Promise<NodeConfig>;

  // Events
  on(event: 'cu' | 'bu', handler: (data: any) => void): void;
  off(event: string, handler: Function): void;
}
```

## Type Definitions

```typescript
interface Channel {
  channelId: string;       // 0x-prefixed hex, 32 bytes
  participants: string[];  // Ordered participant addresses
  adjudicator: string;     // Adjudicator contract address
  challenge: number;       // Challenge period in seconds
  nonce: number;           // Uniqueness guarantee
  status: 'INITIAL' | 'ACTIVE' | 'DISPUTE' | 'FINAL';
  chainId: number;
  token: string;
  version: number;
}

interface Balance {
  asset: string;           // e.g., "usdc", "eth"
  amount: string;          // Total balance (wei/smallest unit)
  available: string;       // Available for new operations
  locked: string;          // Locked in app sessions
}

interface Allocation {
  destination: string;     // Recipient address
  token: string;           // Token contract address
  amount: string;          // Amount in smallest unit
}

interface AppSession {
  appSessionId: string;    // 0x-prefixed hex, 32 bytes
  status: 'active' | 'closed';
  participants: string[];
  weights: number[];
  quorum: number;
  allocations: Allocation[];
}

interface LedgerEntry {
  id: string;
  account_id: string;
  asset: string;
  credit: string;
  debit: string;
  created_at: number;
}

interface LedgerTransaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'app_deposit' | 'app_withdrawal';
  from: string;
  to: string;
  asset: string;
  amount: string;
  timestamp: number;
}
```

## Error Types

| Code | Name | Description |
|------|------|-------------|
| -32700 | Parse Error | Invalid JSON |
| -32600 | Invalid Request | Missing required fields |
| -32601 | Method Not Found | Unknown RPC method |
| -32602 | Invalid Params | Parameter validation failed |
| -32603 | Internal Error | Server-side error |

## Constants & Endpoints

### Chain IDs

| Chain | ID |
|-------|----|
| Ethereum Mainnet | 1 |
| Base | 8453 |
| Arbitrum One | 42161 |
| Polygon | 137 |
| Optimism | 10 |
| BNB Chain | 56 |
| Linea | 59144 |

### Asset Symbols

| Symbol | Name |
|--------|------|
| `usdc` | USD Coin |
| `usdt` | Tether USD |
| `eth` | Ether |
| `weth` | Wrapped Ether |
| `dai` | Dai Stablecoin |
| `wbtc` | Wrapped Bitcoin |

### Magic Numbers

| Name | Value (decimal) | Value (hex) | Purpose |
|------|----------------|-------------|---------|
| CHANOPEN | 7877 | 0x1EC5 | Initial funding state |
| CHANCLOSE | 7879 | 0x1EC7 | Final closing state |

## Further Reading

- [03 - Nitrolite Protocol](./03-nitrolite-protocol.md)
- [05 - SDK Quick Start](./05-sdk-quickstart.md)
- [07 - App Sessions](./07-app-sessions.md)
