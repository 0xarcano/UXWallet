/**
 * Express application factory.
 * Mounts middleware and all route modules.
 */
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./rpc/middleware/errorHandler.js";
import { requestIdMiddleware } from "./rpc/middleware/requestId.js";
import { standardRateLimiter, sensitiveRateLimiter } from "./rpc/middleware/rateLimiter.js";
import { healthRouter } from "./rpc/routes/health.js";
import { delegationRouter } from "./rpc/routes/delegation.js";
import { balanceRouter } from "./rpc/routes/balance.js";
import { withdrawalRouter } from "./rpc/routes/withdrawal.js";
import { stateRouter } from "./rpc/routes/state.js";

export function createApp(): Express {
  const app = express();

  // ── Global middleware ──
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(pinoHttp({ logger }));

  // ── Routes ──
  app.use("/health", healthRouter);
  app.use("/api/delegation", sensitiveRateLimiter, delegationRouter);
  app.use("/api/balance", standardRateLimiter, balanceRouter);
  app.use("/api/withdrawal", sensitiveRateLimiter, withdrawalRouter);
  app.use("/api/state", standardRateLimiter, stateRouter);

  // ── Error handler (must be last) ──
  app.use(errorHandler);

  return app;
}
