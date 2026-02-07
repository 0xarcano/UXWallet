import { http, HttpResponse } from 'msw';
import type { SessionKeyInfo } from '@/types/delegation';
import type { GetBalanceResponse } from '@/types/balance';
import type { WithdrawalInfo } from '@/types/withdrawal';
import type { HealthResponse } from '@/types/health';
import type { SessionInfo } from '@/types/state';

// --- Test data factories ---

export const mockSessionKey: SessionKeyInfo = {
  id: 'sk-uuid-1',
  userAddress: '0x1234567890abcdef1234567890abcdef12345678',
  sessionKeyAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  application: 'Flywheel',
  scope: 'liquidity',
  allowances: [
    { asset: 'ETH', amount: '1000000000000000000' },
    { asset: 'USDC', amount: '1000000000' },
  ],
  expiresAt: Math.floor(Date.now() / 1000) + 86400,
  status: 'ACTIVE',
  createdAt: '2025-01-15T10:30:00.000Z',
};

export const mockBalanceResponse: GetBalanceResponse = {
  userAddress: '0x1234567890abcdef1234567890abcdef12345678',
  balances: [
    { asset: 'ETH', balance: '1500000000000000000', chainId: 11155111 },
    { asset: 'USDC', balance: '500000000', chainId: 84532 },
  ],
};

export const mockWithdrawal: WithdrawalInfo = {
  id: 'wd-uuid-1',
  userAddress: '0x1234567890abcdef1234567890abcdef12345678',
  asset: 'ETH',
  amount: '500000000000000000',
  chainId: 11155111,
  status: 'PENDING',
  createdAt: '2025-01-15T10:30:00.000Z',
};

export const mockHealthResponse: HealthResponse = {
  status: 'healthy',
  timestamp: '2025-01-15T10:30:00.000Z',
  checks: { postgres: 'ok', redis: 'ok' },
};

export const mockSession: SessionInfo = {
  id: 'session-uuid-1',
  channelId: '0xabcdef',
  userAddress: '0x1234567890abcdef1234567890abcdef12345678',
  status: 'OPEN',
  createdAt: '2025-01-15T10:30:00.000Z',
  updatedAt: '2025-01-15T10:35:00.000Z',
};

// --- Handlers ---

export const handlers = [
  // Health
  http.get('*/api/health', () => {
    return HttpResponse.json(mockHealthResponse);
  }),

  // Delegation
  http.post('*/api/delegation/register', () => {
    return HttpResponse.json({ key: mockSessionKey });
  }),

  http.post('*/api/delegation/revoke', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('*/api/delegation/keys', () => {
    return HttpResponse.json({ keys: [mockSessionKey] });
  }),

  // Balance
  http.get('*/api/balance', () => {
    return HttpResponse.json(mockBalanceResponse);
  }),

  // Withdrawal
  http.post('*/api/withdrawal/request', () => {
    return HttpResponse.json({ withdrawal: mockWithdrawal });
  }),

  http.get('*/api/withdrawal/status/:id', () => {
    return HttpResponse.json({
      withdrawal: { ...mockWithdrawal, status: 'COMPLETED', txHash: '0xabc123' },
    });
  }),

  // State
  http.get('*/api/state/channel/:channelId', () => {
    return HttpResponse.json({ session: mockSession });
  }),

  http.get('*/api/state/sessions', () => {
    return HttpResponse.json({ sessions: [mockSession] });
  }),
];
