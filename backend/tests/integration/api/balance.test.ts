/**
 * Integration test for balance endpoints.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mockFindMany = vi.fn();

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: {
    sessionKey: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    userBalance: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: vi.fn(),
    },
    session: { findMany: vi.fn().mockResolvedValue([]) },
    withdrawalRequest: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
    },
    vaultInventory: { findFirst: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("../../../src/lib/redis.js", () => ({
  redis: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    ttl: vi.fn().mockResolvedValue(60),
  },
}));

vi.mock("../../../src/config/index.js", () => ({
  config: {
    nodeEnv: "test",
    logLevel: "silent",
    lifRustBaseUrl: "http://localhost:8080",
    sessionKeyDefaultTtlSeconds: 86400,
    kms: {
      provider: "local",
      localPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    rpcUrls: {
      yellowL3: "http://localhost",
      ethereum: "http://localhost",
      base: "http://localhost",
    },
    chainIds: { yellowL3: 12345, ethereum: 1, base: 8453 },
  },
}));

vi.mock("../../../src/lib/logger.js", async () => {
  const pino = await import("pino");
  return { logger: pino.default({ level: "silent" }) };
});

import { createApp } from "../../../src/app.js";

describe("GET /api/balance/:address", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for an invalid address", async () => {
    const res = await request(app).get("/api/balance/invalid-address");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns unified balances for a valid address", async () => {
    const addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
    mockFindMany.mockResolvedValue([
      { asset: "USDC", balance: "5000000", chainId: null, userAddress: addr },
      { asset: "USDC", balance: "3000000", chainId: 1, userAddress: addr },
      { asset: "USDC", balance: "2000000", chainId: 8453, userAddress: addr },
    ]);

    const res = await request(app).get(
      "/api/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.USDC).toBeDefined();
    expect(res.body.data.USDC.unified).toBe("5000000");
  });

  it("returns empty when user has no balances", async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/balance/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({});
  });
});
