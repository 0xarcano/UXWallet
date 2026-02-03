# **UXWallet: General Project Context**

**The Autonomous Cross-Chain Liquidity & Settlement Layer**

## **1\. Vision & Product Perspective**

UXWallet is the real Web3 wallet, fueled by a novel **Liquidity protocol** that transforms fragmented liquidity into a UX-centric wallet with a single, virtualized **Unified Balance** that is chain-agnostic, gasless and yield-bearing.

### **The Value Proposition**

* **For the User:** "Set and Forget." A one-time delegation and get a real web3 wallet; UX-centric, non-custodial, cross-chain, bear-yielding plus gasless transactions within the Yellow L3.
* **For the Protocol:** Captures the "Spread" in the LI.FI Marketplace by acting as a Just-In-Time (JIT) solver using aggregated community liquidity.
* **The Innovation:** The integration of **LI.FI (ERC-7683)** for intent-based on-boarding and **Yellow Network (ERC-7824)** for millisecond off-chain settlement.

## 

## **2\. Technical Architecture Overview**

UXWallet operates across three distinct layers to provide a seamless "Invisible Cross-Chain" experience.

### **Layer 1: The Inbound Gateway (LI.FI / ERC-7683)**

* **Mechanism:** Users "Unify" their assets from multiple chains (e.g., Base, Arbitrum, Ethereum) into UXWallet Vaults.  
* **Tech:** Uses LI.FI's Open Intent standard to bundle multi-chain deposits into a single logical step.

### **Layer 2: The Settlement Engine (Yellow / ERC-7824)**

* **Mechanism:** Once assets are in the vault, their movement is "virtualized." Claims are updated via **Nitrolite State Channels**.  
* **Tech:** High-frequency, off-chain liability exchange co-signed by the user's **Persistent Session Key**.

### **Layer 3: The Hybrid Exit Strategy**

* **Mechanism:** If a user withdraws from a chain where the local vault is empty, the protocol triggers a **Hybrid Withdrawal**.  
* **Tech:** The protocol treasury sponsors a LI.FI intent fee to pull liquidity from another chain, guaranteeing the user a "Fast Exit" without the bridge tax.

## 

## **3\. The Core Innovations**

### **A. Persistent Session Keys (EIP-712)**

Users sign a one-time delegation during onboarding. This session key is stored/managed by the Backend (KMS) to authorize internal rebalancing and solver-fulfillment updates without requiring a wallet pop-up for every trade.

### 

### **B. Execution Guard**

A smart contract safety layer that ensures the vault only releases funds to a third party if:

1. A corresponding asset is confirmed arriving on another protocol-owned vault (Atomic Intent).  
2. OR, the owner explicitly signed an on-chain withdrawal.

### 

### **C. The Economic Flywheel**

* **Revenue:** 50% to User Yield and 50% to the UXWallet treasury. The UXWallet treasury will reserve 30% for Rebalancing Reserve (Sponsorship Fund), 30% to $YELLOW staking (Gasless Credits), 20% Ops.

## **4\. Sub-Project Integration Guidelines**

### **Communication Matrix**

| From | To | Method |
| :---- | :---- | :---- |
| **Frontend** | **Backend** | Nitrolite RPC for session handshake & state queries. |
| **Backend** | **Contracts** | Monitoring events (Deposits) & submitting Checkpoints. |
| **Contracts** | **Frontend/Backend** | Shared ABIs and Contract Addresses (Deployment Artifacts). |

### **Integration Standards**

1. **Shared Environment:** Maintain a root .env.example to synchronize Chain IDs, RPC URLs, and API Keys across all folders.  
2. **ABI Synchronization:** After contract deployment, ABIs must be exported to frontend/src/abi and backend/src/abi.  
3. **State Persistence:** The Backend must implement a redundant storage layer (PostgreSQL) for the latest signed Nitrolite state; this is the only way for users to avoid a "Challenge Period" during withdrawal.

## 

## **5\. Security & Safety Net**

* **Force Withdrawal:** If the Backend/ClearNode goes offline, users can present their last signed state update directly to the on-chain **Adjudicator** contract to claim funds.  
* **Scoped Permissions:** Session keys are cryptographically restricted. They can only authorize state updates within the protocol's vault network—they cannot transfer funds to external "burner" addresses.

## **6\. Development Workflow (Iterative)**

1. **Stage 1:** Deploy UXVault and Adjudicator. Establish "Physical" liquidity.  
2. **Stage 2:** Implement the Nitrolite RPC and Session Key delegation. Enable "Virtual" rebalancing.  
3. **Stage 3:** Connect the Solver Engine to LI.FI Marketplace. Start generating "Yield."  
4. **Stage 4:** Implement the Hybrid Exit sponsorship logic in the Treasury contract.