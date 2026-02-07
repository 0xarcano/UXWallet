import { env } from '@/config/env';

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrl: string;
}

const TESTNET_CHAINS: ChainConfig[] = [
  {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://sepolia.etherscan.io',
  },
  {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://sepolia.basescan.org',
  },
];

const MAINNET_CHAINS: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    network: 'ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://etherscan.io',
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    network: 'arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://arbiscan.io',
  },
];

export const supportedChains =
  env.EXPO_PUBLIC_CHAIN_ENV === 'testnet' ? TESTNET_CHAINS : MAINNET_CHAINS;
export const defaultChain = supportedChains[0] as ChainConfig;
