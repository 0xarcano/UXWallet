export interface BalanceEntry {
  asset: string;
  balance: string;
  chainId: number;
}

export interface GetBalanceResponse {
  userAddress: string;
  balances: BalanceEntry[];
}
