import { render, screen } from '@testing-library/react-native';

import { YieldBadge } from '../YieldBadge';

describe('YieldBadge', () => {
  it('renders yield amount with asset', () => {
    render(<YieldBadge yieldAmount="1.56" asset="ETH" />);
    expect(screen.getByLabelText('Yield: 1.56 ETH')).toBeTruthy();
  });

  it('renders without asset', () => {
    render(<YieldBadge yieldAmount="0.5" />);
    expect(screen.getByLabelText('Yield: 0.5 ')).toBeTruthy();
  });

  it('returns null when yieldAmount is not provided', () => {
    const { toJSON } = render(<YieldBadge />);
    expect(toJSON()).toBeNull();
  });
});
