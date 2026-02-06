import type { FastifyInstance, FastifyError } from 'fastify';
import { isAppError } from '../../lib/errors.js';

/**
 * Centralised Fastify error handler.
 * Maps AppErrors to structured JSON; handles validation and rate-limit errors.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    // ── Domain errors ─────────────────────────────────────────────────
    if (isAppError(error as any)) {
      const appErr = error as any;
      request.log.warn({ err: appErr }, appErr.message);
      return reply.status(appErr.statusCode).send(appErr.toJSON());
    }

    // ── Fastify schema-validation errors ──────────────────────────────
    if (error.validation) {
      request.log.warn({ err: error }, 'Validation error');
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    // ── Rate-limit errors ─────────────────────────────────────────────
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests',
        },
      });
    }

    // ── Catch-all ─────────────────────────────────────────────────────
    request.log.error({ err: error }, 'Unhandled error');
    return reply.status(error.statusCode ?? 500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : error.message,
      },
    });
  });
}
