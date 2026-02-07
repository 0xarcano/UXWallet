import { render, screen, fireEvent } from '@testing-library/react-native';

import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders success toast with message', () => {
    render(<Toast type="success" message="Transaction sent" visible />);
    expect(screen.getByText('Transaction sent')).toBeTruthy();
  });

  it('renders error toast with title', () => {
    render(<Toast type="error" message="Something failed" title="Error" visible />);
    expect(screen.getByText('Error')).toBeTruthy();
    expect(screen.getByText('Something failed')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const onPress = jest.fn();
    render(
      <Toast
        type="info"
        message="Info message"
        action={{ label: 'Retry', onPress }}
        visible
      />,
    );
    fireEvent.press(screen.getByText('Retry'));
    expect(onPress).toHaveBeenCalled();
  });

  it('returns null when not visible', () => {
    const { toJSON } = render(
      <Toast type="success" message="Hidden" visible={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders info toast content', () => {
    render(<Toast type="info" message="Alert msg" visible />);
    expect(screen.getByText('Alert msg')).toBeTruthy();
  });
});
