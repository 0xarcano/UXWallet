# lif-rust

Rust microservice for **LiFi API** integration in the Flywheel protocol. Used when the **liquidity layer cannot fulfill** a transfer (pool has no funds on the target chain, or on the requested chain for same-chain send). The Flywheel Solver then creates **intent orders in the LiFi marketplace**; lif-rust fetches quotes and builds/encodes order data.

**Canonical flows:** [`.context/sequence-diagrams.md`](../.context/sequence-diagrams.md)

## Development phases

- **Phase 1 (Testnets, LiFi mocked):** Yellow on Sepolia + Arbitrum Sepolia. LiFi system components are **mocked**; callers may stub lif-rust or use mock responses.
- **Phase 2 (Mainnet, LiFi integrated):** Yellow on Ethereum mainnet + Arbitrum mainnet. **LiFi implemented;** lif-rust talks to the real LiFi API.

## What this service does

1. Fetch a LiFi quote.
2. Build ERC-7683 order bytes for intent orders.
3. Return calldata so the wallet or backend can send the transaction.

## LiFi API basics

- Base URL: `https://li.quest/v1`
- API keys optional (higher rate limits)
- If using a key, send in `x-lifi-api-key` header; keep server-side only.

## Endpoints

- `GET /health`
- `POST /lifi/quote`
- `POST /intent/build`
- `POST /intent/calldata`

## Request examples

`POST /lifi/quote` — see existing JSON body format in codebase (fromChain, toChain, fromToken, toToken, fromAmount, fromAddress, toAddress, slippage).

`POST /intent/build` — fillDeadline, orderData (user, inputToken, inputAmount, outputs, destinationSettler, etc.), nonce, lifiCalldata.

## Environment variables

- `LIFI_API_URL` — defaults to `https://li.quest/v1`
- `LIFI_API_KEY` — optional
- `PORT` — defaults to `8080`

(Phase 2 may add contract addresses for calldata generation where applicable.)

## Local dev

```bash
cd lif-rust
cargo run
```

## Documentation

- **Flows:** [`.context/sequence-diagrams.md`](../.context/sequence-diagrams.md)
- **Integration:** [`.context/lif-rust-integration.md`](../.context/lif-rust-integration.md)
- **Architecture:** `lif-rust/ARCHITECTURE.md`
