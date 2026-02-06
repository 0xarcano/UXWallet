# System Design

## Architecture Overview

Flywheel contracts provide **custody and settlement** for the aggregated liquidity protocol, aligned with **Yellow / Nitrolite (ERC-7824)**. User and Treasury assets are held in custody; settlement uses the Adjudicator (conclude / transfer). **User funds are always protected**; only Flywheel Treasury may be withdrawn by system owners.

**Source of truth for flows:** `../../.context/sequence-diagrams.md`

### Custody & State Channels (Nitrolite)

- **Custody Contract:** Holds deposited funds; channel creation, resize, close; final settlement releases funds per Adjudicator outcome.
- **Adjudicator (Nitro):** Validates off-chain state; executes `conclude` and `transfer` (or `concludeAndTransferAllAssets`) to pay out allocations on-chain.

### Pool Fulfillment

- **Pool fulfills:** Payout from pool via Custody/Adjudicator when pool has liquidity. LiFi components are mocked for MVP.

## Core Contract Components

1. **Custody Contract (Nitrolite):** Holds user and pool assets; channel lifecycle; integrates with Adjudicator for payouts.
2. **Adjudicator (ERC-7824):** Validates state; conclude / transfer for on-chain payout; Force Withdrawal escape hatch.
3. **Execution Guard:** Funds released only on atomic intent fulfillment or explicit user withdrawal.
4. **Flywheel Treasury:** Separate from user funds; 50% of rewards; only Treasury may be withdrawn by system owners.

## Security Model

- **Non-custodial:** Force Withdrawal via last signed state to Adjudicator.
- **Session Key (Yellow):** Scoped (app, allowances, expiry); authorizes Solver to fulfill intents only.
- **User funds protected:** Never used for owner withdrawals; only Treasury is withdrawable by owners.
