import { render, screen } from '@testing-library/react-native';

import { ConnectionIndicator } from '../ConnectionIndicator';

describe('ConnectionIndicator', () => {
  it('renders connected status', () => {
    render(<ConnectionIndicator status="connected" />);
    expect(screen.getByLabelText('Connected')).toBeTruthy();
  });

  it('renders disconnected status', () => {
    render(<ConnectionIndicator status="disconnected" />);
    expect(screen.getByLabelText('Disconnected')).toBeTruthy();
  });

  it('renders reconnecting status', () => {
    render(<ConnectionIndicator status="reconnecting" />);
    expect(screen.getByLabelText('Reconnecting')).toBeTruthy();
  });
});
