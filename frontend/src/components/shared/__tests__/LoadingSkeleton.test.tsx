import { render, screen } from '@testing-library/react-native';

import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with text variant by default', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('renders card variant', () => {
    render(<LoadingSkeleton variant="card" />);
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('renders circle variant', () => {
    render(<LoadingSkeleton variant="circle" />);
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });

  it('accepts custom dimensions', () => {
    render(<LoadingSkeleton width={200} height={50} />);
    expect(screen.getByLabelText('Loading')).toBeTruthy();
  });
});
