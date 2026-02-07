import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { StepIndicator } from '@/components/shared/StepIndicator';

const ONBOARDING_STEPS = ['Connect', 'Delegate', 'Tokens', 'Unify'];

export default function ConnectWalletScreen() {
  return (
    <ScreenContainer scroll={false}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-sans text-3xl font-bold text-brand-text">Flywheel</Text>
        <Text className="mt-2 font-sans text-lg text-brand-muted">Set Up. Forget. Grow.</Text>
        <Text className="mt-6 text-center font-sans text-sm text-brand-muted">
          Wallet connection is available on the mobile app. Please use iOS or Android.
        </Text>
      </View>
      <View className="pb-8">
        <StepIndicator steps={ONBOARDING_STEPS} currentStep={0} />
      </View>
    </ScreenContainer>
  );
}
