import { Text, View } from 'react-native';
import { useAppKit, useAccount } from '@reown/appkit-react-native';

import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { AddressDisplay } from '@/components/shared/AddressDisplay';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { disconnect } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <ScreenContainer>
      <Text className="mb-6 font-sans text-xl font-bold text-brand-text">Settings</Text>

      {isConnected && address && (
        <View className="mb-6 rounded-xl bg-brand-card p-4">
          <Text className="mb-2 font-sans text-sm text-brand-muted">Connected Wallet</Text>
          <AddressDisplay address={address} />
        </View>
      )}

      {isConnected && (
        <Button
          title="Disconnect Wallet"
          variant="ghost"
          onPress={() => disconnect()}
          testID="disconnect-wallet-button"
        />
      )}
    </ScreenContainer>
  );
}
