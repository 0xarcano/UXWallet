describe('wagmi config', () => {
  it('exports wagmiAdapter with wagmiConfig', () => {
    const { wagmiAdapter } = require('@/config/wagmi');
    expect(wagmiAdapter).toBeDefined();
    expect(wagmiAdapter.wagmiConfig).toBeDefined();
  });

  it('exports appkit instance', () => {
    const { appkit } = require('@/config/wagmi');
    expect(appkit).toBeDefined();
  });

  it('exports networks array', () => {
    const { networks } = require('@/config/wagmi');
    expect(networks).toBeDefined();
    expect(Array.isArray(networks)).toBe(true);
    expect(networks.length).toBe(2);
  });

  it('selects testnet networks when CHAIN_ENV is testnet', () => {
    const { networks } = require('@/config/wagmi');
    expect(networks[0]).toEqual(expect.objectContaining({ id: 11155111 }));
    expect(networks[1]).toEqual(expect.objectContaining({ id: 84532 }));
  });
});
