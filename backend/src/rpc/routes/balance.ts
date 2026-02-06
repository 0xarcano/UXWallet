/**
 * Balance RPC routes — query unified balance per user/asset.
 */
import { Router } from "express";
import { clearNodeService } from "../../services/clearnode/index.js";
import { validateAddress } from "../../utils/validation.js";

export const balanceRouter = Router();

/**
 * GET /api/balance/:address
 * Returns the unified balance for all assets held by the given address.
 */
balanceRouter.get("/:address", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const balances = await clearNodeService.getUnifiedBalances(address);
    res.json({ data: balances });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/balance/:address/:asset
 * Returns the unified balance for a specific asset.
 */
balanceRouter.get("/:address/:asset", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const { asset } = req.params;
    const balance = await clearNodeService.getUnifiedBalance(address, asset);
    res.json({ data: balance });
  } catch (err) {
    next(err);
  }
});
