# Git Workflow

## Branch Naming

- **Feature branches:** `feat/contract-name` (e.g., `feat/ux-vault`, `feat/execution-guard`).
- **Bugfix branches:** `fix/issue-description` (e.g., `fix/session-key-validation`).
- **Testing branches:** `test/test-name` (e.g., `test/invariant-solvency`).

## Commit Guidelines

- Use descriptive commit messages following conventional commits format.
- Reference related user stories or issues where applicable.

## Pull Request Requirements

- **CI:** Mandatory CI passing for all Foundry tests (unit, fuzz, invariant).
- **Coverage:** Maintain 100% branch coverage for critical contracts.
- **Static Analysis:** Slither must pass with no medium+ severity issues.
- **Code Review:** Require at least one approval from another smart contract engineer.
- **Testing:** All new code must include comprehensive tests.

## Deployment Workflow

- **Feature branches → dev:** Merge after CI passes and code review.
- **dev → staging:** Deploy to testnet for integration testing.
- **staging → main:** Deploy to mainnet after external audit and final approval.
