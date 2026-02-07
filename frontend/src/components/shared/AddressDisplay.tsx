import { Pressable, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { truncateAddress } from '@/lib/format';

interface AddressDisplayProps {
  address: string;
  truncate?: boolean;
  copyable?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  truncate = true,
  copyable = true,
  className = '',
}: AddressDisplayProps): JSX.Element {
  const displayText = truncate ? truncateAddress(address) : address;

  const handleCopy = async (): Promise<void> => {
    if (!copyable) return;
    await Clipboard.setStringAsync(address);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (copyable) {
    return (
      <Pressable onPress={handleCopy} accessibilityRole="button" accessibilityLabel="Copy address">
        <Text className={`font-mono text-sm text-brand-muted ${className}`}>{displayText}</Text>
      </Pressable>
    );
  }

  return <Text className={`font-mono text-sm text-brand-muted ${className}`}>{displayText}</Text>;
}
