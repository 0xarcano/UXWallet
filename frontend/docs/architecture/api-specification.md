# Backend API & WebSocket Contract

> Complete reference for the Flywheel Wallet frontend, derived from the backend source code.

## Base URLs

| Service | Development | Production |
|---------|-------------|------------|
| REST API | `http://localhost:3000/api` | `https://api.flywheel.xyz/api` |
| WebSocket | `ws://localhost:3000/ws` | `wss://api.flywheel.xyz/ws` |
| lif-rust | `http://localhost:8080` | `https://lifi.flywheel.xyz` |

---

## REST API

### Common Headers

| Header | Direction | Purpose |
|--------|-----------|---------|
| `Content-Type: application/json` | Request | All POST bodies |
| `X-Request-Id: <uuid>` | Request (optional) | Correlation ID; server generates one if absent |
| `X-Request-Id: <uuid>` | Response | Echoed back for tracing |
| `Retry-After: <seconds>` | Response (429) | Seconds to wait before retrying |
| `X-RateLimit-Limit` | Response | Max requests in window |
| `X-RateLimit-Remaining` | Response | Remaining requests in window |
| `X-RateLimit-Reset` | Response | Window reset timestamp |

### Error Response Format

All errors follow a consistent JSON structure (from `AppError.toJSON()`):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `VALIDATION_ERROR` | 400 | Request body/query failed validation |
| `NOT_FOUND` | 404 | Resource does not exist |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `AUTH_FAILED` | 401 | Authentication credentials invalid |
| `SESSION_NOT_FOUND` | 404 | Nitrolite session not found |
| `SESSION_EXPIRED` | 410 | Nitrolite session has expired |
| `SESSION_KEY_INVALID` | 400 | Session key is invalid or malformed |
| `SESSION_KEY_EXPIRED` | 410 | Session key has expired |
| `SESSION_KEY_REVOKED` | 410 | Session key was revoked |
| `INSUFFICIENT_FUNDS` | 400 | User balance too low for operation |
| `INSUFFICIENT_LIQUIDITY` | 503 | Pool cannot fulfill request |
| `STALE_STATE` | 409 | State channel conflict |
| `INVALID_SIGNATURE` | 400 | Cryptographic signature verification failed |
| `ALLOCATION_MISMATCH` | 400 | State channel allocation inconsistency |
| `CONNECTION_FAILED` | 503 | Upstream service unreachable |
| `TIMEOUT` | 504 | Upstream service timed out |
| `WITHDRAWAL_FAILED` | 500 | Withdrawal processing error |
| `WITHDRAWAL_PENDING` | 409 | Withdrawal already in progress |

### Rate Limiting

| Tier | Max Requests | Window | Applied To |
|------|-------------|--------|------------|
| Strict | 10 | 60 seconds | `/delegation/register`, `/delegation/revoke`, `/withdrawal/request` |
| Relaxed | 500 | 60 seconds | All other endpoints |

Rate limiting uses Redis as the backing store.

---

### Endpoints

#### `GET /api/health`

Health check with dependency status.

**Rate Limit:** Relaxed

**Response `200`:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "checks": {
    "postgres": "ok",
    "redis": "ok"
  }
}
```

**Response `200` (degraded):**
```json
{
  "status": "degraded",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "checks": {
    "postgres": "ok",
    "redis": "error"
  }
}
```

---

#### `POST /api/delegation/register`

Register a new Session Key delegation with EIP-712 signature verification.

**Rate Limit:** Strict (10/60s)

**Request Body** (validated by `delegationRequestSchema`):
```json
{
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "sessionKeyAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
  "application": "Flywheel",
  "scope": "liquidity",
  "allowances": [
    { "asset": "ETH", "amount": "1000000000000000000" },
    { "asset": "USDC", "amount": "1000000000" }
  ],
  "expiresAt": 1735689600,
  "signature": "0x..."
}
```

**Field Validation:**
| Field | Type | Validation |
|-------|------|------------|
| `userAddress` | `string` | `^0x[a-fA-F0-9]{40}$` |
| `sessionKeyAddress` | `string` | `^0x[a-fA-F0-9]{40}$` |
| `application` | `string` | Min length 1 |
| `scope` | `string` | Min length 1 |
| `allowances` | `array` | Array of `{ asset: string (min 1), amount: uint256String }` |
| `expiresAt` | `number` | Positive integer (Unix timestamp, seconds) |
| `signature` | `string` | `^0x[a-fA-F0-9]*$` (hex-encoded) |

**Response `200`:**
```json
{
  "key": {
    "id": "uuid",
    "userAddress": "0x...",
    "sessionKeyAddress": "0x...",
    "application": "Flywheel",
    "scope": "liquidity",
    "allowances": [...],
    "expiresAt": 1735689600,
    "status": "ACTIVE",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` — Request body failed schema validation
- `400 INVALID_SIGNATURE` — EIP-712 signature does not match `userAddress`
- `429 RATE_LIMITED` — Too many registration attempts

---

#### `POST /api/delegation/revoke`

Revoke an active Session Key.

**Rate Limit:** Strict (10/60s)

**Request Body:**
```json
{
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "sessionKeyAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

**Response `200`:**
```json
{
  "success": true
}
```

**Error Responses:**
- `400 VALIDATION_ERROR` — Invalid addresses
- `404 NOT_FOUND` — Session key not found
- `429 RATE_LIMITED` — Too many requests

---

#### `GET /api/delegation/keys`

List active Session Keys for a user.

**Rate Limit:** Relaxed

**Query Parameters:**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `userAddress` | `string` | Yes | `^0x[a-fA-F0-9]{40}$` |

**Response `200`:**
```json
{
  "keys": [
    {
      "id": "uuid",
      "userAddress": "0x...",
      "sessionKeyAddress": "0x...",
      "application": "Flywheel",
      "scope": "liquidity",
      "allowances": [
        { "asset": "ETH", "amount": "1000000000000000000" }
      ],
      "expiresAt": 1735689600,
      "status": "ACTIVE",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### `GET /api/balance`

Get unified balances for a user, optionally filtered by asset.

**Rate Limit:** Relaxed

**Query Parameters:**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `userAddress` | `string` | Yes | `^0x[a-fA-F0-9]{40}$` |
| `asset` | `string` | No | Min length 1 |

**Response `200`:**
```json
{
  "userAddress": "0x...",
  "balances": [
    {
      "asset": "ETH",
      "balance": "1500000000000000000",
      "chainId": 11155111
    },
    {
      "asset": "USDC",
      "balance": "500000000",
      "chainId": 84532
    }
  ]
}
```

**Note:** `balance` is a string-encoded `uint256` (non-negative integer). Frontend must parse and format for display (e.g., divide by 10^decimals).

---

#### `POST /api/withdrawal/request`

Request a withdrawal from the aggregated liquidity pool.

**Rate Limit:** Strict (10/60s)

**Request Body** (validated by `withdrawalRequestSchema`):
```json
{
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "asset": "ETH",
  "amount": "500000000000000000",
  "chainId": 11155111
}
```

**Field Validation:**
| Field | Type | Validation |
|-------|------|------------|
| `userAddress` | `string` | `^0x[a-fA-F0-9]{40}$` |
| `asset` | `string` | Min length 1 |
| `amount` | `string` | `^\d+$` (uint256 string) |
| `chainId` | `number` | Positive integer |

**Response `200`:**
```json
{
  "withdrawal": {
    "id": "uuid",
    "userAddress": "0x...",
    "asset": "ETH",
    "amount": "500000000000000000",
    "chainId": 11155111,
    "status": "PENDING",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Side Effects:**
- Validates sufficient user balance before creating the withdrawal
- Publishes a `bu` (balance update) event via WebSocket after creating the request

**Error Responses:**
- `400 VALIDATION_ERROR` — Invalid request body
- `400 INSUFFICIENT_FUNDS` — User balance too low
- `409 WITHDRAWAL_PENDING` — A withdrawal is already in progress
- `429 RATE_LIMITED` — Too many withdrawal requests

---

#### `GET /api/withdrawal/status/:id`

Check the status of a withdrawal request.

**Rate Limit:** Relaxed

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Withdrawal request UUID |

**Response `200`:**
```json
{
  "withdrawal": {
    "id": "uuid",
    "userAddress": "0x...",
    "asset": "ETH",
    "amount": "500000000000000000",
    "chainId": 11155111,
    "status": "COMPLETED",
    "txHash": "0x...",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:31:00.000Z"
  }
}
```

**Withdrawal Status Values:**
| Status | Description |
|--------|-------------|
| `PENDING` | Request created, awaiting processing |
| `PROCESSING` | Solver is fulfilling the withdrawal |
| `COMPLETED` | Funds transferred to user on target chain |
| `FAILED` | Withdrawal failed (user should retry) |

**Error Responses:**
- `404 NOT_FOUND` — Withdrawal ID does not exist

---

#### `GET /api/state/channel/:channelId`

Get the latest persisted state for a Nitrolite channel.

**Rate Limit:** Relaxed

**Path Parameters:**
| Parameter | Type | Validation |
|-----------|------|------------|
| `channelId` | `string` | `^0x[a-fA-F0-9]*$` (hex string) |

**Response `200`:**
```json
{
  "session": {
    "id": "uuid",
    "channelId": "0x...",
    "userAddress": "0x...",
    "status": "OPEN",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "latestTransaction": {
      "id": "uuid",
      "nonce": 5,
      "type": "CREDIT",
      "amount": "100000000",
      "asset": "USDC",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 NOT_FOUND` — Channel not found

---

#### `GET /api/state/sessions`

List all sessions for a user, ordered by most recently updated.

**Rate Limit:** Relaxed

**Query Parameters:**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `userAddress` | `string` | Yes | `^0x[a-fA-F0-9]{40}$` |

**Response `200`:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "channelId": "0x...",
      "userAddress": "0x...",
      "status": "OPEN",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:35:00.000Z"
    }
  ]
}
```

---

## WebSocket Protocol

### Connection

Connect to `ws://localhost:3000/ws` (or `wss://` in production). The server assigns a unique `clientId` per connection.

### Client → Server Messages

All messages are JSON objects with a `type` field.

#### `ping`

Keep-alive heartbeat.

```json
{ "type": "ping" }
```

**Server Response:**
```json
{ "type": "pong", "timestamp": 1705312200000 }
```

#### `subscribe`

Subscribe to balance updates for a specific user address.

```json
{
  "type": "subscribe",
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Server Response (success):**
```json
{
  "type": "subscribed",
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Server Response (error):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid userAddress"
  }
}
```

**Notes:**
- Address is normalized to lowercase for subscription matching
- A client can subscribe to multiple addresses
- Clients without subscriptions receive all `bu` events (broadcast mode)

#### `unsubscribe`

Unsubscribe from a user address.

```json
{
  "type": "unsubscribe",
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Server Response:**
```json
{
  "type": "unsubscribed",
  "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

### Server → Client Messages

#### `bu` (Balance Update)

Pushed when a user's balance changes (e.g., after deposit, withdrawal, reward credit).

```json
{
  "type": "bu",
  "data": {
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "asset": "ETH",
    "balance": "1500000000000000000",
    "chainId": 11155111
  },
  "timestamp": 1705312200000
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `data.userAddress` | `string` | Ethereum address (0x-prefixed, 40 hex chars) |
| `data.asset` | `string` | Asset symbol (e.g., `ETH`, `USDC`) |
| `data.balance` | `string` | Updated balance as uint256 string |
| `data.chainId` | `number` (optional) | Chain ID if chain-specific |
| `timestamp` | `number` | Server timestamp (Unix ms) |

#### Error Messages

Sent for invalid client messages.

```json
{
  "error": {
    "code": "PARSE_ERROR",
    "message": "Invalid JSON"
  }
}
```

```json
{
  "error": {
    "code": "UNKNOWN_MESSAGE",
    "message": "Unknown message type"
  }
}
```

### Subscription Routing

The server routes `bu` events using Redis pub/sub on the `flywheel:bu` channel:

1. Backend services publish `bu` events to Redis
2. WebSocket server receives all published events
3. For each connected client:
   - If the client has **no subscriptions**: receives all `bu` events (broadcast mode)
   - If the client has **subscriptions**: only receives `bu` events where `data.userAddress` (lowercase) matches a subscribed address

### Reconnection Strategy (Client-Side)

The backend does not implement reconnection — the client must handle this:

1. On disconnect, attempt reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
2. On reconnect, re-send all `subscribe` messages
3. After reconnect, fetch fresh balances via `GET /api/balance` to catch any missed `bu` events
4. Show a connection indicator in the UI during disconnected state

---

## EIP-712 Delegation Signature

The delegation flow uses EIP-712 typed data for secure, human-readable signing.

### Typed Data Structure

Sourced from `backend/src/services/delegation/verification.ts`:

```typescript
import { EIP712AuthTypes } from '@erc7824/nitrolite';

// Domain
const domain = {
  name: "Flywheel"  // matches `application` field in delegation request
};

// Types — imported from @erc7824/nitrolite
// EIP712AuthTypes includes the "Policy" primary type and its fields

// Message
const message = {
  challenge: '',                            // Empty string for registration
  scope: 'liquidity',                       // Delegation scope
  wallet: '0x<userAddress>',                // User's wallet address (Hex)
  session_key: '0x<sessionKeyAddress>',     // Session key address (Hex)
  expires_at: BigInt(expiresAt),            // Expiry as BigInt (seconds)
  allowances: [                             // Asset allowances
    { asset: 'ETH', amount: '1000000000000000000' },
    { asset: 'USDC', amount: '1000000000' }
  ]
};
```

### Frontend Signing (wagmi)

```typescript
import { useSignTypedData } from 'wagmi';
import { EIP712AuthTypes } from '@erc7824/nitrolite';

const { signTypedDataAsync } = useSignTypedData();

const signature = await signTypedDataAsync({
  domain: { name: 'Flywheel' },
  types: EIP712AuthTypes,
  primaryType: 'Policy',
  message: {
    challenge: '',
    scope: 'liquidity',
    wallet: userAddress,
    session_key: sessionKeyAddress,
    expires_at: BigInt(expiresAt),
    allowances: selectedAllowances,
  },
});
```

### Verification Flow

1. Frontend constructs the EIP-712 typed data and requests signature via wallet (WalletConnect)
2. Frontend sends the signature + delegation data to `POST /api/delegation/register`
3. Backend calls `verifyTypedData` (viem) to confirm the signature was produced by `userAddress`
4. If valid, backend persists the Session Key with `ACTIVE` status
5. If invalid, returns `400 INVALID_SIGNATURE`

---

## lif-rust Endpoints (Phase 2)

> Mocked in Phase 1. The frontend should code against these interfaces but expect stub responses.

Base URL: `http://localhost:8080`

#### `GET /health`

```json
{ "status": "ok" }
```

#### `POST /lifi/quote`

Get a LiFi quote for a cross-chain transfer.

**Request:**
```json
{
  "fromChainId": 11155111,
  "toChainId": 84532,
  "fromToken": "0x...",
  "toToken": "0x...",
  "fromAmount": "1000000000000000000",
  "fromAddress": "0x..."
}
```

#### `POST /intent/build`

Build an ERC-7683 intent order.

#### `POST /intent/calldata`

Get calldata for executing an intent on-chain.

---

## BigInt Conventions

All monetary values are transmitted as **string-encoded unsigned integers** (`uint256String`):

- Regex validation: `^\d+$`
- Represents the smallest unit (wei for ETH, 6-decimal units for USDC)
- Frontend must divide by `10^decimals` for display
- Frontend must multiply by `10^decimals` when constructing requests
- Never use floating-point arithmetic for financial values

| Asset | Decimals | Example: "1.5 ETH" as uint256String |
|-------|----------|--------------------------------------|
| ETH | 18 | `"1500000000000000000"` |
| USDC | 6 | `"1500000"` |

## Supported Chains (MVP — Phase 1)

| Chain | Chain ID | Type |
|-------|----------|------|
| Sepolia | `11155111` | Testnet (Ethereum) |
| Base Sepolia | `84532` | Testnet (Base L2) |
