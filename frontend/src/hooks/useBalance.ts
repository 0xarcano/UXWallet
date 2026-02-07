import { useQuery } from '@tanstack/react-query';
import { getBalance } from '@/lib/api/balance';

export function useBalance(userAddress: string | null, asset?: string) {
  return useQuery({
    queryKey: asset ? ['balance', userAddress, asset] : ['balance', userAddress],
    queryFn: () => getBalance(userAddress as string, asset),
    enabled: !!userAddress,
    staleTime: 30_000,
  });
}
