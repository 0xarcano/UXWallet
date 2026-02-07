import type {
  RequestWithdrawalRequest,
  RequestWithdrawalResponse,
  GetWithdrawalStatusResponse,
} from '@/types/withdrawal';
import { apiGet, apiPost } from './client';

export function requestWithdrawal(
  data: RequestWithdrawalRequest,
): Promise<RequestWithdrawalResponse> {
  return apiPost<RequestWithdrawalResponse>('/api/withdrawal/request', data);
}

export function getWithdrawalStatus(id: string): Promise<GetWithdrawalStatusResponse> {
  return apiGet<GetWithdrawalStatusResponse>(`/api/withdrawal/status/${id}`);
}
