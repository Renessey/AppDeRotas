declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(statement: string, params?: any[]): Promise<[any, any]>;
    transaction(callback: (tx: any) => Promise<void>): Promise<void>;
  }

  export interface OpenDatabaseParams {
    name: string;
    location?: string;
  }

  export function enablePromise(value: boolean): void;
  export function openDatabase(params: OpenDatabaseParams): Promise<SQLiteDatabase>;
}
