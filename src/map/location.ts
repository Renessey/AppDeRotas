import { LocationManager } from '@maplibre/maplibre-react-native';
import { Platform } from 'react-native';

/**
 * Solicita a permissão de localização (GPS) ao usuário.
 *
 * - Android: solicita ACCESS_FINE_LOCATION + ACCESS_COARSE_LOCATION
 * - iOS: solicita autorização "Quando em uso"
 *
 * @returns true se a permissão foi concedida, false caso contrário.
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    return await LocationManager.requestPermissions();
  } catch (error) {
    console.log('[location] erro ao solicitar permissão:', error);
    return false;
  }
}

/**
 * Retorna a plataforma atual para fins de debug/log.
 */
export function getPlatformLabel(): string {
  return Platform.OS === 'ios' ? 'iOS' : 'Android';
}

