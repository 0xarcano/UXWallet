import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getDelegationKeys, registerDelegation, revokeDelegation } from '@/lib/api/delegation';

export function useDelegation(userAddress: string | null) {
  const keysQuery = useQuery({
    queryKey: ['delegation', 'keys', userAddress],
    queryFn: () => getDelegationKeys(userAddress as string),
    enabled: !!userAddress,
    staleTime: 5 * 60_000,
  });

  const registerMutation = useMutation({
    mutationFn: registerDelegation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegation', 'keys', userAddress] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeDelegation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegation', 'keys', userAddress] });
    },
  });

  return { keys: keysQuery, register: registerMutation, revoke: revokeMutation };
}
