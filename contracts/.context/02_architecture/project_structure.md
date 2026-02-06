# Project Structure

```text
contracts/
├── src/
│   ├── core/
│   │   ├── UXVault.sol              # Custody / vault (Nitrolite): deposit, withdraw, Force Withdrawal
│   │   ├── SessionKeyRegistry.sol   # On-chain registry for Session Keys (if used on-chain)
│   │   ├── ExecutionGuard.sol        # Safety layer: release only on intent fulfillment or user withdrawal
│   │   └── Treasury.sol              # Flywheel Treasury (50% rewards; owner withdrawal only)
│   ├── settlement/
│   │   ├── Adjudicator.sol           # ERC-7824 Nitrolite adjudicator (conclude / transfer)
│   │   └── StateChannel.sol          # State channel logic and verification
│   ├── intents/
│   │   ├── LiFiIntentHandler.sol     # LiFi intent handling when pool cannot fulfill (Phase 2)
│   │   └── IntentValidator.sol      # Validate intent fulfillment and atomic arrival
│   ├── interfaces/
│   │   ├── IUXVault.sol
│   │   ├── IAdjudicator.sol
│   │   ├── ISessionKeyRegistry.sol
│   │   ├── IExecutionGuard.sol
│   │   ├── IDestinationSettler.sol   # ERC-7683
│   │   └── IOriginSettler.sol        # ERC-7683
│   └── libraries/
│       ├── SignatureVerification.sol
│       ├── StateVerification.sol
│       └── SafeTransfer.sol
├── test/
│   ├── unit/
│   │   ├── UXVault.t.sol
│   │   ├── SessionKeyRegistry.t.sol
│   │   ├── ExecutionGuard.t.sol
│   │   └── Adjudicator.t.sol
│   ├── integration/
│   │   ├── UnificationFlow.t.sol
│   │   ├── WithdrawalFlow.t.sol
│   │   └── ForceWithdrawal.t.sol
│   └── fuzz/
│       ├── ExecutionGuardFuzz.t.sol
│       └── InvariantTests.t.sol
├── script/
│   ├── Deploy.s.sol                  # Phase 1: Sepolia, Arbitrum Sepolia; Phase 2: mainnet
│   └── Config.s.sol
└── .context/
```

## Alignment with sequence-diagrams.md

- **Custody (Nitrolite):** Holds user and pool assets; channel lifecycle; integrates with Adjudicator for payouts.
- **Adjudicator:** Validates state; conclude / transfer for on-chain payout; Force Withdrawal.
- **Treasury:** Flywheel Treasury; 50% of rewards; only Treasury withdrawable by owners; user funds protected.
- **Execution Guard:** Release only on atomic intent fulfillment or explicit user withdrawal.
- **LiFi (Phase 2):** When pool cannot fulfill; intent orders funded from pool on source chains or Treasury-sponsored.
