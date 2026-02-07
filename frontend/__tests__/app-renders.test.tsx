import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

function BootstrapScreen() {
  return (
    <View>
      <Text>Flywheel</Text>
      <Text>Non-custodial wallet</Text>
    </View>
  );
}

describe('app renders', () => {
  it('renders the bootstrap screen', () => {
    render(<BootstrapScreen />);
    expect(screen.getByText('Flywheel')).toBeTruthy();
    expect(screen.getByText('Non-custodial wallet')).toBeTruthy();
  });
});
