import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useWalletStore } from '@/stores/walletStore';
import { useDelegationStore } from '@/stores/delegationStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

export default function BootstrapScreen() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const isConnected = useWalletStore((s) => s.isConnected);
  const hasActiveDelegation = useDelegationStore((s) => s.hasActiveDelegation);
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);

  useEffect(() => {
    async function hydrate() {
      await Promise.all([
        useDelegationStore.persist.rehydrate(),
        useOnboardingStore.persist.rehydrate(),
      ]);
      setHydrated(true);
    }
    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isConnected) {
      router.replace('/onboarding/connect');
    } else if (!hasActiveDelegation()) {
      router.replace('/onboarding/delegate');
    } else if (!hasCompletedOnboarding) {
      router.replace('/onboarding/select-tokens');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [hydrated, isConnected, hasActiveDelegation, hasCompletedOnboarding, router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-bg">
      <ActivityIndicator size="large" color="#00D4AA" />
    </View>
  );
}
