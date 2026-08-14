module.exports = (api) => {
  // nativewind/babel rewrites every `react-native` import to `react-native-css`.
  // Under pnpm + jest the plugin's self-guard misfires (babel sees symlinked paths),
  // turning react-native-css's own `react-native` imports into circular references
  // that crash every component test. className styling is irrelevant to unit tests,
  // so skip the transform under jest (NODE_ENV=test) and render plain RN components.
  // Metro builds (development/production) keep the full NativeWind transform.
  const isTest = api.env("test");
  api.cache.using(() => process.env.NODE_ENV);
  return {
    presets: isTest
      ? ["babel-preset-expo"]
      : ["babel-preset-expo", "nativewind/babel"],
  };
};
