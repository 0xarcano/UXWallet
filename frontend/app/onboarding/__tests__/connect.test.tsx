import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAppKit, useAccount } from '@reown/appkit-react-native';

import ConnectWalletScreen from '../connect';

jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

const mockUseAppKit = useAppKit as jest.Mock;
const mockUseAccount = useAccount as jest.Mock;
const mockRouter = useRouter as jest.Mock;

describe('ConnectWalletScreen', () => {
  const mockOpen = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppKit.mockReturnValue({ open: mockOpen, close: jest.fn(), disconnect: jest.fn() });
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false });
    mockRouter.mockReturnValue({ replace: mockReplace, back: jest.fn() });
  });

  it('renders the connect screen with branding', () => {
    const { getByText } = render(<ConnectWalletScreen />);

    expect(getByText('Flywheel')).toBeTruthy();
    expect(getByText('Set Up. Forget. Grow.')).toBeTruthy();
  });

  it('renders the connect wallet button', () => {
    const { getByTestId } = render(<ConnectWalletScreen />);

    expect(getByTestId('connect-wallet-button')).toBeTruthy();
  });

  it('opens AppKit modal on button press', () => {
    const { getByTestId } = render(<ConnectWalletScreen />);

    fireEvent.press(getByTestId('connect-wallet-button'));

    expect(mockOpen).toHaveBeenCalled();
  });

  it('navigates to delegate screen when connected', () => {
    mockUseAccount.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      isConnected: true,
    });

    render(<ConnectWalletScreen />);

    expect(mockReplace).toHaveBeenCalledWith('/onboarding/delegate');
  });

  it('renders step indicator at step 0', () => {
    const { getByText } = render(<ConnectWalletScreen />);

    expect(getByText('Connect')).toBeTruthy();
    expect(getByText('Delegate')).toBeTruthy();
    expect(getByText('Tokens')).toBeTruthy();
    expect(getByText('Unify')).toBeTruthy();
  });
});
