# User Stories

## Contract-Specific User Stories

- As a user, I want to deposit assets into secure custody (Nitrolite Custody Contract) so they can be used in the Aggregated Liquidity Pool while remaining non-custodial.
- As a user, I want to withdraw my funds (principal + my 50% reward share) when I request withdrawal, with payout via Adjudicator/Custody; user funds are never used for owner withdrawals.
- As the protocol, I want to use Nitrolite (ERC-7824) state channels for off-chain state and Custody/Adjudicator for on-chain settlement (conclude / transfer).
- As a user, I want to revoke my Session Key (Yellow) or stop delegating so the Solver can no longer act on my behalf.
- As the protocol, I want the Flywheel Treasury to sponsor LiFi intent orders when the pool has no liquidity on the requested chain, so user transfers still complete.
- As a developer, I want the Execution Guard to ensure funds are released only on atomic intent fulfillment or explicit user withdrawal.
- As a user, I want a Force Withdrawal escape hatch: present my last signed state to the Adjudicator to claim funds if the backend is unavailable.
- As the protocol, I want Custody and Adjudicator to integrate with Yellow/Nitrolite for channel lifecycle and on-chain payout.

## Aligned with Flows (sequence-diagrams.md)

- Deposit: user locks funds in custody; channel setup; Session Key grant.
- Fulfill: Solver uses pool; Adjudicator/Custody pay out to intent user or third party.
- Withdraw: user gets principal + 50% rewards; Treasury gets 50%; only Treasury may be withdrawn by owners.
