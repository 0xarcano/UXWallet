import { buildDelegationTypedData, FLYWHEEL_DOMAIN, DELEGATION_PRIMARY_TYPE } from '../delegation';

describe('buildDelegationTypedData', () => {
  it('returns typed data with correct domain', () => {
    const result = buildDelegationTypedData({
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKey: '0xabcdef1234567890abcdef1234567890abcdef12',
      scope: 'liquidity',
      expiresAt: 1735689600,
      allowances: [{ asset: 'ETH', amount: '1000000000000000000' }],
    });

    expect(result.domain).toEqual(FLYWHEEL_DOMAIN);
    expect(result.domain.name).toBe('Flywheel');
  });

  it('returns correct primary type', () => {
    const result = buildDelegationTypedData({
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKey: '0xabcdef1234567890abcdef1234567890abcdef12',
      scope: 'liquidity',
      expiresAt: 1735689600,
      allowances: [],
    });

    expect(result.primaryType).toBe(DELEGATION_PRIMARY_TYPE);
    expect(result.primaryType).toBe('Policy');
  });

  it('sets message fields correctly', () => {
    const result = buildDelegationTypedData({
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKey: '0xabcdef1234567890abcdef1234567890abcdef12',
      scope: 'liquidity',
      expiresAt: 1735689600,
      allowances: [
        { asset: 'ETH', amount: '1000000000000000000' },
        { asset: 'USDC', amount: '1000000000' },
      ],
    });

    expect(result.message.challenge).toBe('');
    expect(result.message.scope).toBe('liquidity');
    expect(result.message.wallet).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.message.session_key).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
    expect(result.message.expires_at).toBe(BigInt(1735689600));
    expect(result.message.allowances).toHaveLength(2);
  });

  it('converts expiresAt to BigInt', () => {
    const result = buildDelegationTypedData({
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKey: '0xabcdef1234567890abcdef1234567890abcdef12',
      scope: 'liquidity',
      expiresAt: 1735689600,
      allowances: [],
    });

    expect(typeof result.message.expires_at).toBe('bigint');
  });

  it('includes EIP712AuthTypes', () => {
    const result = buildDelegationTypedData({
      wallet: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKey: '0xabcdef1234567890abcdef1234567890abcdef12',
      scope: 'liquidity',
      expiresAt: 1735689600,
      allowances: [],
    });

    expect(result.types).toBeDefined();
    expect(result.types.Policy).toBeDefined();
  });
});
