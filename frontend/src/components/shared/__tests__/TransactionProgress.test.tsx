import { render, screen } from '@testing-library/react-native';

import { TransactionProgress } from '../TransactionProgress';

describe('TransactionProgress', () => {
  const steps = [
    { label: 'Submitting', status: 'completed' as const },
    { label: 'Confirming', description: 'Waiting for confirmation', status: 'active' as const },
    { label: 'Done', status: 'pending' as const },
  ];

  it('renders all step labels', () => {
    render(<TransactionProgress steps={steps} />);
    expect(screen.getByText('Submitting')).toBeTruthy();
    expect(screen.getByText('Confirming')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('renders step description', () => {
    render(<TransactionProgress steps={steps} />);
    expect(screen.getByText('Waiting for confirmation')).toBeTruthy();
  });

  it('displays txHash when provided', () => {
    render(
      <TransactionProgress
        steps={steps}
        txHash="0x1234567890abcdef1234567890abcdef12345678"
      />,
    );
    expect(screen.getByText('Tx:')).toBeTruthy();
    expect(screen.getByText('0x1234...5678')).toBeTruthy();
  });

  it('renders failed status', () => {
    const failedSteps = [
      { label: 'Failed step', status: 'failed' as const },
    ];
    render(<TransactionProgress steps={failedSteps} />);
    expect(screen.getByText('Failed step')).toBeTruthy();
  });
});
