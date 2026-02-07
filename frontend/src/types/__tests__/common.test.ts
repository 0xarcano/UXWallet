import {
  toUint256String,
  toEthereumAddress,
  isValidUint256String,
  isValidEthereumAddress,
} from '../common';

describe('toUint256String', () => {
  it('accepts valid numeric strings', () => {
    expect(toUint256String('0')).toBe('0');
    expect(toUint256String('1500000000000000000')).toBe('1500000000000000000');
  });

  it('rejects non-numeric strings', () => {
    expect(() => toUint256String('')).toThrow('Invalid uint256 string');
    expect(() => toUint256String('abc')).toThrow('Invalid uint256 string');
    expect(() => toUint256String('-1')).toThrow('Invalid uint256 string');
    expect(() => toUint256String('1.5')).toThrow('Invalid uint256 string');
    expect(() => toUint256String('0x123')).toThrow('Invalid uint256 string');
  });
});

describe('toEthereumAddress', () => {
  it('accepts valid addresses and lowercases them', () => {
    const addr = toEthereumAddress('0x1234567890abcdef1234567890abcdef12345678');
    expect(addr).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('lowercases mixed-case addresses', () => {
    const addr = toEthereumAddress('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12');
    expect(addr).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
  });

  it('rejects invalid addresses', () => {
    expect(() => toEthereumAddress('')).toThrow('Invalid Ethereum address');
    expect(() => toEthereumAddress('0x123')).toThrow('Invalid Ethereum address');
    expect(() => toEthereumAddress('not-an-address')).toThrow('Invalid Ethereum address');
    expect(() => toEthereumAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toThrow(
      'Invalid Ethereum address',
    );
  });
});

describe('isValidUint256String', () => {
  it('returns true for valid values', () => {
    expect(isValidUint256String('0')).toBe(true);
    expect(isValidUint256String('12345')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isValidUint256String('')).toBe(false);
    expect(isValidUint256String('abc')).toBe(false);
    expect(isValidUint256String('-1')).toBe(false);
  });
});

describe('isValidEthereumAddress', () => {
  it('returns true for valid addresses', () => {
    expect(isValidEthereumAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true);
  });

  it('returns false for invalid addresses', () => {
    expect(isValidEthereumAddress('0x123')).toBe(false);
    expect(isValidEthereumAddress('')).toBe(false);
  });
});
