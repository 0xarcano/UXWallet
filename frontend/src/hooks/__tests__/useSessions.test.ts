import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { server } from '@/test/msw/server';
import { useSessions } from '../useSessions';

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

describe('useSessions', () => {
  it('fetches sessions when address provided', async () => {
    const { result } = renderHook(
      () => useSessions('0x1234567890abcdef1234567890abcdef12345678'),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.sessions).toHaveLength(1);
  });

  it('does not fetch when address is null', () => {
    const { result } = renderHook(() => useSessions(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
