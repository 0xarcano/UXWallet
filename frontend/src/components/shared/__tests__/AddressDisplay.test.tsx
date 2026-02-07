import { render, screen, fireEvent } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { AddressDisplay } from '../AddressDisplay';

describe('AddressDisplay', () => {
  const fullAddress = '0x1234567890abcdef1234567890abcdef12345678';

  it('truncates address by default', () => {
    render(<AddressDisplay address={fullAddress} />);
    expect(screen.getByText('0x1234...5678')).toBeTruthy();
  });

  it('shows full address when truncate is false', () => {
    render(<AddressDisplay address={fullAddress} truncate={false} />);
    expect(screen.getByText(fullAddress)).toBeTruthy();
  });

  it('copies to clipboard on press', () => {
    render(<AddressDisplay address={fullAddress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(fullAddress);
  });

  it('does not render as pressable when copyable is false', () => {
    render(<AddressDisplay address={fullAddress} copyable={false} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('0x1234...5678')).toBeTruthy();
  });
});
