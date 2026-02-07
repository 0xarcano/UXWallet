import {
  ethereumAddressSchema,
  uint256StringSchema,
  chainIdSchema,
  hexStringSchema,
} from '../validation';

describe('ethereumAddressSchema', () => {
  it('accepts valid Ethereum addresses', () => {
    expect(
      ethereumAddressSchema.safeParse('0x1234567890abcdef1234567890abcdef12345678').success,
    ).toBe(true);
  });

  it('rejects addresses without 0x prefix', () => {
    expect(
      ethereumAddressSchema.safeParse('1234567890abcdef1234567890abcdef12345678').success,
    ).toBe(false);
  });

  it('rejects addresses with wrong length', () => {
    expect(ethereumAddressSchema.safeParse('0x1234').success).toBe(false);
  });
});

describe('uint256StringSchema', () => {
  it('accepts valid uint256 strings', () => {
    expect(uint256StringSchema.safeParse('0').success).toBe(true);
    expect(uint256StringSchema.safeParse('1000000000000000000').success).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(uint256StringSchema.safeParse('-1').success).toBe(false);
  });

  it('rejects hex strings', () => {
    expect(uint256StringSchema.safeParse('0xff').success).toBe(false);
  });
});

describe('chainIdSchema', () => {
  it('accepts positive integers', () => {
    expect(chainIdSchema.safeParse(1).success).toBe(true);
    expect(chainIdSchema.safeParse(11155111).success).toBe(true);
  });

  it('rejects zero', () => {
    expect(chainIdSchema.safeParse(0).success).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(chainIdSchema.safeParse(-1).success).toBe(false);
  });

  it('rejects floats', () => {
    expect(chainIdSchema.safeParse(1.5).success).toBe(false);
  });
});

describe('hexStringSchema', () => {
  it('accepts valid hex strings', () => {
    expect(hexStringSchema.safeParse('0x').success).toBe(true);
    expect(hexStringSchema.safeParse('0xabcdef1234').success).toBe(true);
    expect(hexStringSchema.safeParse('0xABCDEF').success).toBe(true);
  });

  it('rejects strings without 0x prefix', () => {
    expect(hexStringSchema.safeParse('abcdef').success).toBe(false);
  });

  it('rejects strings with invalid hex characters', () => {
    expect(hexStringSchema.safeParse('0xGHIJ').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(hexStringSchema.safeParse('').success).toBe(false);
  });
});
