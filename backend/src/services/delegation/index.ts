/**
 * Delegation Service — manages Persistent Session Keys (EIP-712 delegations).
 *
 * Responsibilities:
 * - Submit delegation: verify EIP-712 signature, store session key with scoped permissions.
 * - Revoke delegation: immediately invalidate a session key.
 * - Query delegation status.
 *
 * Security constraints (from stack_security.md):
 * - Session keys may ONLY authorize Nitrolite (ERC-7824) state updates and LI.FI (ERC-7683) intent fulfillment.
 * - Session keys must NOT authorize transfers to external addresses.
 */
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { getKeyStore } from "../../kms/index.js";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../lib/errors.js";
import { verifyEip712Delegation, type DelegationPayload } from "./verification.js";
import { config } from "../../config/index.js";

// Allowed permission scopes
const ALLOWED_SCOPES = [
  "nitrolite_state_update",
  "lifi_intent_fulfillment",
] as const;

export type PermissionScope = (typeof ALLOWED_SCOPES)[number];

export interface SubmitDelegationInput {
  readonly userAddress: string;
  readonly signature: string;
  readonly payload: DelegationPayload;
}

export interface RevokeDelegationInput {
  readonly userAddress: string;
  readonly sessionKeyId: string;
}

class DelegationService {
  /**
   * Submit a new delegation.
   * Verifies the EIP-712 signature, validates scope, then persists the session key.
   */
  async submitDelegation(input: SubmitDelegationInput) {
    const { userAddress, signature, payload } = input;

    // 1. Validate requested scopes
    const scopes = payload.permissionScope.split(",").map((s) => s.trim());
    for (const scope of scopes) {
      if (!ALLOWED_SCOPES.includes(scope as PermissionScope)) {
        throw new ValidationError(
          `Invalid permission scope: '${scope}'. Allowed: ${ALLOWED_SCOPES.join(", ")}`,
        );
      }
    }

    // 2. Verify EIP-712 signature recovers to userAddress
    const recoveredAddress = await verifyEip712Delegation(
      signature as `0x${string}`,
      payload,
    );

    if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      throw new ValidationError(
        "Signature does not match the claimed userAddress",
      );
    }

    // 3. Check for existing active delegation (prevent duplicates)
    const existing = await prisma.sessionKey.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      throw new ConflictError(
        "Active delegation already exists. Revoke it first.",
      );
    }

    // 4. Determine session key public key from KMS
    const keyStore = getKeyStore();
    const signer = await keyStore.getSigner("delegation");
    const sessionKeyAddress = await signer.getAddress();

    // 5. Persist session key
    const ttl = payload.ttlSeconds ?? config.sessionKeyDefaultTtlSeconds;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const sessionKey = await prisma.sessionKey.create({
      data: {
        userAddress: userAddress.toLowerCase(),
        publicKey: sessionKeyAddress,
        signature,
        permissionScope: scopes.join(","),
        expiresAt,
      },
    });

    logger.info(
      { sessionKeyId: sessionKey.id, userAddress, expiresAt },
      "Delegation submitted",
    );

    return {
      sessionKeyId: sessionKey.id,
      sessionKeyAddress,
      permissionScope: sessionKey.permissionScope,
      expiresAt: sessionKey.expiresAt.toISOString(),
    };
  }

  /**
   * Revoke an active delegation immediately.
   */
  async revokeDelegation(input: RevokeDelegationInput) {
    const { userAddress, sessionKeyId } = input;

    const sessionKey = await prisma.sessionKey.findFirst({
      where: {
        id: sessionKeyId,
        userAddress: userAddress.toLowerCase(),
        revokedAt: null,
      },
    });

    if (!sessionKey) {
      throw new NotFoundError("Active session key not found");
    }

    await prisma.sessionKey.update({
      where: { id: sessionKeyId },
      data: { revokedAt: new Date() },
    });

    logger.info({ sessionKeyId, userAddress }, "Delegation revoked");
  }

  /**
   * Get current delegation status for a user.
   */
  async getDelegationStatus(userAddress: string) {
    const activeKey = await prisma.sessionKey.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeKey) {
      return { active: false, sessionKey: null };
    }

    return {
      active: true,
      sessionKey: {
        id: activeKey.id,
        publicKey: activeKey.publicKey,
        permissionScope: activeKey.permissionScope,
        expiresAt: activeKey.expiresAt.toISOString(),
        createdAt: activeKey.createdAt.toISOString(),
      },
    };
  }

  /**
   * Validate that a session key is active and has the required scope.
   * Used internally by solver/clearnode when co-signing.
   */
  async validateSessionKey(
    userAddress: string,
    requiredScope: PermissionScope,
  ) {
    const key = await prisma.sessionKey.findFirst({
      where: {
        userAddress: userAddress.toLowerCase(),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!key) {
      return { valid: false, reason: "No active session key" };
    }

    const scopes = key.permissionScope.split(",");
    if (!scopes.includes(requiredScope)) {
      return {
        valid: false,
        reason: `Session key lacks scope: ${requiredScope}`,
      };
    }

    return { valid: true, sessionKey: key };
  }
}

export const delegationService = new DelegationService();
