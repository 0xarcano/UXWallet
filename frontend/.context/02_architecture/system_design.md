# System Design

**Architecture:** Client-centric integration layer. Communicates with lif-rust microservice for LI.FI routing/intent creation and the Backend Nitrolite RPC for off-chain state updates.

**Design:** The frontend generates a session key in the browser, stores it securely (or discards after delegation if using backend KMS), and requests a delegation signature from the main wallet to authorize the backend solver.

**LI.FI Integration:** Frontend calls lif-rust REST API endpoints:
- `POST /lifi/quote` - Get routing quotes for Unify/Withdraw flows
- `POST /intent/calldata` - Generate calldata for UXOriginSettler.open() transactions
