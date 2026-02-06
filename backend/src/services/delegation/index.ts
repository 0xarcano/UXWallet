import { getPrisma, type PrismaClient } from '../../lib/prisma.js';
import { logger as baseLogger } from '../../lib/logger.js';
import { AppError, ErrorCode } from '../../lib/errors.js';
import {
  verifyDelegationSignature,
  type DelegationData,
} from './verification.js';

const logger = baseLogger.child({ module: 'delegation' });

// ── Service ─────────────────────────────────────────────────────────────────

export class DelegationService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Register a new session key delegation.
   * Validates the EIP-712 signature, checks for duplicates/expiry,
   * and persists to the session_keys table.
   */
  async registerSessionKey(data: DelegationData) {
    // ── Validate signature ──────────────────────────────────────────────
    const isValid = await verifyDelegationSignature(data);
    if (!isValid) {
      throw new AppError(
        ErrorCode.INVALID_SIGNATURE,
        'Delegation signature verification failed',
      );
    }

    // ── Check expiry ────────────────────────────────────────────────────
    const expiresAt = new Date(data.expiresAt * 1000);
    if (expiresAt <= new Date()) {
      throw new AppError(
        ErrorCode.SESSION_KEY_EXPIRED,
        'Session key has already expired',
      );
    }

    // ── Upsert (revoke old if exists, create new) ──────────────────────
    const userAddress = data.userAddress.toLowerCase();
    const sessionKeyAddr = data.sessionKeyAddress.toLowerCase();

    const existing = await this.prisma.sessionKey.findUnique({
      where: {
        userAddress_sessionKeyAddr: { userAddress, sessionKeyAddr },
      },
    });

    if (existing && existing.status === 'ACTIVE') {
      // Revoke the old one before creating a new one
      await this.prisma.sessionKey.update({
        where: { id: existing.id },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
      logger.info(
        { id: existing.id },
        'Revoked existing session key before re-registration',
      );
    }

    const sessionKey = await this.prisma.sessionKey.create({
      data: {
        userAddress,
        sessionKeyAddr,
        application: data.application,
        scope: data.scope,
        allowances: data.allowances,
        expiresAt,
      },
    });

    logger.info(
      { id: sessionKey.id, userAddress, sessionKeyAddr },
      'Session key registered',
    );

    return {
      id: sessionKey.id,
      userAddress: sessionKey.userAddress,
      sessionKeyAddr: sessionKey.sessionKeyAddr,
      application: sessionKey.application,
      scope: sessionKey.scope,
      expiresAt: sessionKey.expiresAt.toISOString(),
      status: sessionKey.status,
    };
  }

  /**
   * Revoke a session key.
   */
  async revokeSessionKey(
    userAddress: string,
    sessionKeyAddress: string,
  ): Promise<void> {
    const key = await this.prisma.sessionKey.findUnique({
      where: {
        userAddress_sessionKeyAddr: {
          userAddress: userAddress.toLowerCase(),
          sessionKeyAddr: sessionKeyAddress.toLowerCase(),
        },
      },
    });

    if (!key) {
      throw AppError.notFound('Session key not found');
    }

    if (key.status !== 'ACTIVE') {
      throw new AppError(
        ErrorCode.SESSION_KEY_REVOKED,
        'Session key is already revoked or expired',
      );
    }

    await this.prisma.sessionKey.update({
      where: { id: key.id },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    logger.info(
      { id: key.id, userAddress, sessionKeyAddress },
      'Session key revoked',
    );
  }

  /**
   * List active (non-expired, non-revoked) session keys for a user.
   */
  async getActiveKeys(userAddress: string) {
    const keys = await this.prisma.sessionKey.findMany({
      where: {
        userAddress: userAddress.toLowerCase(),
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      id: k.id,
      sessionKeyAddr: k.sessionKeyAddr,
      application: k.application,
      scope: k.scope,
      allowances: k.allowances,
      expiresAt: k.expiresAt.toISOString(),
      createdAt: k.createdAt.toISOString(),
    }));
  }

  /**
   * Validate that a session key is active and not expired.
   * Returns the session key record if valid, throws otherwise.
   */
  async validateSessionKey(
    userAddress: string,
    sessionKeyAddr: string,
  ) {
    const key = await this.prisma.sessionKey.findUnique({
      where: {
        userAddress_sessionKeyAddr: {
          userAddress: userAddress.toLowerCase(),
          sessionKeyAddr: sessionKeyAddr.toLowerCase(),
        },
      },
    });

    if (!key) {
      throw new AppError(
        ErrorCode.SESSION_KEY_INVALID,
        'Session key not found',
      );
    }

    if (key.status === 'REVOKED') {
      throw new AppError(
        ErrorCode.SESSION_KEY_REVOKED,
        'Session key has been revoked',
      );
    }

    if (key.expiresAt <= new Date()) {
      // Auto-expire
      await this.prisma.sessionKey.update({
        where: { id: key.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError(
        ErrorCode.SESSION_KEY_EXPIRED,
        'Session key has expired',
      );
    }

    return key;
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let _service: DelegationService | undefined;

export function getDelegationService(): DelegationService {
  if (!_service) {
    _service = new DelegationService(getPrisma());
  }
  return _service;
}

export function resetDelegationService(): void {
  _service = undefined;
}
