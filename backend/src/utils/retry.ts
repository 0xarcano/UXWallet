/**
 * Exponential backoff retry helper.
 */
import { logger } from "../lib/logger.js";

export interface RetryOptions {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly label?: string;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 5,
  baseDelayMs: 200,
  maxDelayMs: 10_000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {},
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, label } = {
    ...DEFAULT_OPTIONS,
    ...opts,
  };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === maxRetries) break;

      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      const jitter = delay * (0.5 + Math.random() * 0.5);

      logger.warn(
        { attempt: attempt + 1, maxRetries, delay: Math.round(jitter), label },
        "Retrying after error",
      );

      await new Promise((resolve) => setTimeout(resolve, jitter));
    }
  }

  throw lastError;
}
