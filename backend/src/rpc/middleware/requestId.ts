import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';

/**
 * Assigns a unique request ID to every incoming request.
 * Uses the `x-request-id` header if provided, otherwise generates a UUID.
 */
export function registerRequestId(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, reply) => {
    const incoming = request.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();

    // Fastify exposes request.id via the genReqId option, but we also
    // propagate via header for downstream systems.
    (request as any).requestId = requestId;
    reply.header('x-request-id', requestId);
  });
}
