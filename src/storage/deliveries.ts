import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImportedRow } from '../import/spreadsheet';
import { GeoPoint } from './geocodeCache';
import { seedDeliveriesFromGeocoded, LocalDeliveryRecord } from './localDatabase';
import { GeocodeResult } from '../geocoding/geocoder';

export type GeocodedDelivery = {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  cep: string;
  pedido: string;
  telefone?: string;
  addressKey: string;
  latitude: number;
  longitude: number;
  geocodedAt: number;
};

const STORAGE_KEY = '@entregasapp/deliveries';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildAddressKey(
  endereco: string,
  bairro: string,
  cidade: string,
  cep: string,
): string {
  return [endereco, bairro, cidade, cep]
    .map(part => part.trim().toLowerCase().replace(/\s+/g, ' '))
    .filter(Boolean)
    .join(' | ');
}

function isValidPoint(point: GeoPoint | null | undefined): boolean {
  return (
    !!point &&
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

export async function saveDeliveries(
  rows: ImportedRow[],
  coordsByIndex: (GeoPoint | null)[],
  geocodeResults?: GeocodeResult[],
): Promise<GeocodedDelivery[]> {
  const deliveries: GeocodedDelivery[] = [];
  const now = Date.now();

  if (!Array.isArray(rows)) {
    return [];
  }

  rows.forEach((row, index) => {
    const point = coordsByIndex[index];
    if (!isValidPoint(point)) {
      return;
    }

    const geoResult = geocodeResults?.[index];
    const finalCidade =
      (row.cidade && row.cidade.trim()) || geoResult?.cidade || '';
    const finalBairro =
      (row.bairro && row.bairro.trim()) || geoResult?.bairro || '';

    deliveries.push({
      id: generateId(),
      nome: row.nome,
      endereco: row.endereco,
      cidade: finalCidade,
      bairro: finalBairro,
      cep: row.cep,
      pedido: row.pedido,
      telefone: row.telefone,
      addressKey: buildAddressKey(
        row.endereco,
        finalBairro,
        finalCidade,
        row.cep,
      ),
      latitude: point!.latitude,
      longitude: point!.longitude,
      geocodedAt: now,
    });
  });

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  } catch (error) {
    console.log('[storage] erro ao salvar AsyncStorage:', error);
  }

  const localRecords: LocalDeliveryRecord[] = deliveries.map(delivery => ({
    id: delivery.id,
    nome: delivery.nome,
    endereco: delivery.endereco,
    bairro: delivery.bairro,
    cidade: delivery.cidade,
    cep: delivery.cep,
    pedido: delivery.pedido,
    telefone: delivery.telefone,
    latitude: delivery.latitude,
    longitude: delivery.longitude,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }));

  try {
    await seedDeliveriesFromGeocoded(localRecords);
  } catch (error) {
    console.log('[storage] erro ao salvar SQLite:', error);
    throw error;
  }

  return deliveries;
}

export async function loadDeliveries(): Promise<GeocodedDelivery[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('[storage] erro ao ler entregas:', error);
    return [];
  }
}

export async function clearDeliveries(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
