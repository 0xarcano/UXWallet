# Mobile Security Guidelines

> Security model for the Flywheel Wallet — a non-custodial React Native (Expo) application.

## Core Principle: Non-Custodial

The Flywheel Wallet **never holds, stores, or transmits private keys**. All cryptographic signing happens in the user's external wallet app (e.g., MetaMask, Rainbow) via WalletConnect. The app is a delegation manager and balance viewer — not a key custodian.

---

## 1. Key & Signature Management

### What the App NEVER Does

- Store private keys or seed phrases
- Generate wallets or key material
- Sign transactions directly
- Request raw private key export
- Log signatures or key material (even in debug builds)

### What the App DOES

- Request EIP-712 typed-data signatures via WalletConnect (delegation only)
- Store **Session Key metadata** (scope, expiry, status) — never the raw signature
- Provide clear UI for delegation revocation

### Session Key Storage

| Data | Storage | Encrypted | Rationale |
|------|---------|-----------|-----------|
| Session Key address | `expo-secure-store` | Yes (OS keychain) | Identity-linked, used for API calls |
| Delegation scope | `expo-secure-store` | Yes | Sensitive authorization data |
| Delegation expiry | `expo-secure-store` | Yes | Determines when re-delegation is needed |
| Delegation status (ACTIVE/REVOKED) | `expo-secure-store` | Yes | Controls app behavior |
| User preferences (theme, etc.) | `AsyncStorage` | No | Non-sensitive |
| Onboarding progress | `AsyncStorage` | No | Non-sensitive |
| TanStack Query cache | In-memory only | N/A | Ephemeral, lost on app restart |

### Rules

- Never store the EIP-712 `signature` field after successful registration — the backend persists it
- Clear SecureStore data on wallet disconnect
- Treat `sessionKeyAddress` as sensitive (store in SecureStore, not AsyncStorage)

---

## 2. Storage Boundaries

### `expo-secure-store` (Encrypted)

Backed by iOS Keychain / Android Keystore. Use for:

- Session Key metadata (address, scope, expiry, status)
- Any tokens or session identifiers if added in the future
- Backend API tokens (if authentication is introduced)

**Limits:** 2048 bytes per key on iOS. Store structured data as compact JSON.

### `@react-native-async-storage/async-storage` (Unencrypted)

Use for:

- User preferences (theme, language)
- Onboarding completion flags
- Non-sensitive UI state (last viewed tab, etc.)

**Never store:** Addresses, signatures, tokens, or any data that could identify or impersonate the user.

### In-Memory Only

- TanStack Query cache (balances, sessions, keys)
- WebSocket connection state
- Form state (React Hook Form)
- Navigation state

---

## 3. Input Validation

Mirror the backend Zod schemas client-side to reject invalid input before network requests.

### Validation Schemas (Client-Side)

```typescript
// Must match backend/src/utils/validation.ts exactly

const ethereumAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address');
const uint256String = z.string().regex(/^\d+$/, 'Invalid amount');
const chainId = z.number().int().positive();
const hexString = z.string().regex(/^0x[a-fA-F0-9]*$/, 'Invalid hex');
```

### Form Validation Rules

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Recipient address | `ethereumAddress` regex | "Enter a valid Ethereum address" |
| Send amount | `uint256String` + ≤ balance | "Amount exceeds your balance" |
| Withdrawal amount | `uint256String` + ≤ balance + > 0 | "Enter a valid amount" |
| Chain selection | Must be in supported chain list | "Unsupported chain" |

### Defense Against Malformed Data

- Validate all API responses before rendering (runtime type checks)
- Never use `JSON.parse` on untrusted data without try/catch
- Sanitize addresses to lowercase before comparison
- Never use `eval()`, `new Function()`, or dynamic code execution

---

## 4. Network Security

### Transport

| Environment | Protocol | Certificate |
|-------------|----------|-------------|
| Development | HTTP / WS | Self-signed OK |
| Production | HTTPS / WSS | Valid TLS certificate required |

### API Communication

- All REST calls go through a single typed HTTP client (`src/lib/api/client.ts`)
- The client adds `Content-Type: application/json` and `X-Request-Id` headers
- Never embed secrets (API keys, tokens) in the client bundle
- `EXPO_PUBLIC_*` env vars are compile-time embedded — they must not contain secrets

### WebSocket Security

- Use `wss://` in production
- Validate all incoming WS messages against expected shape before processing
- Drop malformed messages silently (log in dev only)
- Reconnect with exponential backoff (1s → 2s → 4s → 8s → max 30s)
- Re-subscribe after reconnect; fetch fresh balances to catch missed events

### Certificate Pinning (Consideration)

For Phase 2 production deployment, consider certificate pinning for:
- Backend API domain
- WebSocket endpoint

This prevents MITM attacks on compromised devices. Implementation via `expo-ssl-pinning` or React Native's built-in TrustKit integration.

---

## 5. Deep Link Security

expo-router supports deep links (`flywheel://` scheme). Security rules:

### Route Validation

- Only allow navigation to known routes defined in `app/`
- Reject deep links with unexpected query parameters
- Never auto-execute transactions from deep links

### Transaction Safety

- Deep links may navigate to a send/withdraw screen with pre-filled data
- The user **must always explicitly confirm** the transaction
- Display a warning banner when a screen was opened via deep link: "This was opened from an external link. Verify the details."

### Phishing Prevention

- Do not follow URLs embedded in deep link parameters
- Do not display external content (iframes, web views) from deep link data
- Validate that `userAddress` in deep link params matches the connected wallet

---

## 6. Delegation Scope Communication

The delegation flow is the single most security-critical UX in the app. The user must clearly understand what they are authorizing.

### Required UI Elements on Delegation Screen

| Element | Content |
|---------|---------|
| **Title** | "Authorize Flywheel Solver" |
| **Scope badge** | Shows the `scope` value (e.g., "liquidity") |
| **Allowance list** | Per-asset allowance amounts in human-readable format |
| **Expiry** | Human-readable expiration date/time |
| **What this allows** | "The Solver can move your delegated assets within the vault network to fulfill intents and earn yield." |
| **What this does NOT allow** | "The Solver cannot withdraw your funds to external addresses. You can revoke at any time." |
| **Revocation note** | "You can revoke this delegation at any time from Settings." |

### Post-Delegation Visibility

- Settings screen always shows active delegation: scope, allowances, expiry, creation date
- A prominent "Revoke" button is always accessible
- Expired delegations show a "Re-delegate" prompt

---

## 7. Runtime Security

### Sensitive Screen Protection

- Prevent screenshots on delegation and transaction confirmation screens (iOS: `UIScreen.main.isCaptured`, Android: `FLAG_SECURE`)
- Redact balance amounts in app switcher/recent apps view

### Logging

- **Development:** Log API requests/responses (without signatures)
- **Production:** Log only errors and anonymized metrics
- **Never log:** Private keys, signatures, full addresses (truncate to first/last 4 chars), SecureStore contents

### Debug Build Safeguards

- `__DEV__` flag guards: Disable verbose logging, mock data, and dev-only UI in production builds
- Remove React DevTools in production bundles (Expo handles this by default)

---

## 8. Dependency Security

- Pin dependency versions with `~` (patch updates only)
- Run `npm audit` as part of CI pipeline
- Review `@reown/appkit` and `wagmi` changelogs before upgrading (wallet security-critical)
- Avoid dependencies with native code unless from trusted sources (Expo ecosystem preferred)
- Never add dependencies that request unnecessary permissions (camera, contacts, etc.)

---

## 9. Error Handling Security

- Never expose stack traces or internal error details to the user
- Map backend error codes to user-friendly messages (see `architecture.md`)
- Never include raw server responses in user-facing error messages
- Log full error details to a secure logging service (not to the device)

---

## 10. Checklist for Security Review

Before each release, verify:

- [ ] No private keys or signatures stored in AsyncStorage
- [ ] SecureStore used for all Session Key metadata
- [ ] All API calls use HTTPS/WSS in production config
- [ ] Input validation mirrors backend Zod schemas
- [ ] Deep links cannot auto-execute transactions
- [ ] Delegation screen clearly explains scope and revocation
- [ ] Screenshots blocked on sensitive screens
- [ ] No secrets in `EXPO_PUBLIC_*` variables
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Production logging does not include sensitive data
