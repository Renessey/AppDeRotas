import { readSpreadsheet } from '../src/import/spreadsheet';

describe('readSpreadsheet', () => {
  beforeAll(() => {
    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = jest.fn(async () => ({
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    })) as unknown as typeof fetch;
  });

  it('parseia uma planilha simples com cabeçalho e linha de dados', async () => {
    const result = await readSpreadsheet('file:///mock/planilha.xlsx', 'planilha.xlsx');

    expect(result.hasHeader).toBe(true);
    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.rows[0]).toMatchObject({
      nome: 'Ana Silva',
      endereco: 'Rua A',
      cidade: 'São Paulo',
      bairro: 'Centro',
      cep: '01000-000',
      pedido: '1001',
    });
  });
});
