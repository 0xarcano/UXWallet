import { createPublicClient, http, type Chain, type PublicClient } from 'viem';
import { sepolia } from 'viem/chains';

// ── Base Sepolia chain definition ───────────────────────────────────────────

export const baseSepolia: Chain = {
  id: 84_532,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

// ── Supported chains ────────────────────────────────────────────────────────

export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
};

export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number);

// ── Client cache ────────────────────────────────────────────────────────────

const clientCache = new Map<number, PublicClient>();

/**
 * Get a viem PublicClient for the given chain ID.
 * Clients are cached and reused.
 */
export function getChainClient(chainId: number): PublicClient {
  const existing = clientCache.get(chainId);
  if (existing) return existing;

  const chain = SUPPORTED_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Allow env overrides for RPC URLs
  const rpcOverrides: Record<number, string | undefined> = {
    [sepolia.id]: process.env['RPC_URL_SEPOLIA'],
    [baseSepolia.id]: process.env['RPC_URL_BASE_SEPOLIA'],
  };

  const rpcUrl = rpcOverrides[chainId];

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  clientCache.set(chainId, client as PublicClient);
  return client as PublicClient;
}

/** Clear client cache — for tests. */
export function resetChainClients(): void {
  clientCache.clear();
}
