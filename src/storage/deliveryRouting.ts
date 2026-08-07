export type DeliveryCoordinates = {
  latitude: number;
  longitude: number;
};

export type DeliveryRouteItem<T extends DeliveryCoordinates = DeliveryCoordinates> =
  T & {
    id: string;
    status?: string;
  };

const EARTH_RADIUS_KM = 6371;
const DEFAULT_SPEED_KMH = 20;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(
  start: DeliveryCoordinates,
  end: DeliveryCoordinates,
): number {
  if (
    !Number.isFinite(start?.latitude) ||
    !Number.isFinite(start?.longitude) ||
    !Number.isFinite(end?.latitude) ||
    !Number.isFinite(end?.longitude)
  ) {
    return 0;
  }

  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);
  const deltaLat = toRadians(end.latitude - start.latitude);
  const deltaLon = toRadians(end.longitude - start.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function calculateRouteSequence<T extends DeliveryRouteItem>(
  deliveries: T[],
  startPoint: DeliveryCoordinates,
): T[] {
  if (!Array.isArray(deliveries) || deliveries.length === 0) {
    return [];
  }

  const valid = deliveries.filter(
    d =>
      d &&
      typeof d.id === 'string' &&
      Number.isFinite(d.latitude) &&
      Number.isFinite(d.longitude),
  );

  return valid
    .filter(delivery => delivery.status !== 'delivered')
    .map(delivery => ({
      ...delivery,
      distanceKm: getDistanceKm(startPoint, delivery),
    }))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    .map(({ distanceKm: _distanceKm, ...rest }) => rest as unknown as T);
}

export function getEtaMinutes(
  distanceKm: number,
  speedKmh = DEFAULT_SPEED_KMH,
): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 1;
  }
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60));
}
