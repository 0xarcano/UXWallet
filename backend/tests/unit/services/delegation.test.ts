/**
 * Unit tests for the Delegation Service.
 *
 * Tests delegation lifecycle: creation, usage, expiration, revocation.
 * Tests scoped permissions: ensure session keys cannot authorize transfers to external addresses.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { delegationService } from "../../../src/services/delegation/index.js";

// Mock Prisma
const mockCreate = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("../../../src/lib/prisma.js", () => ({
  prisma: {
    sessionKey: {
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
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

vi.mock("../../../src/config/index.js", () => ({
  config: {
    sessionKeyDefaultTtlSeconds: 86400,
    kms: {
      provider: "local",
      localPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    logLevel: "silent",
    nodeEnv: "test",
  },
}));

vi.mock("../../../src/kms/index.js", () => ({
  getKeyStore: () => ({
    getSigner: vi.fn().mockResolvedValue({
      getAddress: vi.fn().mockResolvedValue("0x1234567890abcdef1234567890abcdef12345678"),
      sign: vi.fn().mockResolvedValue("0x" + "ab".repeat(65)),
    }),
  }),
}));

vi.mock("../../../src/services/delegation/verification.js", () => ({
  verifyEip712Delegation: vi.fn().mockResolvedValue(
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  ),
  isValidSignature: vi.fn().mockReturnValue(true),
}));

describe("DelegationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitDelegation", () => {
    it("rejects invalid permission scopes", async () => {
      await expect(
        delegationService.submitDelegation({
          userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          signature: "0x" + "ab".repeat(65),
          payload: {
            sessionKeyAddress: "0x1234567890abcdef1234567890abcdef12345678",
            permissionScope: "transfer_external",
            nonce: 1,
            chainId: 1,
          },
        }),
      ).rejects.toThrow("Invalid permission scope");
    });

    it("rejects when signature does not match userAddress", async () => {
      const mod = await import("../../../src/services/delegation/verification.js");
      const mockVerify = mod.verifyEip712Delegation as ReturnType<typeof vi.fn>;
      mockVerify.mockResolvedValueOnce("0x0000000000000000000000000000000000000001");

      await expect(
        delegationService.submitDelegation({
          userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          signature: "0x" + "ab".repeat(65),
          payload: {
            sessionKeyAddress: "0x1234567890abcdef1234567890abcdef12345678",
            permissionScope: "nitrolite_state_update",
            nonce: 1,
            chainId: 1,
          },
        }),
      ).rejects.toThrow("Signature does not match");
    });

    it("rejects when an active delegation already exists", async () => {
      mockFindFirst.mockResolvedValueOnce({
        id: "existing-key",
        userAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(
        delegationService.submitDelegation({
          userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          signature: "0x" + "ab".repeat(65),
          payload: {
            sessionKeyAddress: "0x1234567890abcdef1234567890abcdef12345678",
            permissionScope: "nitrolite_state_update",
            nonce: 1,
            chainId: 1,
          },
        }),
      ).rejects.toThrow("Active delegation already exists");
    });

    it("creates a session key on valid delegation", async () => {
      mockFindFirst.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValue({
        id: "new-key-id",
        userAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        publicKey: "0x1234567890abcdef1234567890abcdef12345678",
        permissionScope: "nitrolite_state_update",
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await delegationService.submitDelegation({
        userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        signature: "0x" + "ab".repeat(65),
        payload: {
          sessionKeyAddress: "0x1234567890abcdef1234567890abcdef12345678",
          permissionScope: "nitrolite_state_update",
          nonce: 1,
          chainId: 1,
        },
      });

      expect(result.sessionKeyId).toBe("new-key-id");
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("revokeDelegation", () => {
    it("revokes an active session key", async () => {
      mockFindFirst.mockResolvedValue({
        id: "key-to-revoke",
        userAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        revokedAt: null,
      });
      mockUpdate.mockResolvedValue({});

      await delegationService.revokeDelegation({
        userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        sessionKeyId: "key-to-revoke",
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "key-to-revoke" },
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });

    it("throws NotFound when session key does not exist", async () => {
      mockFindFirst.mockResolvedValue(null);

      await expect(
        delegationService.revokeDelegation({
          userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          sessionKeyId: "nonexistent",
        }),
      ).rejects.toThrow("Active session key not found");
    });
  });

  describe("validateSessionKey", () => {
    it("returns valid for active key with matching scope", async () => {
      mockFindFirst.mockResolvedValue({
        id: "key-1",
        userAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        permissionScope: "nitrolite_state_update,lifi_intent_fulfillment",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await delegationService.validateSessionKey(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "nitrolite_state_update",
      );

      expect(result.valid).toBe(true);
    });

    it("returns invalid for key missing required scope", async () => {
      mockFindFirst.mockResolvedValue({
        id: "key-1",
        permissionScope: "nitrolite_state_update",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await delegationService.validateSessionKey(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "lifi_intent_fulfillment",
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("lacks scope");
    });

    it("returns invalid when no active session key exists", async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await delegationService.validateSessionKey(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "nitrolite_state_update",
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain("No active session key");
    });
  });
});
