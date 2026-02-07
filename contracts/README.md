# Flywheel Contracts (MVP)

This folder contains the on-chain MVP for:

1. User delegation with session keys.
2. Solver intent fulfillment with session-key spend caps.
3. Principal and treasury custody separation.
4. Nitro/Nitrolite settlement adapter calls.

## Contract Inventory

- `src/flywheel/FlywheelProtocol.sol`
  - Protocol facade that coordinates deposit, session-key registration, solver fills, Nitro calls, and treasury actions.
  - Intended on-chain entrypoint for app/backend.
- `src/onboard/SessionKeyRegistry.sol`
  - Session key registration, nonce replay protection, expiry.
  - Relayer flow via `registerSessionKeyWithSig`.
  - Per-token per-spend caps.
- `src/intents/IntentSettler.sol` (`IntentSettler` contract)
  - Intent entry (`open`, `openFor`).
  - Session key signature + cap enforcement in `openFor`.
  - Optional LI.FI submission via adapter.
- `src/intents/LifiAdapter.sol`
  - Optional external LI.FI call bridge.
- `src/flywheel/LPVault.sol`
  - User principal custody.
  - Router-only delegated deposit/withdraw (`depositFor`, `withdrawFor`).
- `src/flywheel/TreasuryVault.sol`
  - Treasury-only balances.
  - Reward distributor credit path.
  - Admin-only treasury withdrawal.
- `src/flywheel/NitroSettlementAdapter.sol`
  - Role-gated passthrough calls to Adjudicator/Custody.
- `src/mocks/MockERC20.sol`
  - Mintable ERC20 for test/dev networks.

## Workflow Mapping (Your 3 Diagrams)

### 1) User Delegates Assets + Session Key

On-chain calls:

1. User approves token to `LPVault`.
2. User calls:
   - `FlywheelProtocol.delegateAndRegister(asset, amount, receiver, req, tokens, caps, signature)`.
3. Protocol internally:
   - `LPVault.depositFor(user, asset, amount, receiver)`.
   - `SessionKeyRegistry.registerSessionKeyWithSig(req, tokens, caps, signature)`.
4. Settler is configured with registry:
   - `IntentSettler.setSessionKeyRegistry(registry)`.

Off-chain responsibilities:

- ClearNode/Nitrolite channel setup and lifecycle.
- Smart-account UX orchestration.

### 2) Solver Fulfills Intents + Registers Credits

On-chain calls:

1. Solver calls:
   - `FlywheelProtocol.fulfillIntent(order, signature, originFillerData)`.
2. Protocol forwards to:
   - `IntentSettler.openFor(...)`.
3. Settler enforces:
   - signer is user OR active session key.
   - per-spend cap from `SessionKeyRegistry`.
4. Optional LI.FI path:
   - `LifiAdapter.submit(lifiCalldata)` if configured in settler order data.
5. Treasury credit via protocol:
   - `FlywheelProtocol.creditTreasury(asset, amount)` ->
   - `TreasuryVault.creditTreasury(asset, amount)`.
6. Nitro settlement via protocol:
   - `FlywheelProtocol.settleViaAdjudicator(calldata)`.
   - `FlywheelProtocol.settleViaCustody(calldata)`.

Current MVP note:

- Reward/credit split accounting (50% user / 50% treasury) is currently off-chain.
- Treasury custody and withdrawal controls are on-chain.

### 3) User Withdrawal + Distribution

On-chain calls:

1. User withdraws principal:
   - `FlywheelProtocol.withdrawPrincipal(asset, amount, recipient)` ->
   - `LPVault.withdrawFor(user, asset, amount, recipient)`.
2. Treasury operator withdraws treasury funds:
   - `FlywheelProtocol.withdrawTreasury(asset, amount, to)` ->
   - `TreasuryVault.withdrawTreasury(asset, amount, to)`.

Safety boundary:

- User principal is isolated in `LPVault`.
- Treasury balances are isolated in `TreasuryVault`.
- Treasury withdrawal path does not debit user principal mappings.

## Required Role Wiring (for `FlywheelProtocol`)

Grant these roles before using facade functions in production:

1. `LPVault.ROUTER_ROLE` -> `FlywheelProtocol`
2. `TreasuryVault.REWARD_DISTRIBUTOR_ROLE` -> `FlywheelProtocol`
3. `TreasuryVault.TREASURY_ADMIN_ROLE` -> `FlywheelProtocol` (if treasury withdrawals are routed through protocol)
4. `NitroSettlementAdapter.SETTLER_ROLE` -> `FlywheelProtocol`
5. `FlywheelProtocol.SOLVER_ROLE` -> solver address(es)
6. `FlywheelProtocol.TREASURY_OPERATOR_ROLE` -> treasury operator address(es)

Optional:

- Keep direct lower-level calls if you do not want a facade path.

## End-to-End Test

Workflow test:

- `test/FlywheelWorkflow.t.sol`
- `testSolverAndRegister()`

Coverage:

1. Deposit + session key registration via protocol facade.
2. Solver fill via protocol facade and settler cap enforcement.
3. Treasury credit via protocol facade.
4. Nitro adapter calls via protocol facade.
5. User principal withdrawal and treasury withdrawal via protocol facade.

Run:

```bash
forge test --match-contract FlywheelWorkflowTest --offline
```

`--offline` is used as a local workaround for a Foundry networking/proxy panic on this machine; logic/results are unchanged.

## Scripts

- `script/SessionKeyRegistry.s.sol`: deploy registry.
- `script/DeployMockERC20.s.sol`: deploy + mint mock token.

Deploy examples:

```bash
source .env
forge script script/SessionKeyRegistry.s.sol:SessionKeyRegistryScript --rpc-url "$RPC_URL" --broadcast
forge script script/DeployMockERC20.s.sol:DeployMockERC20Script --rpc-url "$RPC_URL" --broadcast
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
