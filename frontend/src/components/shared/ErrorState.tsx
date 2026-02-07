import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  code?: string;
  message?: string;
  title?: string;
  onRetry?: () => void;
  inline?: boolean;
}

export function ErrorState({
  code,
  message,
  title,
  onRetry,
  inline = false,
}: ErrorStateProps): JSX.Element {
  const errorInfo = code ? getErrorMessage(code) : null;
  const displayTitle = title ?? errorInfo?.title ?? 'Something Went Wrong';
  const displayBody = message ?? errorInfo?.body ?? 'An unexpected error occurred.';

  if (inline) {
    return (
      <View className="flex-row items-center bg-brand-error/10 rounded-xl p-3">
        <AlertTriangle size={20} color="#F87171" />
        <View className="flex-1 ml-3">
          <Text className="font-sans font-semibold text-sm text-brand-error">{displayTitle}</Text>
          <Text className="font-sans text-xs text-brand-muted mt-0.5">{displayBody}</Text>
        </View>
        {onRetry && (
          <Button title="Retry" variant="ghost" onPress={onRetry} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <AlertTriangle size={48} color="#F87171" />
      <Text className="font-sans font-bold text-xl text-brand-text mt-4 text-center">
        {displayTitle}
      </Text>
      <Text className="font-sans text-sm text-brand-muted mt-2 text-center">{displayBody}</Text>
      {onRetry && (
        <View className="mt-6">
          <Button title="Try Again" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}
