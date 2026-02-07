import { formatBalance, truncateAddress } from '../format';
import { toUint256String } from '@/types/common';

describe('formatBalance', () => {
  it('formats 18-decimal ETH correctly', () => {
    expect(formatBalance(toUint256String('1500000000000000000'), 18)).toBe('1.5');
    expect(formatBalance(toUint256String('1000000000000000000'), 18)).toBe('1');
    expect(formatBalance(toUint256String('100000000000000'), 18)).toBe('0.0001');
  });

  it('formats 6-decimal USDC correctly', () => {
    expect(formatBalance(toUint256String('1500000'), 6)).toBe('1.5');
    expect(formatBalance(toUint256String('1000000'), 6)).toBe('1');
    expect(formatBalance(toUint256String('100'), 6)).toBe('0.0001');
  });

  it('handles zero', () => {
    expect(formatBalance(toUint256String('0'), 18)).toBe('0');
    expect(formatBalance(toUint256String('0'), 6)).toBe('0');
  });

  it('handles whole numbers without trailing decimals', () => {
    expect(formatBalance(toUint256String('5000000000000000000'), 18)).toBe('5');
  });

  it('handles large amounts', () => {
    expect(formatBalance(toUint256String('1000000000000000000000'), 18)).toBe('1000');
  });

  it('trims trailing zeros from decimal part', () => {
    expect(formatBalance(toUint256String('1500000000000000000'), 18)).toBe('1.5');
  });

  it('throws on invalid decimals', () => {
    expect(() => formatBalance(toUint256String('1'), -1)).toThrow('Invalid decimals value');
    expect(() => formatBalance(toUint256String('1'), 78)).toThrow('Invalid decimals value');
  });
});

describe('truncateAddress', () => {
  it('truncates long addresses', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
  });

  it('does not truncate short strings', () => {
    expect(truncateAddress('0x1234')).toBe('0x1234');
  });

  it('supports custom start and end lengths', () => {
    expect(truncateAddress('0x1234567890abcdef1234567890abcdef12345678', 10, 6)).toBe(
      '0x12345678...345678',
    );
  });
});
