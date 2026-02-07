export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface WithdrawalInfo {
  id: string;
  userAddress: string;
  asset: string;
  amount: string;
  chainId: number;
  status: WithdrawalStatus;
  txHash?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RequestWithdrawalRequest {
  userAddress: string;
  asset: string;
  amount: string;
  chainId: number;
}

export interface RequestWithdrawalResponse {
  withdrawal: WithdrawalInfo;
}

export interface GetWithdrawalStatusResponse {
  withdrawal: WithdrawalInfo;
}
