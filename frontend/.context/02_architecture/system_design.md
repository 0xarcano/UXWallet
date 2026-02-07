# System Design

**Architecture:** Client-centric Expo/React Native mobile app. The Flywheel Wallet communicates with **Backend/ClearNode** (Fastify + Redis + PostgreSQL) via REST and WebSocket for delegation, balance, withdrawal, and real-time updates. LiFi components are mocked for Phase 1.

**Full architecture details:** `../docs/architecture/architecture.md`

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Flywheel Wallet App                    │
│                  (Expo / React Native)                   │
├─────────────────────────────────────────────────────────┤
│  expo-router   │  Zustand  │  TanStack Query  │  Wagmi  │
└──────┬──────────────┬──────────────┬──────────────┬─────┘
       │              │              │              │
       │         REST (HTTPS)   WebSocket (WSS)    │
       │              │              │              │
       │    ┌─────────▼──────────────▼─────────┐   │
       │    │     Backend / ClearNode           │   │
       │    │   (Fastify + Redis + PostgreSQL)  │   │
       │    └─────────┬──────────────┬─────────┘   │
       │              │              │              │
       │         JSON-RPC       REST (Phase 2)     │
       │              │              │              │
       │    ┌─────────▼─────┐ ┌─────▼──────────┐  │
       │    │   Contracts   │ │   lif-rust      │  │
       │    │   (On-Chain)  │ │   (LiFi API)    │  │
       │    └───────────────┘ └────────────────┘   │
       │                                           │
       └──── WalletConnect (EIP-712 signing) ──────┘
```

## Communication Paths

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| App | Backend | REST (HTTPS) | Delegation, balance, withdrawal, state queries |
| App | Backend | WebSocket (WSS) | Real-time `bu` (balance update) events |
| App | Wallet App | WalletConnect (Reown) | EIP-712 signature requests |
| Backend | Contracts | JSON-RPC (Viem) | On-chain settlement, custody |
| Backend | lif-rust | REST | Intent building (Phase 2, mocked Phase 1) |

## State Management — Three-Layer Model

| Layer | Tool | What Lives Here | Persistence |
|-------|------|-----------------|-------------|
| Server State | TanStack Query | API data (balances, keys, sessions, withdrawals) | Query cache (in-memory, 5 min stale time) |
| Client State | Zustand | App state (wallet connection, delegation status, WS status, onboarding progress) | Zustand persist → AsyncStorage |
| Ephemeral State | React state / RHF | Form inputs, modal open/close, animation state | None (component lifecycle) |

## Phase Boundaries

| Component | Phase 1 (Testnet) | Phase 2 (Mainnet) |
|-----------|-------------------|-------------------|
| Delegation (EIP-712) | Fully implemented | Fully implemented |
| Balance API + WebSocket | Fully implemented | Fully implemented |
| Withdrawal | Fully implemented | Fully implemented |
| lif-rust integration | Mocked responses | Live LiFi API |
| Cross-chain transfers | Stub UI | Full LiFi routing |
| Chains | Sepolia (11155111), Base Sepolia (84532) | Ethereum (1), Arbitrum (42161) |

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
**Frontend flow diagrams:** `./flow_diagrams.md`
**lif-rust integration:** `./lif_rust_integration.md`
**API contract:** `../docs/architecture/api-specification.md`
