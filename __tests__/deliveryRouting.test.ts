import { calculateRouteSequence, getEtaMinutes, getDistanceKm } from '../src/storage/deliveryRouting';

describe('delivery routing', () => {
  it('orders deliveries by proximity to the starting point', () => {
    const deliveries = [
      { id: 'a', latitude: -23.5601, longitude: -46.6352 },
      { id: 'b', latitude: -23.5505, longitude: -46.6333 },
      { id: 'c', latitude: -23.5710, longitude: -46.6400 },
    ];

    const ordered = calculateRouteSequence(deliveries, {
      latitude: -23.5510,
      longitude: -46.6320,
    });

    expect(ordered.map(item => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('computes eta based on distance and speed', () => {
    const distanceKm = getDistanceKm(
      { latitude: -23.5505, longitude: -46.6333 },
      { latitude: -23.5601, longitude: -46.6352 },
    );

    expect(distanceKm).toBeGreaterThan(0);
    expect(getEtaMinutes(distanceKm)).toBeGreaterThan(0);
  });
});
