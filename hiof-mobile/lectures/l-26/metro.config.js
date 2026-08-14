const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v5: the CSS file is imported in app/_layout.tsx ("./global.css")
module.exports = withNativewind(config);
