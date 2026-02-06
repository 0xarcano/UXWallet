# Project Structure

```text
contracts/
├── src/
│   ├── core/
│   │   ├── UXVault.sol              # Multi-chain vault contract (deposit, withdraw, Force Withdrawal)
│   │   ├── SessionKeyRegistry.sol   # On-chain registry for Persistent Session Keys
│   │   ├── ExecutionGuard.sol       # Safety layer ensuring atomic fund release
│   │   └── Treasury.sol             # Protocol treasury for Hybrid Exit sponsorship
│   ├── settlement/
│   │   ├── Adjudicator.sol          # ERC-7824 Nitrolite state channel adjudicator
│   │   └── StateChannel.sol         # State channel logic and verification
│   ├── intents/
│   │   ├── LiFiIntentHandler.sol    # ERC-7683 intent handler for Unification flow
│   │   └── IntentValidator.sol      # Validate intent fulfillment and atomic arrival
│   ├── interfaces/
│   │   ├── IUXVault.sol
│   │   ├── IAdjudicator.sol
│   │   ├── ISessionKeyRegistry.sol
│   │   ├── IExecutionGuard.sol
│   │   ├── IDestinationSettler.sol  # ERC-7683 interface
│   │   └── IOriginSettler.sol       # ERC-7683 interface
│   └── libraries/
│       ├── SignatureVerification.sol # EIP-712 signature verification
│       ├── StateVerification.sol     # Nitrolite state verification
│       └── SafeTransfer.sol          # SafeERC20 wrapper
├── test/
│   ├── unit/
│   │   ├── UXVault.t.sol
│   │   ├── SessionKeyRegistry.t.sol
│   │   ├── ExecutionGuard.t.sol
│   │   └── Adjudicator.t.sol
│   ├── integration/
│   │   ├── UnificationFlow.t.sol     # Full unification intent flow
│   │   ├── WithdrawalFlow.t.sol      # Direct Exit vs Sponsored Exit
│   │   └── ForceWithdrawal.t.sol     # Force Withdrawal escape hatch
│   └── fuzz/
│       ├── ExecutionGuardFuzz.t.sol  # Fuzz test Execution Guard
│       └── InvariantTests.t.sol      # Invariant: totalVaultLiquidity ≥ totalUserClaims
├── script/
│   ├── Deploy.s.sol                  # Multi-chain deployment script
│   └── Config.s.sol                  # Chain-specific configuration
└── .context/                         # Context documentation
```

## Key Components Alignment with 3-Layer Architecture

### Layer 1: Inbound Gateway (LI.FI / ERC-7683)
- `intents/LiFiIntentHandler.sol`: Accepts and validates ERC-7683 intents for Unification.
- `intents/IntentValidator.sol`: Ensures atomic arrival of funds from source chains.

### Layer 2: Settlement Engine (Yellow / ERC-7824)
- `settlement/Adjudicator.sol`: Verifies Nitrolite state updates.
- `settlement/StateChannel.sol`: State channel logic for off-chain settlement.
- `core/SessionKeyRegistry.sol`: Manages Persistent Session Keys with scoped permissions.

### Layer 3: Hybrid Exit Strategy
- `core/Treasury.sol`: Sponsors LI.FI bridge fees for Hybrid Exits.
- `core/ExecutionGuard.sol`: Validates Direct Exit vs Sponsored Exit logic.
