import { render, screen, fireEvent } from '@testing-library/react-native';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('maps error code to user-facing message', () => {
    render(<ErrorState code="INSUFFICIENT_FUNDS" />);
    expect(screen.getByText('Insufficient Funds')).toBeTruthy();
    expect(screen.getByText(/balance is too low/)).toBeTruthy();
  });

  it('uses custom message when provided', () => {
    render(<ErrorState message="Custom error" title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByText('Custom error')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorState code="NETWORK_ERROR" onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders inline variant', () => {
    const onRetry = jest.fn();
    render(<ErrorState code="RATE_LIMITED" onRetry={onRetry} inline />);
    expect(screen.getByText('Slow Down')).toBeTruthy();
    fireEvent.press(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows default message when no code or message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something Went Wrong')).toBeTruthy();
  });
});
