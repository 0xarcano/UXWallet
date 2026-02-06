/**
 * Inventory Manager — tracks vault liquidity across chains and enforces "Fast Exit Guarantee".
 *
 * Never fulfill an intent if it would break withdrawal guarantees.
 */
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";

export interface HealthCheckResult {
  readonly safe: boolean;
  readonly reason: string;
  readonly availableBalance: string;
  readonly requiredReserve: string;
}

class InventoryManager {
  /**
   * Minimum reserve ratio — vault must retain at least this fraction of total user claims.
   * E.g., 0.2 = always keep 20% reserve for withdrawal guarantees.
   */
  private readonly minReserveRatio = 0.2;

  /**
   * Check if fulfilling an intent is safe w.r.t. inventory health.
   * Returns { safe: true } if fulfillment won't break Fast Exit Guarantee.
   */
  async checkHealth(
    chainId: number,
    asset: string,
    fulfillmentAmount: string,
  ): Promise<HealthCheckResult> {
    // 1. Get current vault balance on the destination chain
    const inventory = await prisma.vaultInventory.findFirst({
      where: { chainId, asset },
    });

    const currentBalance = BigInt(inventory?.balance ?? "0");
    const amount = BigInt(fulfillmentAmount);

    // 2. Get total user claims for this asset on this chain
    const userClaims = await this.getTotalUserClaims(chainId, asset);

    // 3. Calculate required reserve
    const requiredReserve = (userClaims * BigInt(Math.floor(this.minReserveRatio * 1000))) / 1000n;

    // 4. Check if post-fulfillment balance exceeds reserve
    const postFulfillmentBalance = currentBalance - amount;

    if (postFulfillmentBalance < 0n) {
      return {
        safe: false,
        reason: `Insufficient vault balance: have ${currentBalance}, need ${amount}`,
        availableBalance: currentBalance.toString(),
        requiredReserve: requiredReserve.toString(),
      };
    }

    if (postFulfillmentBalance < requiredReserve) {
      return {
        safe: false,
        reason: `Would break Fast Exit Guarantee: post-balance ${postFulfillmentBalance} < reserve ${requiredReserve}`,
        availableBalance: currentBalance.toString(),
        requiredReserve: requiredReserve.toString(),
      };
    }

    return {
      safe: true,
      reason: "OK",
      availableBalance: currentBalance.toString(),
      requiredReserve: requiredReserve.toString(),
    };
  }

  /**
   * Record an intent fulfillment by deducting from vault inventory.
   */
  async recordFulfillment(
    chainId: number,
    asset: string,
    amount: string,
  ): Promise<void> {
    const inventory = await prisma.vaultInventory.findFirst({
      where: { chainId, asset },
    });

    if (!inventory) {
      logger.warn({ chainId, asset }, "No vault inventory record found for fulfillment");
      return;
    }

    const newBalance = BigInt(inventory.balance) - BigInt(amount);

    await prisma.vaultInventory.update({
      where: { id: inventory.id },
      data: { balance: newBalance.toString() },
    });

    logger.info(
      { chainId, asset, oldBalance: inventory.balance, newBalance: newBalance.toString() },
      "Vault inventory updated after fulfillment",
    );
  }

  /**
   * Record an incoming deposit (increases vault inventory).
   */
  async recordDeposit(
    chainId: number,
    asset: string,
    vaultAddress: string,
    amount: string,
  ): Promise<void> {
    await prisma.vaultInventory.upsert({
      where: {
        chainId_asset_vaultAddress: { chainId, asset, vaultAddress },
      },
      update: {
        balance: (
          BigInt(
            (await prisma.vaultInventory.findFirst({ where: { chainId, asset, vaultAddress } }))
              ?.balance ?? "0",
          ) + BigInt(amount)
        ).toString(),
      },
      create: {
        chainId,
        asset,
        vaultAddress,
        balance: amount,
      },
    });
  }

  /**
   * Get total user claims for an asset on a specific chain.
   */
  private async getTotalUserClaims(
    chainId: number,
    asset: string,
  ): Promise<bigint> {
    const balances = await prisma.userBalance.findMany({
      where: { asset, chainId },
    });

    let total = 0n;
    for (const b of balances) {
      total += BigInt(b.balance);
    }
    return total;
  }
}

export const inventoryManager = new InventoryManager();
