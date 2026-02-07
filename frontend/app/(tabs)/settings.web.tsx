import { Text } from 'react-native';

import { ScreenContainer } from '@/components/shared/ScreenContainer';

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <Text className="mb-6 font-sans text-xl font-bold text-brand-text">Settings</Text>
      <Text className="font-sans text-sm text-brand-muted">
        Wallet management is available on the mobile app.
      </Text>
    </ScreenContainer>
  );
}
