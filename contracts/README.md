# Contracts

Minimal Foundry workspace for Flywheel MVP contracts.

## Core Contracts

- `src/onboard/SessionKeyRegistry.sol`: session key registration, caps, expiry, relayer flow (`registerSessionKeyWithSig`).
- `src/FlywheelSettler.sol`: intent entrypoint (`open/openFor`) + session key cap checks.
- `src/LifiAdapter.sol`: optional adapter for LI.FI execution path.
- `src/flywheel/LPVault.sol`: user principal custody.
- `src/flywheel/TreasuryVault.sol`: treasury-only balances and owner withdrawals.
- `src/flywheel/CreditLedger.sol`: intent accounting + reward split (50% user / 50% treasury).
- `src/flywheel/WithdrawalRouter.sol`: principal + rewards withdrawal path.
- `src/flywheel/NitroSettlementAdapter.sol`: role-gated Nitrolite/Nitro call adapter.

## Scripts

- `script/SessionKeyRegistry.s.sol`: deploy `SessionKeyRegistry`.
- `script/DeployMockERC20.s.sol`: deploy and mint a mock ERC20.

## Quickstart

```bash
forge build
forge test
```

## .env Example

```bash
PRIVATE_KEY=0x...
RPC_URL=https://...
ETHERSCAN_API_KEY=...

TOKEN_NAME="Mock USDC"
TOKEN_SYMBOL=mUSDC
MINT_TO=0x...
MINT_AMOUNT=1000000000000000000000
```

## Deploy Commands

Deploy SessionKeyRegistry:

```bash
source .env
forge script script/SessionKeyRegistry.s.sol:SessionKeyRegistryScript --rpc-url "$RPC_URL" --broadcast
```

Deploy Mock ERC20 + mint:

```bash
source .env
forge script script/DeployMockERC20.s.sol:DeployMockERC20Script --rpc-url "$RPC_URL" --broadcast
```

## Notes

- Contracts are chain-local. Deploy the stack per chain where you enforce permissions/settlement.
- Keep user principal (`LPVault`) and treasury funds (`TreasuryVault`) separated.
- Rotate compromised private keys immediately.
