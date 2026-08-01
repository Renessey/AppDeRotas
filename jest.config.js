module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(js|ts|tsx|mjs)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@maplibre|lucide-react-native|react-native-.*)/)',
  ],
};
