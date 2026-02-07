import { useEffect } from 'react';
import { Text } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface YieldBadgeProps {
  yieldAmount?: string;
  asset?: string;
  className?: string;
}

export function YieldBadge({
  yieldAmount,
  asset,
  className = '',
}: YieldBadgeProps): JSX.Element | null {
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!yieldAmount) return null;

  return (
    <Animated.View
      className={`flex-row items-center bg-brand-success/20 rounded-full px-3 py-1.5 ${className}`}
      style={animatedStyle}
      accessibilityRole="text"
      accessibilityLabel={`Yield: ${yieldAmount} ${asset ?? ''}`}
    >
      <TrendingUp size={14} color="#34D399" />
      <Text className="font-mono text-sm text-brand-success ml-1">
        {'\u2191'} {yieldAmount} {asset ?? ''}
      </Text>
    </Animated.View>
  );
}
