import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { createAppKit } from '@reown/appkit-react-native';
import { sepolia, baseSepolia, mainnet, arbitrum } from 'wagmi/chains';

import { env } from '@/config/env';
import { appKitStorage } from '@/lib/appkit/storage';

const projectId = env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID;

const testnetNetworks = [sepolia, baseSepolia] as const;
const mainnetNetworks = [mainnet, arbitrum] as const;

export const networks =
  env.EXPO_PUBLIC_CHAIN_ENV === 'testnet' ? testnetNetworks : mainnetNetworks;

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

const metadata = {
  name: 'Flywheel Wallet',
  description: 'Non-custodial aggregated liquidity wallet',
  url: 'https://flywheel.app',
  icons: ['https://flywheel.app/icon.png'],
  redirect: {
    native: 'flywheel://',
  },
};

export const appkit = createAppKit({
  projectId,
  metadata,
  networks: [...networks],
  adapters: [wagmiAdapter],
  storage: appKitStorage,
  defaultNetwork: networks[0],
  themeMode: 'dark',
  features: {
    onramp: false,
    swaps: false,
  },
});
