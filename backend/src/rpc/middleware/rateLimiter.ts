/**
 * Rate limiting is configured globally via `@fastify/rate-limit` in app.ts.
 * This module exports route-specific overrides that can be spread into
 * route options via `config.rateLimit`.
 *
 * Usage:
 *   app.post('/sensitive', { ...strictRateLimit }, handler);
 */

export const strictRateLimit = {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: 60_000,
    },
  },
} as const;

export const relaxedRateLimit = {
  config: {
    rateLimit: {
      max: 500,
      timeWindow: 60_000,
    },
  },
} as const;
