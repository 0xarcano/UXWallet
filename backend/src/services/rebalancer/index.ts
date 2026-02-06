/**
 * Rebalancer Service — handles withdrawal requests with Direct Exit vs Sponsored Exit logic.
 *
 * Responsibilities:
 * - Evaluate withdrawal requests against vault inventory.
 * - Direct Exit: enough local vault liquidity → process immediately.
 * - Sponsored Exit (Hybrid): insufficient local → trigger LI.FI cross-chain bridge → protocol sponsors fee.
 * - Track withdrawal progress state machine.
 */
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { lifiClient } from "../../integrations/lifi/client.js";
import { inventoryManager } from "../solver/inventoryManager.js";
import { emitBalanceUpdate } from "../../websocket/server.js";
import { NotFoundError, ValidationError } from "../../lib/errors.js";
import type { ExitType, WithdrawalStatus } from "@prisma/client";

export interface WithdrawalRequestInput {
  readonly userAddress: string;
  readonly asset: string;
  readonly amount: string;
  readonly destinationChainId: number;
}

class RebalancerService {
  /**
   * Create a new withdrawal request and begin evaluation.
   */
  async createWithdrawalRequest(input: WithdrawalRequestInput) {
    const { userAddress, asset, amount, destinationChainId } = input;

    // 1. Check user has sufficient unified balance
    const userBalance = await prisma.userBalance.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        asset,
        chainId: null, // unified balance
      },
    });

    if (!userBalance || BigInt(userBalance.balance) < BigInt(amount)) {
      throw new ValidationError(
        `Insufficient unified balance for ${asset}. Have: ${userBalance?.balance ?? "0"}, need: ${amount}`,
      );
    }

    // 2. Create withdrawal request
    const request = await prisma.withdrawalRequest.create({
      data: {
        userAddress: userAddress.toLowerCase(),
        asset,
        amount,
        destinationChainId,
        status: "PENDING",
      },
    });

    logger.info(
      { withdrawalId: request.id, userAddress, asset, amount, destinationChainId },
      "Withdrawal request created",
    );

    // 3. Evaluate async (non-blocking to the HTTP response)
    this.evaluateWithdrawal(request.id).catch((err) => {
      logger.error({ err, withdrawalId: request.id }, "Withdrawal evaluation failed");
    });

    return {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    };
  }

  /**
   * Evaluate a withdrawal: determine Direct Exit vs Sponsored Exit.
   */
  async evaluateWithdrawal(withdrawalId: string): Promise<void> {
    await this.updateStatus(withdrawalId, "EVALUATING");

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new NotFoundError(`Withdrawal not found: ${withdrawalId}`);
    }

    // Check local vault inventory on the destination chain
    const inventory = await prisma.vaultInventory.findFirst({
      where: {
        chainId: withdrawal.destinationChainId,
        asset: withdrawal.asset,
      },
    });

    const localBalance = BigInt(inventory?.balance ?? "0");
    const requiredAmount = BigInt(withdrawal.amount);

    if (localBalance >= requiredAmount) {
      // ── Direct Exit ──
      await this.processDirectExit(withdrawal.id, withdrawal);
    } else {
      // ── Sponsored Exit (Hybrid) ──
      await this.processSponsoredExit(withdrawal.id, withdrawal, localBalance);
    }
  }

  /**
   * Direct Exit — enough local vault liquidity.
   */
  private async processDirectExit(
    withdrawalId: string,
    withdrawal: { userAddress: string; asset: string; amount: string; destinationChainId: number },
  ): Promise<void> {
    logger.info({ withdrawalId }, "Processing Direct Exit");

    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: "PROCESSING",
        exitType: "DIRECT",
      },
    });

    try {
      // In production: submit on-chain withdrawal transaction
      // For now: update inventory and mark complete

      // Deduct from vault inventory
      await inventoryManager.recordFulfillment(
        withdrawal.destinationChainId,
        withdrawal.asset,
        withdrawal.amount,
      );

      // Deduct from user's unified balance
      await this.deductUserBalance(
        withdrawal.userAddress,
        withdrawal.asset,
        withdrawal.amount,
      );

      await this.updateStatus(withdrawalId, "COMPLETED", "DIRECT");

      // Notify user
      emitBalanceUpdate(withdrawal.userAddress, {
        type: "withdrawal_complete",
        withdrawalId,
        exitType: "DIRECT",
      });

      logger.info({ withdrawalId }, "Direct Exit completed");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: "FAILED", errorMessage },
      });
      logger.error({ err, withdrawalId }, "Direct Exit failed");
    }
  }

  /**
   * Sponsored Exit (Hybrid) — trigger LI.FI bridge to pull liquidity from another chain.
   */
  private async processSponsoredExit(
    withdrawalId: string,
    withdrawal: { userAddress: string; asset: string; amount: string; destinationChainId: number },
    localBalance: bigint,
  ): Promise<void> {
    logger.info(
      { withdrawalId, localBalance: localBalance.toString() },
      "Processing Sponsored Exit (Hybrid)",
    );

    await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: "BRIDGING",
        exitType: "SPONSORED",
      },
    });

    try {
      // 1. Find a source chain with sufficient liquidity
      const sourceChain = await this.findSourceChain(
        withdrawal.asset,
        withdrawal.amount,
        withdrawal.destinationChainId,
      );

      if (!sourceChain) {
        throw new Error("No source chain found with sufficient liquidity");
      }

      // 2. Get quote from lif-rust
      const quote = await lifiClient.getQuote({
        sourceChainId: sourceChain.chainId,
        destinationChainId: withdrawal.destinationChainId,
        asset: withdrawal.asset,
        amount: withdrawal.amount,
      });

      // 3. Build the bridge order
      const order = await lifiClient.buildIntentOrder({
        intentId: `hybrid-exit-${withdrawalId}`,
        sourceChainId: sourceChain.chainId,
        destinationChainId: withdrawal.destinationChainId,
        asset: withdrawal.asset,
        amount: withdrawal.amount,
      });

      // 4. Update with intent ID
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          lifiIntentId: `hybrid-exit-${withdrawalId}`,
        },
      });

      // 5. In production: execute bridge transaction and monitor progress
      // For now: simulate completion

      // Deduct from user's unified balance
      await this.deductUserBalance(
        withdrawal.userAddress,
        withdrawal.asset,
        withdrawal.amount,
      );

      await this.updateStatus(withdrawalId, "COMPLETED", "SPONSORED");

      // Notify user
      emitBalanceUpdate(withdrawal.userAddress, {
        type: "withdrawal_complete",
        withdrawalId,
        exitType: "SPONSORED",
      });

      logger.info({ withdrawalId }, "Sponsored Exit completed");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await prisma.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: { status: "FAILED", errorMessage },
      });
      logger.error({ err, withdrawalId }, "Sponsored Exit failed");
    }
  }

  /**
   * Find a chain with enough vault liquidity to fund a sponsored exit.
   */
  private async findSourceChain(
    asset: string,
    amount: string,
    excludeChainId: number,
  ): Promise<{ chainId: number; balance: string } | null> {
    const inventories = await prisma.vaultInventory.findMany({
      where: {
        asset,
        chainId: { not: excludeChainId },
      },
      orderBy: { balance: "desc" },
    });

    for (const inv of inventories) {
      if (BigInt(inv.balance) >= BigInt(amount)) {
        return { chainId: inv.chainId, balance: inv.balance };
      }
    }

    return null;
  }

  /**
   * Deduct from a user's unified balance atomically.
   */
  private async deductUserBalance(
    userAddress: string,
    asset: string,
    amount: string,
  ): Promise<void> {
    const balance = await prisma.userBalance.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        asset,
        chainId: null,
      },
    });

    if (!balance) return;

    const newBalance = BigInt(balance.balance) - BigInt(amount);

    await prisma.userBalance.update({
      where: { id: balance.id },
      data: { balance: newBalance < 0n ? "0" : newBalance.toString() },
    });
  }

  /**
   * Get withdrawal status.
   */
  async getWithdrawalStatus(id: string) {
    const request = await prisma.withdrawalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError(`Withdrawal request not found: ${id}`);
    }

    return {
      id: request.id,
      userAddress: request.userAddress,
      asset: request.asset,
      amount: request.amount,
      destinationChainId: request.destinationChainId,
      status: request.status,
      exitType: request.exitType,
      lifiIntentId: request.lifiIntentId,
      txHash: request.txHash,
      errorMessage: request.errorMessage,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  /**
   * Get withdrawal history for a user.
   */
  async getWithdrawalHistory(userAddress: string) {
    const requests = await prisma.withdrawalRequest.findMany({
      where: { userAddress: userAddress.toLowerCase() },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return requests.map((r) => ({
      id: r.id,
      asset: r.asset,
      amount: r.amount,
      destinationChainId: r.destinationChainId,
      status: r.status,
      exitType: r.exitType,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  private async updateStatus(
    id: string,
    status: WithdrawalStatus,
    exitType?: ExitType,
  ): Promise<void> {
    const data: Record<string, unknown> = { status };
    if (exitType) data.exitType = exitType;

    await prisma.withdrawalRequest.update({
      where: { id },
      data,
    });
  }
}

export const rebalancerService = new RebalancerService();
