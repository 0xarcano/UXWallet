const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude husky from Metro's file map — its shell script file conflicts with TreeFS
config.resolver.blockList = [/node_modules\/husky\/.*/];

module.exports = withNativeWind(config, { input: './global.css' });
