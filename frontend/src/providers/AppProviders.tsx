import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WagmiProvider } from 'wagmi';
import { AppKitProvider } from '@reown/appkit-react-native';

import { wagmiAdapter, appkit } from '@/config/wagmi';
import { queryClient } from '@/lib/queryClient';
import { useWalletSync } from '@/hooks/useWalletSync';

function WalletSync() {
  useWalletSync();
  return null;
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppKitProvider instance={appkit}>
            <WalletSync />
            {/* WebSocketProvider — E-7 */}
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </AppKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </GestureHandlerRootView>
  );
}
