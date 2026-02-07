process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.EXPO_PUBLIC_WS_URL = 'ws://localhost:3000/ws';
process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-project-id';
process.env.EXPO_PUBLIC_CHAIN_ENV = 'testnet';

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|nativewind|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@tanstack/react-query|react-native-css-interop|lucide-react-native|react-native-svg|expo-clipboard))',
  ],
};
