import { useEffect } from 'react';
import { View, Text, Pressable, Modal, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  title?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.5],
  title,
}: BottomSheetProps): JSX.Element | null {
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * (snapPoints[0] ?? 0.5);
  const translateY = useSharedValue(sheetHeight);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(sheetHeight, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, sheetHeight, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = (): void => {
    translateY.value = withTiming(sheetHeight, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  if (!isOpen) return null;

  return (
    <Modal transparent visible={isOpen} animationType="none" onRequestClose={handleClose}>
      <View className="flex-1">
        <Pressable className="flex-1" onPress={handleClose}>
          <Animated.View
            className="flex-1 bg-black"
            style={backdropStyle}
          />
        </Pressable>

        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-brand-card rounded-t-2xl"
          style={[{ height: sheetHeight }, sheetStyle]}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-brand-muted" />
          </View>

          {title && (
            <View className="px-4 pb-3 border-b border-brand-muted/20">
              <Text className="text-lg font-sans font-bold text-brand-text text-center">
                {title}
              </Text>
            </View>
          )}

          <View className="flex-1 px-4 pt-3">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}
