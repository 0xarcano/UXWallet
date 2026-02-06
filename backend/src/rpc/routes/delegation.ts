import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  delegationRequestSchema,
  ethereumAddress,
} from '../../utils/validation.js';
import { AppError } from '../../lib/errors.js';
import { getDelegationService } from '../../services/delegation/index.js';
import { strictRateLimit } from '../middleware/rateLimiter.js';

const revokeSchema = z.object({
  userAddress: ethereumAddress,
  sessionKeyAddress: ethereumAddress,
});

const keysQuery = z.object({ userAddress: ethereumAddress });

export const delegationRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /api/delegation/register
   *
   * Register a new session key delegation (EIP-712 signed by user).
   */
  app.post('/delegation/register', strictRateLimit, async (request, reply) => {
    const parsed = delegationRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      throw AppError.validation('Invalid delegation request', {
        issues: parsed.error.issues,
      });
    }

    const service = getDelegationService();
    const result = await service.registerSessionKey(parsed.data);
    return reply.status(201).send(result);
  });

  /**
   * POST /api/delegation/revoke
   *
   * Revoke an existing session key.
   */
  app.post('/delegation/revoke', strictRateLimit, async (request, reply) => {
    const parsed = revokeSchema.safeParse(request.body);
    if (!parsed.success) {
      throw AppError.validation('Invalid revoke request', {
        issues: parsed.error.issues,
      });
    }

    const service = getDelegationService();
    await service.revokeSessionKey(
      parsed.data.userAddress,
      parsed.data.sessionKeyAddress,
    );
    return reply.send({ success: true });
  });

  /**
   * GET /api/delegation/keys?userAddress=0x…
   *
   * List active session keys for a user.
   */
  app.get('/delegation/keys', async (request, reply) => {
    const parsed = keysQuery.safeParse(request.query);
    if (!parsed.success) {
      throw AppError.validation('Invalid query', {
        issues: parsed.error.issues,
      });
    }

    const service = getDelegationService();
    const keys = await service.getActiveKeys(parsed.data.userAddress);
    return reply.send({ keys });
  });
};
