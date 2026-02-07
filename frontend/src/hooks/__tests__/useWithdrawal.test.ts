import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { server } from '@/test/msw/server';
import { useWithdrawalRequest, useWithdrawalStatus } from '../useWithdrawal';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useWithdrawalRequest', () => {
  it('provides a mutation function', () => {
    const { result } = renderHook(() => useWithdrawalRequest(), { wrapper: createWrapper() });
    expect(result.current.mutateAsync).toBeDefined();
  });
});

describe('useWithdrawalStatus', () => {
  it('fetches withdrawal status when id provided', async () => {
    const { result } = renderHook(() => useWithdrawalStatus('wd-uuid-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.withdrawal.status).toBe('COMPLETED');
  });

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useWithdrawalStatus(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
