const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v5: CSS-fila importeres i app/_layout.tsx, ikke via { input }
module.exports = withNativewind(config);
