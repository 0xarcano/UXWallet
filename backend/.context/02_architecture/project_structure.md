# Project Structure

```text
backend/
├── src/
│   ├── services/
│   │   ├── solver/           # JIT Solver Engine (LI.FI marketplace listener, profit/health checks)
│   │   ├── clearnode/        # ClearNode (Nitrolite RPC, WebSocket server for `bu` notifications)
│   │   ├── rebalancer/       # Cross-chain liquidity rebalancing (Hybrid Exit logic)
│   │   └── delegation/       # Persistent Session Key management (creation, validation, revocation)
│   ├── kms/                  # Key Management Service (session key storage, signing logic)
│   ├── rpc/                  # RPC endpoints (state queries, balance, withdrawal requests)
│   ├── websocket/            # WebSocket server for real-time updates (`bu`, progress tracking)
│   ├── db/                   # Database models and repositories (PostgreSQL, Redis)
│   │   ├── models/           # User balances, sessions, intent logs, yield logs
│   │   └── repositories/     # Data access layer
│   ├── integrations/
│   │   ├── lifi/             # LI.FI SDK wrapper (ERC-7683 intents)
│   │   ├── yellow/           # Yellow SDK wrapper (ERC-7824 Nitrolite state channels)
│   │   └── chains/           # Multi-chain RPC clients (Yellow L3, Ethereum, Base)
│   └── utils/                # Signature verification, math, helpers
├── tests/
│   ├── unit/
│   ├── integration/
│   └── load/
└── .context/                 # Context documentation
```

## Key Components Alignment with 3-Layer Architecture

### Layer 1: Inbound Gateway (LI.FI / ERC-7683)
- `services/solver/`: Listens to LI.FI marketplace, evaluates intents, fulfills orders.
- `integrations/lifi/`: LI.FI SDK wrapper for ERC-7683 intents.

### Layer 2: Settlement Engine (Yellow / ERC-7824)
- `services/clearnode/`: Co-signs Nitrolite state updates, provides real-time updates.
- `integrations/yellow/`: Yellow SDK wrapper for state channel management.
- `websocket/`: Delivers `bu` notifications to frontend.

### Layer 3: Hybrid Exit Strategy
- `services/rebalancer/`: Detects insufficient liquidity, triggers Sponsored Exits via LI.FI.
- Logic to determine "Direct Exit" vs "Sponsored Exit (Hybrid)".
