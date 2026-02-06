/**
 * Unit tests for the Rebalancer Service.
 *
 * Tests Direct Exit vs Sponsored Exit decision logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external dependencies before importing
const mockWithdrawalCreate = vi.fn();
const mockWithdrawalFindUnique = vi.fn();
const mockWithdrawalFindMany = vi.fn();
const mockWithdrawalUpdate = vi.fn();
const mockVaultFindFirst = vi.fn();
const mockVaultFindMany = vi.fn();
const mockVaultUpdate = vi.fn();
const mockBalanceFindFirst = vi.fn();
const mockBalanceFindMany = vi.fn();
const mockBalanceUpdate = vi.fn();

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: {
    withdrawalRequest: {
      create: (...args: unknown[]) => mockWithdrawalCreate(...args),
      findUnique: (...args: unknown[]) => mockWithdrawalFindUnique(...args),
      findMany: (...args: unknown[]) => mockWithdrawalFindMany(...args),
      update: (...args: unknown[]) => mockWithdrawalUpdate(...args),
    },
    vaultInventory: {
      findFirst: (...args: unknown[]) => mockVaultFindFirst(...args),
      findMany: (...args: unknown[]) => mockVaultFindMany(...args),
      update: (...args: unknown[]) => mockVaultUpdate(...args),
    },
    userBalance: {
      findFirst: (...args: unknown[]) => mockBalanceFindFirst(...args),
      findMany: (...args: unknown[]) => mockBalanceFindMany(...args),
      update: (...args: unknown[]) => mockBalanceUpdate(...args),
    },
  },
}));

vi.mock("../../../src/lib/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../../src/websocket/server.js", () => ({
  emitBalanceUpdate: vi.fn(),
}));

vi.mock("../../../src/integrations/lifi/client.js", () => ({
  lifiClient: {
    getQuote: vi.fn().mockResolvedValue({
      route: {},
      estimatedGasCost: "100",
      bridgeFee: "50",
      estimatedTime: 60,
    }),
    buildIntentOrder: vi.fn().mockResolvedValue({
      orderData: {},
      encodedOrder: "0xabc",
    }),
  },
}));

vi.mock("../../../src/config/index.js", () => ({
  config: {
    lifRustBaseUrl: "http://localhost:8080",
    logLevel: "silent",
    nodeEnv: "test",
  },
}));

import { rebalancerService } from "../../../src/services/rebalancer/index.js";

describe("RebalancerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createWithdrawalRequest", () => {
    it("rejects when user has insufficient balance", async () => {
      mockBalanceFindFirst.mockResolvedValue(null); // no balance

      await expect(
        rebalancerService.createWithdrawalRequest({
          userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          asset: "USDC",
          amount: "1000",
          destinationChainId: 8453,
        }),
      ).rejects.toThrow("Insufficient unified balance");
    });

    it("creates a withdrawal request when balance is sufficient", async () => {
      mockBalanceFindFirst.mockResolvedValue({ balance: "5000" });
      mockWithdrawalCreate.mockResolvedValue({
        id: "wd-1",
        status: "PENDING",
        createdAt: new Date(),
      });

      // Mock the evaluateWithdrawal to not actually run
      mockWithdrawalFindUnique.mockResolvedValue(null);

      const result = await rebalancerService.createWithdrawalRequest({
        userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        asset: "USDC",
        amount: "1000",
        destinationChainId: 8453,
      });

      expect(result.id).toBe("wd-1");
      expect(mockWithdrawalCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("evaluateWithdrawal - Direct vs Sponsored Exit", () => {
    it("processes Direct Exit when local vault has sufficient liquidity", async () => {
      const withdrawalId = "wd-direct";

      mockWithdrawalUpdate.mockResolvedValue({});
      mockWithdrawalFindUnique.mockResolvedValue({
        id: withdrawalId,
        userAddress: "0xuser",
        asset: "USDC",
        amount: "1000",
        destinationChainId: 8453,
      });

      // Local vault has enough
      mockVaultFindFirst.mockResolvedValue({
        id: "inv-1",
        balance: "5000",
        chainId: 8453,
        asset: "USDC",
      });

      // User balance for deduction
      mockBalanceFindFirst.mockResolvedValue({
        id: "bal-1",
        balance: "3000",
      });

      // Mock the inventory manager's findFirst for recordFulfillment
      mockVaultUpdate.mockResolvedValue({});
      mockBalanceUpdate.mockResolvedValue({});

      await rebalancerService.evaluateWithdrawal(withdrawalId);

      // Should update to COMPLETED with DIRECT exit type
      const updateCalls = mockWithdrawalUpdate.mock.calls;
      const completedCall = updateCalls.find(
        (call: unknown[]) => (call[0] as Record<string, unknown>).data &&
          ((call[0] as Record<string, Record<string, unknown>>).data.status === "COMPLETED"),
      );
      expect(completedCall).toBeDefined();
    });

    it("triggers Sponsored Exit when local vault is insufficient", async () => {
      const withdrawalId = "wd-sponsored";

      mockWithdrawalUpdate.mockResolvedValue({});
      mockWithdrawalFindUnique.mockResolvedValue({
        id: withdrawalId,
        userAddress: "0xuser",
        asset: "USDC",
        amount: "5000",
        destinationChainId: 8453,
      });

      // Local vault is insufficient
      mockVaultFindFirst.mockResolvedValue({
        id: "inv-1",
        balance: "1000",
        chainId: 8453,
        asset: "USDC",
      });

      // Another chain has enough
      mockVaultFindMany.mockResolvedValue([
        { chainId: 1, balance: "10000", asset: "USDC" },
      ]);

      // User balance for deduction
      mockBalanceFindFirst.mockResolvedValue({
        id: "bal-1",
        balance: "6000",
      });

      mockBalanceUpdate.mockResolvedValue({});

      await rebalancerService.evaluateWithdrawal(withdrawalId);

      // Should have been set to BRIDGING at some point
      const updateCalls = mockWithdrawalUpdate.mock.calls;
      const bridgingCall = updateCalls.find(
        (call: unknown[]) => (call[0] as Record<string, Record<string, unknown>>).data &&
          ((call[0] as Record<string, Record<string, unknown>>).data.status === "BRIDGING"),
      );
      expect(bridgingCall).toBeDefined();
    });
  });

  describe("getWithdrawalStatus", () => {
    it("returns withdrawal details", async () => {
      mockWithdrawalFindUnique.mockResolvedValue({
        id: "wd-1",
        userAddress: "0xuser",
        asset: "USDC",
        amount: "1000",
        destinationChainId: 8453,
        status: "COMPLETED",
        exitType: "DIRECT",
        lifiIntentId: null,
        txHash: "0xabc",
        errorMessage: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      });

      const status = await rebalancerService.getWithdrawalStatus("wd-1");
      expect(status.status).toBe("COMPLETED");
      expect(status.exitType).toBe("DIRECT");
    });

    it("throws NotFound for nonexistent withdrawal", async () => {
      mockWithdrawalFindUnique.mockResolvedValue(null);

      await expect(
        rebalancerService.getWithdrawalStatus("nonexistent"),
      ).rejects.toThrow("Withdrawal request not found");
    });
  });
});
