import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStoreAdapter } from './lib/secureStoreAdapter';

export type DelegationStatus = 'none' | 'active' | 'expired' | 'revoked';

interface DelegationState {
  status: DelegationStatus;
  sessionKeyAddress: string | null;
  scope: string | null;
  expiresAt: number | null;
  setActive: (sessionKeyAddress: string, scope: string, expiresAt: number) => void;
  clear: () => void;
  hasActiveDelegation: () => boolean;
}

export const useDelegationStore = create<DelegationState>()(
  persist(
    (set, get) => ({
      status: 'none',
      sessionKeyAddress: null,
      scope: null,
      expiresAt: null,
      setActive: (sessionKeyAddress: string, scope: string, expiresAt: number) =>
        set({ status: 'active', sessionKeyAddress, scope, expiresAt }),
      clear: () =>
        set({ status: 'none', sessionKeyAddress: null, scope: null, expiresAt: null }),
      hasActiveDelegation: () => {
        const state = get();
        return state.status === 'active' && state.expiresAt !== null && state.expiresAt > Date.now() / 1000;
      },
    }),
    {
      name: 'flywheel-delegation',
      storage: createJSONStorage(() => secureStoreAdapter),
      skipHydration: true,
    },
  ),
);
