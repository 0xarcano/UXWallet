import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryManager } from '../../../src/services/solver/inventoryManager.js';

function createMockPrisma() {
  return {
    vaultInventory: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    withdrawalRequest: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (cb: any) => cb({
      vaultInventory: {
        findUnique: vi.fn().mockResolvedValue({ amount: '1000000' }),
        upsert: vi.fn(),
      },
    })),
    $executeRaw: vi.fn(),
  } as any;
}

describe('InventoryManager', () => {
  let manager: InventoryManager;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
    manager = new InventoryManager(prisma);
  });

  describe('getInventory', () => {
    it('returns amount from DB', async () => {
      prisma.vaultInventory.findUnique.mockResolvedValue({
        amount: '5000000',
      });

      const result = await manager.getInventory(11155111, 'usdc');
      expect(result.amount).toBe(5_000_000n);
    });

    it('returns 0n when no record', async () => {
      prisma.vaultInventory.findUnique.mockResolvedValue(null);

      const result = await manager.getInventory(11155111, 'usdc');
      expect(result.amount).toBe(0n);
    });
  });

  describe('hasLiquidity', () => {
    it('returns true when sufficient', async () => {
      prisma.vaultInventory.findUnique.mockResolvedValue({
        amount: '1000000',
      });
      prisma.withdrawalRequest.findMany.mockResolvedValue([]);

      const result = await manager.hasLiquidity(11155111, 'usdc', 500_000n);
      expect(result).toBe(true);
    });

    it('returns false when insufficient', async () => {
      prisma.vaultInventory.findUnique.mockResolvedValue({
        amount: '100',
      });
      prisma.withdrawalRequest.findMany.mockResolvedValue([]);

      const result = await manager.hasLiquidity(11155111, 'usdc', 500_000n);
      expect(result).toBe(false);
    });

    it('reserves pending withdrawals', async () => {
      prisma.vaultInventory.findUnique.mockResolvedValue({
        amount: '1000000',
      });
      prisma.withdrawalRequest.findMany.mockResolvedValue([
        { amount: '900000' },
      ]);

      // Usable = 1000000 − 900000 = 100000, need 500000
      const result = await manager.hasLiquidity(11155111, 'usdc', 500_000n);
      expect(result).toBe(false);
    });
  });
});
