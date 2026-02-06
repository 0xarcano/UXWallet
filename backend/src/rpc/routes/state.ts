import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getPrisma } from '../../lib/prisma.js';
import { ethereumAddress, hexString } from '../../utils/validation.js';
import { AppError } from '../../lib/errors.js';

const channelQuery = z.object({ channelId: hexString });
const userQuery = z.object({ userAddress: ethereumAddress });

export const stateRoutes: FastifyPluginAsync = async (app) => {
  /**
   * GET /api/state/channel/:channelId
   *
   * Returns the latest persisted state for a single channel.
   */
  app.get('/state/channel/:channelId', async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const parsed = channelQuery.safeParse({ channelId });
    if (!parsed.success) {
      throw AppError.validation('Invalid channel ID');
    }

    const session = await getPrisma().session.findUnique({
      where: { channelId: parsed.data.channelId },
      include: { transactions: { orderBy: { nonce: 'desc' }, take: 1 } },
    });

    if (!session) throw AppError.notFound('Session not found');

    return reply.send({ session });
  });

  /**
   * GET /api/state/sessions?userAddress=0x…
   *
   * Returns all sessions for a user.
   */
  app.get('/state/sessions', async (request, reply) => {
    const parsed = userQuery.safeParse(request.query);
    if (!parsed.success) {
      throw AppError.validation('Invalid query', {
        issues: parsed.error.issues,
      });
    }

    const sessions = await getPrisma().session.findMany({
      where: { participantA: parsed.data.userAddress.toLowerCase() },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({ sessions });
  });
};
