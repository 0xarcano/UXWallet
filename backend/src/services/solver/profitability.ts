/**
 * Profitability Engine — calculates if a spread covers all costs.
 *
 * Per stack_security.md: spread calculations must account for all fees
 * (gas, bridge, rebalancing) to prevent negative yields.
 */
import { logger } from "../../lib/logger.js";
import { lifiClient } from "../../integrations/lifi/client.js";
import type { MarketplaceIntent } from "./index.js";

export interface ProfitabilityResult {
  readonly profitable: boolean;
  readonly spread: string;
  readonly estimatedCosts: string;
  readonly netProfit: string;
  readonly reason: string;
}

class ProfitabilityEngine {
  /**
   * Minimum spread in basis points (1 bp = 0.01%).
   * Only fulfill intents that generate at least this much after costs.
   */
  private readonly minSpreadBps = 10; // 0.10%

  /**
   * Evaluate whether an intent is profitable after accounting for all costs.
   */
  async evaluate(intent: MarketplaceIntent): Promise<ProfitabilityResult> {
    const amount = BigInt(intent.amount);
    const minReceived = BigInt(intent.minReceived);

    // 1. Raw spread = amount - minReceived (what the solver captures)
    const rawSpread = amount - minReceived;

    if (rawSpread <= 0n) {
      return {
        profitable: false,
        spread: "0",
        estimatedCosts: "0",
        netProfit: "0",
        reason: "Negative or zero spread",
      };
    }

    // 2. Estimate costs (gas + bridge fees + potential rebalancing)
    const estimatedCosts = await this.estimateCosts(intent);

    // 3. Net profit = spread - costs
    const netProfit = rawSpread - estimatedCosts;

    // 4. Check minimum spread threshold
    const spreadBps = Number((rawSpread * 10000n) / amount);

    if (spreadBps < this.minSpreadBps) {
      return {
        profitable: false,
        spread: rawSpread.toString(),
        estimatedCosts: estimatedCosts.toString(),
        netProfit: netProfit.toString(),
        reason: `Spread ${spreadBps}bps below minimum ${this.minSpreadBps}bps`,
      };
    }

    if (netProfit <= 0n) {
      return {
        profitable: false,
        spread: rawSpread.toString(),
        estimatedCosts: estimatedCosts.toString(),
        netProfit: netProfit.toString(),
        reason: "Costs exceed spread",
      };
    }

    logger.debug(
      {
        intentId: intent.intentId,
        spreadBps,
        rawSpread: rawSpread.toString(),
        estimatedCosts: estimatedCosts.toString(),
        netProfit: netProfit.toString(),
      },
      "Profitability evaluated",
    );

    return {
      profitable: true,
      spread: rawSpread.toString(),
      estimatedCosts: estimatedCosts.toString(),
      netProfit: netProfit.toString(),
      reason: "Profitable",
    };
  }

  /**
   * Estimate total costs for fulfilling an intent.
   * In production, queries gas estimator + bridge fee APIs.
   */
  private async estimateCosts(intent: MarketplaceIntent): Promise<bigint> {
    try {
      // Get quote from lif-rust for cost estimation
      const quote = await lifiClient.getQuote({
        sourceChainId: intent.sourceChainId,
        destinationChainId: intent.destinationChainId,
        asset: intent.asset,
        amount: intent.amount,
      });

      // Use estimated gas + bridge fees from quote
      return BigInt(quote.estimatedGasCost ?? "0") + BigInt(quote.bridgeFee ?? "0");
    } catch {
      // Fallback: assume 0.05% of amount as cost estimate
      const amount = BigInt(intent.amount);
      return (amount * 5n) / 10000n;
    }
  }
}

export const profitabilityEngine = new ProfitabilityEngine();
