import { render, screen } from '@testing-library/react-native';

import { AmountDisplay } from '../AmountDisplay';

describe('AmountDisplay', () => {
  it('formats 18-decimal ETH', () => {
    render(<AmountDisplay amount="1500000000000000000" asset="ETH" decimals={18} />);
    expect(screen.getByText('1.5')).toBeTruthy();
    expect(screen.getByText('ETH')).toBeTruthy();
  });

  it('formats 6-decimal USDC', () => {
    render(<AmountDisplay amount="1500000" asset="USDC" decimals={6} />);
    expect(screen.getByText('1.5')).toBeTruthy();
    expect(screen.getByText('USDC')).toBeTruthy();
  });

  it('handles zero balance', () => {
    render(<AmountDisplay amount="0" asset="ETH" decimals={18} />);
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('hides symbol when showSymbol is false', () => {
    render(<AmountDisplay amount="1000000" asset="USDC" decimals={6} showSymbol={false} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('USDC')).toBeNull();
  });

  it('renders different sizes', () => {
    const { rerender } = render(
      <AmountDisplay amount="1000000000000000000" asset="ETH" decimals={18} size="sm" />,
    );
    expect(screen.getByText('1')).toBeTruthy();

    rerender(
      <AmountDisplay amount="1000000000000000000" asset="ETH" decimals={18} size="xl" />,
    );
    expect(screen.getByText('1')).toBeTruthy();
  });
});
