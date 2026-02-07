import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-brand-bg p-5">
        <Text className="font-sans text-xl font-bold text-brand-text">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="font-sans text-brand-primary">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
