# Yellow Network Overview

> **Sources**: [MiCA White Paper v1.2](./YELLOW_MiCA_White_Paper_v.1.2.pdf), [docs.yellow.org](https://docs.yellow.org), [GitHub layer-3/docs](https://github.com/layer-3/docs)

## What is Yellow Network?

Yellow Network is a comprehensive Web3 ecosystem providing core infrastructure and developer tools to power a new generation of high-performance decentralized finance applications. At its heart is a proprietary **Layer-3 protocol** that enables real-time, non-custodial, cross-chain trading off-chain using **state channels**, with only the final settlement recorded on-chain.

This architecture creates a global, unified pool of liquidity while enabling chains to effectively scale to **millions of transactions per second**.

Yellow Network aims to drive the mass adoption of Web3 while creating a more efficient and inclusive financial ecosystem that extends the principles of Bitcoin and Ethereum to everyday life.

## Problems Solved

| Problem | Yellow's Solution |
|---------|------------------|
| Fragmented liquidity across chains | Unified cross-chain liquidity pool via state channels and ClearNodes |
| Slow on-chain transactions | Off-chain state channels with near-instant finality |
| High transaction costs | Minimal on-chain footprint; only settlement touches L1/L2 |
| Complex multi-chain UX | Chain abstraction via ClearNodes; unified balances |
| Custodial risk on exchanges | Non-custodial architecture; users retain control of funds |
| Difficult dApp development | Yellow SDK provides Web2-like development experience |

## Ecosystem Components

### Yellow Network (Layer-3 Protocol)

The core infrastructure layer. A proprietary Layer-3 protocol enabling real-time, non-custodial, cross-chain trading using state channels. It creates a clearing and settlement network of interconnected nodes operating across different blockchains.

- **Protocol**: Nitrolite (lightweight state-channel framework)
- **On-chain contracts**: ERC-7824 specification for channel arbitration
- **Off-chain layer**: ClearNode network for chain abstraction and routing
- **Supported chains**: Ethereum, Base, Arbitrum, Linea, BNB, Polygon (expanding)

### Yellow.com

The retail-facing arm of the Yellow Network. Currently serves as a media outlet with plans to become a regulated broker. Includes the Yellow.com User Portal launched in 2024.

### Yellow SDK

A comprehensive Software Development Kit serving as the primary toolkit for developers to build advanced, user-friendly, and efficient dApps on the Yellow Network. Provides:

- **Nitrolite RPC API** - Rapid integration with the Yellow Network
- **NitroliteClient library** - Granular control over state channels and on-chain contracts
- **NPM package**: `@erc7824/nitrolite`

### NeoDAX

A crypto brokerage solution that is simple to set up, provides turnkey liquidity, and can handle hundreds of thousands of transactions per second. Planned for public open-source release.

### $YELLOW Token

The native utility token powering the Yellow Network. ERC-20 token with a maximum supply of **10,000,000,000** (10 billion) tokens operating across multiple blockchain networks.

**Core utilities**:
- **Access rights**: Required to operate nodes, brokers, or integrations
- **Feature unlocking**: Premium tiers and advanced services depend on staking thresholds
- **Governance rights**: Staked YELLOW grants voting power over network parameter changes
- **Rewards**: Node operators and delegators earn rewards for reliable service; penalties for misconduct

## Company & Legal Entity

| Field | Value |
|-------|-------|
| **Entity** | Layer3 Fintech Ltd. |
| **Parent** | Layer3 Foundation |
| **Registered** | Jayla Place, P.O. Box 216, Road Town, VG1110-VG (British Virgin Islands) |
| **Registration date** | 2022-02-21 |
| **Contact** | legal@layer3.foundation |
| **Website** | https://www.yellow.org/ |
| **Documentation** | https://docs.yellow.org/ |
| **Applicable law** | British Virgin Islands (token); Ireland (offer) |

## Team

| Name | Role |
|------|------|
| Karl Alexis Sirkia Zachari | Cofounder |
| Louis Bellet | Cofounder, Chief Architect |
| Camille Meulien | Cofounder |
| Alessio Treglia | CTO |
| Chris Larsen (Ripple co-founder) | Advisor |
| Juan Otero | Advisor |

**Team size**: 33 full-time staff, supplemented by a network of contributors and advisors.

**Technical partners**: Consensys (state channel technology inventor), Hacken/Zokyo (security audits), Cobo/Fireblocks (custody and treasury management).

## Markets Served

The primary market for Yellow Network is **professional traders and brokers**. The broader ecosystem targets:

- Decentralized finance (DeFi) applications
- Peer-to-peer financial services
- Gaming and entertainment
- Insurance and enterprise blockchain use cases
- Retail users (via Yellow.com)

## Roadmap

### Milestones Achieved (2024)

- State Channel & Account Abstraction R&D
- Launch of the Yellow Smart Account
- Launch of the Yellow Wallet
- Establishment of the Clearing Network Legal Framework
- Launch of the Yellow.com User Portal
- Finalization of the Core Protocol Architecture

### Milestones Achieved (2025)

- Production Release of the Yellow SDK
- Network Expansion to 6 New EVM Chains
- Official Launch of the Yellow Builder Program

### Outlook (2025-2026)

- Public Release of the NeoDAX Brokerage Software
- Finalization of the Clearing Network Architecture
- Public Release of the Yellow Clearing Network
- Initiation of non-EVM Chain Support (Closed Beta)
- YELLOW Staking protocol
- Multi-phase rollout of smart contract-based decentralized governance
- Yellow App Store
- Governance-driven strategic reserve allocation mechanism

## Key GitHub Repositories

- **ClearNode**: https://github.com/erc7824/clearnode — Official Yellow network node (open source client + auditable smart contracts)
- **Documentation**: https://github.com/layer-3/docs — Official documentation website source

## Further Reading

- [02 - Architecture](./02-architecture.md)
- [03 - Nitrolite Protocol](./03-nitrolite-protocol.md)
- [04 - State Channels](./04-state-channels.md)
- [05 - SDK & Quick Start](./05-sdk-quickstart.md)
- [06 - API Reference](./06-api-reference.md)
- [07 - App Sessions](./07-app-sessions.md)
- [08 - Tokenomics](./08-tokenomics.md)
- [09 - Security](./09-security.md)
