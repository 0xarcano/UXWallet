# Domain Glossary

| Term | Definition |
|------|------------|
| **UXVault** | The on-chain vault contract holding user assets across multiple chains (Yellow L3, Ethereum, Base for MVP). |
| **Persistent Session Key** | Session-scoped key created via one-time EIP-712 delegation; can only authorize state updates within the vault network as result of intent order fulfillment, NOT transfers to external addresses. |
| **Checkpoint** | An on-chain proof of off-chain state (Nitrolite state channel state). |
| **Force Withdrawal** | An escape hatch for users to claim funds without protocol permission by presenting their last signed state update to the Adjudicator contract. |
| **SessionKeyRegistry** | On-chain mapping of Owner => Persistent Session Key with expiry timestamp and permission scopes. |
| **Execution Guard** | Smart contract safety layer ensuring vault funds are only released when: (1) a corresponding asset is confirmed arriving on another protocol-owned vault (atomic intent behavior), OR (2) the owner explicitly signs an on-chain withdrawal. |
| **Sponsorship Module / Treasury** | Contract logic for the protocol treasury to subsidize LI.FI bridge fees during "Hybrid Exits / Sponsored Exits" when local vault liquidity is insufficient. |
| **Adjudicator** | The ERC-7824 contract verifying Nitrolite off-chain state updates and managing Force Withdrawal escape hatch. |
| **Unified Balance** | A single aggregated per-asset balance (represented off-chain, enforced by on-chain vault invariants). |
| **Hybrid Exit / Sponsored Exit** | Withdrawal mode where the protocol treasury sponsors LI.FI bridge fees when the local vault lacks sufficient liquidity. |
| **Direct Exit** | Withdrawal mode where the local vault has sufficient liquidity; processed instantly via state channel close. |
| **ERC-7683 Intent** | Standard for cross-chain intents used by LI.FI for the Unification flow. |
| **ERC-7824 State Channel** | Standard for Nitrolite state channels used for off-chain-speed settlement. |
