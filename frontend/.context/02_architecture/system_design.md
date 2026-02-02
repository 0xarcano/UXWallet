# System Design

**Architecture:** Client-centric integration layer. Communicates with LI.FI API for routing/intent creation and the Backend Nitrolite RPC for off-chain state updates.

**Design:** The frontend generates a session key in the browser, stores it securely (or discards after delegation if using backend KMS), and requests a delegation signature from the main wallet to authorize the backend solver.
