# ADR-007: Dark-First Theme

## Status

Accepted

## Context

The brand design tokens define a dark color palette: background `#0F172A`, card `#1E293B`, text `#F8FAFC`. `app.json` sets `userInterfaceStyle: "dark"`. Dark themes are the convention for crypto wallet applications and align with user expectations in this space.

## Decision

Dark mode is the primary and only theme for Phase 1. `app.json` is configured with `userInterfaceStyle: "dark"`. All brand tokens target dark backgrounds. Light mode is deferred to a future phase.

## Consequences

- **Positive:** Focused styling effort — one theme to build and test
- **Positive:** Consistent with crypto wallet conventions and user expectations
- **Positive:** Simplifies component development (no theme switching logic)
- **Negative:** Light mode requires future work (new token set, theme toggle, component updates)
