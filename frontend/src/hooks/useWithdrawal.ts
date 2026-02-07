import { useQuery, useMutation } from '@tanstack/react-query';
import { requestWithdrawal, getWithdrawalStatus } from '@/lib/api/withdrawal';

export function useWithdrawalRequest() {
  return useMutation({ mutationFn: requestWithdrawal });
}

export function useWithdrawalStatus(id: string | null) {
  return useQuery({
    queryKey: ['withdrawal', id],
    queryFn: () => getWithdrawalStatus(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.withdrawal.status;
      if (status === 'COMPLETED' || status === 'FAILED') return false;
      return 5_000;
    },
    staleTime: 5_000,
  });
}
