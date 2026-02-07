import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { server } from '@/test/msw/server';
import { useChannel } from '../useChannel';

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

describe('useChannel', () => {
  it('fetches channel when channelId provided', async () => {
    const { result } = renderHook(() => useChannel('0xabcdef'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.session.status).toBe('OPEN');
  });

  it('does not fetch when channelId is null', () => {
    const { result } = renderHook(() => useChannel(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
