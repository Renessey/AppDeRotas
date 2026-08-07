/**
 * Mock do @react-native-async-storage/async-storage para testes (jest).
 * Implementa um armazenamento em memória.
 */
let store: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => store[key] ?? null,
  setItem: async (key: string, value: string): Promise<void> => {
    store[key] = value;
  },
  removeItem: async (key: string): Promise<void> => {
    delete store[key];
  },
  clear: async (): Promise<void> => {
    store = {};
  },
  getAllKeys: async (): Promise<string[]> => Object.keys(store),
  multiGet: async (keys: string[]): Promise<[string, string | null][]> =>
    keys.map(key => [key, store[key] ?? null]),
  multiSet: async (pairs: [string, string][]): Promise<void> => {
    pairs.forEach(([key, value]) => {
      store[key] = value;
    });
  },
  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach(key => {
      delete store[key];
    });
  },
};

export default AsyncStorage;
