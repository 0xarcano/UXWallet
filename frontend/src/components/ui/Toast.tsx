import { useEffect } from 'react';
import { Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
  action?: { label: string; onPress: () => void };
  visible: boolean;
  onDismiss?: () => void;
}

const TYPE_STYLES: Record<ToastProps['type'], { border: string; icon: string }> = {
  success: { border: 'border-l-brand-success', icon: 'text-brand-success' },
  error: { border: 'border-l-brand-error', icon: 'text-brand-error' },
  info: { border: 'border-l-brand-info', icon: 'text-brand-info' },
};

export function Toast({
  type,
  message,
  title,
  action,
  visible,
  onDismiss,
}: ToastProps): JSX.Element | null {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : -100, { duration: 300 });
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const styles = TYPE_STYLES[type];

  return (
    <Animated.View
      className={`mx-4 mt-2 rounded-xl bg-brand-card border-l-4 ${styles.border} p-4`}
      style={animatedStyle}
      accessibilityRole="alert"
    >
      {title && (
        <Text className={`font-sans font-bold text-sm ${styles.icon} mb-1`}>{title}</Text>
      )}
      <Text className="font-sans text-sm text-brand-text">{message}</Text>
      {action && (
        <Pressable
          onPress={() => {
            action.onPress();
            onDismiss?.();
          }}
          className="mt-2"
        >
          <Text className="font-sans font-semibold text-sm text-brand-primary">
            {action.label}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
