# System Design

## Architecture Overview

UXWallet smart contracts operate within a **3-layer technical architecture** to provide secure, non-custodial custody with off-chain-speed settlement:

### Layer 1: Inbound Gateway (LI.FI / ERC-7683)
- **Mechanism**: Users "Unify" fragmented assets from multiple chains into UXWallet Vaults via intent-based deposits.
- **Contract Role**: Validate and accept deposits from LI.FI intents (ERC-7683); Execution Guard ensures atomic arrival of funds.

### Layer 2: Settlement Engine (Yellow / ERC-7824 via Nitrolite)
- **Mechanism**: Once assets are in vaults, movements between the Yellow L3 is virtualized; claims are updated via Nitrolite State Channels.
- **Contract Role**: Adjudicator verifies off-chain state updates signed by user's Persistent Session Key + ClearNode; enforce state channel rules and finally requesting the settlement engine to register the "virtual" movement of the assets.

### Layer 3: Settlement Engine (Yellow / ERC-7824 via Nitrolite)
- **Mechanism**: Once a intent order is won by the JIT solver and the are secured by the LI.FI's intents protocol the solver is authorized to move the funds on-chain to fulfill the intent order and claim the funds to the new vault.
- **Contract Role**: Adjudicator verifies validity of the Persistent Session Key's involved in the intents order transaction fulfillment and verify that the LI.FI's protocol secured the funds of the order won by the solver before execute the transfer to the target external wallet.

### Layer 4: Hybrid Exit Strategy ("Fast Exit Guarantee")
- **Mechanism**: If a user withdraws on a chain where the local vault is insufficient, the protocol triggers a Hybrid / Sponsored Exit.
- **Contract Role**: Treasury contract sponsors LI.FI bridge fees; vault releases funds once bridge completes; Execution Guard validates.

## Core Contract Components

**Architecture:** Joint Custody via State Verification.

1. **UXVault**: Multi-chain vault contracts holding user assets; implements deposit, withdrawal, and Force Withdrawal.
2. **SessionKeyRegistry**: On-chain registry of Persistent Session Keys with expiry and scoped permissions.
3. **Adjudicator (ERC-7824)**: Validates Nitrolite off-chain state updates; verifies ECDSA signatures and state transitions; manages Force Withdrawal escape hatch.
4. **Execution Guard**: Safety module ensuring vault funds are only released when atomic counterpart is confirmed (arrival in another protocol vault OR explicit user signature).
5. **Treasury / Sponsorship Module**: Holds protocol funds to subsidize Hybrid Exits (sponsored withdrawals when local vault is dry).
6. **LI.FI Integration (ERC-7683)**: Interface contracts for accepting intents and validating fulfillment (Unification flow).

## Security Model

- **Non-custodial**: Users retain ultimate control via Force Withdrawal (present last signed state to Adjudicator).
- **Scoped delegation**: Persistent Session Keys can ONLY authorize state updates within vault network as result of intent fulfillment; CANNOT transfer to external addresses.
- **Atomic guarantees**: Execution Guard prevents fund release without confirmed counterpart arrival.
- **State verification**: Adjudicator validates all off-chain state updates (nonces, signatures, state transitions).
