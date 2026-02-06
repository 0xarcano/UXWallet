# Library Patterns

## OpenZeppelin Contracts (v5.0+)

| Library | Usage |
|---------|-------|
| **SafeERC20** | Mandatory for all token transfers; handles non-standard ERC20 tokens safely. |
| **ReentrancyGuard** | Use on all functions that release funds to prevent reentrancy attacks. |
| **AccessControl** | Role-based access control for protocol-level permissions (admin, operator, treasury). |
| **Pausable** | Emergency pause functionality for critical operations. |
| **ECDSA** | Signature verification for EIP-712 typed data (session keys, state updates). |
| **EIP712** | Domain separator and typed data hashing for delegation signatures. |
| **Ownable / Ownable2Step** | Use Ownable2Step for safer ownership transfers. |

## Custom Libraries for Flywheel

| Library | Purpose |
|---------|---------|
| **SignatureVerification.sol** | EIP-712 signature verification for Persistent Session Keys and state updates. |
| **StateVerification.sol** | Nitrolite (ERC-7824) state channel verification logic. |
| **SafeTransfer.sol** | SafeERC20 wrapper with additional Flywheel-specific checks. |

## ERC Standards

| Standard | Usage |
|----------|-------|
| **ERC-7683** | LI.FI intents standard for Unification flow; implement `IDestinationSettler` and `IOriginSettler` interfaces. |
| **ERC-7824** | Nitrolite state channels standard for off-chain settlement; implement Adjudicator logic. |
| **ERC-20** | Standard token interface; use SafeERC20 for interactions. |

## Integration Patterns

- **LI.FI SDK:** Use for creating and fulfilling ERC-7683 intents.
- **Yellow SDK:** Use for Nitrolite state channel management and signature verification.
- **Multi-chain RPC:** Abstract chain-specific differences (Phase 1: Sepolia, Arbitrum Sepolia; Phase 2: Ethereum mainnet, Arbitrum mainnet) behind common interfaces.

## Library Development Best Practices

- Keep libraries pure/stateless where possible.
- Use `internal` functions for library methods.
- Thoroughly test library functions with fuzz testing.
- Document expected inputs and error conditions in NatSpec.
