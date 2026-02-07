import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { getHealth } from '../health';
import { registerDelegation, revokeDelegation, getDelegationKeys } from '../delegation';
import { getBalance } from '../balance';
import { requestWithdrawal, getWithdrawalStatus } from '../withdrawal';
import { getChannel, getSessions } from '../state';
import { mockBalanceResponse } from '@/test/msw/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getHealth', () => {
  it('returns health response', async () => {
    const result = await getHealth();
    expect(result.status).toBe('healthy');
    expect(result.checks.postgres).toBe('ok');
  });
});

describe('getDelegationKeys', () => {
  it('returns delegation keys for user', async () => {
    const result = await getDelegationKeys('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.keys).toHaveLength(1);
    expect(result.keys[0]?.status).toBe('ACTIVE');
  });
});

describe('registerDelegation', () => {
  it('returns registered session key', async () => {
    const result = await registerDelegation({
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKeyAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      application: 'Flywheel',
      scope: 'liquidity',
      allowances: [{ asset: 'ETH', amount: '1000000000000000000' }],
      expiresAt: 1735689600,
      signature: '0xabc',
    });
    expect(result.key.application).toBe('Flywheel');
  });

  it('handles validation error', async () => {
    server.use(
      http.post('*/api/delegation/register', () => {
        return HttpResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Invalid request' } },
          { status: 400 },
        );
      }),
    );

    await expect(
      registerDelegation({
        userAddress: 'invalid',
        sessionKeyAddress: 'invalid',
        application: '',
        scope: '',
        allowances: [],
        expiresAt: 0,
        signature: '',
      }),
    ).rejects.toThrow();
  });
});

describe('revokeDelegation', () => {
  it('returns success', async () => {
    const result = await revokeDelegation({
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKeyAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    });
    expect(result.success).toBe(true);
  });
});

describe('getBalance', () => {
  it('returns balance data', async () => {
    const result = await getBalance('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.balances).toHaveLength(2);
    expect(result.balances[0]?.asset).toBe('ETH');
  });

  it('passes asset query param', async () => {
    server.use(
      http.get('*/api/balance', ({ request }) => {
        const url = new URL(request.url);
        const asset = url.searchParams.get('asset');
        return HttpResponse.json({
          userAddress: '0x1234567890abcdef1234567890abcdef12345678',
          balances: asset
            ? mockBalanceResponse.balances.filter((b) => b.asset === asset)
            : mockBalanceResponse.balances,
        });
      }),
    );

    const result = await getBalance('0x1234567890abcdef1234567890abcdef12345678', 'ETH');
    expect(result.balances).toHaveLength(1);
    expect(result.balances[0]?.asset).toBe('ETH');
  });
});

describe('requestWithdrawal', () => {
  it('returns withdrawal info', async () => {
    const result = await requestWithdrawal({
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      asset: 'ETH',
      amount: '500000000000000000',
      chainId: 11155111,
    });
    expect(result.withdrawal.status).toBe('PENDING');
  });
});

describe('getWithdrawalStatus', () => {
  it('returns withdrawal status', async () => {
    const result = await getWithdrawalStatus('wd-uuid-1');
    expect(result.withdrawal.status).toBe('COMPLETED');
    expect(result.withdrawal.txHash).toBe('0xabc123');
  });
});

describe('getChannel', () => {
  it('returns channel session', async () => {
    const result = await getChannel('0xabcdef');
    expect(result.session.status).toBe('OPEN');
  });
});

describe('getSessions', () => {
  it('returns sessions for user', async () => {
    const result = await getSessions('0x1234567890abcdef1234567890abcdef12345678');
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]?.channelId).toBe('0xabcdef');
  });
});
