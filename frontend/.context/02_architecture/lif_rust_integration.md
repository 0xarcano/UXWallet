# lif-rust Integration (Frontend)

Adapted from: `../../.context/lif-rust-integration.md`
Full API spec: `../docs/architecture/api-specification.md`

---

## Overview

`lif-rust` is a stateless microservice that integrates with the **LiFi API** for cross-chain routing. The frontend consumes lif-rust endpoints for:
- Quote estimation (fees, ETA) during Unification and Cross-chain Send flows
- ERC-7683 intent building

**Phase 1 (MVP):** All lif-rust responses are **mocked**. The frontend codes against the real interfaces but receives stub data.
**Phase 2 (Mainnet):** lif-rust connects to the live LiFi API.

---

## Frontend → lif-rust Communication

The frontend calls lif-rust **indirectly** — requests go through the backend in most cases. For quote previews, the frontend may call lif-rust directly.

| Endpoint | Method | Frontend Usage | Phase |
|----------|--------|---------------|-------|
| `GET /health` | GET | Health check (optional) | 1 (mocked) |
| `POST /lifi/quote` | POST | Fee + ETA preview for Unification and Cross-chain Send | 1 (mocked) → 2 (live) |
| `POST /intent/build` | POST | Build ERC-7683 intent order (called by backend Solver) | Backend only |
| `POST /intent/calldata` | POST | Get calldata for on-chain execution (called by backend Solver) | Backend only |

---

## Quote Request/Response

### `POST /lifi/quote`

Used by the frontend to show fee and ETA estimates before the user confirms a Unification or Cross-chain Send.

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

**Response (Phase 1 — mocked):**
```json
{
  "estimatedOutput": "990000000000000000",
  "fee": "10000000000000000",
  "estimatedTime": 120,
  "route": "mock"
}
```

**Frontend handling:**
- Display estimated output, fees, and ETA in the preview screen.
- Show values as human-readable (divide by 10^decimals).
- Label estimates as estimates ("~0.01 ETH fee", "~2 min").
- If quote fails, show "Unable to estimate fees" with option to proceed or retry.

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8080` |
| Production | `https://lifi.flywheel.xyz` |

Configured via `EXPO_PUBLIC_LIFI_URL` or routed through the backend API.

---

## Design Principles

- **Stateless:** No session state; same input → same output.
- **Mocked for MVP:** Frontend should handle both mock and real responses identically.
- **Separation of concerns:** lif-rust handles LiFi integration only. Custody, settlement, and state channels are Yellow/Nitrolite (backend + contracts).

---

## Frontend Implementation Notes

1. **Quote hook:** Create `useQuote(params)` TanStack Query hook that calls `POST /lifi/quote`.
2. **Stale time:** Quotes are volatile — use short stale time (10-15 seconds) or no caching.
3. **Error handling:** Quote failures should not block the flow — show "estimate unavailable" and let user proceed.
4. **Phase 1 awareness:** The UI should not distinguish between mock and real quotes — same code path for both.
