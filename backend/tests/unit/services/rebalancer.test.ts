import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RebalancerService } from '../../../src/services/rebalancer/index.js';

function createMockInventory() {
  return {
    getInventory: vi.fn(),
  } as any;
}

describe('RebalancerService', () => {
  let service: RebalancerService;
  let inventory: ReturnType<typeof createMockInventory>;

  beforeEach(() => {
    inventory = createMockInventory();
    service = new RebalancerService({} as any, inventory);
  });

  describe('checkImbalances', () => {
    it('reports deficit chains', async () => {
      inventory.getInventory
        .mockResolvedValueOnce({ amount: 500n }) // chain A — below target
        .mockResolvedValueOnce({ amount: 2000n }); // chain B — above target

      const results = await service.checkImbalances('usdc', 1000n, [1, 2]);

      expect(results).toHaveLength(1);
      expect(results[0]!.chainId).toBe(1);
      expect(results[0]!.deficit).toBe(500n);
    });

    it('returns empty when all chains meet target', async () => {
      inventory.getInventory
        .mockResolvedValueOnce({ amount: 1000n })
        .mockResolvedValueOnce({ amount: 1500n });

      const results = await service.checkImbalances('usdc', 1000n, [1, 2]);
      expect(results).toHaveLength(0);
    });
  });

  describe('rebalance (MVP stub)', () => {
    it('does not throw', async () => {
      await expect(
        service.rebalance([
          {
            chainId: 1,
            asset: 'usdc',
            currentAmount: 500n,
            targetAmount: 1000n,
            deficit: 500n,
          },
        ]),
      ).resolves.not.toThrow();
    });
  });
});
