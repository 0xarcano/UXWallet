import type {
  RegisterDelegationRequest,
  RegisterDelegationResponse,
  RevokeDelegationRequest,
  RevokeDelegationResponse,
  GetDelegationKeysResponse,
} from '@/types/delegation';
import { apiGet, apiPost } from './client';

export function registerDelegation(
  data: RegisterDelegationRequest,
): Promise<RegisterDelegationResponse> {
  return apiPost<RegisterDelegationResponse>('/api/delegation/register', data);
}

export function revokeDelegation(
  data: RevokeDelegationRequest,
): Promise<RevokeDelegationResponse> {
  return apiPost<RevokeDelegationResponse>('/api/delegation/revoke', data);
}

export function getDelegationKeys(userAddress: string): Promise<GetDelegationKeysResponse> {
  return apiGet<GetDelegationKeysResponse>('/api/delegation/keys', { userAddress });
}
