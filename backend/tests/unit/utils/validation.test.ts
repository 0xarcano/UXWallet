import { describe, it, expect } from 'vitest';
import {
  ethereumAddress,
  uint256String,
  chainId,
  hexString,
  allowanceSchema,
  delegationRequestSchema,
  withdrawalRequestSchema,
} from '../../../src/utils/validation.js';

describe('ethereumAddress', () => {
  it('accepts valid checksummed address', () => {
    expect(
      ethereumAddress.safeParse('0x' + 'aB'.repeat(20)).success,
    ).toBe(true);
  });

  it('accepts lowercase address', () => {
    expect(
      ethereumAddress.safeParse('0x' + 'a'.repeat(40)).success,
    ).toBe(true);
  });

  it('rejects too-short address', () => {
    expect(ethereumAddress.safeParse('0x123').success).toBe(false);
  });

  it('rejects missing 0x prefix', () => {
    expect(
      ethereumAddress.safeParse('a'.repeat(40)).success,
    ).toBe(false);
  });
});

describe('uint256String', () => {
  it('accepts "0"', () => {
    expect(uint256String.safeParse('0').success).toBe(true);
  });

  it('accepts large number', () => {
    expect(uint256String.safeParse('999999999999999999').success).toBe(true);
  });

  it('rejects negative', () => {
    expect(uint256String.safeParse('-1').success).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(uint256String.safeParse('abc').success).toBe(false);
  });
});

describe('chainId', () => {
  it('accepts positive int', () => {
    expect(chainId.safeParse(11155111).success).toBe(true);
  });

  it('rejects zero', () => {
    expect(chainId.safeParse(0).success).toBe(false);
  });

  it('rejects float', () => {
    expect(chainId.safeParse(1.5).success).toBe(false);
  });
});

describe('hexString', () => {
  it('accepts 0x-prefixed hex', () => {
    expect(hexString.safeParse('0xdeadbeef').success).toBe(true);
    expect(hexString.safeParse('0x').success).toBe(true);
  });

  it('rejects non-hex', () => {
    expect(hexString.safeParse('deadbeef').success).toBe(false);
    expect(hexString.safeParse('0xGG').success).toBe(false);
  });
});

describe('allowanceSchema', () => {
  it('accepts valid allowance', () => {
    expect(
      allowanceSchema.safeParse({ asset: 'usdc', amount: '1000000' }).success,
    ).toBe(true);
  });

  it('rejects missing asset', () => {
    expect(
      allowanceSchema.safeParse({ amount: '100' }).success,
    ).toBe(false);
  });
});

describe('delegationRequestSchema', () => {
  const valid = {
    userAddress: '0x' + 'a'.repeat(40),
    sessionKeyAddress: '0x' + 'b'.repeat(40),
    application: 'Flywheel',
    scope: 'console',
    allowances: [{ asset: 'usdc', amount: '1000000' }],
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    signature: '0x' + 'ab'.repeat(32),
  };

  it('accepts valid delegation', () => {
    expect(delegationRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing signature', () => {
    const { signature, ...rest } = valid;
    expect(delegationRequestSchema.safeParse(rest).success).toBe(false);
  });
});

describe('withdrawalRequestSchema', () => {
  it('accepts valid withdrawal', () => {
    expect(
      withdrawalRequestSchema.safeParse({
        userAddress: '0x' + 'a'.repeat(40),
        asset: 'eth',
        amount: '1000000000000000000',
        chainId: 11155111,
      }).success,
    ).toBe(true);
  });
});
