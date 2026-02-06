/**
 * Integration test for the health endpoint.
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: {
    sessionKey: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    userBalance: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
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

describe("GET /health", () => {
  const app = createApp();

  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});
