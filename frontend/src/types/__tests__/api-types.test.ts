import type { ApiError, ApiErrorDetail } from '../api';
import type { SessionKeyInfo, Allowance, RegisterDelegationRequest } from '../delegation';
import type { BalanceEntry, GetBalanceResponse } from '../balance';
import type { WithdrawalInfo, WithdrawalStatus } from '../withdrawal';
import type { SessionInfo, GetChannelResponse, GetSessionsResponse } from '../state';
import type { HealthResponse } from '../health';
import type {
  WsBalanceUpdate,
  WsPong,
  WsSubscribed,
  WsUnsubscribed,
  WsError,
  WsServerMessage,
} from '../websocket';

describe('API types', () => {
  it('ApiError matches the expected structure', () => {
    const error: ApiError = {
      error: { code: 'VALIDATION_ERROR', message: 'Bad input' },
    };
    expect(error.error.code).toBe('VALIDATION_ERROR');
  });

  it('ApiErrorDetail supports optional details', () => {
    const detail: ApiErrorDetail = {
      code: 'NOT_FOUND',
      message: 'Not found',
      details: { id: '123' },
    };
    expect(detail.details).toEqual({ id: '123' });
  });
});

describe('Delegation types', () => {
  it('Allowance has asset and amount', () => {
    const allowance: Allowance = { asset: 'ETH', amount: '1000000000000000000' };
    expect(allowance.asset).toBe('ETH');
  });

  it('SessionKeyInfo matches API response shape', () => {
    const key: SessionKeyInfo = {
      id: 'uuid',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKeyAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      application: 'Flywheel',
      scope: 'liquidity',
      allowances: [{ asset: 'ETH', amount: '1000000000000000000' }],
      expiresAt: 1735689600,
      status: 'ACTIVE',
      createdAt: '2025-01-15T10:30:00.000Z',
    };
    expect(key.status).toBe('ACTIVE');
  });

  it('RegisterDelegationRequest includes signature', () => {
    const req: RegisterDelegationRequest = {
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      sessionKeyAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      application: 'Flywheel',
      scope: 'liquidity',
      allowances: [],
      expiresAt: 1735689600,
      signature: '0xabc',
    };
    expect(req.signature).toBe('0xabc');
  });
});

describe('Balance types', () => {
  it('BalanceEntry has required fields', () => {
    const entry: BalanceEntry = { asset: 'ETH', balance: '1500000000000000000', chainId: 11155111 };
    expect(entry.chainId).toBe(11155111);
  });

  it('GetBalanceResponse wraps balances array', () => {
    const resp: GetBalanceResponse = {
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      balances: [],
    };
    expect(resp.balances).toEqual([]);
  });
});

describe('Withdrawal types', () => {
  it('WithdrawalStatus is a string union', () => {
    const statuses: WithdrawalStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
    expect(statuses).toHaveLength(4);
  });

  it('WithdrawalInfo has optional txHash and updatedAt', () => {
    const info: WithdrawalInfo = {
      id: 'uuid',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      asset: 'ETH',
      amount: '500000000000000000',
      chainId: 11155111,
      status: 'PENDING',
      createdAt: '2025-01-15T10:30:00.000Z',
    };
    expect(info.txHash).toBeUndefined();
    expect(info.updatedAt).toBeUndefined();
  });
});

describe('State types', () => {
  it('SessionInfo has optional latestTransaction', () => {
    const session: SessionInfo = {
      id: 'uuid',
      channelId: '0xabc',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
      status: 'OPEN',
      createdAt: '2025-01-15T10:30:00.000Z',
      updatedAt: '2025-01-15T10:30:00.000Z',
    };
    expect(session.latestTransaction).toBeUndefined();
  });

  it('GetChannelResponse wraps a session', () => {
    const resp: GetChannelResponse = {
      session: {
        id: 'uuid',
        channelId: '0xabc',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'OPEN',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
      },
    };
    expect(resp.session.channelId).toBe('0xabc');
  });

  it('GetSessionsResponse wraps sessions array', () => {
    const resp: GetSessionsResponse = { sessions: [] };
    expect(resp.sessions).toEqual([]);
  });
});

describe('Health types', () => {
  it('HealthResponse has status and checks', () => {
    const resp: HealthResponse = {
      status: 'healthy',
      timestamp: '2025-01-15T10:30:00.000Z',
      checks: { postgres: 'ok', redis: 'ok' },
    };
    expect(resp.status).toBe('healthy');
  });
});

describe('WebSocket types', () => {
  it('WsBalanceUpdate has bu type', () => {
    const msg: WsBalanceUpdate = {
      type: 'bu',
      data: {
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        asset: 'ETH',
        balance: '1500000000000000000',
        chainId: 11155111,
      },
      timestamp: Date.now(),
    };
    expect(msg.type).toBe('bu');
  });

  it('WsPong has pong type', () => {
    const msg: WsPong = { type: 'pong', timestamp: Date.now() };
    expect(msg.type).toBe('pong');
  });

  it('WsSubscribed has userAddress', () => {
    const msg: WsSubscribed = {
      type: 'subscribed',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
    };
    expect(msg.type).toBe('subscribed');
  });

  it('WsUnsubscribed has userAddress', () => {
    const msg: WsUnsubscribed = {
      type: 'unsubscribed',
      userAddress: '0x1234567890abcdef1234567890abcdef12345678',
    };
    expect(msg.type).toBe('unsubscribed');
  });

  it('WsError has error object', () => {
    const msg: WsError = { error: { code: 'PARSE_ERROR', message: 'Invalid JSON' } };
    expect(msg.error.code).toBe('PARSE_ERROR');
  });

  it('WsServerMessage is a discriminated union', () => {
    const messages: WsServerMessage[] = [
      { type: 'bu', data: { userAddress: '0x1234567890abcdef1234567890abcdef12345678', asset: 'ETH', balance: '0' }, timestamp: 0 },
      { type: 'pong', timestamp: 0 },
      { type: 'subscribed', userAddress: '0x1234567890abcdef1234567890abcdef12345678' },
      { type: 'unsubscribed', userAddress: '0x1234567890abcdef1234567890abcdef12345678' },
      { error: { code: 'ERR', message: 'fail' } },
    ];
    expect(messages).toHaveLength(5);
  });
});
