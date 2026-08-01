/**
 * Configuração dos mapas offline do EntregasApp.
 *
 * MVP: usa o estilo gratuito do OpenFreeMap (https://openfreemap.org)
 * para download de regiões e renderização online.
 */

/** URL do estilo de tiles usado pelo mapa (online e nos packs offline). */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Zoom mínimo/máximo baixado nos packs offline. */
export const OFFLINE_MIN_ZOOM = 12;
export const OFFLINE_MAX_ZOOM = 16;

/** Nome do banco de dados offline criado pelo MapLibre no dispositivo. */
export const OFFLINE_DB_NAME = 'EntregasAppOffline';

/**
 * Representa um mapa offline instalado no dispositivo.
 */
export interface InstalledMap {
  /** ID único do pack (UUID gerado nativamente). */
  id: string;
  /** Nome amigável exibido ao usuário. */
  name: string;
  /** Tamanho em bytes dos recursos já baixados. */
  sizeBytes: number;
  /** Percentual de download (0-100). */
  percentage: number;
  /** Estado do download: inactive | active | complete. */
  state: 'inactive' | 'active' | 'complete';
  /** Data de criação em timestamp (ms). */
  createdAt: number;
}

/**
 * Formata um valor em bytes para exibição amigável (KB/MB/GB).
 */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

