# Stack Security

- Ensure the Adjudicator logic cannot be bypassed by stale signatures (use nonces/sequence numbers).
- Verify that "Force Withdrawal" doesn't allow for double-claiming across chains.
- **Escape Hatch:** Ensure `forceWithdraw` bypasses the session key entirely using the owner's primary signature.
- **Atomic Guarantee:** Fuzz test the ExecutionGuard to ensure no scenario allows funds to be drained via spoofed intents.
