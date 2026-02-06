import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DelegationService } from '../../../src/services/delegation/index.js';

// ── Mock Prisma ─────────────────────────────────────────────────────────────

function createMockPrisma() {
  return {
    sessionKey: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  } as any;
}

// ── Mock verification ───────────────────────────────────────────────────────

vi.mock('../../../src/services/delegation/verification.js', () => ({
  verifyDelegationSignature: vi.fn().mockResolvedValue(true),
  validateAllowance: vi.fn(),
}));

describe('DelegationService', () => {
  let service: DelegationService;
  let prisma: ReturnType<typeof createMockPrisma>;

  const validData = {
    userAddress: '0x' + 'a'.repeat(40),
    sessionKeyAddress: '0x' + 'b'.repeat(40),
    application: 'Flywheel',
    scope: 'console',
    allowances: [{ asset: 'usdc', amount: '1000000' }],
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    signature: '0x' + 'ab'.repeat(32),
  };

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new DelegationService(prisma);
  });

  describe('registerSessionKey', () => {
    it('creates a new session key', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue(null);
      prisma.sessionKey.create.mockResolvedValue({
        id: 'key-1',
        userAddress: validData.userAddress.toLowerCase(),
        sessionKeyAddr: validData.sessionKeyAddress.toLowerCase(),
        application: validData.application,
        scope: validData.scope,
        expiresAt: new Date(validData.expiresAt * 1000),
        status: 'ACTIVE',
      });

      const result = await service.registerSessionKey(validData);

      expect(result.id).toBe('key-1');
      expect(result.status).toBe('ACTIVE');
      expect(prisma.sessionKey.create).toHaveBeenCalled();
    });

    it('revokes existing before re-registering', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'old-key',
        status: 'ACTIVE',
      });
      prisma.sessionKey.update.mockResolvedValue({});
      prisma.sessionKey.create.mockResolvedValue({
        id: 'new-key',
        userAddress: validData.userAddress.toLowerCase(),
        sessionKeyAddr: validData.sessionKeyAddress.toLowerCase(),
        application: validData.application,
        scope: validData.scope,
        expiresAt: new Date(validData.expiresAt * 1000),
        status: 'ACTIVE',
      });

      const result = await service.registerSessionKey(validData);

      expect(prisma.sessionKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'old-key' },
          data: expect.objectContaining({ status: 'REVOKED' }),
        }),
      );
      expect(result.id).toBe('new-key');
    });

    it('rejects expired keys', async () => {
      const expired = {
        ...validData,
        expiresAt: Math.floor(Date.now() / 1000) - 10,
      };

      await expect(service.registerSessionKey(expired)).rejects.toThrow(
        'expired',
      );
    });
  });

  describe('revokeSessionKey', () => {
    it('revokes an active key', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'key-1',
        status: 'ACTIVE',
      });
      prisma.sessionKey.update.mockResolvedValue({});

      await service.revokeSessionKey(
        validData.userAddress,
        validData.sessionKeyAddress,
      );

      expect(prisma.sessionKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'REVOKED' }),
        }),
      );
    });

    it('throws if key not found', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeSessionKey(validData.userAddress, validData.sessionKeyAddress),
      ).rejects.toThrow('not found');
    });

    it('throws if key already revoked', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'key-1',
        status: 'REVOKED',
      });

      await expect(
        service.revokeSessionKey(validData.userAddress, validData.sessionKeyAddress),
      ).rejects.toThrow('already revoked');
    });
  });

  describe('getActiveKeys', () => {
    it('returns only active, non-expired keys', async () => {
      prisma.sessionKey.findMany.mockResolvedValue([
        {
          id: 'k1',
          sessionKeyAddr: '0x' + 'b'.repeat(40),
          application: 'Flywheel',
          scope: 'console',
          allowances: [],
          expiresAt: new Date(Date.now() + 3600000),
          createdAt: new Date(),
        },
      ]);

      const keys = await service.getActiveKeys(validData.userAddress);
      expect(keys).toHaveLength(1);
      expect(keys[0]!.id).toBe('k1');
    });
  });

  describe('validateSessionKey', () => {
    it('returns key if valid', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'k1',
        status: 'ACTIVE',
        expiresAt: futureDate,
      });

      const key = await service.validateSessionKey(
        validData.userAddress,
        validData.sessionKeyAddress,
      );
      expect(key.id).toBe('k1');
    });

    it('throws on revoked key', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'k1',
        status: 'REVOKED',
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(
        service.validateSessionKey(validData.userAddress, validData.sessionKeyAddress),
      ).rejects.toThrow('revoked');
    });

    it('auto-expires and throws on expired key', async () => {
      prisma.sessionKey.findUnique.mockResolvedValue({
        id: 'k1',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.sessionKey.update.mockResolvedValue({});

      await expect(
        service.validateSessionKey(validData.userAddress, validData.sessionKeyAddress),
      ).rejects.toThrow('expired');

      expect(prisma.sessionKey.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'EXPIRED' },
        }),
      );
    });
  });
});
