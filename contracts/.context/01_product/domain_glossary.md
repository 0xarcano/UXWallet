# Domain Glossary

| Term | Definition |
|------|------------|
| **Aggregated Liquidity Pool** | Pool of user-delegated assets plus Flywheel Treasury; used by the Flywheel Solver to fulfill intents when liquidity is available. |
| **Custody Contract (Nitrolite)** | ERC-7824 / Yellow contract that holds deposited funds, manages channel creation/resize/close, and releases funds on final settlement (with Adjudicator). |
| **Adjudicator (Nitro)** | ERC-7824 contract that validates off-chain state and executes `conclude` / `transfer` (or `concludeAndTransferAllAssets`) to pay out allocations on-chain. |
| **Session Key (Yellow)** | App-scoped key created via one-time EIP-712 delegation; allows the Flywheel Solver to fulfill intents without repeated user signatures (allowances, expires_at). |
| **Force Withdrawal** | Escape hatch: user presents last signed state to the Adjudicator to claim funds without protocol cooperation. |
| **Execution Guard** | Logic ensuring funds are released only when (1) corresponding asset is confirmed (intent fulfillment) or (2) owner explicitly signs on-chain withdrawal. |
| **Flywheel Treasury** | Protocol treasury receiving 50% of intent-fulfillment rewards; part of pool liquidity; only Treasury may be withdrawn by system owners—never user funds. |
| **Unified Balance** | Single aggregated per-asset balance (off-chain ledger, backed by on-chain custody). |
| **ERC-7824** | State channel standard used by Nitrolite / Yellow. |

**Source of truth for flows:** `../../.context/sequence-diagrams.md`
