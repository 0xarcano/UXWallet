import { View, Text, TextInput, Pressable } from 'react-native';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  asset: string;
  decimals: number;
  maxAmount?: string;
  error?: string;
  label?: string;
}

const NUMERIC_REGEX = /^[0-9]*\.?[0-9]*$/;

export function AmountInput({
  value,
  onChangeText,
  asset,
  decimals,
  maxAmount,
  error,
  label,
}: AmountInputProps): JSX.Element {
  const handleChangeText = (text: string): void => {
    if (text === '' || NUMERIC_REGEX.test(text)) {
      const parts = text.split('.');
      if (parts[1] && parts[1].length > decimals) {
        return;
      }
      onChangeText(text);
    }
  };

  const handleMax = (): void => {
    if (maxAmount) {
      onChangeText(maxAmount);
    }
  };

  return (
    <View>
      {label && (
        <Text className="font-sans text-sm text-brand-muted mb-2">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-brand-card rounded-xl px-4 py-3 ${
          error ? 'border border-brand-error' : ''
        }`}
      >
        <TextInput
          className="flex-1 font-mono text-lg text-brand-text"
          value={value}
          onChangeText={handleChangeText}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#8892A0"
          accessibilityLabel={label ?? 'Amount input'}
        />
        <Text className="font-sans font-semibold text-brand-muted ml-2">{asset}</Text>
        {maxAmount && (
          <Pressable
            onPress={handleMax}
            className="ml-2 bg-brand-primary/20 rounded-lg px-2 py-1"
            accessibilityRole="button"
            accessibilityLabel="Set maximum amount"
          >
            <Text className="font-sans text-xs font-bold text-brand-primary">MAX</Text>
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="font-sans text-xs text-brand-error mt-1">{error}</Text>
      )}
    </View>
  );
}
