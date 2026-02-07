import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { RecipientInput } from '../RecipientInput';

describe('RecipientInput', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    defaultProps.onChangeText.mockClear();
  });

  it('renders with label', () => {
    render(<RecipientInput {...defaultProps} label="Recipient" />);
    expect(screen.getByText('Recipient')).toBeTruthy();
  });

  it('pastes from clipboard', async () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    (Clipboard.getStringAsync as jest.Mock).mockResolvedValue(address);

    render(<RecipientInput {...defaultProps} />);
    fireEvent.press(screen.getByLabelText('Paste address'));

    await waitFor(() => {
      expect(defaultProps.onChangeText).toHaveBeenCalledWith(address);
    });
  });

  it('displays external error', () => {
    render(<RecipientInput {...defaultProps} error="Address not found" />);
    expect(screen.getByText('Address not found')).toBeTruthy();
  });

  it('validates on blur with invalid address', () => {
    render(<RecipientInput {...defaultProps} value="invalid" />);
    fireEvent(screen.getByLabelText('Recipient address'), 'blur');
    expect(screen.getByText('Invalid Ethereum address')).toBeTruthy();
  });

  it('does not show error on blur with valid address', () => {
    render(
      <RecipientInput
        {...defaultProps}
        value="0x1234567890abcdef1234567890abcdef12345678"
      />,
    );
    fireEvent(screen.getByLabelText('Recipient address'), 'blur');
    expect(screen.queryByText('Invalid Ethereum address')).toBeNull();
  });
});
