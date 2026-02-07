import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
  className?: string;
}

export function ScreenContainer({
  children,
  scroll = true,
  padding = true,
  className = '',
}: ScreenContainerProps): JSX.Element {
  const paddingClass = padding ? 'px-4 pt-4' : '';

  if (scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-brand-bg ${className}`}>
        <ScrollView
          className={`flex-1 ${paddingClass}`}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-brand-bg ${className}`}>
      <View className={`flex-1 ${paddingClass}`}>{children}</View>
    </SafeAreaView>
  );
}
