const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const reanimatedMock = path.resolve(__dirname, 'src/utils/reanimatedMock.js');

// Redirect react-native-reanimated to our mock
config.resolver.extraNodeModules = {
  'react-native-reanimated': reanimatedMock,
};

// Use resolveRequest to intercept reanimated imports
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-reanimated' || moduleName.startsWith('react-native-reanimated/')) {
    return {
      filePath: reanimatedMock,
      type: 'sourceFile',
    };
  }
  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
