import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { server } from '@/test/msw/server';
import { useDelegation } from '../useDelegation';

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

describe('useDelegation', () => {
  it('fetches delegation keys when address provided', async () => {
    const { result } = renderHook(
      () => useDelegation('0x1234567890abcdef1234567890abcdef12345678'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.keys.isSuccess).toBe(true);
    });

    expect(result.current.keys.data?.keys).toHaveLength(1);
  });

  it('does not fetch when address is null', () => {
    const { result } = renderHook(() => useDelegation(null), { wrapper: createWrapper() });

    expect(result.current.keys.fetchStatus).toBe('idle');
  });

  it('provides register and revoke mutations', () => {
    const { result } = renderHook(
      () => useDelegation('0x1234567890abcdef1234567890abcdef12345678'),
      { wrapper: createWrapper() },
    );

    expect(result.current.register.mutateAsync).toBeDefined();
    expect(result.current.revoke.mutateAsync).toBeDefined();
  });
});
