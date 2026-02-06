import { describe, it, expect } from 'vitest';
import {
  evaluateProfitability,
  splitReward,
} from '../../../src/services/solver/profitability.js';

describe('evaluateProfitability', () => {
  it('returns profitable for a standard intent', () => {
    const result = evaluateProfitability({
      intentAmount: 1_000_000n,
      estimatedGasCost: 100n,
      bridgeFee: 0n,
      minSpreadBps: 1,
    });

    expect(result.isProfitable).toBe(true);
    // 0.30 % of 1_000_000 = 3000
    expect(result.grossReward).toBe(3000n);
    expect(result.netReward).toBe(2900n); // 3000 − 100
    expect(result.spreadBps).toBeGreaterThan(0);
  });

  it('rejects when gas exceeds reward', () => {
    const result = evaluateProfitability({
      intentAmount: 1_000n,
      estimatedGasCost: 10_000n,
      bridgeFee: 0n,
      minSpreadBps: 1,
    });

    expect(result.isProfitable).toBe(false);
    expect(result.netReward).toBe(0n);
  });

  it('accounts for bridge fees', () => {
    const result = evaluateProfitability({
      intentAmount: 1_000_000n,
      estimatedGasCost: 0n,
      bridgeFee: 500n,
      minSpreadBps: 1,
    });

    // grossReward = 3000, net = 3000 − 500 = 2500
    expect(result.netReward).toBe(2500n);
    expect(result.isProfitable).toBe(true);
  });

  it('rejects when spread below minSpreadBps', () => {
    const result = evaluateProfitability({
      intentAmount: 1_000_000n,
      estimatedGasCost: 250n,
      bridgeFee: 0n,
      minSpreadBps: 100, // 1 % required
    });

    // net = 300 − 250 = 50 → 0.5 bps < 100
    expect(result.isProfitable).toBe(false);
  });

  it('throws on non-positive intentAmount', () => {
    expect(() =>
      evaluateProfitability({
        intentAmount: 0n,
        estimatedGasCost: 0n,
        bridgeFee: 0n,
        minSpreadBps: 0,
      }),
    ).toThrow();
  });
});

describe('splitReward', () => {
  it('splits evenly when even', () => {
    const { userReward, treasuryReward } = splitReward(100n);
    expect(userReward).toBe(50n);
    expect(treasuryReward).toBe(50n);
  });

  it('gives rounding dust to treasury', () => {
    const { userReward, treasuryReward } = splitReward(101n);
    expect(userReward).toBe(50n);
    expect(treasuryReward).toBe(51n);
  });

  it('handles zero', () => {
    const { userReward, treasuryReward } = splitReward(0n);
    expect(userReward).toBe(0n);
    expect(treasuryReward).toBe(0n);
  });

  it('handles 1 (indivisible)', () => {
    const { userReward, treasuryReward } = splitReward(1n);
    expect(userReward).toBe(0n);
    expect(treasuryReward).toBe(1n);
  });
});
