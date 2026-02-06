# User Stories

## Contract-Specific User Stories

- As a user, I want to deposit my assets into a secure UXVault so they can be used for yield-bearing solver activities while remaining non-custodial.
- As a user, I want to withdraw my funds instantly (Direct Exit) if I provide a valid off-chain Nitrolite state proof and the local vault has sufficient liquidity.
- As a protocol, I want to rebalance assets across chains using Nitrolite (ERC-7824) state channels for off-chain register of the new chain location of the users liquidity.
- As a user, I want to revoke my Persistent Session Key instantly on-chain in case of a backend breach or security concern.
- As a protocol, I want to use the Treasury to subsidize a withdrawal fee (Hybrid Exit / Sponsored Exit) if local liquidity is missing, guaranteeing a "Fast Exit" for users.
- As a developer, I want to ensure the Execution Guard prevents assets from leaving the vault without an atomic counterpart (either confirmed arrival in another protocol vault OR explicit user signature).
- As a user, I want a Force Withdrawal escape hatch that allows me to claim funds by presenting my last signed state update to the Adjudicator contract, bypassing the backend if it's unavailable.
- As a protocol, I want to integrate with LI.FI (ERC-7683) intents for the Unification flow, ensuring atomic arrival of funds from multiple source chains.

## Aligned with Frontend User Stories

- US-01: Support one-time delegation (EIP-712) via SessionKeyRegistry with scoped permissions and revocation capability.
- US-02: Enforce invariants that enable "Unified Balance" (total vault assets ≥ total user claims).
- US-03: Support Unification intents (ERC-7683) with Execution Guard ensuring atomic behavior.
- US-04: Implement "Fast Exit Guarantee" logic (Direct Exit vs Sponsored Exit based on vault liquidity).
- US-05: Enable gasless Yellow L3 P2P transfers via Nitrolite state channel updates (off-chain).
- US-06: Support cross-chain transfers with Execution Guard validation.
