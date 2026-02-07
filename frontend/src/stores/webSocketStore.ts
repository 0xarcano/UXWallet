import { create } from 'zustand';

export type WsConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface WebSocketState {
  status: WsConnectionStatus;
  lastUpdated: number | null;
  setStatus: (status: WsConnectionStatus) => void;
  setLastUpdated: (timestamp: number) => void;
}

export const useWebSocketStore = create<WebSocketState>((set) => ({
  status: 'disconnected',
  lastUpdated: null,
  setStatus: (status: WsConnectionStatus) => set({ status }),
  setLastUpdated: (timestamp: number) => set({ lastUpdated: timestamp }),
}));
