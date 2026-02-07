# ADR-001: Scaffolding Strategy

## Status

Accepted

## Context

The `frontend/` directory already contains documentation (`docs/`, `.context/`, `CLAUDE.md`), reference files, assets, and scripts. `create-expo-app` expects an empty target directory and will refuse to scaffold into a non-empty one. We need the official Expo SDK 52 boilerplate (correct dependency versions, `app.json`, `package.json`, `tsconfig.json`, `app/_layout.tsx` with expo-router) while preserving our existing files.

## Decision

Use `create-expo-app --template default@sdk-52` in a temporary directory, then merge the generated files into the existing `frontend/` directory. Specifically:

1. Scaffold to a temp directory
2. Copy `package.json`, `app.json`, `tsconfig.json`, `app/`, `babel.config.js`, `metro.config.js`, `.gitignore`, and `assets/` contents into `frontend/`
3. Customize copied files (rename, add scripts, configure for our project)
4. Clean up the temp directory

## Consequences

- **Positive:** Official Expo version pins, working app baseline, correct expo-router file structure
- **Positive:** Preserves all existing documentation and configuration files
- **Negative:** One extra merge step during bootstrap (one-time cost)
