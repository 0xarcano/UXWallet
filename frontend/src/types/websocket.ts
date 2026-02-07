export interface WsBalanceUpdate {
  type: 'bu';
  data: {
    userAddress: string;
    asset: string;
    balance: string;
    chainId?: number;
  };
  timestamp: number;
}

export interface WsPong {
  type: 'pong';
  timestamp: number;
}

export interface WsSubscribed {
  type: 'subscribed';
  userAddress: string;
}

export interface WsUnsubscribed {
  type: 'unsubscribed';
  userAddress: string;
}

export interface WsError {
  error: {
    code: string;
    message: string;
  };
}

export type WsServerMessage =
  | WsBalanceUpdate
  | WsPong
  | WsSubscribed
  | WsUnsubscribed
  | WsError;
