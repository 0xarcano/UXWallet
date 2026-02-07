const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'web-build/', '*.config.js', '.agents/'],
  },
];
