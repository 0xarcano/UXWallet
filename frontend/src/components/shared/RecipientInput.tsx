import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ClipboardPaste } from 'lucide-react-native';

import { isValidEthereumAddress } from '@/types/common';

interface RecipientInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
}

export function RecipientInput({
  value,
  onChangeText,
  error,
  label,
}: RecipientInputProps): JSX.Element {
  const [localError, setLocalError] = useState<string | undefined>();

  const handleBlur = (): void => {
    if (value && !isValidEthereumAddress(value)) {
      setLocalError('Invalid Ethereum address');
    } else {
      setLocalError(undefined);
    }
  };

  const handlePaste = async (): Promise<void> => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      onChangeText(text.trim());
    }
  };

  const displayError = error ?? localError;

  return (
    <View>
      {label && (
        <Text className="font-sans text-sm text-brand-muted mb-2">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-brand-card rounded-xl px-4 py-3 ${
          displayError ? 'border border-brand-error' : ''
        }`}
      >
        <TextInput
          className="flex-1 font-mono text-sm text-brand-text"
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          placeholder="0x..."
          placeholderTextColor="#8892A0"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label ?? 'Recipient address'}
        />
        <Pressable
          onPress={handlePaste}
          className="ml-2 p-1"
          accessibilityRole="button"
          accessibilityLabel="Paste address"
        >
          <ClipboardPaste size={20} color="#8892A0" />
        </Pressable>
      </View>
      {displayError && (
        <Text className="font-sans text-xs text-brand-error mt-1">{displayError}</Text>
      )}
    </View>
  );
}
