import type { FastifyPluginAsync } from 'fastify';
import { getPrisma } from '../../lib/prisma.js';
import { getRedis } from '../../lib/redis.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    const checks: Record<string, string> = {};

    // Postgres
    try {
      await getPrisma().$queryRaw`SELECT 1`;
      checks['postgres'] = 'ok';
    } catch {
      checks['postgres'] = 'error';
    }

    // Redis
    try {
      const pong = await getRedis().ping();
      checks['redis'] = pong === 'PONG' ? 'ok' : 'error';
    } catch {
      checks['redis'] = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return reply.status(allOk ? 200 : 503).send({
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  });
};
