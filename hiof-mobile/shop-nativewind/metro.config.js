const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v5: CSS-filen importeres i App.tsx ("./global.css")
module.exports = withNativewind(config);
