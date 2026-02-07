import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

interface ConnectionIndicatorProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
}

const STATUS_COLORS: Record<ConnectionIndicatorProps['status'], string> = {
  connected: 'bg-brand-success',
  disconnected: 'bg-brand-error',
  reconnecting: 'bg-brand-warning',
};

const STATUS_LABELS: Record<ConnectionIndicatorProps['status'], string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting',
};

export function ConnectionIndicator({ status }: ConnectionIndicatorProps): JSX.Element {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status === 'reconnecting') {
      opacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
    } else {
      cancelAnimation(opacity);
      opacity.value = 1;
    }
  }, [status, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (status === 'reconnecting') {
    return (
      <Animated.View
        className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
        style={animatedStyle}
        accessibilityRole="text"
        accessibilityLabel={STATUS_LABELS[status]}
      />
    );
  }

  return (
    <View
      className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`}
      accessibilityRole="text"
      accessibilityLabel={STATUS_LABELS[status]}
    />
  );
}
