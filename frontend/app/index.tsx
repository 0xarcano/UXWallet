import { Text, View } from 'react-native';

export default function BootstrapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-brand-bg">
      <Text className="font-sans text-2xl font-bold text-brand-text">Flywheel</Text>
      <Text className="mt-2 font-mono text-sm text-brand-muted">Non-custodial wallet</Text>
    </View>
  );
}
