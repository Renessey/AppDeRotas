import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@entregasapp/geocode_cache';

/** Coordenadas geográficas resultantes de uma geocodificação. */
export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/** Entrada do cache: chave normalizada do endereço -> coordenadas. */
export type GeocodeCache = Record<string, GeoPoint>;

let memoryCache: GeocodeCache | null = null;

/**
 * Carrega o cache de geocodificação (uma única vez para a sessão).
 * Retorna um objeto vazio em caso de erro para não quebrar o fluxo.
 */
export async function loadGeocodeCache(): Promise<GeocodeCache> {
  if (memoryCache) {
    return memoryCache;
  }
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    memoryCache = raw ? (JSON.parse(raw) as GeocodeCache) : {};
  } catch (error) {
    console.log('[geocode] erro ao carregar cache:', error);
    memoryCache = {};
  }
  return memoryCache;
}

/**
 * Recupera as coordenadas em cache para uma chave de endereço.
 * Retorna null se não estiver em cache.
 */
export async function getCachedCoordinates(
  addressKey: string,
): Promise<GeoPoint | null> {
  const cache = await loadGeocodeCache();
  return cache[addressKey] ?? null;
}

/**
 * Salva as coordenadas em cache para uma chave de endereço,
 * persistindo no dispositivo. Chamadas em paralelo são serializadas
 * para evitar escrita simultânea.
 */
let writeQueue: Promise<void> = Promise.resolve();
export async function setCachedCoordinates(
  addressKey: string,
  point: GeoPoint,
): Promise<void> {
  const cache = await loadGeocodeCache();
  cache[addressKey] = point;
  writeQueue = writeQueue.then(() =>
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache)),
  );
  await writeQueue;
}

/**
 * Limpa todo o cache de geocodificação.
 */
export async function clearGeocodeCache(): Promise<void> {
  memoryCache = {};
  await AsyncStorage.removeItem(CACHE_KEY);
}
