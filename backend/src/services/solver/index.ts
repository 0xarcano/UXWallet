/**
 * Solver Engine — JIT solver for LI.FI marketplace intents (ERC-7683).
 *
 * Responsibilities:
 * - Listen to LI.FI marketplace for eligible intents.
 * - Evaluate Spread vs Inventory Health.
 * - Fulfill profitable orders using vault liquidity.
 * - Record intent logs and update inventory/state via ClearNode.
 */
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { lifiClient } from "../../integrations/lifi/client.js";
import { clearNodeService } from "../clearnode/index.js";
import { delegationService } from "../delegation/index.js";
import { inventoryManager } from "./inventoryManager.js";
import { profitabilityEngine } from "./profitability.js";
import { Prisma, type IntentStatus } from "@prisma/client";

export interface MarketplaceIntent {
  readonly intentId: string;
  readonly sourceChainId: number;
  readonly destinationChainId: number;
  readonly asset: string;
  readonly amount: string;
  readonly minReceived: string;
  readonly metadata?: Record<string, unknown>;
}

class SolverService {
  private running = false;

  /**
   * Start the solver — begins listening for marketplace intents.
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    logger.info("Solver engine started");

    // In production, this would be a WebSocket connection to LI.FI marketplace.
    // For now, we expose evaluateIntent() to be called externally or via polling.
  }

  /**
   * Stop the solver.
   */
  stop(): void {
    this.running = false;
    logger.info("Solver engine stopped");
  }

  /**
   * Evaluate and potentially fulfill a marketplace intent.
   * This is the core JIT solver decision pipeline.
   */
  async evaluateIntent(intent: MarketplaceIntent): Promise<{
    action: "fulfilled" | "skipped" | "failed";
    reason: string;
    intentLogId?: string;
  }> {
    const logContext = { intentId: intent.intentId, asset: intent.asset };
    logger.info(logContext, "Evaluating intent");

    // Create initial log entry
    const intentLog = await prisma.intentLog.create({
      data: {
        intentId: intent.intentId,
        sourceChainId: intent.sourceChainId,
        destinationChainId: intent.destinationChainId,
        asset: intent.asset,
        amount: intent.amount,
        spread: "0",
        status: "EVALUATING",
        metadata: (intent.metadata as Prisma.InputJsonValue) ?? undefined,
      },
    });

    try {
      // 1. Check inventory health — never break "Fast Exit Guarantee"
      const healthCheck = await inventoryManager.checkHealth(
        intent.destinationChainId,
        intent.asset,
        intent.amount,
      );

      if (!healthCheck.safe) {
        await this.updateIntentStatus(intentLog.id, "SKIPPED");
        logger.info(
          { ...logContext, reason: healthCheck.reason },
          "Intent skipped — inventory health check failed",
        );
        return {
          action: "skipped",
          reason: healthCheck.reason,
          intentLogId: intentLog.id,
        };
      }

      // 2. Calculate profitability (spread vs costs)
      const profitability = await profitabilityEngine.evaluate(intent);

      if (!profitability.profitable) {
        await this.updateIntentStatus(intentLog.id, "SKIPPED");
        logger.info(
          { ...logContext, reason: profitability.reason },
          "Intent skipped — not profitable",
        );
        return {
          action: "skipped",
          reason: profitability.reason,
          intentLogId: intentLog.id,
        };
      }

      // 3. Build the fulfillment order via lif-rust
      await this.updateIntentStatus(intentLog.id, "FULFILLING");

      const orderData = await lifiClient.buildIntentOrder({
        intentId: intent.intentId,
        sourceChainId: intent.sourceChainId,
        destinationChainId: intent.destinationChainId,
        asset: intent.asset,
        amount: intent.amount,
      });

      // 4. Execute fulfillment (in production, this submits on-chain via chain clients)
      // For now, record the fulfillment and update state
      await prisma.intentLog.update({
        where: { id: intentLog.id },
        data: {
          status: "FULFILLED",
          spread: profitability.spread,
          fulfilledAt: new Date(),
          metadata: {
            ...intent.metadata,
            orderData: orderData as unknown as Record<string, unknown>,
          } as unknown as Prisma.InputJsonValue,
        },
      });

      // 5. Update vault inventory
      await inventoryManager.recordFulfillment(
        intent.destinationChainId,
        intent.asset,
        intent.amount,
      );

      logger.info(
        { ...logContext, spread: profitability.spread },
        "Intent fulfilled",
      );

      return {
        action: "fulfilled",
        reason: `Spread captured: ${profitability.spread}`,
        intentLogId: intentLog.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await prisma.intentLog.update({
        where: { id: intentLog.id },
        data: { status: "FAILED", errorMessage },
      });

      logger.error({ ...logContext, err }, "Intent fulfillment failed");

      return {
        action: "failed",
        reason: errorMessage,
        intentLogId: intentLog.id,
      };
    }
  }

  private async updateIntentStatus(
    id: string,
    status: IntentStatus,
  ): Promise<void> {
    await prisma.intentLog.update({ where: { id }, data: { status } });
  }
}

export const solverService = new SolverService();
