import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, withTimeout } from '../../../src/utils/retry.js';

describe('retryWithBackoff', () => {
  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on transient failure', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('ok');

    const result = await retryWithBackoff(fn, { initialDelayMs: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent'));

    await expect(
      retryWithBackoff(fn, { maxRetries: 2, initialDelayMs: 10 }),
    ).rejects.toThrow('persistent');

    // initial call + 2 retries = 3
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry when isRetryable returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'));

    await expect(
      retryWithBackoff(fn, {
        maxRetries: 5,
        initialDelayMs: 10,
        isRetryable: () => false,
      }),
    ).rejects.toThrow('fatal');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('respects maxDelayMs cap', async () => {
    const delays: number[] = [];
    const originalSetTimeout = globalThis.setTimeout;

    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((
      cb: (...args: any[]) => void,
      ms?: number,
    ) => {
      if (ms && ms > 5) delays.push(ms);
      return originalSetTimeout(cb, 10); // speed up
    }) as any);

    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await retryWithBackoff(fn, {
      maxRetries: 4,
      initialDelayMs: 100,
      maxDelayMs: 250,
    }).catch(() => {});

    // All delays should be ≤ maxDelayMs
    for (const d of delays) {
      expect(d).toBeLessThanOrEqual(250);
    }

    vi.restoreAllMocks();
  });
});

describe('withTimeout', () => {
  it('resolves when within timeout', async () => {
    const result = await withTimeout(Promise.resolve('fast'), 1000);
    expect(result).toBe('fast');
  });

  it('rejects when timeout exceeded', async () => {
    const slow = new Promise((resolve) =>
      setTimeout(() => resolve('late'), 5000),
    );

    await expect(withTimeout(slow, 50, 'too slow')).rejects.toThrow(
      'too slow',
    );
  });

  it('uses default message when none provided', async () => {
    const slow = new Promise(() => {}); // never resolves
    await expect(withTimeout(slow, 50)).rejects.toThrow('Operation timed out');
  });
});
