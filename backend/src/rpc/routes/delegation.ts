/**
 * Delegation RPC routes — submit, revoke, query session key status.
 */
import { Router } from "express";
import { delegationService } from "../../services/delegation/index.js";
import { validateAddress } from "../../utils/validation.js";

export const delegationRouter = Router();

/**
 * POST /api/delegation/submit
 * Submit a new EIP-712 delegation (signature + payload) to create a Persistent Session Key.
 */
delegationRouter.post("/submit", async (req, res, next) => {
  try {
    const { userAddress, signature, payload } = req.body;
    validateAddress(userAddress, "userAddress");

    const result = await delegationService.submitDelegation({
      userAddress,
      signature,
      payload,
    });

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/delegation/revoke
 * Immediately revoke an active session key.
 */
delegationRouter.post("/revoke", async (req, res, next) => {
  try {
    const { userAddress, sessionKeyId } = req.body;
    validateAddress(userAddress, "userAddress");

    await delegationService.revokeDelegation({ userAddress, sessionKeyId });

    res.json({ data: { revoked: true } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/delegation/status/:address
 * Get active delegation status for a user.
 */
delegationRouter.get("/status/:address", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const status = await delegationService.getDelegationStatus(address);
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
});
