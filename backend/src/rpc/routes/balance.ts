import type { FastifyPluginAsync } from 'fastify';
import { getPrisma } from '../../lib/prisma.js';
import { balanceQuerySchema } from '../../utils/validation.js';
import { AppError } from '../../lib/errors.js';

export const balanceRoutes: FastifyPluginAsync = async (app) => {
  /**
   * GET /api/balance?userAddress=0x…&asset=eth
   *
   * Returns unified balances for the user, optionally filtered by asset.
   */
  app.get('/balance', async (request, reply) => {
    const parsed = balanceQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      throw AppError.validation('Invalid balance query', {
        issues: parsed.error.issues,
      });
    }

    const { userAddress, asset } = parsed.data;
    const prisma = getPrisma();

    const where: Record<string, unknown> = {
      userAddress: userAddress.toLowerCase(),
    };
    if (asset) {
      where['asset'] = asset.toLowerCase();
    }

    const balances = await prisma.userBalance.findMany({ where });

    return reply.send({
      userAddress,
      balances: balances.map((b) => ({
        asset: b.asset,
        balance: b.balance,
        chainId: b.chainId,
      })),
    });
  });
};
