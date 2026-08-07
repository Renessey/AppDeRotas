import { ImportedRow } from '../import/spreadsheet';
import { buildAddressKey } from '../storage/deliveries';
import {
  GeoPoint,
  getCachedCoordinates,
  setCachedCoordinates,
} from '../storage/geocodeCache';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const REQUEST_DELAY_MS = 1100;
const REQUEST_TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;

export type GeocodeResult = {
  index: number;
  addressKey: string;
  point: GeoPoint | null;
  status: 'cached' | 'geocoded' | 'failed';
  cidade?: string;
  bairro?: string;
};

export type GeocodeProgressCallback = (progress: {
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
}) => void;

export type GeocodeTextResult = {
  point: GeoPoint;
  cidade?: string;
  bairro?: string;
};

export function buildAddressString(row: ImportedRow): string {
  return [row.endereco, row.bairro, row.cidade, row.cep]
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');
}

function extractCepDigits(cep: string): string {
  return cep.replace(/\D/g, '');
}

function buildStructuredParams(
  row: ImportedRow,
): Record<string, string> | null {
  const street = [row.endereco, row.bairro]
    .map(p => p.trim())
    .filter(Boolean)
    .join(', ');
  const city = row.cidade.trim();
  const cepDigits = extractCepDigits(row.cep);

  if (!street && !city && !cepDigits) {
    return null;
  }

  const params: Record<string, string> = {
    format: 'jsonv2',
    limit: '1',
    'accept-language': 'pt',
    countrycodes: 'br',
    addressdetails: '1',
  };

  if (street) {
    params.street = street;
  }
  if (city) {
    params.city = city;
  }
  if (cepDigits) {
    params.postalcode = cepDigits;
  }

  return params;
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'EntregasApp/1.0 (local; mobile)',
        },
      });
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get('retry-after');
        const delayMs = retryAfter
          ? Number(retryAfter) * 1000
          : 1000 * Math.pow(2, attempt);
        lastError = new Error(`Nominatim retornou HTTP ${response.status}`);
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), delayMs),
        );
        continue;
      }
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise<void>(resolve =>
          setTimeout(() => resolve(), 1000 * Math.pow(2, attempt)),
        );
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error('Falha ao executar a requisição');
}

type NominatimAddressDetails = {
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
};

type NominatimResultItem = {
  lat: string;
  lon: string;
  address?: NominatimAddressDetails;
};

function extractLocality(data: NominatimResultItem): {
  cidade?: string;
  bairro?: string;
} {
  const addr = data.address;
  const cidade =
    addr?.city || addr?.town || addr?.municipality || addr?.county || '';
  const bairro =
    addr?.suburb ||
    addr?.neighbourhood ||
    addr?.quarter ||
    addr?.city_district ||
    '';
  return {
    cidade: cidade.trim() || undefined,
    bairro: bairro.trim() || undefined,
  };
}

async function fetchCoordinates(
  row: ImportedRow,
): Promise<(GeocodeTextResult & { point: GeoPoint }) | null> {
  const structured = buildStructuredParams(row);
  if (structured) {
    const query = new URLSearchParams(structured).toString();
    const url = `${NOMINATIM_URL}?${query}`;

    const response = await fetchWithRetry(url);
    if (response.ok) {
      const data = (await response.json()) as NominatimResultItem[];
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          const locality = extractLocality(data[0]);
          return { point: { latitude: lat, longitude: lon }, ...locality };
        }
      }
    } else {
      throw new Error(`Nominatim retornou HTTP ${response.status}`);
    }
  }

  const address = buildAddressString(row);
  if (address) {
    const url =
      `${NOMINATIM_URL}?format=jsonv2&limit=1&accept-language=pt` +
      `&countrycodes=br&addressdetails=1&q=${encodeURIComponent(address)}`;

    const response = await fetchWithRetry(url);
    if (response.ok) {
      const data = (await response.json()) as NominatimResultItem[];
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          const locality = extractLocality(data[0]);
          return { point: { latitude: lat, longitude: lon }, ...locality };
        }
      }
      return null;
    }
    throw new Error(`Nominatim retornou HTTP ${response.status}`);
  }

  return null;
}

async function geocodeRow(
  row: ImportedRow,
  index: number,
): Promise<GeocodeResult> {
  const addressKey = buildAddressKey(
    row.endereco,
    row.bairro,
    row.cidade,
    row.cep,
  );

  const cached = await getCachedCoordinates(addressKey);
  if (cached) {
    return { index, addressKey, point: cached, status: 'cached' };
  }

  try {
    const result = await fetchCoordinates(row);
    if (result) {
      await setCachedCoordinates(addressKey, result.point);
      return {
        index,
        addressKey,
        point: result.point,
        status: 'geocoded',
        cidade: result.cidade,
        bairro: result.bairro,
      };
    }
    return { index, addressKey, point: null, status: 'failed' };
  } catch (error) {
    console.log(`[geocode] falha na linha ${index}:`, error);
    return { index, addressKey, point: null, status: 'failed' };
  }
}

export async function geocodeAddressText(
  endereco: string,
  cep?: string,
): Promise<GeocodeTextResult | null> {
  const cepDigits = extractCepDigits(cep ?? '');
  const cleanAddress = endereco.trim();

  const queries: string[] = [];
  if (cleanAddress && cepDigits) {
    queries.push(`${cleanAddress} ${cep ?? cepDigits}`);
  }
  if (cleanAddress) {
    queries.push(cleanAddress);
  }
  if (cepDigits) {
    queries.push(cep ?? cepDigits);
  }

  for (const query of queries) {
    try {
      const url =
        `${NOMINATIM_URL}?format=jsonv2&limit=1&accept-language=pt` +
        `&countrycodes=br&addressdetails=1&q=${encodeURIComponent(query)}`;
      const response = await fetchWithRetry(url);
      if (!response.ok) {
        continue;
      }
      const data = (await response.json()) as NominatimResultItem[];
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          const locality = extractLocality(data[0]);
          return {
            point: { latitude: lat, longitude: lon },
            cidade: locality.cidade,
            bairro: locality.bairro,
          };
        }
      }
    } catch (error) {
      console.log('[geocode] falha na busca por texto:', error);
    }
  }

  return null;
}

export async function geocodeRows(
  rows: ImportedRow[],
  onProgress?: GeocodeProgressCallback,
): Promise<GeocodeResult[]> {
  const results: GeocodeResult[] = [];
  let succeeded = 0;
  let failed = 0;

  if (!Array.isArray(rows)) {
    return [];
  }

  for (let i = 0; i < rows.length; i++) {
    const result = await geocodeRow(rows[i], i);
    results.push(result);

    if (result.point) {
      succeeded++;
    } else {
      failed++;
    }

    onProgress?.({
      processed: i + 1,
      total: rows.length,
      succeeded,
      failed,
    });

    if (result.status === 'geocoded' && i < rows.length - 1) {
      await new Promise<void>(resolve =>
        setTimeout(() => resolve(), REQUEST_DELAY_MS),
      );
    }
  }

  return results;
}
