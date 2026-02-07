import { View, Text } from 'react-native';

import { formatBalance } from '@/lib/format';
import type { Uint256String } from '@/types/common';

interface AmountDisplayProps {
  amount: string;
  asset: string;
  decimals: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSymbol?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export function AmountDisplay({
  amount,
  asset,
  decimals,
  size = 'md',
  showSymbol = true,
  className = '',
}: AmountDisplayProps): JSX.Element {
  const formatted = formatBalance(amount as Uint256String, decimals);
  const sizeClass = SIZE_CLASSES[size];

  return (
    <View className={`flex-row items-baseline ${className}`}>
      <Text className={`font-mono ${sizeClass} text-brand-text`}>{formatted}</Text>
      {showSymbol && (
        <Text className={`font-mono ${sizeClass} text-brand-muted ml-1`}>{asset}</Text>
      )}
    </View>
  );
}
