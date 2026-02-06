/**
 * State RPC routes — query latest signed Nitrolite state proofs.
 */
import { Router } from "express";
import { clearNodeService } from "../../services/clearnode/index.js";
import { validateAddress } from "../../utils/validation.js";

export const stateRouter = Router();

/**
 * GET /api/state/proof/:address
 * Returns the latest signed state proof for a user (for Force Withdrawal / Adjudicator recovery).
 */
stateRouter.get("/proof/:address", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const proof = await clearNodeService.getLatestStateProof(address);
    res.json({ data: proof });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/state/sessions/:address
 * Returns active Nitrolite session metadata for a user.
 */
stateRouter.get("/sessions/:address", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const sessions = await clearNodeService.getActiveSessions(address);
    res.json({ data: sessions });
  } catch (err) {
    next(err);
  }
});
