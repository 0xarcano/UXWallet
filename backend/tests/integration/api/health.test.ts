import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { healthRoutes } from '../../../src/rpc/routes/health.js';

// ── Mock dependencies ───────────────────────────────────────────────────────

vi.mock('../../../src/lib/prisma.js', () => ({
  getPrisma: () => ({
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  }),
}));

vi.mock('../../../src/lib/redis.js', () => ({
  getRedis: () => ({
    ping: vi.fn().mockResolvedValue('PONG'),
  }),
}));

describe('GET /api/health', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(healthRoutes, { prefix: '/api' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with healthy status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);
    expect(body.status).toBe('healthy');
    expect(body.checks.postgres).toBe('ok');
    expect(body.checks.redis).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });
});
