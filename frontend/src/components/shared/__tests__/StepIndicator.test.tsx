import { render, screen } from '@testing-library/react-native';

import { StepIndicator } from '../StepIndicator';

describe('StepIndicator', () => {
  const steps = ['Connect', 'Delegate', 'Confirm'];

  it('renders all step labels', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('Connect')).toBeTruthy();
    expect(screen.getByText('Delegate')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('displays step numbers for future steps', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('shows current step number', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    expect(screen.getByText('2')).toBeTruthy();
  });
});
