# **UXWallet: General Project Context**
 
**A UX-focused, non-custodial, chain-agnostic wallet + aggregated liquidity protocol.**
 

 
## **1. Vision & Product Perspective**
 
UXWallet is a UX-centric Web3 wallet that **unifies fragmented cross-chain liquidity** and **generates yield automatically**, while keeping assets **non-custodial**. The product goal is a “one-step” user experience: hide bridging, gas, and chain switching behind a single delegation signature and clear progress UX.
 
### **Target Users**
 
- **Web3 medium and advanced users**
 
### **MVP Chains (Frontend MVP scope)**
 
- **Yellow L3 + Ethereum + Base**
 
### **Value Proposition (PRD-consistent)**
 
- **For users**: one-time delegation, unified balance, automated “bear-yielding” experience, gasless Yellow L3 transactions, and one-step cross-chain actions.
- **For the protocol**: acts as a **Just-In-Time (JIT) solver** in the LI.FI marketplace, using protocol vault liquidity to capture spread and distribute yield.
- **Core innovation**: 
- **Core technologies**: **LI.FI (ERC-7683)** intents + **Yellow / Nitrolite (ERC-7824)** state channels for off-chain-speed settlement and real-time UX.
 
## **2. What the Frontend Is Responsible For**
 
The frontend is a **Non-custodial Aggregated Liquidity Orchestrator UI**:
 
- Makes common actions feel atomic (unify, send, withdraw) with step-by-step progress and safe failure states.
- Keeps the security boundary behind **one explicit EIP-712 delegation** and provides always-available **revocation** controls.
- Presents a **Unified Balance** per asset (with optional per-chain breakdown).
- Subscribes to **ClearNode WebSocket** updates (e.g., `bu`) to drive real-time balance/progress updates.
 
## **3. Technical Architecture Overview (3 layers)**
 
UXWallet operates across three distinct layers to provide an “Invisible Cross-Chain” experience.
 
### **Layer 1: Inbound Gateway (LI.FI / ERC-7683)**
 
- **Mechanism**: users **Unify** fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits.
- **Tech**: LI.FI SDK / Open Intent standard (ERC-7683) to bundle multi-chain deposits into a single logical step.
 
### **Layer 2: Settlement Engine (Yellow / ERC-7824 via Nitrolite)**
 
- **Mechanism**: once assets are in vaults, movement is virtualized; claims are updated via **Nitrolite State Channels**.
- **Tech**: off-chain liability exchange co-signed by the user’s **Persistent Session Key**; UI reflects state-channel-driven states.
 
### **Layer 3: Hybrid Exit Strategy (“Fast Exit Guarantee”)**
 
- **Mechanism**: if a user withdraws on a chain where the local vault is insufficient, the protocol triggers a **Hybrid / Sponsored Exit**.
- **Tech**: protocol treasury sponsors the LI.FI intent/bridge fee to pull liquidity from another chain, guaranteeing a fast exit without extra user fees.
 
## **4. Core Concepts & Security Model**
 
### **A. Delegation & Persistent Session Key (EIP-712)**
 
Users sign **one EIP-712 typed-data delegation** during onboarding. After delegation:
 
- Internal operations (rebalancing, solver fulfillment, state updates) must not require repeated wallet pop-ups.
- The session key is **scoped**: it can authorize **state updates within the vault network** as result of an intent order fulfillment (checking that the funds are delivered in the another chain smart contract vault by the intents protocol that the solver is working with), and must **not** authorize transfers to external addresses that not are related to an intents order being fulfilled.
- Delegation must be **auditable** in the UI (what was authorized, when) and **revocable** from Settings.
 
### **B. Execution Guard**
 
A smart contract safety layer ensuring vault funds are only released when:
 
1. A corresponding asset is confirmed arriving on another protocol-owned vault (atomic intent behavior), **or**
2. The owner explicitly signs an on-chain withdrawal.
 
### **C. Safety Net: Force Withdrawal**
 
If the backend/ClearNode is unavailable, users can present their last signed state update to the on-chain **Adjudicator** contract to claim funds.
 
## **5. Sub-Project Integration Guidelines**
 
### **Communication Matrix**
 
| From | To | Method |
| :---- | :---- | :---- |
| **Frontend** | **Backend / ClearNode** | WebSocket (e.g., `bu`) for real-time updates; RPC for state queries/handshake. |
| **Frontend** | **LI.FI** | LI.FI SDK for ERC-7683 intents + status tracking hooks for progress UX. |
| **Backend** | **Contracts** | Monitor events (deposits/withdrawals) & submit checkpoints/state where required. |
| **Contracts** | **Frontend/Backend** | Shared ABIs and contract addresses (deployment artifacts). |
 
### **Integration Standards**
 
1. **Shared environment**: maintain a root `.env.example` to synchronize chain IDs, RPC URLs, and API keys across folders.
2. **ABI synchronization**: after contract deployment, export ABIs to `frontend/src/abi` and `backend/src/abi`.
3. **State persistence**: backend should persist the latest signed Nitrolite state (e.g., PostgreSQL) to reduce user friction and support safe recovery flows.
 
## **6. MVP Phasing (PRD-aligned)**
 
- **Phase 0 (Foundation)**: connect + delegation (EIP-712), clear explanations, revoke in Settings, baseline error handling.
- **Phase 1 (Core wallet)**: unified balance + yield display; real-time updates via ClearNode WebSocket `bu`.
- **Phase 2 (Unification)**: “dust sweep” unify + add liquidity; intent progress tracking; safe, actionable failure states.
- **Phase 3 (Send / Withdraw)**: gasless Yellow L3 P2P send; cross-chain send; withdraw with “Direct Exit” vs “Sponsored Exit (Hybrid)” behavior.