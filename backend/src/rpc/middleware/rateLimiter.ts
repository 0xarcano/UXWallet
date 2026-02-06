/**
 * Rate limiting middleware using Redis sliding window.
 *
 * Per general_security.md: Implement rate limiting on RPC endpoints to prevent abuse.
 */
import type { Request, Response, NextFunction } from "express";
import { redis } from "../../lib/redis.js";
import { RateLimitError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

export interface RateLimitOptions {
  /** Max requests in the window. */
  readonly maxRequests: number;
  /** Window size in seconds. */
  readonly windowSeconds: number;
  /** Key prefix for Redis. */
  readonly prefix?: string;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 100,
  windowSeconds: 60,
  prefix: "rl",
};

/**
 * Create a rate limiter middleware.
 * Uses a Redis-based sliding window counter keyed by IP address.
 */
export function rateLimiter(opts: Partial<RateLimitOptions> = {}) {
  const { maxRequests, windowSeconds, prefix } = { ...DEFAULT_OPTIONS, ...opts };

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `${prefix}:${req.ip}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current));

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        res.setHeader("Retry-After", ttl);
        throw new RateLimitError(
          `Rate limit exceeded. Try again in ${ttl} seconds.`,
        );
      }

      next();
    } catch (err) {
      if (err instanceof RateLimitError) {
        next(err);
        return;
      }
      // If Redis is down, allow the request through (fail open)
      logger.warn({ err }, "Rate limiter Redis error, allowing request");
      next();
    }
  };
}

/**
 * Stricter rate limiter for sensitive endpoints (e.g., delegation, withdrawal).
 */
export const sensitiveRateLimiter = rateLimiter({
  maxRequests: 20,
  windowSeconds: 60,
  prefix: "rl:sensitive",
});

/**
 * Standard rate limiter for regular endpoints.
 */
export const standardRateLimiter = rateLimiter({
  maxRequests: 200,
  windowSeconds: 60,
  prefix: "rl:standard",
});
