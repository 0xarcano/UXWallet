/**
 * Withdrawal RPC routes — create and query withdrawal requests.
 */
import { Router } from "express";
import { rebalancerService } from "../../services/rebalancer/index.js";
import { validateAddress, validatePositiveAmount, validateChainId } from "../../utils/validation.js";

export const withdrawalRouter = Router();

/**
 * POST /api/withdrawal/request
 * Create a new withdrawal request.
 */
withdrawalRouter.post("/request", async (req, res, next) => {
  try {
    const { userAddress, asset, amount, destinationChainId } = req.body;
    validateAddress(userAddress, "userAddress");
    validatePositiveAmount(amount, "amount");
    validateChainId(destinationChainId, "destinationChainId");

    const result = await rebalancerService.createWithdrawalRequest({
      userAddress,
      asset,
      amount,
      destinationChainId,
    });

    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/withdrawal/status/:id
 * Query status of a withdrawal request.
 */
withdrawalRouter.get("/status/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = await rebalancerService.getWithdrawalStatus(id);
    res.json({ data: status });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/withdrawal/history/:address
 * List withdrawal history for a user.
 */
withdrawalRouter.get("/history/:address", async (req, res, next) => {
  try {
    const address = validateAddress(req.params.address, "address");
    const history = await rebalancerService.getWithdrawalHistory(address);
    res.json({ data: history });
  } catch (err) {
    next(err);
  }
});
