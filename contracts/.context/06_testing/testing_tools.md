# Testing Tools

## Primary Testing Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **Forge (Foundry)** | Unit, fuzz, and integration testing | `forge test` for all test types; `forge test --gas-report` for gas profiling. |
| **Slither** | Static analysis for common vulnerabilities | Run on all contracts; address all medium+ severity findings before deployment. |
| **Echidna** | Property-based fuzzing and invariant testing | Use for continuous invariant checking (solvency, session key scope, state monotonicity). |

## Additional Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **Foundry Gas Snapshots** | Track gas cost changes over time | `forge snapshot` to create baseline; monitor regressions. |
| **Foundry Coverage** | Measure test coverage | `forge coverage` to ensure 100% branch coverage for critical contracts. |
| **Mythril** | Symbolic execution for vulnerability detection | Optional: run on critical functions (Execution Guard, withdrawal logic). |
| **Manticore** | Symbolic execution and formal verification | Optional: use for formal verification of critical invariants. |

## Testing Workflow

1. **Unit Tests:** `forge test` - fast feedback on individual functions.
2. **Fuzz Tests:** `forge test --fuzz-runs 10000` - test edge cases and random inputs.
3. **Invariant Tests:** `echidna` - continuous property checking (run overnight or in CI).
4. **Static Analysis:** `slither .` - detect common vulnerabilities.
5. **Gas Profiling:** `forge test --gas-report` - optimize hot paths.
6. **Coverage:** `forge coverage` - ensure comprehensive test coverage.

## CI/CD Integration

- Run `forge test` in CI on every commit.
- Run `slither` in CI; fail build if medium+ severity findings.
- Run fuzz tests with high iteration count (10000+) in nightly CI.
- Run invariant tests (Echidna) in nightly CI or pre-deployment.

## Pre-Deployment Checklist

- [ ] All Forge tests passing (unit, fuzz, integration).
- [ ] 100% branch coverage for critical contracts.
- [ ] Slither clean (no medium+ severity issues).
- [ ] Invariant tests passing (Echidna).
- [ ] Gas costs within acceptable ranges.
- [ ] External audit completed and findings addressed.
- [ ] Deployment scripts tested on testnets.
- [ ] Emergency procedures documented and tested.
