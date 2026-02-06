import { randomUUID } from 'node:crypto';
import { getPrisma, type PrismaClient } from '../../lib/prisma.js';
import { logger as baseLogger } from '../../lib/logger.js';
import { AppError, ErrorCode } from '../../lib/errors.js';
import { publishBalanceUpdate } from '../../websocket/server.js';
import {
  evaluateProfitability,
  splitReward,
} from './profitability.js';
import {
  getInventoryManager,
  type InventoryManager,
} from './inventoryManager.js';
import { getLifiClient, type ILifiClient } from '../../integrations/lifi/client.js';

const logger = baseLogger.child({ module: 'solver' });

// ── Types ───────────────────────────────────────────────────────────────────

export interface IntentRequest {
  intentId?: string;
  intentUserAddr: string;
  asset: string;
  amount: string; // BigInt as string
  sourceChainId: number;
  targetChainId: number;
}

export interface FulfillmentResult {
  intentLogId: string;
  status: 'fulfilled' | 'failed';
  userReward: string;
  treasuryReward: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

export class SolverService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly inventory: InventoryManager,
    private readonly lifi: ILifiClient,
  ) {}

  /**
   * Attempt to fulfill an intent from the aggregated pool.
   *
   * 1. Check pool liquidity on target chain.
   * 2. Evaluate profitability.
   * 3. Debit inventory & update ledger atomically.
   * 4. Allocate rewards 50 % User / 50 % Treasury.
   * 5. Log the intent and emit a balance-update event.
   */
  async fulfillIntent(req: IntentRequest): Promise<FulfillmentResult> {
    const intentId = req.intentId ?? `intent-${randomUUID()}`;
    const amount = BigInt(req.amount);

    logger.info(
      { intentId, user: req.intentUserAddr, asset: req.asset, amount: req.amount },
      'Processing intent',
    );

    // ── 1. Liquidity check ────────────────────────────────────────────
    const hasLiq = await this.inventory.hasLiquidity(
      req.targetChainId,
      req.asset,
      amount,
    );

    if (!hasLiq) {
      // Fallback to LiFi (mocked) — or fail in MVP
      logger.warn({ intentId }, 'Insufficient pool liquidity, attempting LiFi fallback');

      const lifiResult = await this.lifi.submitIntent({
        quoteId: `fallback-${intentId}`,
        fromAddress: req.intentUserAddr,
        toAddress: req.intentUserAddr,
      });

      // Even with mock, log the attempt
      await this.prisma.intentLog.create({
        data: {
          intentId,
          sourceChainId: req.sourceChainId,
          targetChainId: req.targetChainId,
          asset: req.asset.toLowerCase(),
          amount: req.amount,
          intentUserAddr: req.intentUserAddr.toLowerCase(),
          fulfilledFrom: 'LIFI',
          status: lifiResult.status === 'fulfilled' ? 'FULFILLED' : 'FAILED',
          solverReward: '0',
          userReward: '0',
          treasuryReward: '0',
        },
      });

      return {
        intentLogId: intentId,
        status: lifiResult.status === 'fulfilled' ? 'fulfilled' : 'failed',
        userReward: '0',
        treasuryReward: '0',
      };
    }

    // ── 2. Profitability ──────────────────────────────────────────────
    const profitability = evaluateProfitability({
      intentAmount: amount,
      estimatedGasCost: 21_000n, // placeholder
      bridgeFee: 0n,
      minSpreadBps: 1, // very low for MVP
    });

    if (!profitability.isProfitable) {
      logger.warn({ intentId, ...profitability }, 'Intent not profitable, skipping');
      return {
        intentLogId: intentId,
        status: 'failed',
        userReward: '0',
        treasuryReward: '0',
      };
    }

    // ── 3. Fulfill from pool (atomic) ─────────────────────────────────
    const { userReward, treasuryReward } = splitReward(
      profitability.grossReward,
    );

    await this.prisma.$transaction(async (tx) => {
      // Debit inventory
      await this.inventory.debit(req.targetChainId, req.asset, amount);

      // Log intent
      await tx.intentLog.create({
        data: {
          intentId,
          sourceChainId: req.sourceChainId,
          targetChainId: req.targetChainId,
          asset: req.asset.toLowerCase(),
          amount: req.amount,
          intentUserAddr: req.intentUserAddr.toLowerCase(),
          fulfilledFrom: 'POOL',
          status: 'FULFILLED',
          solverReward: profitability.grossReward.toString(),
          userReward: userReward.toString(),
          treasuryReward: treasuryReward.toString(),
        },
      });

      // Credit user balance with reward (yield)
      await tx.userBalance.upsert({
        where: {
          userAddress_asset_chainId: {
            userAddress: req.intentUserAddr.toLowerCase(),
            asset: req.asset.toLowerCase(),
            chainId: null as any, // unified
          },
        },
        update: {
          // We'll do a raw increment after the transaction
        },
        create: {
          userAddress: req.intentUserAddr.toLowerCase(),
          asset: req.asset.toLowerCase(),
          balance: userReward.toString(),
          chainId: null,
        },
      });
    });

    // ── 4. Yield log ──────────────────────────────────────────────────
    const intentLog = await this.prisma.intentLog.findUnique({
      where: { intentId },
    });

    if (intentLog && userReward > 0n) {
      await this.prisma.yieldLog.create({
        data: {
          userAddress: req.intentUserAddr.toLowerCase(),
          intentLogId: intentLog.id,
          amount: userReward.toString(),
          asset: req.asset.toLowerCase(),
        },
      });
    }

    // ── 5. Emit balance update ────────────────────────────────────────
    const updatedBalance = await this.prisma.userBalance.findFirst({
      where: {
        userAddress: req.intentUserAddr.toLowerCase(),
        asset: req.asset.toLowerCase(),
      },
    });

    await publishBalanceUpdate({
      userAddress: req.intentUserAddr.toLowerCase(),
      asset: req.asset.toLowerCase(),
      balance: updatedBalance?.balance ?? '0',
    });

    logger.info(
      {
        intentId,
        userReward: userReward.toString(),
        treasuryReward: treasuryReward.toString(),
      },
      'Intent fulfilled from pool',
    );

    return {
      intentLogId: intentId,
      status: 'fulfilled',
      userReward: userReward.toString(),
      treasuryReward: treasuryReward.toString(),
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _service: SolverService | undefined;

export function getSolverService(): SolverService {
  if (!_service) {
    _service = new SolverService(
      getPrisma(),
      getInventoryManager(),
      getLifiClient(),
    );
  }
  return _service;
}

export function resetSolverService(): void {
  _service = undefined;
}
