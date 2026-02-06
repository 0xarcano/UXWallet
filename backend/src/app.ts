import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';

import { getConfig } from './config/index.js';
import { createLogger } from './lib/logger.js';
import { getRedis } from './lib/redis.js';

import { registerRequestId } from './rpc/middleware/requestId.js';
import { registerErrorHandler } from './rpc/middleware/errorHandler.js';

import { healthRoutes } from './rpc/routes/health.js';
import { balanceRoutes } from './rpc/routes/balance.js';
import { stateRoutes } from './rpc/routes/state.js';
import { delegationRoutes } from './rpc/routes/delegation.js';
import { withdrawalRoutes } from './rpc/routes/withdrawal.js';
import { registerWebSocket } from './websocket/server.js';

export async function buildApp() {
  const config = getConfig();
  const log = createLogger('server', config.LOG_LEVEL);

  const app = Fastify({ logger: log });

  // ── Plugins ─────────────────────────────────────────────────────────────
  await app.register(cors, { origin: true });

  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    redis: getRedis(),
  });

  await app.register(websocket);

  // ── Middleware ───────────────────────────────────────────────────────────
  registerRequestId(app);
  registerErrorHandler(app);

  // ── Routes ──────────────────────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(balanceRoutes, { prefix: '/api' });
  await app.register(stateRoutes, { prefix: '/api' });
  await app.register(delegationRoutes, { prefix: '/api' });
  await app.register(withdrawalRoutes, { prefix: '/api' });

  // ── WebSocket ───────────────────────────────────────────────────────────
  await app.register(registerWebSocket);

  return app;
}
