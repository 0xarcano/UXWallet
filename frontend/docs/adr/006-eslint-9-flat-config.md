# ADR-006: ESLint 9 Flat Config

## Status

Accepted

## Context

`coding-standards.md` specifies ESLint 9 with flat config format. The `eslint-config-expo` package exports a `/flat` configuration compatible with ESLint 9's `eslint.config.js` format. Expo SDK 52 ships with ESLint 8 by default, so Expo Doctor may emit a version mismatch warning — this is cosmetic and resolves with SDK 53+.

## Decision

Use ESLint 9 with flat config (`eslint.config.js`) and `eslint-config-expo/flat` as the base configuration.

## Consequences

- **Positive:** Modern, forward-looking config format
- **Positive:** Better composability of rule sets
- **Positive:** Aligns with `coding-standards.md` specification
- **Negative:** Expo Doctor may warn about ESLint version mismatch for SDK 52 (cosmetic only)
- **Negative:** Resolves naturally with SDK 53+ upgrade
