import { getPrisma, type PrismaClient } from '../../lib/prisma.js';
import { logger as baseLogger } from '../../lib/logger.js';
import { AppError, ErrorCode } from '../../lib/errors.js';

const logger = baseLogger.child({ module: 'solver:inventory' });

// ── Service ─────────────────────────────────────────────────────────────────

export class InventoryManager {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get the current inventory for a given chain + asset.
   */
  async getInventory(
    chainId: number,
    asset: string,
  ): Promise<{ amount: bigint }> {
    const record = await this.prisma.vaultInventory.findUnique({
      where: { chainId_asset: { chainId, asset: asset.toLowerCase() } },
    });

    return { amount: record ? BigInt(record.amount) : 0n };
  }

  /**
   * Check if there is sufficient liquidity to fulfill an intent.
   * Never fulfills if it would break the "Fast Exit Guarantee"
   * (i.e. reserved withdrawal amounts must remain).
   */
  async hasLiquidity(
    chainId: number,
    asset: string,
    requiredAmount: bigint,
  ): Promise<boolean> {
    const { amount: available } = await this.getInventory(chainId, asset);

    // Reserve: sum of pending withdrawals on this chain + asset
    const pendingWithdrawals = await this.prisma.withdrawalRequest.findMany({
      where: {
        chainId,
        asset: asset.toLowerCase(),
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      select: { amount: true },
    });

    const reserved = pendingWithdrawals.reduce(
      (acc, w) => acc + BigInt(w.amount),
      0n,
    );
    const usable = available > reserved ? available - reserved : 0n;

    const sufficient = usable >= requiredAmount;

    logger.debug(
      {
        chainId,
        asset,
        available: available.toString(),
        reserved: reserved.toString(),
        usable: usable.toString(),
        required: requiredAmount.toString(),
        sufficient,
      },
      'Liquidity check',
    );

    return sufficient;
  }

  /**
   * Atomically debit inventory after fulfillment.
   */
  async debit(
    chainId: number,
    asset: string,
    amount: bigint,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const record = await tx.vaultInventory.findUnique({
        where: { chainId_asset: { chainId, asset: asset.toLowerCase() } },
      });

      const current = record ? BigInt(record.amount) : 0n;
      if (current < amount) {
        throw new AppError(
          ErrorCode.INSUFFICIENT_LIQUIDITY,
          `Insufficient inventory: have ${current}, need ${amount}`,
        );
      }

      await tx.vaultInventory.upsert({
        where: { chainId_asset: { chainId, asset: asset.toLowerCase() } },
        update: { amount: (current - amount).toString() },
        create: {
          chainId,
          asset: asset.toLowerCase(),
          amount: '0',
        },
      });
    });

    logger.info(
      { chainId, asset, amount: amount.toString() },
      'Inventory debited',
    );
  }

  /**
   * Credit inventory (e.g. after deposit or solver settlement).
   * Uses a transaction to read-then-write atomically.
   */
  async credit(
    chainId: number,
    asset: string,
    amount: bigint,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const record = await tx.vaultInventory.findUnique({
        where: { chainId_asset: { chainId, asset: asset.toLowerCase() } },
      });

      const current = record ? BigInt(record.amount) : 0n;
      const newAmount = (current + amount).toString();

      await tx.vaultInventory.upsert({
        where: { chainId_asset: { chainId, asset: asset.toLowerCase() } },
        update: { amount: newAmount },
        create: {
          chainId,
          asset: asset.toLowerCase(),
          amount: newAmount,
        },
      });
    });

    logger.info(
      { chainId, asset, amount: amount.toString() },
      'Inventory credited',
    );
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _manager: InventoryManager | undefined;

export function getInventoryManager(): InventoryManager {
  if (!_manager) {
    _manager = new InventoryManager(getPrisma());
  }
  return _manager;
}

export function resetInventoryManager(): void {
  _manager = undefined;
}
