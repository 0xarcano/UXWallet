import { useWalletStore } from '../walletStore';

describe('walletStore', () => {
  beforeEach(() => {
    useWalletStore.setState({ address: null, isConnected: false });
  });

  it('starts disconnected', () => {
    const state = useWalletStore.getState();
    expect(state.address).toBeNull();
    expect(state.isConnected).toBe(false);
  });

  it('sets connected with address', () => {
    useWalletStore.getState().setConnected('0x1234567890abcdef1234567890abcdef12345678');
    const state = useWalletStore.getState();
    expect(state.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(state.isConnected).toBe(true);
  });

  it('disconnects and clears address', () => {
    useWalletStore.getState().setConnected('0x1234567890abcdef1234567890abcdef12345678');
    useWalletStore.getState().disconnect();
    const state = useWalletStore.getState();
    expect(state.address).toBeNull();
    expect(state.isConnected).toBe(false);
  });
});
