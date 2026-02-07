import { render, screen, fireEvent } from '@testing-library/react-native';

import { TokenRow } from '../TokenRow';

describe('TokenRow', () => {
  it('displays asset name and balance', () => {
    render(<TokenRow asset="ETH" balance="1500000000000000000" decimals={18} />);
    expect(screen.getByText('ETH')).toBeTruthy();
    expect(screen.getByText('1.5')).toBeTruthy();
  });

  it('displays first letter icon', () => {
    render(<TokenRow asset="USDC" balance="1000000" decimals={6} />);
    expect(screen.getByText('U')).toBeTruthy();
  });

  it('displays chain name when provided', () => {
    render(<TokenRow asset="ETH" balance="1000000000000000000" decimals={18} chainName="Sepolia" />);
    expect(screen.getByText('Sepolia')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<TokenRow asset="ETH" balance="1000000000000000000" decimals={18} onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('is not pressable when onPress is not provided', () => {
    render(<TokenRow asset="ETH" balance="1000000000000000000" decimals={18} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
