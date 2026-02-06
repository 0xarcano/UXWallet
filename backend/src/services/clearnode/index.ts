/**
 * ClearNode Service — Virtual Ledger + state management + real-time notifications.
 *
 * Responsibilities:
 * - Maintain the Virtual Ledger (user_balances).
 * - Persist latest signed Nitrolite state (replay protection via sequence numbers).
 * - Emit `bu` (balance update) WebSocket notifications.
 * - Provide balance queries and state proof fetch.
 */
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../lib/logger.js";
import { emitBalanceUpdate } from "../../websocket/server.js";
import { NotFoundError, ConflictError } from "../../lib/errors.js";
import { Prisma } from "@prisma/client";

export interface StateUpdateInput {
  readonly sessionId: string;
  readonly sequenceNumber: number;
  readonly stateData: Record<string, unknown>;
  readonly signatureA: string; // user signature
  readonly signatureB: string; // clearnode signature
  readonly balanceUpdates?: BalanceUpdateEntry[];
}

export interface BalanceUpdateEntry {
  readonly userAddress: string;
  readonly asset: string;
  readonly newBalance: string;
  readonly chainId?: number | null;
}

class ClearNodeService {
  /**
   * Apply a validated state update atomically:
   * 1. Verify sequence number (replay protection).
   * 2. Persist new transaction + update session state.
   * 3. Update user balances.
   * 4. Emit `bu` notifications.
   */
  async applyStateUpdate(input: StateUpdateInput): Promise<void> {
    const {
      sessionId,
      sequenceNumber,
      stateData,
      signatureA,
      signatureB,
      balanceUpdates,
    } = input;

    await prisma.$transaction(async (tx) => {
      // 1. Fetch session and verify sequence
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundError(`Session not found: ${sessionId}`);
      }

      if (session.status !== "OPEN") {
        throw new ConflictError(`Session is not open: ${session.status}`);
      }

      if (sequenceNumber !== session.sequenceNumber + 1) {
        throw new ConflictError(
          `Invalid sequence number. Expected ${session.sequenceNumber + 1}, got ${sequenceNumber}`,
        );
      }

      // 2. Create transaction record
      await tx.transaction.create({
        data: {
          sessionId,
          sequenceNumber,
          type: "STATE_UPDATE",
          stateData: stateData as Prisma.InputJsonValue,
          signatureA,
          signatureB,
        },
      });

      // 3. Update session with latest state
      const stateHash = computeStateHash(stateData);
      await tx.session.update({
        where: { id: sessionId },
        data: {
          sequenceNumber,
          latestStateHash: stateHash,
          latestStateSig: signatureB, // ClearNode's co-signature
          latestStateData: stateData as Prisma.InputJsonValue,
        },
      });

      // 4. Update user balances if provided
      if (balanceUpdates && balanceUpdates.length > 0) {
        for (const update of balanceUpdates) {
          const addr = update.userAddress.toLowerCase();
          const cid = update.chainId ?? undefined;

          // findFirst + create/update pattern (compound unique includes nullable chainId)
          const existing = await tx.userBalance.findFirst({
            where: { userAddress: addr, asset: update.asset, chainId: cid ?? null },
          });

          if (existing) {
            await tx.userBalance.update({
              where: { id: existing.id },
              data: { balance: update.newBalance },
            });
          } else {
            await tx.userBalance.create({
              data: {
                userAddress: addr,
                asset: update.asset,
                balance: update.newBalance,
                chainId: cid,
              },
            });
          }
        }
      }
    });

    // 5. Emit `bu` notifications (outside transaction for speed)
    if (balanceUpdates) {
      const addressesNotified = new Set<string>();
      for (const update of balanceUpdates) {
        const addr = update.userAddress.toLowerCase();
        if (!addressesNotified.has(addr)) {
          addressesNotified.add(addr);
          emitBalanceUpdate(addr, {
            sessionId,
            sequenceNumber,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    logger.info({ sessionId, sequenceNumber }, "State update applied");
  }

  /**
   * Get unified balances for a user (aggregated across all chains).
   */
  async getUnifiedBalances(userAddress: string) {
    const balances = await prisma.userBalance.findMany({
      where: { userAddress: userAddress.toLowerCase() },
      orderBy: { asset: "asc" },
    });

    // Group by asset: unified (chainId=null) + per-chain breakdown
    const unified: Record<string, { unified: string; chains: Record<number, string> }> = {};

    for (const b of balances) {
      if (!unified[b.asset]) {
        unified[b.asset] = { unified: "0", chains: {} };
      }
      if (b.chainId === null) {
        unified[b.asset].unified = b.balance;
      } else {
        unified[b.asset].chains[b.chainId] = b.balance;
      }
    }

    return unified;
  }

  /**
   * Get unified balance for a specific asset.
   */
  async getUnifiedBalance(userAddress: string, asset: string) {
    const balances = await prisma.userBalance.findMany({
      where: { userAddress: userAddress.toLowerCase(), asset },
    });

    if (balances.length === 0) {
      return { asset, unified: "0", chains: {} };
    }

    const result: { asset: string; unified: string; chains: Record<number, string> } = {
      asset,
      unified: "0",
      chains: {},
    };

    for (const b of balances) {
      if (b.chainId === null) {
        result.unified = b.balance;
      } else {
        result.chains[b.chainId] = b.balance;
      }
    }

    return result;
  }

  /**
   * Get latest signed state proof for a user (for Force Withdrawal / Adjudicator).
   */
  async getLatestStateProof(userAddress: string) {
    const sessions = await prisma.session.findMany({
      where: {
        participantA: userAddress.toLowerCase(),
        latestStateData: { not: Prisma.DbNull },
      },
      orderBy: { updatedAt: "desc" },
      take: 1,
    });

    if (sessions.length === 0) {
      throw new NotFoundError("No signed state found for this address");
    }

    const session = sessions[0];
    return {
      channelId: session.channelId,
      sequenceNumber: session.sequenceNumber,
      stateHash: session.latestStateHash,
      stateSignature: session.latestStateSig,
      stateData: session.latestStateData,
      updatedAt: session.updatedAt.toISOString(),
    };
  }

  /**
   * Get active sessions for a user.
   */
  async getActiveSessions(userAddress: string) {
    const sessions = await prisma.session.findMany({
      where: {
        participantA: userAddress.toLowerCase(),
        status: "OPEN",
      },
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      channelId: s.channelId,
      status: s.status,
      sequenceNumber: s.sequenceNumber,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  /**
   * Create or open a new Nitrolite session.
   */
  async openSession(channelId: string, participantA: string, participantB: string) {
    const session = await prisma.session.create({
      data: {
        channelId,
        participantA: participantA.toLowerCase(),
        participantB: participantB.toLowerCase(),
        status: "OPEN",
        sequenceNumber: 0,
      },
    });

    logger.info({ sessionId: session.id, channelId }, "Session opened");
    return session;
  }
}

/**
 * Simple state hash computation (placeholder — real impl would keccak256 the canonical encoding).
 */
function computeStateHash(stateData: Record<string, unknown>): string {
  // In production, use keccak256 over canonical ABI-encoded state
  const serialized = JSON.stringify(stateData, Object.keys(stateData).sort());
  // Simple hash placeholder
  let hash = 0;
  for (let i = 0; i < serialized.length; i++) {
    const char = serialized.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
}

export const clearNodeService = new ClearNodeService();
