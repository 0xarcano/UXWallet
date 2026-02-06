/**
 * Unit tests for the Profitability Engine.
 *
 * Per stack_security.md: spread calculations must account for all fees
 * (gas, bridge, rebalancing) to prevent negative yields.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { profitabilityEngine } from "../../../src/services/solver/profitability.js";
import type { MarketplaceIntent } from "../../../src/services/solver/index.js";

// Mock lifi client
vi.mock("../../../src/integrations/lifi/client.js", () => ({
  lifiClient: {
    getQuote: vi.fn().mockResolvedValue({
      route: {},
      estimatedGasCost: "100",
      bridgeFee: "50",
      estimatedTime: 60,
    }),
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

vi.mock("../../../src/config/index.js", () => ({
  config: {
    lifRustBaseUrl: "http://localhost:8080",
    logLevel: "silent",
    nodeEnv: "test",
  },
}));

describe("ProfitabilityEngine", () => {
  const makeIntent = (overrides: Partial<MarketplaceIntent> = {}): MarketplaceIntent => ({
    intentId: "test-intent-1",
    sourceChainId: 1,
    destinationChainId: 8453,
    asset: "USDC",
    amount: "1000000", // 1 USDC (6 decimals)
    minReceived: "998000", // 0.2% spread
    ...overrides,
  });

  it("identifies a profitable intent (spread > costs)", async () => {
    const result = await profitabilityEngine.evaluate(makeIntent());
    expect(result.profitable).toBe(true);
    expect(BigInt(result.spread)).toBe(2000n); // 1000000 - 998000
    expect(BigInt(result.netProfit)).toBeGreaterThan(0n);
  });

  it("rejects when spread is zero", async () => {
    const result = await profitabilityEngine.evaluate(
      makeIntent({ amount: "1000000", minReceived: "1000000" }),
    );
    expect(result.profitable).toBe(false);
    expect(result.reason).toContain("Negative or zero spread");
  });

  it("rejects when spread is negative", async () => {
    const result = await profitabilityEngine.evaluate(
      makeIntent({ amount: "1000000", minReceived: "1000001" }),
    );
    expect(result.profitable).toBe(false);
    expect(result.reason).toContain("Negative or zero spread");
  });

  it("rejects when spread is below minimum threshold", async () => {
    // 0.05% spread = 5bps, below the 10bps minimum
    const result = await profitabilityEngine.evaluate(
      makeIntent({ amount: "1000000", minReceived: "999500" }),
    );
    expect(result.profitable).toBe(false);
    expect(result.reason).toContain("below minimum");
  });

  it("rejects when costs exceed spread", async () => {
    // Tiny amount where costs dominate
    const result = await profitabilityEngine.evaluate(
      makeIntent({ amount: "300", minReceived: "296" }), // 4 spread but >150 cost
    );
    // spread is ~133bps, costs estimated at 150
    expect(result.profitable).toBe(false);
  });
});
