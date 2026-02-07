import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { AddressDisplay } from '@/components/shared/AddressDisplay';
import { ConnectionIndicator } from '@/components/wallet/ConnectionIndicator';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  walletAddress?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'reconnecting';
}

export function Header({
  title,
  showBack = false,
  rightAction,
  walletAddress,
  connectionStatus,
}: HeaderProps): JSX.Element {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-brand-bg">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-2 p-1"
          >
            <ChevronLeft size={24} color="#F8FAFB" />
          </Pressable>
        )}

        {title && (
          <Text className="text-lg font-sans font-bold text-brand-text">{title}</Text>
        )}

        {walletAddress && !title && (
          <View className="flex-row items-center bg-brand-card rounded-full px-3 py-1.5">
            {connectionStatus && (
              <View className="mr-2">
                <ConnectionIndicator status={connectionStatus} />
              </View>
            )}
            <AddressDisplay address={walletAddress} />
          </View>
        )}
      </View>

      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
