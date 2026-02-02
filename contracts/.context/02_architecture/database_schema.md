# Database Schema

| Mapping | Description |
|---------|-------------|
| `mapping(address => UserState)` | userStates |
| `mapping(bytes32 => bool)` | processedCheckpoints |
| `mapping(address => uint256)` | totalVaultLiquidity |
| `mapping(address => SessionKey) public registries` | Session key registry. |
| `mapping(address => uint256) public treasuryBalances` | Sponsorship funds. |
