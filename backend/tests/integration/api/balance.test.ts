import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { balanceRoutes } from '../../../src/rpc/routes/balance.js';

// ── Mock Prisma ─────────────────────────────────────────────────────────────

const mockBalances = [
  {
    asset: 'usdc',
    balance: '1000000',
    chainId: null,
  },
  {
    asset: 'eth',
    balance: '500000000000000000',
    chainId: null,
  },
];

vi.mock('../../../src/lib/prisma.js', () => ({
  getPrisma: () => ({
    userBalance: {
      findMany: vi.fn().mockResolvedValue(mockBalances),
    },
  }),
}));

describe('GET /api/balance', () => {
  let app: FastifyInstance;
  const userAddress = '0x' + 'a'.repeat(40);

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(balanceRoutes, { prefix: '/api' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns balances for a valid address', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/balance?userAddress=${userAddress}`,
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.body);
    expect(body.userAddress).toBe(userAddress);
    expect(body.balances).toHaveLength(2);
    expect(body.balances[0].asset).toBe('usdc');
  });

  it('returns 400 for invalid address', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/balance?userAddress=not-valid',
    });

    expect(res.statusCode).toBe(400);
  });

  it('filters by asset when provided', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/balance?userAddress=${userAddress}&asset=usdc`,
    });

    expect(res.statusCode).toBe(200);
  });
});
