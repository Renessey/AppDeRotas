/**
 * Mock do xlsx (SheetJS) para testes (jest).
 *
 * Compatível com `import * as XLSX from 'xlsx'` e `import XLSX from 'xlsx'`.
 */
const mockXLSX = {
  read(data, opts) {
    return {
      SheetNames: ['Planilha1'],
      Sheets: {
        Planilha1: {},
      },
    };
  },
  utils: {
    sheet_to_json(sheet, opts) {
      return [
        ['Nome', 'Endereço', 'Cidade', 'Bairro', 'CEP', 'Pedido'],
        ['Ana Silva', 'Rua A', 'São Paulo', 'Centro', '01000-000', '1001'],
      ];
    },
  },
  version: '0.0.0-mock',
};

module.exports = mockXLSX;
module.exports.default = mockXLSX;
module.exports.read = mockXLSX.read;
module.exports.utils = mockXLSX.utils;
module.exports.version = mockXLSX.version;
