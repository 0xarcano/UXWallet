import type { GetBalanceResponse } from '@/types/balance';
import { apiGet } from './client';

export function getBalance(userAddress: string, asset?: string): Promise<GetBalanceResponse> {
  const params: Record<string, string> = { userAddress };
  if (asset) {
    params.asset = asset;
  }
  return apiGet<GetBalanceResponse>('/api/balance', params);
}
