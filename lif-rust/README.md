# lif-rust

Minimal Rust adapter that connects UXWallet on-chain intents to LI.FI routing.

## What this is

`lif-rust` is a thin backend service that:
1. Calls LI.FI REST APIs to fetch a quote for a multi-chain "Unify" intent.
2. Builds ABI-encoded `UXDepositOrder` + `OnchainCrossChainOrder` payloads that match the contracts in `contracts/src/UXOriginSettler.sol`.
3. Returns the encoded bytes so your signer can call `UXOriginSettler.open(...)`.

## LI.FI API basics

1. Base URL is `https://li.quest/v1`. citeturn0search1
2. API keys are optional and only needed for higher rate limits. citeturn0search1
3. If you use a key, send it in the `x-lifi-api-key` header and keep it server-side only. citeturn0search1

## Service endpoints

1. `GET /health`
1. `POST /lifi/quote` returns the raw LI.FI quote JSON.
1. `POST /intent/build` returns ABI-encoded `orderData` and `onchainOrder` bytes.

## Request examples

`POST /lifi/quote` JSON body:

```json
{
  "fromChain": 1,
  "toChain": 8453,
  "fromToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "toToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "fromAmount": "100000000000000000",
  "fromAddress": "0x1111111111111111111111111111111111111111",
  "toAddress": "0x2222222222222222222222222222222222222222",
  "slippage": 0.03
}
```

`POST /intent/build` JSON body:

```json
{
  "fillDeadline": 1900000000,
  "orderData": {
    "user": "0x1111111111111111111111111111111111111111",
    "inputToken": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "inputAmount": "100000000000000000",
    "outputs": [
      {
        "token": "0x000000000000000000000000EeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "amount": "100000000000000000",
        "recipient": "0x0000000000000000000000002222222222222222222222222222222222222222",
        "chainId": 8453
      }
    ],
    "destinationSettler": "0x0000000000000000000000003333333333333333333333333333333333333333",
    "destinationCallData": ["0x"],
    "nonce": 1,
    "lifiCalldata": "0x"
  }
}
```

## Environment variables

1. `LIFI_API_URL` defaults to `https://li.quest/v1`. citeturn0search1
2. `LIFI_API_KEY` optional. Do not expose client-side. citeturn0search1
3. `PORT` defaults to `8080`.

## Local dev

```bash
cd lif-rust
cargo run
```

## Files

1. `lif-rust/src/main.rs` axum server and routes.
2. `lif-rust/src/types.rs` request/response types aligned to `UXOriginSettler` structs.
3. `lif-rust/src/uxwallet_codec.rs` ABI encoding for `UXDepositOrder` and `OnchainCrossChainOrder`.
4. `lif-rust/src/lifi_client.rs` LI.FI REST client.
5. `lif-rust/src/error.rs` error mapping using `thiserror`.
