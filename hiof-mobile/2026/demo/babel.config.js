// NativeWind v5 needs no babel configuration. `withNativewind` in
// metro.config.js does the work through a resolveRequest hook that rewrites
// react-native imports to react-native-css, not through a babel pass.
//
// Lecture l-30 still lists `nativewind/babel` here. That is the v4 form. In v5
// it is redundant, and it makes babel-preset-expo register the worklets plugin
// twice, so every file gets that transform run over it two times.
module.exports = {
  presets: ["babel-preset-expo"],
};
