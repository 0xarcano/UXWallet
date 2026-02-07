jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn().mockResolvedValue(''),
  setStringAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createMockIcon = (name: string) => {
    const MockIcon = (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: `icon-${name}` });
    MockIcon.displayName = name;
    return MockIcon;
  };
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'string' && prop !== '__esModule') {
          return createMockIcon(prop as string);
        }
        return undefined;
      },
    },
  );
});

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureDetector: View,
    GestureHandlerRootView: View,
    Gesture: {
      Pan: () => ({
        onStart: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }),
        onUpdate: () => ({ onEnd: () => ({}) }),
        onEnd: () => ({}),
      }),
    },
    Directions: {},
    State: {},
  };
});
