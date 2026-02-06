# lif-rust Integration Documentation

## Summary

This document summarizes the integration of `lif-rust` as an official microservice in the UXWallet architecture, following the decision to adopt **Scenario B: Microservice Addition**.

## What Changed

The lif-rust project has been formally integrated into the UXWallet architecture with full documentation updates across all sub-projects.

## Updated Documentation Files

### Root Level
- ✅ `.context/project-context.md` - Updated communication matrix and integration standards
- ✅ `.context/diagrams.md` - Updated architecture diagrams to show lif-rust
- ✅ `README.md` - Complete rewrite with project structure and lif-rust description

### Backend Documentation
- ✅ `backend/.context/01_product/domain_glossary.md` - Added lif-rust definition
- ✅ `backend/.context/02_architecture/system_design.md` - Added to system components and communication matrix
- ✅ `backend/.context/02_architecture/project_structure.md` - Updated Layer 1 integration notes
- ✅ `backend/.context/04_tech_stack/library_patterns.md` - Added HTTP client for lif-rust communication

### Frontend Documentation
- ✅ `frontend/.context/02_architecture/system_design.md` - Added LI.FI integration via lif-rust
- ✅ `frontend/.context/04_tech_stack/library_patterns.md` - Changed from @lifi/sdk to lif-rust REST API

### lif-rust Documentation
- ✅ `lif-rust/ARCHITECTURE.md` - New comprehensive architecture rationale document
- ✅ `lif-rust/README.md` - Updated with architecture reference

## Architecture Position

lif-rust is now officially documented as part of **Layer 1: Inbound Gateway (LI.FI / ERC-7683)**.

### Role
A specialized Rust microservice that:
1. Fetches LI.FI routing quotes
2. Encodes ERC-7683 orders with type-safe ABI encoding
3. Generates calldata for `UXOriginSettler.open()` transactions

### Consumers
- **Frontend**: User-initiated Unify/Withdraw flows
- **Backend JIT Solver**: Marketplace order fulfillment

### Dependencies
- **LI.FI API**: External HTTPS calls for routing data
- **UXOriginSettler contract**: Generates calldata for contract interactions

## Communication Patterns

### Frontend → lif-rust
```
POST /lifi/quote       # Get routing quote
POST /intent/calldata  # Get transaction calldata
```

### Backend → lif-rust
```
POST /lifi/quote     # Get routing quote
POST /intent/build   # Build ERC-7683 order
```

### lif-rust → LI.FI API
```
GET /quote  # Fetch routing information
```

## Why Rust?

Documented in `lif-rust/ARCHITECTURE.md`:

1. **Type-safe ABI encoding** - Compile-time guarantees using `alloy-sol-types`
2. **Performance** - 10-100x faster than JavaScript for complex struct encoding
3. **Correctness** - Security-critical encoding with strong type safety
4. **Resource efficiency** - Low memory footprint (~10-20MB)

## Design Principles

- **Stateless**: No session state, horizontally scalable
- **Idempotent**: Same input → same output
- **Fast**: Sub-10ms response time for encoding
- **Separation of concerns**: Handles LI.FI integration only

## Deployment

- Runs as independent service (Docker container or standalone binary)
- Scales independently from backend/frontend
- No secrets required (LI.FI API key optional, for rate limits only)

## Integration Standards

As documented in `.context/project-context.md`:

1. **Shared environment**: lif-rust configuration in root `.env.example`
2. **ABI synchronization**: Uses shared contract ABIs from `contracts/` deployment
3. **REST API**: Standard HTTP/JSON for all communications
4. **No state coupling**: Stateless design allows independent scaling

## Future Considerations

From `lif-rust/ARCHITECTURE.md`:

1. **Caching**: Redis cache for quote results (5-min TTL)
2. **Rate limiting**: Per-IP limits to prevent abuse
3. **Metrics**: Prometheus observability
4. **Status tracking**: Optional LI.FI order status polling

## Key Takeaway

lif-rust is **not** a prototype or experimental code. It is a production microservice that:

- Provides critical LI.FI integration capabilities
- Ensures type-safe ERC-7683 encoding
- Maintains clean architectural separation
- Serves both frontend and backend consumers

All documentation has been updated to reflect this integration, ensuring consistency across the codebase.
