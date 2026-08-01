/**
 * Mock do @react-native-community/netinfo para testes (Jest).
 */
export default {
  addEventListener: jest.fn(callback => {
    callback({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });
    return jest.fn();
  }),
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  configure: jest.fn(),
  refresh: jest.fn(),
};

