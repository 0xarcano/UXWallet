describe('smoke test', () => {
  it('runs the test pipeline', () => {
    expect(1 + 1).toBe(2);
  });

  it('has required environment variables set', () => {
    expect(process.env.EXPO_PUBLIC_API_URL).toBeDefined();
    expect(process.env.EXPO_PUBLIC_WS_URL).toBeDefined();
    expect(process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_CHAIN_ENV).toBe('testnet');
  });
});
