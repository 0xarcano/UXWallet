# lif-rust

Rust microservice for **LiFi API** integration in the Flywheel protocol. For the MVP, LiFi system components are **mocked**; callers may stub lif-rust or use mock responses (Sepolia + Base Sepolia).

**Canonical flows:** [`.context/sequence-diagrams.md`](../.context/sequence-diagrams.md)

## What this service does

1. Fetch a LiFi quote (mocked in MVP).
2. Build ERC-7683 order bytes for intent orders (mocked in MVP).
3. Return calldata so the wallet or backend can send the transaction (mocked in MVP).

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

## Local dev

```bash
cd lif-rust
cargo run
```

## Documentation

- **Flows:** [`.context/sequence-diagrams.md`](../.context/sequence-diagrams.md)
- **Integration:** [`.context/lif-rust-integration.md`](../.context/lif-rust-integration.md)
- **Architecture:** `lif-rust/ARCHITECTURE.md`
