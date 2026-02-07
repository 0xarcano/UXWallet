export interface LatestTransaction {
  id: string;
  nonce: number;
  type: string;
  amount: string;
  asset: string;
  createdAt: string;
}

export interface SessionInfo {
  id: string;
  channelId: string;
  userAddress: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  latestTransaction?: LatestTransaction;
}

export interface GetChannelResponse {
  session: SessionInfo;
}

export interface GetSessionsResponse {
  sessions: SessionInfo[];
}
