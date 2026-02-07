# Client-Side Storage

*(No database — mobile client-side state only.)*

| Store | Technology | Encrypted | Contents |
|-------|-----------|-----------|----------|
| **SecureStore** | `expo-secure-store` (OS Keychain / Keystore) | Yes | Session Key metadata (address, scope, expiry, status) |
| **AsyncStorage** | `@react-native-async-storage/async-storage` | No | User preferences (theme), onboarding progress, non-sensitive UI state |
| **TanStack Query Cache** | In-memory | N/A | API data (balances, sessions, keys, withdrawals) — lost on app restart |
| **Zustand Stores** | In-memory + AsyncStorage persist | Partial | Wallet connection, delegation status, WS status, onboarding progress |
| **React State / RHF** | In-memory | N/A | Form inputs, modal state, animations — component lifecycle only |

**Security rules:** Never store private keys, raw signatures, or full addresses in AsyncStorage. See `../docs/architecture/security.md`.
