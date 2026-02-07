import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { server } from '@/test/msw/server';
import { useBalance } from '../useBalance';

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

describe('useBalance', () => {
  it('fetches balance when address provided', async () => {
    const { result } = renderHook(
      () => useBalance('0x1234567890abcdef1234567890abcdef12345678'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.balances).toHaveLength(2);
  });

  it('does not fetch when address is null', () => {
    const { result } = renderHook(() => useBalance(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
