/**
 * Multi-chain RPC clients - viem-based on-chain interaction layer.
 *
 * MVP chains: Yellow L3, Ethereum, Base.
 */
import { createPublicClient, http, type PublicClient, type Chain } from "viem";
import { mainnet, base } from "viem/chains";
import { config } from "../../config/index.js";
import { logger } from "../../lib/logger.js";

/**
 * Custom chain definition for Yellow L3 (placeholder - update with real chain details).
 */
const yellowL3: Chain = {
  id: config.chainIds.yellowL3,
  name: "Yellow L3",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [config.rpcUrls.yellowL3] },
  },
};

export interface ChainClients {
  readonly yellowL3: PublicClient;
  readonly ethereum: PublicClient;
  readonly base: PublicClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPublicClient = any;

/**
 * Create viem public clients for all MVP chains.
 */
function createChainClients(): ChainClients {
  const clients: ChainClients = {
    yellowL3: createPublicClient({
      chain: yellowL3,
      transport: http(config.rpcUrls.yellowL3),
    }) as AnyPublicClient,
    ethereum: createPublicClient({
      chain: mainnet,
      transport: http(config.rpcUrls.ethereum),
    }) as AnyPublicClient,
    base: createPublicClient({
      chain: base,
      transport: http(config.rpcUrls.base),
    }) as AnyPublicClient,
  };

  logger.info(
    {
      chains: [
        `Yellow L3 (${config.chainIds.yellowL3})`,
        `Ethereum (${config.chainIds.ethereum})`,
        `Base (${config.chainIds.base})`,
      ],
    },
    "Chain clients initialized",
  );

  return clients;
}

export const chainClients = createChainClients();

/**
 * Get the client for a given chain ID.
 */
export function getClientForChain(chainId: number): PublicClient {
  switch (chainId) {
    case config.chainIds.yellowL3:
      return chainClients.yellowL3;
    case config.chainIds.ethereum:
      return chainClients.ethereum;
    case config.chainIds.base:
      return chainClients.base;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

/**
 * Get block number for a chain (health check utility).
 */
export async function getBlockNumber(chainId: number): Promise<bigint> {
  const client = getClientForChain(chainId);
  return client.getBlockNumber();
}
