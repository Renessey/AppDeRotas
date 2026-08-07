import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export type LocalDeliveryRecord = {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  pedido: string;
  telefone?: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'delivered' | 'undelivered';
  observacoes?: string;
  deliveryTime?: string;
  createdAt: number;
  updatedAt: number;
};

export type SavedRoute = {
  id: string;
  nome: string;
  startLatitude: number;
  startLongitude: number;
  sequence: string[];
  createdAt: number;
};

let dbInstance: SQLiteDatabase | null = null;

export async function openLocalDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await SQLite.openDatabase({
      name: 'entregasapp.db',
      location: 'default',
    });

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        endereco TEXT NOT NULL,
        bairro TEXT NOT NULL DEFAULT '',
        cidade TEXT NOT NULL DEFAULT '',
        cep TEXT NOT NULL,
        telefone TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS entregas (
        id TEXT PRIMARY KEY,
        clienteId TEXT NOT NULL,
        pedido TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        observacoes TEXT,
        deliveryTime TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY(clienteId) REFERENCES clientes(id)
      )
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS rotas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        startLatitude REAL NOT NULL,
        startLongitude REAL NOT NULL,
        sequence TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS mapas_offline (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        bounds TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS historico (
        id TEXT PRIMARY KEY,
        deliveryId TEXT NOT NULL,
        action TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);
  } catch (error) {
    console.log('[localDatabase] erro ao abrir banco:', error);
    dbInstance = null;
    throw error;
  }

  return dbInstance;
}

function hasValidCoords(d: { latitude?: number; longitude?: number }): boolean {
  return (
    typeof d?.latitude === 'number' &&
    typeof d?.longitude === 'number' &&
    Number.isFinite(d.latitude) &&
    Number.isFinite(d.longitude) &&
    d.latitude >= -90 &&
    d.latitude <= 90 &&
    d.longitude >= -180 &&
    d.longitude <= 180
  );
}

export async function seedDeliveriesFromGeocoded(
  deliveries: LocalDeliveryRecord[],
): Promise<void> {
  if (!Array.isArray(deliveries) || deliveries.length === 0) {
    return;
  }

  const db = await openLocalDatabase();
  const valid = deliveries.filter(
    d =>
      d &&
      typeof d.id === 'string' &&
      typeof d.nome === 'string' &&
      typeof d.endereco === 'string' &&
      hasValidCoords(d),
  );

  if (valid.length !== deliveries.length) {
    console.log(
      `[localDatabase] ${deliveries.length - valid.length} registros inválidos ignorados no seed`,
    );
  }

  if (valid.length === 0) {
    return;
  }

  try {
    await db.transaction(async (tx: any) => {
      for (const delivery of valid) {
        try {
          await tx.executeSql(
            `INSERT OR REPLACE INTO clientes (id, nome, endereco, bairro, cidade, cep, telefone, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              delivery.id,
              delivery.nome,
              delivery.endereco,
              delivery.bairro ?? '',
              delivery.cidade ?? '',
              delivery.cep,
              delivery.telefone ?? null,
              delivery.createdAt,
              delivery.updatedAt,
            ],
          );

          await tx.executeSql(
            `INSERT OR REPLACE INTO entregas (id, clienteId, pedido, latitude, longitude, status, observacoes, deliveryTime, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              delivery.id,
              delivery.id,
              delivery.pedido,
              delivery.latitude,
              delivery.longitude,
              delivery.status,
              delivery.observacoes ?? null,
              delivery.deliveryTime ?? null,
              delivery.createdAt,
              delivery.updatedAt,
            ],
          );
        } catch (rowError) {
          console.log(
            `[localDatabase] erro ao inserir entrega ${delivery.id}:`,
            rowError,
          );
        }
      }
    });
  } catch (error) {
    console.log('[localDatabase] erro na transação de seed:', error);
    throw error;
  }
}

export async function listDeliveries(): Promise<LocalDeliveryRecord[]> {
  try {
    const db = await openLocalDatabase();
    const [result] = await db.executeSql(`
      SELECT e.id, c.nome, c.endereco, c.bairro, c.cidade, c.cep, c.telefone, e.pedido, e.latitude, e.longitude, e.status, e.observacoes, e.deliveryTime, e.createdAt, e.updatedAt
      FROM entregas e
      JOIN clientes c ON c.id = e.clienteId
      ORDER BY e.createdAt DESC
    `);

    const rows = result?.rows?.raw?.() ?? [];
    return rows
      .filter((row: any) => row && hasValidCoords(row))
      .map((row: any) => ({
        id: row.id,
        nome: row.nome,
        endereco: row.endereco,
        bairro: row.bairro ?? '',
        cidade: row.cidade ?? '',
        cep: row.cep,
        pedido: row.pedido,
        telefone: row.telefone ?? undefined,
        latitude: row.latitude,
        longitude: row.longitude,
        status: row.status,
        observacoes: row.observacoes ?? undefined,
        deliveryTime: row.deliveryTime ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
  } catch (error) {
    console.log('[localDatabase] erro ao listar entregas:', error);
    return [];
  }
}

export async function saveOptimizedRoute(params: {
  id?: string;
  nome: string;
  startLatitude: number;
  startLongitude: number;
  sequence: string[];
}): Promise<SavedRoute> {
  const db = await openLocalDatabase();
  const now = Date.now();
  const id = params.id ?? `route-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (
    !hasValidCoords({
      latitude: params.startLatitude,
      longitude: params.startLongitude,
    }) ||
    !Array.isArray(params.sequence)
  ) {
    throw new Error('Parâmetros inválidos para salvar rota otimizada.');
  }

  await db.executeSql(
    `INSERT OR REPLACE INTO rotas (id, nome, startLatitude, startLongitude, sequence, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      params.nome || `Rota ${new Date(now).toLocaleString('pt-BR')}`,
      params.startLatitude,
      params.startLongitude,
      JSON.stringify(params.sequence),
      now,
    ],
  );

  return {
    id,
    nome: params.nome,
    startLatitude: params.startLatitude,
    startLongitude: params.startLongitude,
    sequence: params.sequence,
    createdAt: now,
  };
}

export async function getLatestRoute(): Promise<SavedRoute | null> {
  try {
    const db = await openLocalDatabase();
    const [result] = await db.executeSql(`
      SELECT id, nome, startLatitude, startLongitude, sequence, createdAt
      FROM rotas
      ORDER BY createdAt DESC
      LIMIT 1
    `);

    const rows = result?.rows?.raw?.() ?? [];
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    let sequence: string[] = [];
    try {
      sequence = Array.isArray(JSON.parse(row.sequence))
        ? JSON.parse(row.sequence)
        : [];
    } catch {
      sequence = [];
    }

    return {
      id: row.id,
      nome: row.nome,
      startLatitude: row.startLatitude,
      startLongitude: row.startLongitude,
      sequence,
      createdAt: row.createdAt,
    };
  } catch (error) {
    console.log('[localDatabase] erro ao buscar rota:', error);
    return null;
  }
}

export async function listRoutes(): Promise<SavedRoute[]> {
  try {
    const db = await openLocalDatabase();
    const [result] = await db.executeSql(`
      SELECT id, nome, startLatitude, startLongitude, sequence, createdAt
      FROM rotas
      ORDER BY createdAt DESC
    `);

    const rows = result?.rows?.raw?.() ?? [];
    return rows
      .map((row: any) => {
        let sequence: string[] = [];
        try {
          sequence = Array.isArray(JSON.parse(row.sequence))
            ? JSON.parse(row.sequence)
            : [];
        } catch {
          sequence = [];
        }
        return {
          id: row.id,
          nome: row.nome,
          startLatitude: row.startLatitude,
          startLongitude: row.startLongitude,
          sequence,
          createdAt: row.createdAt,
        };
      })
      .filter(
        (r: SavedRoute) =>
          hasValidCoords({
            latitude: r.startLatitude,
            longitude: r.startLongitude,
          }),
      );
  } catch (error) {
    console.log('[localDatabase] erro ao listar rotas:', error);
    return [];
  }
}

export async function updateDeliveryStatus(
  id: string,
  status: LocalDeliveryRecord['status'],
): Promise<void> {
  const db = await openLocalDatabase();
  const now = Date.now();
  await db.executeSql(
    'UPDATE entregas SET status = ?, updatedAt = ? WHERE id = ?',
    [status, now, id],
  );
  await db.executeSql(
    'INSERT INTO historico (id, deliveryId, action, createdAt) VALUES (?, ?, ?, ?)',
    [`history-${now}-${id}`, id, status, now],
  );
}

export async function updateDeliveryObservations(
  id: string,
  observacoes: string,
): Promise<void> {
  const db = await openLocalDatabase();
  const now = Date.now();
  await db.executeSql(
    'UPDATE entregas SET observacoes = ?, updatedAt = ? WHERE id = ?',
    [observacoes, now, id],
  );
}

export async function updateDeliveryTime(
  id: string,
  deliveryTime: string,
): Promise<void> {
  const db = await openLocalDatabase();
  const now = Date.now();
  await db.executeSql(
    'UPDATE entregas SET deliveryTime = ?, updatedAt = ? WHERE id = ?',
    [deliveryTime, now, id],
  );
}

export async function clearLocalDatabase(): Promise<void> {
  const db = await openLocalDatabase();
  await db.executeSql('DELETE FROM historico');
  await db.executeSql('DELETE FROM entregas');
  await db.executeSql('DELETE FROM clientes');
  await db.executeSql('DELETE FROM rotas');
  await db.executeSql('DELETE FROM mapas_offline');
}
