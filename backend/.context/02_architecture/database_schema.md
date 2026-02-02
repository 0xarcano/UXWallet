# Database Schema

**Stack:** Redis/PostgreSQL.

| Store | Description |
|-------|-------------|
| **sessions** | State channel session metadata. |
| **transactions** | History of off-chain state transitions. |
| **yield_logs** | Pro-rata profit distribution records. |
| **session_keys** | Store delegated addresses and permissions (KMS-backed). |
| **vault_inventory** | Real-time tracking of physical assets on all chains. |
| **intent_logs** | Records of LI.FI fulfillments and captured spreads. |
