import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getPrisma } from '../../lib/prisma.js';
import {
  withdrawalRequestSchema,
  ethereumAddress,
  hexString,
} from '../../utils/validation.js';
import { AppError, ErrorCode } from '../../lib/errors.js';
import { publishBalanceUpdate } from '../../websocket/server.js';
import { strictRateLimit } from '../middleware/rateLimiter.js';

const statusQuery = z.object({ id: z.string().uuid() });

export const withdrawalRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /api/withdrawal/request
   *
   * Initiate a withdrawal from the aggregated pool.
   */
  app.post(
    '/withdrawal/request',
    strictRateLimit,
    async (request, reply) => {
      const parsed = withdrawalRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        throw AppError.validation('Invalid withdrawal request', {
          issues: parsed.error.issues,
        });
      }

      const { userAddress, asset, amount, chainId } = parsed.data;
      const prisma = getPrisma();

      // ── Check user balance ────────────────────────────────────────────
      const balance = await prisma.userBalance.findFirst({
        where: {
          userAddress: userAddress.toLowerCase(),
          asset: asset.toLowerCase(),
        },
      });

      if (!balance || BigInt(balance.balance) < BigInt(amount)) {
        throw AppError.insufficientFunds(
          `Insufficient ${asset} balance for withdrawal`,
        );
      }

      // ── Create withdrawal request ─────────────────────────────────────
      const withdrawal = await prisma.withdrawalRequest.create({
        data: {
          userAddress: userAddress.toLowerCase(),
          asset: asset.toLowerCase(),
          amount,
          chainId,
        },
      });

      // Emit a balance update notification
      await publishBalanceUpdate({
        userAddress: userAddress.toLowerCase(),
        asset: asset.toLowerCase(),
        balance: (BigInt(balance.balance) - BigInt(amount)).toString(),
        chainId,
      });

      return reply.status(201).send({ withdrawal });
    },
  );

  /**
   * GET /api/withdrawal/status/:id
   *
   * Check the status of a withdrawal request.
   */
  app.get('/withdrawal/status/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = statusQuery.safeParse({ id });
    if (!parsed.success) {
      throw AppError.validation('Invalid withdrawal ID');
    }

    const withdrawal = await getPrisma().withdrawalRequest.findUnique({
      where: { id: parsed.data.id },
    });

    if (!withdrawal) throw AppError.notFound('Withdrawal request not found');

    return reply.send({ withdrawal });
  });
};
