import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface LoadingSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  variant?: 'text' | 'card' | 'circle';
  className?: string;
}

interface VariantStyle {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius: number;
}

const VARIANT_STYLES: Record<'text' | 'card' | 'circle', VariantStyle> = {
  text: { width: '100%', height: 16, borderRadius: 4 },
  card: { width: '100%', height: 80, borderRadius: 12 },
  circle: { width: 40, height: 40, borderRadius: 20 },
};

export function LoadingSkeleton({
  width,
  height,
  variant = 'text',
  className = '',
}: LoadingSkeletonProps): JSX.Element {
  const opacity = useSharedValue(0.3);
  const defaults = VARIANT_STYLES[variant];

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-brand-card ${className}`}
      style={[
        {
          width: width ?? defaults.width,
          height: height ?? defaults.height,
          borderRadius: defaults.borderRadius,
        },
        animatedStyle,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    />
  );
}
