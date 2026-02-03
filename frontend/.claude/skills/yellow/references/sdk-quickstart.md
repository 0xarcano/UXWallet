# SDK & Developer Quick Start

> **Sources**: [docs.yellow.org/build/quick-start](https://docs.yellow.org/docs/build/quick-start), [GitHub erc7824/nitrolite](https://github.com/erc7824/nitrolite), [GitHub layer-3/docs](https://github.com/layer-3/docs)

## Overview

The Yellow SDK (`@erc7824/nitrolite`) provides developers with tools to build dApps on the Yellow Network. It offers two levels of abstraction:

1. **NitroliteRPC** — High-level API for rapid integration (recommended for most developers)
2. **NitroliteClient** — Low-level library for granular control over state channels and contracts

## Installation

```bash
npm install @erc7824/nitrolite
```

## Endpoints

| Environment | WebSocket URL | Description |
|-------------|--------------|-------------|
| **Production** | `wss://clearnet.yellow.com/ws` | Live network |
| **Sandbox** | `wss://clearnet-sandbox.yellow.com/ws` | Testing environment |

## Quick Start: Step by Step

### Step 1: Connect to ClearNode

```typescript
import { NitroliteRPC } from '@erc7824/nitrolite';

// Create WebSocket connection
const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');

// Initialize RPC client
const rpc = new NitroliteRPC({
  ws,
  signer: walletClient, // viem WalletClient or ethers Signer
});
```

### Step 2: Authenticate

Authentication uses EIP-712 typed data signing:

```typescript
// Request authentication challenge
const challenge = await rpc.authRequest();

// Sign the challenge with your wallet
const signature = await walletClient.signTypedData(challenge);

// Verify and get JWT session token
const session = await rpc.authVerify(signature);

// Session token is now stored internally in the RPC client
console.log('Authenticated:', session.jwt);
```

### Step 3: Create a Channel

```typescript
// Create a payment channel with the ClearNode
const channel = await rpc.createChannel({
  token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  amount: '1000000', // 1 USDC (6 decimals)
  chainId: 8453,     // Base
});

console.log('Channel ID:', channel.channelId);
console.log('Status:', channel.status); // 'ACTIVE'
```

### Step 4: Check Balances

```typescript
// Get unified balance across all chains
const balances = await rpc.getBalances();

console.log('Balances:', balances);
// [{ asset: 'usdc', amount: '1000000', available: '1000000' }]
```

### Step 5: Send a Transfer

```typescript
// Send funds to another user (off-chain, instant)
const transfer = await rpc.sendTransfer({
  to: '0xRecipientAddress...',
  asset: 'usdc',
  amount: '500000', // 0.5 USDC
});

console.log('Transfer ID:', transfer.id);
```

### Step 6: Close the Channel

```typescript
// Cooperative close — funds returned to wallet
const result = await rpc.closeChannel({
  channelId: channel.channelId,
});

console.log('Channel closed, funds settled on-chain');
```

## Session Keys

Session keys allow delegated signing without wallet prompts for every action:

```typescript
import { generateSessionKey } from '@erc7824/nitrolite';

// Generate a temporary session key
const sessionKey = generateSessionKey({
  allowance: '10000000',      // Max 10 USDC spending
  expiration: Date.now() + 3600000, // 1 hour
  scope: ['transfer', 'app_session'], // Allowed operations
});

// Register the session key with ClearNode
await rpc.registerSessionKey(sessionKey);

// Now operations use the session key (no wallet prompts)
await rpc.sendTransfer({
  to: '0xRecipient...',
  asset: 'usdc',
  amount: '100000',
}); // No wallet popup!
```

## WebSocket Handling

### Connection Management

```typescript
const ws = new WebSocket('wss://clearnet.yellow.com/ws');

ws.onopen = () => {
  console.log('Connected to ClearNode');
};

ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
  // Implement reconnection logic
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### Handling Notifications

```typescript
// Listen for balance updates
rpc.on('bu', (update) => {
  console.log('Balance update:', update);
  // { asset: 'usdc', amount: '750000', available: '750000' }
});

// Listen for channel updates
rpc.on('cu', (update) => {
  console.log('Channel update:', update);
  // { channelId: '0x...', status: 'ACTIVE', version: 5 }
});
```

## Complete Example: Simple Payment App

```typescript
import { NitroliteRPC } from '@erc7824/nitrolite';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// --- Setup ---
const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY');
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

// --- Connect ---
const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');
const rpc = new NitroliteRPC({ ws, signer: walletClient });

// --- Authenticate ---
async function authenticate() {
  const challenge = await rpc.authRequest();
  const signature = await walletClient.signTypedData(challenge);
  return await rpc.authVerify(signature);
}

// --- Create Channel ---
async function openChannel(tokenAddress: string, amount: string) {
  return await rpc.createChannel({
    token: tokenAddress,
    amount,
    chainId: 8453, // Base
  });
}

// --- Make Payment ---
async function pay(to: string, asset: string, amount: string) {
  return await rpc.sendTransfer({ to, asset, amount });
}

// --- Query History ---
async function getHistory() {
  return await rpc.getLedgerTransactions();
}

// --- Close Channel ---
async function closeChannel(channelId: string) {
  return await rpc.closeChannel({ channelId });
}

// --- Main Flow ---
async function main() {
  // 1. Connect and authenticate
  await authenticate();
  console.log('Authenticated');

  // 2. Open channel with 10 USDC
  const channel = await openChannel(
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '10000000'
  );
  console.log('Channel opened:', channel.channelId);

  // 3. Listen for balance updates
  rpc.on('bu', (update) => {
    console.log('Balance changed:', update);
  });

  // 4. Send payments
  await pay('0xAlice...', 'usdc', '1000000'); // 1 USDC to Alice
  await pay('0xBob...', 'usdc', '500000');    // 0.5 USDC to Bob

  // 5. Check remaining balance
  const balances = await rpc.getBalances();
  console.log('Remaining:', balances);

  // 6. Close channel when done
  await closeChannel(channel.channelId);
  console.log('Channel closed, funds settled');
}

main().catch(console.error);
```

## App Sessions (Multi-Party)

For applications requiring multiple participants (gaming, escrow, etc.):

```typescript
// Create a multi-party app session
const session = await rpc.createAppSession({
  appDefinition: {
    protocol: 'simple-consensus',
    participants: ['0xAlice', '0xBob', '0xJudge'],
    weights: [40, 40, 50],
    quorum: 80,
  },
  allocations: [
    { participant: '0xAlice', token: 'usdc', amount: '5000000' },
    { participant: '0xBob', token: 'usdc', amount: '5000000' },
  ],
});

console.log('App Session ID:', session.appSessionId);

// Submit state updates (e.g., game round results)
await rpc.submitAppState({
  appSessionId: session.appSessionId,
  intent: 'OPERATE',
  allocations: [
    { participant: '0xAlice', token: 'usdc', amount: '7000000' }, // Alice wins
    { participant: '0xBob', token: 'usdc', amount: '3000000' },
  ],
  signatures: [aliceSignature, bobSignature], // Quorum met: 40 + 40 = 80
});

// Close session
await rpc.closeAppSession({ appSessionId: session.appSessionId });
```

## Developer Resources

| Resource | URL |
|----------|-----|
| **Documentation** | https://docs.yellow.org |
| **SDK Package** | https://www.npmjs.com/package/@erc7824/nitrolite |
| **ClearNode Repo** | https://github.com/erc7824/clearnode |
| **Docs Repo** | https://github.com/layer-3/docs |
| **Yellow Builder Program** | https://yellow.org/builders |

## Supported Assets

Common asset symbols used in the API:

| Symbol | Asset |
|--------|-------|
| `usdc` | USD Coin |
| `usdt` | Tether USD |
| `eth` | Ether |
| `weth` | Wrapped Ether |
| `dai` | Dai Stablecoin |
| `wbtc` | Wrapped Bitcoin |

## Further Reading

- [03 - Nitrolite Protocol](./03-nitrolite-protocol.md)
- [06 - API Reference](./06-api-reference.md)
- [07 - App Sessions](./07-app-sessions.md)
- [09 - Security (Session Keys)](./09-security.md)
