import { getPrisma, type PrismaClient } from '../../lib/prisma.js';
import { logger as baseLogger } from '../../lib/logger.js';
import {
  getInventoryManager,
  type InventoryManager,
} from '../solver/inventoryManager.js';

const logger = baseLogger.child({ module: 'rebalancer' });

// ── Types ───────────────────────────────────────────────────────────────────

export interface RebalanceCheck {
  chainId: number;
  asset: string;
  currentAmount: bigint;
  targetAmount: bigint;
  deficit: bigint;
}

// ── Service ─────────────────────────────────────────────────────────────────

/**
 * Cross-chain liquidity rebalancer (Hybrid Exit logic).
 *
 * **MVP stub:** logs imbalances but does not execute bridges.
 * When real LiFi integration is available, this service will
 * trigger cross-chain transfers to maintain inventory targets.
 */
export class RebalancerService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly inventory: InventoryManager,
  ) {}

  /**
   * Scan vault inventory across supported chains and report
   * any chain whose balance is below the target threshold.
   */
  async checkImbalances(
    asset: string,
    targetPerChain: bigint,
    chainIds: number[],
  ): Promise<RebalanceCheck[]> {
    const results: RebalanceCheck[] = [];

    for (const chainId of chainIds) {
      const { amount } = await this.inventory.getInventory(chainId, asset);
      if (amount < targetPerChain) {
        results.push({
          chainId,
          asset,
          currentAmount: amount,
          targetAmount: targetPerChain,
          deficit: targetPerChain - amount,
        });
      }
    }

    if (results.length > 0) {
      logger.warn(
        {
          asset,
          imbalances: results.map((r) => ({
            chainId: r.chainId,
            deficit: r.deficit.toString(),
          })),
        },
        'Liquidity imbalances detected',
      );
    } else {
      logger.debug({ asset }, 'No liquidity imbalances');
    }

    return results;
  }

  /**
   * Execute rebalancing for detected imbalances.
   *
   * **MVP:** no-op. Logs intent to rebalance.
   * Production: uses LiFi bridge to move assets cross-chain.
   */
  async rebalance(checks: RebalanceCheck[]): Promise<void> {
    for (const check of checks) {
      logger.info(
        {
          chainId: check.chainId,
          asset: check.asset,
          deficit: check.deficit.toString(),
        },
        'Rebalance needed (MVP stub — no action taken)',
      );
    }
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _service: RebalancerService | undefined;

export function getRebalancerService(): RebalancerService {
  if (!_service) {
    _service = new RebalancerService(getPrisma(), getInventoryManager());
  }
  return _service;
}

export function resetRebalancerService(): void {
  _service = undefined;
}
