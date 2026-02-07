# Stack Security

Full details in `../docs/architecture/security.md`.

## Session Key Storage

| Data | Storage | Encrypted |
|------|---------|-----------|
| Session Key address | `expo-secure-store` | Yes (OS keychain) |
| Delegation scope | `expo-secure-store` | Yes |
| Delegation expiry | `expo-secure-store` | Yes |
| Delegation status | `expo-secure-store` | Yes |
| User preferences | `AsyncStorage` | No |
| Onboarding progress | `AsyncStorage` | No |
| TanStack Query cache | In-memory only | N/A |

## Rules

- Never store the EIP-712 `signature` field after successful registration — the backend persists it.
- Clear SecureStore data on wallet disconnect.
- Treat `sessionKeyAddress` as sensitive (store in SecureStore, not AsyncStorage).
- Use EIP-712 signed typed data for all Nitrolite interactions.
- Session keys are enforced on-chain via `SessionKeyRegistry` (per-token spend caps, expiry, revocation). The frontend does not bypass these limits — the backend and contracts enforce them together.

## Runtime Security

- Prevent screenshots on delegation and transaction confirmation screens (iOS: `UIScreen.main.isCaptured`, Android: `FLAG_SECURE`).
- Redact balance amounts in app switcher/recent apps view.
- **Development:** Log API requests/responses (without signatures).
- **Production:** Log only errors and anonymized metrics.
- **Never log:** Private keys, signatures, full addresses, SecureStore contents.

## Dependency Security

- Pin dependency versions with `~` (patch updates only).
- Run `npm audit` as part of CI pipeline.
- Review `@reown/appkit` and `wagmi` changelogs before upgrading (wallet security-critical).
- Avoid dependencies with native code unless from trusted sources (Expo ecosystem preferred).

## Delegation Scope Communication

Required UI elements on the delegation screen:
- Scope badge showing the `scope` value.
- Per-asset allowance amounts in human-readable format.
- Human-readable expiration date/time.
- Clear explanation: what the Solver can and cannot do.
- Revocation note: "You can revoke at any time from Settings."
