import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenContainer } from '../ScreenContainer';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

describe('ScreenContainer', () => {
  it('renders children', () => {
    render(
      <ScreenContainer>
        <Text>Hello World</Text>
      </ScreenContainer>,
    );
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders with scroll by default', () => {
    const { toJSON } = render(
      <ScreenContainer>
        <Text>Content</Text>
      </ScreenContainer>,
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).toContain('RCTScrollView');
  });

  it('renders without scroll when disabled', () => {
    const { toJSON } = render(
      <ScreenContainer scroll={false}>
        <Text>Content</Text>
      </ScreenContainer>,
    );
    const tree = JSON.stringify(toJSON());
    expect(tree).not.toContain('RCTScrollView');
  });
});
