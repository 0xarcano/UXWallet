# Testing Strategy

Full details in `../docs/architecture/coding-standards.md`.

## Unit & Component Tests (Jest + Testing Library)

- Test file lives next to source: `BalanceCard.tsx` → `BalanceCard.test.tsx` (or in `__tests__/` at same level).
- Test behavior, not implementation — query by role/text, not by test ID.
- Mock API calls with MSW (Mock Service Worker).
- Mock Wagmi hooks at the module level.

## E2E Tests (Maestro)

- Test critical user flows: onboarding, delegation, send, withdraw.
- Run against a dev build with mocked backend.
- Maestro YAML flows live in `e2e/` directory.

## Coverage Targets

| Category | Target |
|----------|--------|
| Hooks | 80%+ |
| Utility functions | 90%+ |
| Components | 70%+ (behavior-focused) |
| E2E critical flows | 100% of happy paths |
