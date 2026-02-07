import { useEffect, useRef } from 'react';
import { useAccount } from '@reown/appkit-react-native';
import * as SecureStore from 'expo-secure-store';

import { useWalletStore } from '@/stores/walletStore';
import { useDelegationStore } from '@/stores/delegationStore';

export function useWalletSync(): void {
  const { address, isConnected } = useAccount();
  const setConnected = useWalletStore((s) => s.setConnected);
  const disconnect = useWalletStore((s) => s.disconnect);
  const clearDelegation = useDelegationStore((s) => s.clear);
  const prevConnected = useRef(isConnected);

  useEffect(() => {
    if (isConnected && address) {
      setConnected(address);
    } else if (prevConnected.current && !isConnected) {
      disconnect();
      clearDelegation();
      SecureStore.deleteItemAsync('flywheel-delegation').catch(() => {});
    }
    prevConnected.current = isConnected;
  }, [isConnected, address, setConnected, disconnect, clearDelegation]);
}
