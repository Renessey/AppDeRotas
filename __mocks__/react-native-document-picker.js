/**
 * Mock do react-native-document-picker para testes (jest).
 */
const types = {
  allFiles: '*/*',
  audio: 'audio/*',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  images: 'image/*',
  json: 'application/json',
  pdf: 'application/pdf',
  plainText: 'text/plain',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  video: 'video/*',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
};

const mockResponse = {
  uri: 'file:///mock/planilha.xlsx',
  name: 'planilha.xlsx',
  fileCopyUri: 'file:///mock/planilha.xlsx',
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  size: 1024,
};

async function pickSingle() {
  return mockResponse;
}

async function pick() {
  return [mockResponse];
}

function isCancel(error) {
  return error?.code === 'DOCUMENT_PICKER_CANCELED';
}

function isInProgress() {
  return false;
}

async function releaseSecureAccess() {}

export default {
  types,
  pickSingle,
  pick,
  isCancel,
  isInProgress,
  releaseSecureAccess,
};

export { types, pickSingle, pick, isCancel, isInProgress, releaseSecureAccess };

