import { AppError, ErrorCode } from '../../lib/errors.js';
import { logger as baseLogger } from '../../lib/logger.js';

const logger = baseLogger.child({ module: 'solver:profitability' });

// ── Types ───────────────────────────────────────────────────────────────────

export interface ProfitabilityParams {
  /** Amount the intent user wants (in smallest unit). */
  intentAmount: bigint;
  /** Estimated gas cost for settlement (in the same unit). */
  estimatedGasCost: bigint;
  /** Any bridge / rebalancing fee. */
  bridgeFee: bigint;
  /** Minimum acceptable spread in basis points (e.g. 10 = 0.1%). */
  minSpreadBps: number;
}

export interface ProfitabilityResult {
  isProfitable: boolean;
  grossReward: bigint;
  netReward: bigint;
  spreadBps: number;
}

// ── Logic ───────────────────────────────────────────────────────────────────

/**
 * Compute the spread earned by fulfilling an intent and decide
 * whether the Solver should proceed.
 *
 * Rewards from fulfillment: 50 % Users, 50 % Treasury.
 * `grossReward` = total reward from the intent.
 * `netReward`   = grossReward − gas − bridge fees.
 */
export function evaluateProfitability(
  params: ProfitabilityParams,
): ProfitabilityResult {
  const { intentAmount, estimatedGasCost, bridgeFee, minSpreadBps } = params;

  if (intentAmount <= 0n) {
    throw AppError.validation('Intent amount must be positive');
  }

  // For MVP, the gross reward is modeled as a fixed fraction of intentAmount.
  // In production this would come from the marketplace / order-book spread.
  const REWARD_BPS = 30n; // 0.30 % mock spread
  const grossReward = (intentAmount * REWARD_BPS) / 10_000n;

  const totalCost = estimatedGasCost + bridgeFee;
  const netReward = grossReward > totalCost ? grossReward - totalCost : 0n;

  const spreadBps =
    intentAmount > 0n
      ? Number((netReward * 10_000n) / intentAmount)
      : 0;

  const isProfitable = spreadBps >= minSpreadBps;

  logger.debug(
    {
      intentAmount: intentAmount.toString(),
      grossReward: grossReward.toString(),
      netReward: netReward.toString(),
      spreadBps,
      isProfitable,
    },
    'Profitability evaluated',
  );

  return { isProfitable, grossReward, netReward, spreadBps };
}

/**
 * Split a reward amount 50 / 50 between user and treasury.
 */
export function splitReward(totalReward: bigint): {
  userReward: bigint;
  treasuryReward: bigint;
} {
  const userReward = totalReward / 2n;
  const treasuryReward = totalReward - userReward; // rounding dust → treasury
  return { userReward, treasuryReward };
}
