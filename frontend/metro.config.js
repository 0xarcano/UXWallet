const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude husky and test files from Metro's file map
config.resolver.blockList = [
  /node_modules\/husky\/.*/,
  /\/__tests__\/.*/,
  /.*\.test\.[jt]sx?$/,
];

// Stub out native-only packages on web to prevent valtio/Reown bundling errors
const nativeOnlyPackages = [
  '@reown/appkit-react-native',
  '@reown/appkit-wagmi-react-native',
  '@reown/appkit-core-react-native',
  '@walletconnect/react-native-compat',
  'react-native-get-random-values',
  'valtio',
  'derive-valtio',
];

const emptyModule = path.resolve(__dirname, 'src/lib/emptyModule.js');

// Deduplicate valtio and derive-valtio so all Reown packages share one module
// instance. pnpm creates per-package copies which breaks valtio's internal
// proxyStateMap WeakMap (proxy created by copy A isn't found by copy B).
const canonicalOrigin = path.join(
  __dirname,
  'node_modules/@reown/appkit-core-react-native/src/index.ts',
);
const singletonPackages = ['valtio', 'derive-valtio', 'proxy-compare'];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Web: stub native-only packages
  if (platform === 'web' && nativeOnlyPackages.some((pkg) => moduleName === pkg || moduleName.startsWith(pkg + '/'))) {
    return { type: 'sourceFile', filePath: emptyModule };
  }

  // Native: force singleton resolution for valtio ecosystem by resolving from
  // appkit-core-react-native, ensuring all copies resolve to the same instance.
  if (platform !== 'web') {
    for (const pkg of singletonPackages) {
      if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
        return context.resolveRequest(
          { ...context, originModulePath: canonicalOrigin },
          moduleName,
          platform,
        );
      }
    }
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
