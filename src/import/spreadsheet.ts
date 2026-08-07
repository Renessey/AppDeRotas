import * as XLSX from 'xlsx';
import { Platform } from 'react-native';

export type DetectedColumn =
  | 'nome'
  | 'endereco'
  | 'cidade'
  | 'bairro'
  | 'cep'
  | 'pedido'
  | 'telefone';

export type ImportedRow = {
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  cep: string;
  pedido: string;
  telefone?: string;
};

export type FieldError = {
  index: number;
  field: DetectedColumn;
  message: string;
};

export type ImportResult = {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  columns: DetectedColumn[];
  rows: ImportedRow[];
  errors: FieldError[];
  rawHeaders: string[];
  hasHeader: boolean;
};

const FIELD_ALIASES: Record<DetectedColumn, string[]> = {
  nome: ['nome', 'cliente', 'name', 'destinatario', 'destinatário', 'titular'],
  endereco: [
    'endereco',
    'endereço',
    'address',
    'logradouro',
    'rua',
    'end',
    'enderecoentrega',
  ],
  cidade: ['cidade', 'city', 'municipio', 'município'],
  bairro: ['bairro', 'district', 'neighborhood', 'bairroentrega'],
  cep: ['cep', 'zip', 'zipcode', 'codpostal', 'código postal', 'postalcode'],
  pedido: ['pedido', 'pedidos', 'order', 'numero', 'número', 'protocolo', 'id'],
  telefone: ['telefone', 'phone', 'celular', 'fone', 'contato', 'whatsapp'],
};

function normalizeHeader(value: string): string {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

function detectColumn(header: string): DetectedColumn | null {
  const normalized = normalizeHeader(header);
  if (!normalized) {
    return null;
  }

  for (const field of Object.keys(FIELD_ALIASES) as DetectedColumn[]) {
    const aliases = FIELD_ALIASES[field];
    if (aliases.some(alias => normalizeHeader(alias) === normalized)) {
      return field;
    }
  }

  for (const field of Object.keys(FIELD_ALIASES) as DetectedColumn[]) {
    const aliases = FIELD_ALIASES[field];
    if (aliases.some(alias => normalized.includes(normalizeHeader(alias)))) {
      return field;
    }
  }

  return null;
}

function isValidCep(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8;
}

function normalizeCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return value;
}

export async function readSpreadsheet(
  uri: string,
  fileName: string,
): Promise<ImportResult> {
  const response = await fetch(uri);
  const buffer = await response.arrayBuffer();

  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('A planilha não contém nenhuma planilha utilizável.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });

  if (!rawRows.length) {
    throw new Error('A planilha está vazia.');
  }

  // ===== Detectar cabeçalho =====
  const firstRow = rawRows[0].map(v => String(v ?? '').trim());
  let headerRowIndex = 0;
  let hasHeader = false;

  const firstRowDetected = firstRow
    .map(detectColumn)
    .filter(Boolean) as DetectedColumn[];

  if (firstRowDetected.length >= 2) {
    hasHeader = true;
    headerRowIndex = 0;
  } else {
    // Tenta a segunda linha como cabeçalho (caso a primeira seja título)
    const secondRow = rawRows[1]?.map(v => String(v ?? '').trim()) ?? [];
    const secondRowDetected = secondRow
      .map(detectColumn)
      .filter(Boolean) as DetectedColumn[];
    if (secondRowDetected.length >= 2) {
      hasHeader = true;
      headerRowIndex = 1;
    }
  }

  if (!hasHeader) {
    throw new Error(
      'Não foi possível identificar as colunas da planilha. Verifique se a primeira linha contém os cabeçalhos (Nome, Endereço, Cidade, Bairro, CEP, Pedido).',
    );
  }

  const headerRow = rawRows[headerRowIndex].map(v => String(v ?? '').trim());
  const rawHeaders = headerRow;

// ===== Mapear colunas =====
  const columnMap = new Map<number, DetectedColumn>();
  headerRow.forEach((header, index) => {
    const col = detectColumn(header);
    if (col && ![...columnMap.values()].includes(col)) {
      columnMap.set(index, col);
    }
  });

  const columns = [...columnMap.values()];

  // ===== Extrair linhas =====
  const rows: ImportedRow[] = [];
  const errors: FieldError[] = [];
  let validRows = 0;

  const dataRows = rawRows.slice(headerRowIndex + 1);

  dataRows.forEach((raw, rowIndex) => {
    const get = (col: DetectedColumn): string => {
      for (const [index, mapped] of columnMap.entries()) {
        if (mapped === col) {
          return String(raw[index] ?? '').trim();
        }
      }
      return '';
    };

    const nome = get('nome');
    const endereco = get('endereco');
    const cidade = get('cidade');
    const bairro = get('bairro');
    const cep = get('cep');
    const pedido = get('pedido');
    const telefone = get('telefone');

    // Linha totalmente vazia -> ignorar
    if (!nome && !endereco && !cidade && !bairro && !cep && !pedido) {
      return;
    }

    const rowErrors: FieldError[] = [];
    const pushError = (field: DetectedColumn, message: string) => {
      rowErrors.push({ index: rowIndex, field, message });
    };

    if (!nome) {
      pushError('nome', 'Nome é obrigatório.');
    }
    if (!endereco) {
      pushError('endereco', 'Endereço é obrigatório.');
    }
    if (!cidade) {
      pushError('cidade', 'Cidade é obrigatória.');
    }
    if (!cep) {
      pushError('cep', 'CEP é obrigatório.');
    } else if (!isValidCep(cep)) {
      pushError('cep', 'CEP inválido (esperado 8 dígitos).');
    }

    if (rowErrors.length === 0) {
      validRows++;
    }

    rows.push({
      nome,
      endereco,
      cidade,
      bairro,
      cep: normalizeCep(cep),
      pedido,
      telefone: telefone || undefined,
    });

    errors.push(...rowErrors);
  });

  return {
    fileName,
    totalRows: rows.length,
    validRows,
    invalidRows: rows.length - validRows,
    columns,
    rows,
    errors,
    rawHeaders,
    hasHeader,
  };
}

export function getImportExtensions(): string[] {
  return Platform.OS === 'ios'
    ? ['org.openxmlformats.spreadsheetml.sheet', 'public.comma-separated-values-text']
    : ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
}
