# Database Schema (On-Chain State)

## Custody / Vault Contract

| Mapping / State | Description |
|-----------------|-------------|
| `mapping(address => UserState) private userStates` | Per-user state: balance, nonce, last checkpoint hash (for Nitrolite state channel). |
| `mapping(bytes32 => bool) private processedCheckpoints` | Track processed checkpoints to prevent replay attacks. |
| `mapping(address => uint256) public totalVaultLiquidity` | Total physical liquidity per token in this vault (for inventory health checks). |
| `uint256 public totalUserClaims` | Sum of all user claims (invariant: totalVaultLiquidity ≥ totalUserClaims). |

## SessionKeyRegistry Contract

| Mapping / State | Description |
|-----------------|-------------|
| `mapping(address => SessionKey) public sessionKeys` | Owner address => Persistent Session Key struct (key address, expiry, permission bits). |
| `mapping(address => bool) public revokedKeys` | Track revoked session keys for instant on-chain revocation. |

## Treasury / Sponsorship Module

| Mapping / State | Description |
|-----------------|-------------|
| `mapping(address => uint256) public treasuryBalances` | Protocol treasury balances per token. |
| `uint256 public sponsoredExitCount` | Counter for exit-related analytics (reserved for future use). |

## Adjudicator Contract (ERC-7824)

| Mapping / State | Description |
|-----------------|-------------|
| `mapping(bytes32 => StateChannel) private channels` | State channel ID => channel state (participants, nonce, latest state root). |
| `mapping(bytes32 => uint256) public finalizedStates` | Track finalized state channel states (for Force Withdrawal). |

## Key Invariants

- **Solvency**: `totalVaultLiquidity ≥ totalUserClaims` across all tokens and chains.
- **Session Key Scope**: Session keys can only sign state updates, not direct transfers to external addresses (enforced by Execution Guard).
- **State Monotonicity**: State channel nonces must strictly increase; no replay or rollback attacks.
