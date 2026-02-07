# ADR-005: Package Manager (pnpm)

## Status

Accepted

## Context

The backend sub-project already uses pnpm. `CLAUDE.md` references `pnpm run lint` and `pnpm run test`. Using a different package manager in the frontend would create inconsistency and confusion across the monorepo.

## Decision

Use pnpm as the package manager for the frontend sub-project.

## Consequences

- **Positive:** Consistency with the backend sub-project
- **Positive:** Faster installs and stricter dependency resolution than npm
- **Positive:** Shared developer experience across the monorepo
- **Negative:** Some Expo community examples and tutorials assume npm or yarn
