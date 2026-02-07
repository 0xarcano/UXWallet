import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppKit, useAccount } from '@reown/appkit-react-native';

import { ScreenContainer } from '@/components/shared/ScreenContainer';
import { StepIndicator } from '@/components/shared/StepIndicator';
import { Button } from '@/components/ui/Button';

const ONBOARDING_STEPS = ['Connect', 'Delegate', 'Tokens', 'Unify'];

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      router.replace('/onboarding/delegate');
    }
  }, [isConnected, router]);

  return (
    <ScreenContainer scroll={false}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-sans text-3xl font-bold text-brand-text">Flywheel</Text>
        <Text className="mt-2 font-sans text-lg text-brand-muted">Set Up. Forget. Grow.</Text>
        <Text className="mt-6 text-center font-sans text-sm text-brand-muted">
          Connect your wallet to delegate assets, earn yield, and manage your portfolio — all
          non-custodially.
        </Text>
        <View className="mt-10 w-full">
          <Button
            title="Connect Wallet"
            onPress={() => open()}
            testID="connect-wallet-button"
          />
        </View>
      </View>
      <View className="pb-8">
        <StepIndicator steps={ONBOARDING_STEPS} currentStep={0} />
      </View>
    </ScreenContainer>
  );
}
