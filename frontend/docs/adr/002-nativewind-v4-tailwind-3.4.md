# ADR-002: NativeWind v4 + TailwindCSS 3.4

## Status

Accepted

## Context

The `tech-stack.md` specification calls for NativeWind 4.x. NativeWind v5 targets Expo SDK 54 + Reanimated v4, both of which are still in preview. We need a stable, well-documented styling solution for our Expo SDK 52 project.

## Decision

Use NativeWind ~4.1 with TailwindCSS ~3.4. This is the stable, proven combination for Expo SDK 52 with the most community support and documentation.

## Consequences

- **Positive:** Stable and battle-tested with Expo SDK 52
- **Positive:** Extensive community support and examples
- **Positive:** TailwindCSS 3.4 config format is well understood
- **Negative:** Will require migration to NativeWind v5 + TailwindCSS v4 when upgrading to Expo SDK 54+
