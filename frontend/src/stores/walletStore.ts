import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  setConnected: (address: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  setConnected: (address: string) => set({ address, isConnected: true }),
  disconnect: () => set({ address: null, isConnected: false }),
}));
