import { render, screen, fireEvent } from '@testing-library/react-native';

import { Header } from '../Header';

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it('renders title', () => {
    render(<Header title="Send" />);
    expect(screen.getByText('Send')).toBeTruthy();
  });

  it('calls router.back when back button is pressed', () => {
    render(<Header title="Details" showBack />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders wallet address pill', () => {
    render(
      <Header walletAddress="0x1234567890abcdef1234567890abcdef12345678" />,
    );
    expect(screen.getByText('0x1234...5678')).toBeTruthy();
  });

  it('renders connection indicator with wallet address', () => {
    render(
      <Header
        walletAddress="0x1234567890abcdef1234567890abcdef12345678"
        connectionStatus="connected"
      />,
    );
    expect(screen.getByLabelText('Connected')).toBeTruthy();
  });

  it('renders right action', () => {
    const { Text } = require('react-native');
    render(<Header title="Home" rightAction={<Text>Settings</Text>} />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });
});
