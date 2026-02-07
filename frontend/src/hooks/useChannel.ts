import { useQuery } from '@tanstack/react-query';
import { getChannel } from '@/lib/api/state';

export function useChannel(channelId: string | null) {
  return useQuery({
    queryKey: ['state', 'channel', channelId],
    queryFn: () => getChannel(channelId as string),
    enabled: !!channelId,
    staleTime: 5 * 60_000,
  });
}
