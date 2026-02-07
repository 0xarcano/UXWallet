module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    return {
      presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    };
  }

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind', unstable_transformImportMeta: true }],
      'nativewind/babel',
    ],
  };
};
