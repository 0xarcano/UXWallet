import { supportedChains, defaultChain } from '../chains';

describe('chains config', () => {
  it('returns testnet chains when CHAIN_ENV is testnet', () => {
    // jest.config.js sets EXPO_PUBLIC_CHAIN_ENV=testnet
    expect(supportedChains).toHaveLength(2);
    expect(supportedChains[0]?.name).toBe('Sepolia');
    expect(supportedChains[1]?.name).toBe('Base Sepolia');
  });

  it('default chain is the first supported chain', () => {
    expect(defaultChain).toBe(supportedChains[0]);
    expect(defaultChain.id).toBe(11155111);
  });

  it('each chain has required fields', () => {
    for (const chain of supportedChains) {
      expect(chain.id).toBeGreaterThan(0);
      expect(chain.name).toBeTruthy();
      expect(chain.network).toBeTruthy();
      expect(chain.nativeCurrency.symbol).toBe('ETH');
      expect(chain.nativeCurrency.decimals).toBe(18);
      expect(chain.blockExplorerUrl).toMatch(/^https:\/\//);
    }
  });

  it('testnet chains have correct chain IDs', () => {
    const chainIds = supportedChains.map((c) => c.id);
    expect(chainIds).toContain(11155111); // Sepolia
    expect(chainIds).toContain(84532); // Base Sepolia
  });
});
