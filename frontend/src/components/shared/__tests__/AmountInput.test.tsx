import { render, screen, fireEvent } from '@testing-library/react-native';

import { AmountInput } from '../AmountInput';

describe('AmountInput', () => {
  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    asset: 'ETH',
    decimals: 18,
  };

  beforeEach(() => {
    defaultProps.onChangeText.mockClear();
  });

  it('renders with label', () => {
    render(<AmountInput {...defaultProps} label="Amount" />);
    expect(screen.getByText('Amount')).toBeTruthy();
  });

  it('accepts numeric input', () => {
    render(<AmountInput {...defaultProps} />);
    fireEvent.changeText(screen.getByLabelText('Amount input'), '1.5');
    expect(defaultProps.onChangeText).toHaveBeenCalledWith('1.5');
  });

  it('rejects non-numeric input', () => {
    render(<AmountInput {...defaultProps} />);
    fireEvent.changeText(screen.getByLabelText('Amount input'), 'abc');
    expect(defaultProps.onChangeText).not.toHaveBeenCalled();
  });

  it('fills max amount when MAX button is pressed', () => {
    render(<AmountInput {...defaultProps} maxAmount="10.5" />);
    fireEvent.press(screen.getByLabelText('Set maximum amount'));
    expect(defaultProps.onChangeText).toHaveBeenCalledWith('10.5');
  });

  it('displays asset symbol', () => {
    render(<AmountInput {...defaultProps} />);
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('displays error message', () => {
    render(<AmountInput {...defaultProps} error="Amount too high" />);
    expect(screen.getByText('Amount too high')).toBeTruthy();
  });

  it('does not show MAX button when maxAmount is not provided', () => {
    render(<AmountInput {...defaultProps} />);
    expect(screen.queryByLabelText('Set maximum amount')).toBeNull();
  });
});
