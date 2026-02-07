# Git Workflow

Full details in `../docs/architecture/coding-standards.md`.

## Branch Naming

```
feat/ui-<component-or-feature>    # New feature
fix/ui-<description>              # Bug fix
refactor/ui-<description>         # Code refactoring
docs/ui-<description>             # Documentation only
```

Examples: `feat/ui-delegation-modal`, `fix/ui-balance-formatting`, `refactor/ui-hook-structure`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(delegation): add EIP-712 signing flow
fix(balance): handle zero-balance display correctly
refactor(hooks): extract WebSocket reconnect logic
test(withdrawal): add status polling tests
```

Scopes: `delegation`, `balance`, `send`, `withdraw`, `onboarding`, `hooks`, `home`, `settings`.

## Pre-Commit Hooks

Enforced via `husky` + `lint-staged`:
- `*.{ts,tsx}` → `eslint --fix` + `prettier --write`
- `*.{json,md}` → `prettier --write`

## Pull Request Rules

- One feature/fix per PR.
- PR title follows conventional commit format.
- Description includes: Summary, Test plan, Screenshots (for UI changes).
- Must pass CI (lint + type check + tests) before merge.
- Squash merge to keep history clean.
