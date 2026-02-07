import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BottomSheet } from '../BottomSheet';

describe('BottomSheet', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders children when open', () => {
    render(
      <BottomSheet isOpen onClose={onClose}>
        <Text>Sheet Content</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Sheet Content')).toBeTruthy();
  });

  it('renders nothing when closed', () => {
    const { toJSON } = render(
      <BottomSheet isOpen={false} onClose={onClose}>
        <Text>Sheet Content</Text>
      </BottomSheet>,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders title when provided', () => {
    render(
      <BottomSheet isOpen onClose={onClose} title="Select Token">
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Select Token')).toBeTruthy();
  });

  it('renders content with backdrop', () => {
    render(
      <BottomSheet isOpen onClose={onClose}>
        <Text>Content</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });
});
