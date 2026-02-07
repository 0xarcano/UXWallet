import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A1628' },
      }}
    >
      <Stack.Screen name="connect" options={{ gestureEnabled: false }} />
      <Stack.Screen name="delegate" />
      <Stack.Screen name="select-tokens" />
      <Stack.Screen name="unify" />
    </Stack>
  );
}
