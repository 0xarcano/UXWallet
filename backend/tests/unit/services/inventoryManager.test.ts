/**
 * Unit tests for the Inventory Manager.
 *
 * Per stack_security.md: Never fulfill an intent if it would break
 * withdrawal guarantees ("Fast Exit Guarantee").
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { inventoryManager } from "../../../src/services/solver/inventoryManager.js";

// Mock Prisma
const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
const mockUpsert = vi.fn();

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: {
    vaultInventory: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
    userBalance: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
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

describe("InventoryManager.checkHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns safe when vault has sufficient balance after fulfillment", async () => {
    mockFindFirst.mockResolvedValue({ balance: "10000" });
    mockFindMany.mockResolvedValue([{ balance: "5000" }]);

    const result = await inventoryManager.checkHealth(8453, "USDC", "1000");

    expect(result.safe).toBe(true);
    expect(result.reason).toBe("OK");
  });

  it("returns unsafe when vault has insufficient balance", async () => {
    mockFindFirst.mockResolvedValue({ balance: "500" });
    mockFindMany.mockResolvedValue([]);

    const result = await inventoryManager.checkHealth(8453, "USDC", "1000");

    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Insufficient vault balance");
  });

  it("returns unsafe when fulfillment would break Fast Exit Guarantee", async () => {
    // Vault has 2000, user claims are 8000, reserve = 8000 * 0.2 = 1600
    // Fulfilling 1000 leaves 1000 < 1600
    mockFindFirst.mockResolvedValue({ balance: "2000" });
    mockFindMany.mockResolvedValue([
      { balance: "3000" },
      { balance: "5000" },
    ]);

    const result = await inventoryManager.checkHealth(8453, "USDC", "1000");

    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Fast Exit Guarantee");
  });

  it("handles zero vault inventory gracefully", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    const result = await inventoryManager.checkHealth(8453, "USDC", "1000");

    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Insufficient vault balance");
  });
});
