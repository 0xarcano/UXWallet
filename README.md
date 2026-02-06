# UXWallet

**A UX-focused, non-custodial, chain-agnostic wallet + aggregated liquidity protocol.**

UXWallet unifies fragmented cross-chain liquidity and generates yield automatically while keeping assets non-custodial. The product goal is a "one-step" user experience: hide bridging, gas, and chain switching behind a single delegation signature and clear progress UX.

## Project Structure

```
UXWallet/
├── .context/              # Project-wide context and architecture documentation
├── frontend/              # Next.js/React UI (TypeScript)
├── backend/               # Node.js/TypeScript backend (ClearNode, Solver, KMS)
├── contracts/             # Solidity smart contracts (Foundry)
└── lif-rust/              # Rust microservice for LI.FI integration
```

## Architecture Overview

UXWallet operates across **three distinct layers**:

### Layer 1: Inbound Gateway (LI.FI / ERC-7683)
- Users "Unify" fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits
- **lif-rust** microservice handles LI.FI API integration and ERC-7683 order encoding
- **UXOriginSettler** contract validates and processes intents

### Layer 2: Settlement Engine (Yellow / ERC-7824 via Nitrolite)
- Asset movement is virtualized; claims are updated via Nitrolite State Channels
- Off-chain liability exchange co-signed by user's Persistent Session Key
- **Backend/ClearNode** provides real-time WebSocket updates (`bu` notifications)

### Layer 3: Hybrid Exit Strategy ("Fast Exit Guarantee")
- Protocol treasury sponsors LI.FI intent/bridge fees when local vault is insufficient
- Guarantees fast withdrawals without extra user fees

## Core Technologies

- **LI.FI (ERC-7683)**: Intent-based cross-chain actions
- **Yellow / Nitrolite (ERC-7824)**: State channels for off-chain-speed settlement
- **EIP-712**: One-time delegation signature for session key authorization

## MVP Chains

- Yellow L3
- Ethereum
- Base

## Sub-Projects

### Frontend
Next.js/React application providing the user interface.

**Tech Stack**: TypeScript, React, Next.js, TailwindCSS

**Key Features**:
- One-time EIP-712 delegation flow
- Unified balance view (aggregated across chains)
- Real-time updates via WebSocket
- Unify/Send/Withdraw flows with progress tracking

**Documentation**: See `frontend/.context/`

**Getting Started**: See `frontend/README.md`

### Backend
Node.js/TypeScript backend handling session keys, state channels, and JIT solver logic.

**Tech Stack**: TypeScript, Node.js, PostgreSQL, Redis

**Key Components**:
- ClearNode (Nitrolite RPC + WebSocket)
- JIT Solver Engine (LI.FI marketplace listener)
- KMS (Key Management Service)
- Inventory Manager
- Rebalancer

**Documentation**: See `backend/.context/`

**Getting Started**: See `backend/README.md`

### Contracts
Solidity smart contracts deployed on Yellow L3, Ethereum, and Base.

**Tech Stack**: Solidity, Foundry

**Key Contracts**:
- `UXOriginSettler`: ERC-7683 intent handler
- `UXVault`: Multi-chain custody vaults
- `Adjudicator`: Nitrolite state verification (ERC-7824)
- `SessionKeyRegistry`: Persistent session key management
- `LifiAdapter`: LI.FI integration adapter

**Documentation**: See `contracts/.context/`

**Getting Started**:
```bash
cd contracts
forge build
forge test
```

### lif-rust
Rust microservice providing LI.FI API integration and ERC-7683 order encoding.

**Tech Stack**: Rust, Axum, Alloy

**Why Rust?**: Type-safe ABI encoding, performance, correctness guarantees. See `lif-rust/ARCHITECTURE.md` for detailed rationale.

**API Endpoints**:
- `GET /health` - Health check
- `POST /lifi/quote` - Fetch LI.FI routing quote
- `POST /intent/build` - Build ERC-7683 order bytes
- `POST /intent/calldata` - Generate UXOriginSettler.open() calldata

**Documentation**: See `lif-rust/ARCHITECTURE.md`

**Getting Started**:
```bash
cd lif-rust
cargo run
```

## Communication Matrix

| From | To | Method |
|------|-----|--------|
| **Frontend** | **Backend/ClearNode** | WebSocket (`bu`) + RPC |
| **Frontend** | **lif-rust** | REST API |
| **Frontend** | **Contracts** | JSON-RPC (ethers.js) |
| **Backend** | **lif-rust** | REST API |
| **Backend** | **Contracts** | JSON-RPC (ethers.js/viem) |
| **lif-rust** | **LI.FI API** | HTTPS |

## Security Model

- **Non-custodial**: Users retain ultimate control via Force Withdrawal
- **Scoped delegation**: Persistent Session Keys can ONLY authorize state updates within vault network (not transfers to external addresses)
- **Execution Guard**: Vault funds only released on atomic counterpart arrival or explicit user signature
- **State verification**: Adjudicator validates all off-chain state updates

## Development Workflow

1. **Start local chain** (Anvil):
   ```bash
   cd contracts
   anvil
   ```

2. **Deploy contracts**:
   ```bash
   cd contracts
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

3. **Start lif-rust**:
   ```bash
   cd lif-rust
   cargo run
   ```

4. **Start backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Documentation

- **Project Context**: `.context/project-context.md`
- **Architecture Diagrams**: `.context/diagrams.md`
- **Frontend PRD**: `frontend/docs/uxwallet-frontend-prd.md`
- **lif-rust Architecture**: `lif-rust/ARCHITECTURE.md`

Each sub-project has detailed `.context/` folders with:
- Role definitions
- System design
- Tech stack documentation
- Security guidelines
- Testing strategies

## Contributing

See individual sub-project READMEs for contribution guidelines.

## License

TBD
