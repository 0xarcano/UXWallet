import { formatBalance, truncateAddress, parseAmount } from '../format';
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

describe('parseAmount', () => {
  it('parses whole numbers for 18 decimals', () => {
    expect(parseAmount('1', 18)).toBe('1000000000000000000');
    expect(parseAmount('5', 18)).toBe('5000000000000000000');
  });

  it('parses decimal amounts for 18 decimals', () => {
    expect(parseAmount('1.5', 18)).toBe('1500000000000000000');
    expect(parseAmount('0.0001', 18)).toBe('100000000000000');
  });

  it('parses 6-decimal USDC amounts', () => {
    expect(parseAmount('1', 6)).toBe('1000000');
    expect(parseAmount('1.5', 6)).toBe('1500000');
    expect(parseAmount('0.0001', 6)).toBe('100');
  });

  it('parses zero', () => {
    expect(parseAmount('0', 18)).toBe('0');
    expect(parseAmount('0.0', 18)).toBe('0');
  });

  it('handles large amounts', () => {
    expect(parseAmount('1000', 18)).toBe('1000000000000000000000');
  });

  it('throws on invalid format', () => {
    expect(() => parseAmount('', 18)).toThrow('Invalid amount format');
    expect(() => parseAmount('abc', 18)).toThrow('Invalid amount format');
    expect(() => parseAmount('-1', 18)).toThrow('Invalid amount format');
    expect(() => parseAmount('1.2.3', 18)).toThrow('Invalid amount format');
  });

  it('throws on too many decimal places', () => {
    expect(() => parseAmount('1.1234567', 6)).toThrow('Too many decimal places');
  });

  it('throws on invalid decimals value', () => {
    expect(() => parseAmount('1', -1)).toThrow('Invalid decimals value');
    expect(() => parseAmount('1', 78)).toThrow('Invalid decimals value');
  });

  it('is the inverse of formatBalance', () => {
    const original = '1500000000000000000';
    const display = formatBalance(toUint256String(original), 18);
    const result = parseAmount(display, 18);
    expect(result).toBe(original);
  });
});
