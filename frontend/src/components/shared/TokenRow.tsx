import { View, Text, Pressable } from 'react-native';

import { AmountDisplay } from '@/components/shared/AmountDisplay';

interface TokenRowProps {
  asset: string;
  balance: string;
  decimals: number;
  chainName?: string;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
}

export function TokenRow({
  asset,
  balance,
  decimals,
  chainName,
  onPress,
  selected = false,
  className = '',
}: TokenRowProps): JSX.Element {
  const firstLetter = asset.charAt(0).toUpperCase();
  const selectedClass = selected ? 'border border-brand-primary' : '';

  const content = (
    <View className={`flex-row items-center py-3 px-4 rounded-xl bg-brand-card ${selectedClass} ${className}`}>
      <View className="w-10 h-10 rounded-full bg-brand-primary/20 items-center justify-center mr-3">
        <Text className="font-sans font-bold text-brand-primary text-lg">{firstLetter}</Text>
      </View>

      <View className="flex-1">
        <Text className="font-sans font-semibold text-brand-text">{asset}</Text>
        {chainName && (
          <Text className="font-sans text-xs text-brand-muted mt-0.5">{chainName}</Text>
        )}
      </View>

      <AmountDisplay amount={balance} asset={asset} decimals={decimals} size="sm" showSymbol={false} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return content;
}
