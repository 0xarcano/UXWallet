export interface Allowance {
  asset: string;
  amount: string;
}

export type SessionKeyStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface SessionKeyInfo {
  id: string;
  userAddress: string;
  sessionKeyAddress: string;
  application: string;
  scope: string;
  allowances: Allowance[];
  expiresAt: number;
  status: SessionKeyStatus;
  createdAt: string;
}

export interface RegisterDelegationRequest {
  userAddress: string;
  sessionKeyAddress: string;
  application: string;
  scope: string;
  allowances: Allowance[];
  expiresAt: number;
  signature: string;
}

export interface RegisterDelegationResponse {
  key: SessionKeyInfo;
}

export interface RevokeDelegationRequest {
  userAddress: string;
  sessionKeyAddress: string;
}

export interface RevokeDelegationResponse {
  success: boolean;
}

export interface GetDelegationKeysResponse {
  keys: SessionKeyInfo[];
}
