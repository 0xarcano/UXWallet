import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import BootstrapScreen from '../index';
import { useWalletStore } from '@/stores/walletStore';
import { useDelegationStore } from '@/stores/delegationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockRouter = useRouter as jest.Mock;

describe('BootstrapScreen (navigation guard)', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({ replace: mockReplace, back: jest.fn() });

    useWalletStore.setState({ address: null, isConnected: false });
    useDelegationStore.setState({
      status: 'none',
      sessionKeyAddress: null,
      scope: null,
      expiresAt: null,
    });
    useOnboardingStore.setState({
      currentStep: 'connect',
      hasCompletedOnboarding: false,
    });
  });

  it('redirects to connect when not connected', async () => {
    render(<BootstrapScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding/connect');
    });
  });

  it('redirects to delegate when connected but no delegation', async () => {
    useWalletStore.setState({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true,
    });

    render(<BootstrapScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding/delegate');
    });
  });

  it('redirects to select-tokens when connected and delegated but onboarding not complete', async () => {
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

    render(<BootstrapScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding/select-tokens');
    });
  });

  it('redirects to home when fully onboarded', async () => {
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
    useOnboardingStore.setState({
      currentStep: 'complete',
      hasCompletedOnboarding: true,
    });

    render(<BootstrapScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)/home');
    });
  });

  it('does not redirect before hydration completes', () => {
    render(<BootstrapScreen />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
