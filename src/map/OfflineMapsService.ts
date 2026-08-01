import {
  OfflineManager,
  OfflinePack,
  OfflinePackStatus,
} from '@maplibre/maplibre-react-native';
import { Platform } from 'react-native';
import {
  InstalledMap,
  MAP_STYLE_URL,
  OFFLINE_MAX_ZOOM,
  OFFLINE_MIN_ZOOM,
} from './offlineMaps';

/** Bounds geográficos [oeste, sul, leste, norte]. */
export type Bounds = [west: number, south: number, east: number, north: number];

/**
 * Callback de progresso de download de um pack offline.
 */
export type DownloadProgressCallback = (progress: {
  percentage: number;
  completedTileSize: number;
  requiredResourceCount: number;
}) => void;

/** Cache dos packs para evitar recarregar do nativo a cada chamada. */
const packsCache = new Map<string, OfflinePack>();

/**
 * Inicializa (idempotente) o gerenciador offline do MapLibre.
 */
async function ensureInitialized(): Promise<void> {
  // O OfflineManager é um singleton; getPacks() chama initialize() internamente.
  const packs = await OfflineManager.getPacks();
  packsCache.clear();
  for (const pack of packs) {
    packsCache.set(pack.id, pack);
  }
}

/**
 * Cria um nome amigável para o pack a partir dos bounds.
 */
function buildPackName(bounds: Bounds): string {
  const [west, south, _east, _north] = bounds;
  return `Mapa ${Math.abs(south).toFixed(2)}°${south >= 0 ? 'S' : 'N'} ${Math.abs(
    west,
  ).toFixed(2)}°${west >= 0 ? 'L' : 'O'} - ${new Date().toLocaleDateString(
    'pt-BR',
  )}`;
}

/**
 * Baixa uma região do mapa (bounds) para uso offline.
 *
 * @param bounds Bounds geográficos [oeste, sul, leste, norte]
 * @param onProgress Callback de progresso durante o download
 * @param onError Callback em caso de erro
 * @returns O ID do pack criado.
 */
export async function downloadRegion(
  bounds: Bounds,
  onProgress: DownloadProgressCallback,
  onError?: (error: Error) => void,
): Promise<string | null> {
  try {
    await ensureInitialized();

    const pack = await OfflineManager.createPack(
      {
        mapStyle: MAP_STYLE_URL,
        bounds,
        minZoom: OFFLINE_MIN_ZOOM,
        maxZoom: OFFLINE_MAX_ZOOM,
        metadata: {
          name: buildPackName(bounds),
          createdAt: Date.now(),
          platform: Platform.OS,
        },
      },
      (_pack: OfflinePack, status: OfflinePackStatus) => {
        onProgress({
          percentage: status.percentage,
          completedTileSize: status.completedResourceSize,
          requiredResourceCount: status.requiredResourceCount,
        });
      },
      (_pack: OfflinePack, err) => {
        console.log('[offline] erro no download do pack:', err.message);
        onError?.(new Error(err.message));
      },
    );

    packsCache.set(pack.id, pack);
    return pack.id;
  } catch (error) {
    console.log('[offline] falha ao criar pack:', error);
    onError?.(error as Error);
    return null;
  }
}

/**
 * Retorna a lista de mapas offline instalados no dispositivo,
 * incluindo nome, tamanho ocupado (bytes) e estado.
 */
export async function getInstalledMaps(): Promise<InstalledMap[]> {
  try {
    await ensureInitialized();

    const packs = Array.from(packsCache.values());
    const installed: InstalledMap[] = [];

    for (const pack of packs) {
      let sizeBytes = 0;
      let percentage = 0;
      let state: InstalledMap['state'] = 'inactive';

      try {
        const status = await pack.status();
        sizeBytes = status.completedResourceSize;
        percentage = status.percentage;
        state = status.state;
      } catch (err) {
        console.log('[offline] erro ao obter status do pack:', err);
      }

      const metadata = pack.metadata ?? {};
      const name =
        (metadata.name as string) ||
        `Mapa ${new Date(Number(metadata.createdAt) || Date.now()).toLocaleDateString(
          'pt-BR',
        )}`;
      const createdAt = Number(metadata.createdAt) || Date.now();

      installed.push({
        id: pack.id,
        name,
        sizeBytes,
        percentage,
        state,
        createdAt,
      });
    }

    return installed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.log('[offline] falha ao listar packs:', error);
    return [];
  }
}

/**
 * Exclui um mapa offline do dispositivo.
 *
 * @param id ID do pack a ser excluído.
 */
export async function deleteMap(id: string): Promise<boolean> {
  try {
    await ensureInitialized();
    await OfflineManager.deletePack(id);
    packsCache.delete(id);
    return true;
  } catch (error) {
    console.log('[offline] falha ao excluir pack:', error);
    return false;
  }
}

/**
 * Soma o tamanho total ocupado por todos os mapas instalados.
 */
export async function getTotalSizeBytes(): Promise<number> {
  const maps = await getInstalledMaps();
  return maps.reduce((sum, map) => sum + map.sizeBytes, 0);
}

