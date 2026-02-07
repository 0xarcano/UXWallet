import { render, screen, fireEvent } from '@testing-library/react-native';

import { ChainSelector } from '../ChainSelector';

describe('ChainSelector', () => {
  const chains = [
    { chainId: 11155111, name: 'Sepolia' },
    { chainId: 84532, name: 'Base Sepolia' },
  ];

  it('displays selected chain name', () => {
    render(
      <ChainSelector selectedChainId={11155111} onChange={jest.fn()} chains={chains} />,
    );
    expect(screen.getByLabelText('Selected chain: Sepolia')).toBeTruthy();
  });

  it('calls onChange when a chain is selected', () => {
    const onChange = jest.fn();
    render(
      <ChainSelector selectedChainId={11155111} onChange={onChange} chains={chains} />,
    );

    // Open the bottom sheet
    fireEvent.press(screen.getByLabelText('Selected chain: Sepolia'));

    // Select Base Sepolia
    fireEvent.press(screen.getByText('Base Sepolia'));
    expect(onChange).toHaveBeenCalledWith(84532);
  });

  it('uses default chains when none provided', () => {
    render(
      <ChainSelector selectedChainId={11155111} onChange={jest.fn()} />,
    );
    expect(screen.getByLabelText('Selected chain: Sepolia')).toBeTruthy();
  });
});
