import { renderHook } from '@testing-library/react-native';
import { useAccount } from '@reown/appkit-react-native';
import * as SecureStore from 'expo-secure-store';

import { useWalletSync } from '@/hooks/useWalletSync';
import { useWalletStore } from '@/stores/walletStore';
import { useDelegationStore } from '@/stores/delegationStore';

const mockUseAccount = useAccount as jest.Mock;

describe('useWalletSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useWalletStore.setState({ address: null, isConnected: false });
    useDelegationStore.setState({
      status: 'none',
      sessionKeyAddress: null,
      scope: null,
      expiresAt: null,
    });
  });

  it('syncs connected wallet address to walletStore', () => {
    mockUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true,
    });

    renderHook(() => useWalletSync());

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('does nothing when not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    renderHook(() => useWalletSync());

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
  });

  it('clears stores on disconnect', () => {
    useWalletStore.setState({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true,
    });
    useDelegationStore.setState({
      status: 'active',
      sessionKeyAddress: '0xabc',
      scope: 'test',
      expiresAt: Date.now() / 1000 + 3600,
    });

    mockUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true,
    });

    const { rerender } = renderHook(() => useWalletSync());

    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    rerender({});

    const walletState = useWalletStore.getState();
    expect(walletState.isConnected).toBe(false);
    expect(walletState.address).toBeNull();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('flywheel-delegation');
  });

  it('updates address when wallet changes', () => {
    mockUseAccount.mockReturnValue({
      address: '0xaaaa',
      isConnected: true,
    });

    const { rerender } = renderHook(() => useWalletSync());

    expect(useWalletStore.getState().address).toBe('0xaaaa');

    mockUseAccount.mockReturnValue({
      address: '0xbbbb',
      isConnected: true,
    });

    rerender({});

    expect(useWalletStore.getState().address).toBe('0xbbbb');
  });
});
