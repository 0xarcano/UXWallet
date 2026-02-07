# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flywheel (UXWallet)** — A non-custodial wallet and aggregated liquidity protocol. Users delegate assets; the Flywheel Solver fulfills intents using an Aggregated Liquidity Pool (user assets + Treasury). Rewards split 50/50 between users and Treasury. When the pool can't fulfill, the system falls back to creating LiFi marketplace intent orders.

**Canonical source of truth for flows:** `.context/sequence-diagrams.md`

## Repository Structure

Four independent sub-projects sharing a git repo:

| Sub-project | Stack | Purpose |
|-------------|-------|---------|
| `frontend/` | Expo SDK 52, React Native, TypeScript, NativeWind | Wallet mobile app (planning/docs phase — no code yet) |
| `backend/` | Node.js, Fastify, Prisma, Viem, TypeScript | ClearNode, Solver, KMS |
| `contracts/` | Solidity 0.8.33, Foundry | Custody & settlement smart contracts |
| `lif-rust/` | Rust, Axum, Alloy, Tokio | LiFi integration microservice |

Each sub-project has its own build system and dependencies. `backend/`, `frontend/`, and `contracts/` each have a `.context/` folder with architecture, standards, security, and testing docs. `lif-rust/` does not have a `.context/` folder — see its `README.md` and the root-level `.context/lif-rust-integration.md` instead. Always review `../.context/` (project-wide) and `.context/` (sub-project) before writing code.

## Build & Development Commands

### Backend (`backend/`)
```bash
# Infrastructure (PostgreSQL 16 + Redis 7)
cd backend && docker compose up -d

# Setup
npm install
cp .env.example .env          # then configure
npm run db:generate            # Prisma client generation
npm run db:migrate             # Run migrations
npm run db:push                # Push schema directly to DB

# Development
npm run dev                    # tsx watch mode on port 3000

# Build & Production
npm run build                  # tsc
npm start                      # node dist/index.js

# Quality
npm run test                   # Vitest unit tests
npm run test:watch             # Watch mode
npm run test:integration       # Integration tests (separate config)
```

### Contracts (`contracts/`)
```bash
forge build                    # Compile
forge test                     # Run tests
forge fmt                      # Format
forge snapshot                 # Gas snapshots
anvil                          # Local dev node

# Deployment (requires .env with PRIVATE_KEY and RPC_URL)
source .env
forge script script/SessionKeyRegistry.s.sol:SessionKeyRegistryScript --rpc-url $RPC_URL --broadcast
```
Uses git submodules for dependencies (forge-std, openzeppelin-contracts, openzeppelin-contracts-upgradeable).

### lif-rust (`lif-rust/`)
```bash
cargo build                    # Build
cargo run                      # Dev server on port 8080
cargo test                     # Tests
```
Env vars: `LIFI_API_URL` (default: `https://li.quest/v1`), `LIFI_API_KEY`, `PORT` (default: 8080).

### Frontend (`frontend/`)
Currently in planning/documentation phase — no package.json or source code yet. See `frontend/CLAUDE.md`, `frontend/.context/`, and `frontend/docs/architecture/` for architecture and standards.
```bash
npx expo install                # Install dependencies (Expo-managed versions)
npx expo start                  # Start dev server
npx expo start --ios            # iOS simulator
npx expo start --android        # Android emulator
npm run lint                    # ESLint
npm run test                    # Jest unit tests
npx maestro test e2e/           # E2E tests
```

## Architecture

### Communication Flow
- **Frontend** ↔ **Backend/ClearNode**: WebSocket + RPC (real-time `bu` push notifications)
- **Frontend** → **lif-rust**: REST (Phase 2 only; mocked in Phase 1)
- **Backend** → **lif-rust**: REST (intent building for LiFi orders)
- **Backend** ↔ **Contracts**: JSON-RPC via Viem
- **lif-rust** → **LiFi API**: HTTPS (Phase 2 only)

### Backend Services
- **ClearNode**: Yellow/Nitrolite (ERC-7824) state channel coordination, WebSocket server
- **Solver**: Evaluates and fulfills intents from the Aggregated Liquidity Pool; falls back to LiFi when pool insufficient
- **KMS**: Session key management (local signer for dev, AWS KMS for production)
- **Rebalancer**: Cross-chain liquidity optimization; triggers Sponsored Exits via LiFi when needed

### Key Backend Modules
- `src/services/solver/` — inventory management, profitability evaluation, fulfillment
- `src/services/clearnode/` — Nitrolite RPC/WebSocket
- `src/services/rebalancer/` — cross-chain liquidity
- `src/services/delegation/` — session key verification
- `src/integrations/` — Yellow SDK, multi-chain RPC clients, lif-rust REST client
- `src/kms/` — signing (local dev / AWS)

### API Routes (Backend)
- `/health` — GET
- `/api/delegation` — POST /register, POST /revoke, GET /keys?userAddress=
- `/api/balance` — GET ?userAddress=&asset=
- `/api/withdrawal` — POST /request, GET /status/:id
- `/api/state` — GET /channel/:channelId, GET /sessions?userAddress=

### lif-rust Endpoints
`GET /health`, `POST /lifi/quote`, `POST /intent/build`, `POST /intent/calldata`

### Smart Contracts
- **UXOriginSettler**: ERC-7683 cross-chain order handling with LiFi adapter, ECDSA signature verification, nonce-based replay protection, session key spend-cap enforcement via SessionKeyRegistry
- **SessionKeyRegistry**: On-chain session key registry with EIP-712 signature-based registration, per-token spend caps, expiry, and instant revocation. Used by UXOriginSettler to validate delegated operations.
- **LifiAdapter**: Wrapper for LiFi integration with role-based access control (`SETTLER_ROLE`)

### Database (Prisma/PostgreSQL)
Key models: `SessionKey`, `Session`, `Transaction`, `UserBalance`, `VaultInventory`, `IntentLog`, `YieldLog`, `WithdrawalRequest`. Key enums: `SessionStatus`, `SessionKeyStatus`, `TransactionType`, `IntentStatus`, `WithdrawalStatus`, `FulfillmentSource`. Schema at `backend/prisma/schema.prisma`.

## Development Phases

- **Phase 1 (current)**: Testnets (Sepolia + Arbitrum Sepolia). Yellow/Nitrolite fully implemented; LiFi components mocked.
- **Phase 2**: Mainnet (Ethereum + Arbitrum). Full LiFi marketplace integration via lif-rust.

## Context Documentation

`backend/`, `frontend/`, and `contracts/` each have a `.context/` folder structured as:
- `00_meta/` — role definitions
- `01_product/` — product specs, user stories, domain glossary
- `02_architecture/` — system design, project structure, database schema
- `03_standards/` — coding style, error handling, git workflow
- `04_tech_stack/` — framework best practices, language rules, library patterns
- `05_security/` — security guidelines
- `06_testing/` — testing strategy and tools

Root-level `.context/` has project-wide docs: `project-context.md`, `sequence-diagrams.md` (canonical), `diagrams.md`, `best-practices.md`, `lif-rust-integration.md`.
