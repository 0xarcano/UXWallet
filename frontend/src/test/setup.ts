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

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@erc7824/nitrolite', () => ({
  EIP712AuthTypes: {
    Policy: [
      { name: 'challenge', type: 'string' },
      { name: 'scope', type: 'string' },
      { name: 'wallet', type: 'address' },
      { name: 'session_key', type: 'address' },
      { name: 'expires_at', type: 'uint256' },
      { name: 'allowances', type: 'Allowance[]' },
    ],
    Allowance: [
      { name: 'asset', type: 'string' },
      { name: 'amount', type: 'string' },
    ],
  },
}));

jest.mock('react-native-get-random-values', () => {});

jest.mock('@walletconnect/react-native-compat', () => {});

const mockUseAppKit = jest.fn().mockReturnValue({
  open: jest.fn(),
  close: jest.fn(),
  disconnect: jest.fn(),
  switchNetwork: jest.fn(),
});

const mockUseAccount = jest.fn().mockReturnValue({
  address: undefined,
  isConnected: false,
  chainId: undefined,
});

jest.mock('@reown/appkit-react-native', () => {
  const React = require('react');
  return {
    createAppKit: jest.fn().mockReturnValue({}),
    AppKit: () => null,
    AppKitProvider: ({ children }: { children: React.ReactNode }) => children,
    useAppKit: mockUseAppKit,
    useAccount: mockUseAccount,
    useProvider: jest.fn().mockReturnValue({ provider: null }),
    useWalletInfo: jest.fn().mockReturnValue({ walletInfo: null }),
    useAppKitState: jest.fn().mockReturnValue({}),
    useAppKitEvents: jest.fn(),
  };
});

jest.mock('@reown/appkit-wagmi-react-native', () => ({
  WagmiAdapter: jest.fn().mockImplementation(() => ({
    wagmiConfig: {},
    wagmiChains: [],
  })),
}));

jest.mock('wagmi', () => {
  const React = require('react');
  return {
    WagmiProvider: ({ children }: { children: React.ReactNode }) => children,
    useAccount: jest.fn().mockReturnValue({
      address: undefined,
      isConnected: false,
    }),
    useSignTypedData: jest.fn().mockReturnValue({
      signTypedData: jest.fn(),
      signTypedDataAsync: jest.fn(),
    }),
  };
});

jest.mock('wagmi/chains', () => ({
  sepolia: { id: 11155111, name: 'Sepolia' },
  baseSepolia: { id: 84532, name: 'Base Sepolia' },
  mainnet: { id: 1, name: 'Ethereum' },
  arbitrum: { id: 42161, name: 'Arbitrum One' },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

jest.mock('expo-application', () => ({
  applicationId: 'com.flywheel.wallet',
  applicationName: 'Flywheel',
  nativeApplicationVersion: '0.1.0',
  nativeBuildVersion: '1',
}));

jest.mock('@/config/wagmi', () => ({
  wagmiAdapter: { wagmiConfig: {} },
  appkit: {},
  networks: [
    { id: 11155111, name: 'Sepolia' },
    { id: 84532, name: 'Base Sepolia' },
  ],
}));
