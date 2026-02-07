import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/lib/api/state';

export function useSessions(userAddress: string | null) {
  return useQuery({
    queryKey: ['state', 'sessions', userAddress],
    queryFn: () => getSessions(userAddress as string),
    enabled: !!userAddress,
    staleTime: 5 * 60_000,
  });
}
