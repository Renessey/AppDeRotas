import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FileUp, Loader2 } from 'lucide-react-native';
import DocumentPicker, {
  DocumentPickerResponse,
  isCancel,
} from 'react-native-document-picker';
import { useAppTheme } from '../../theme/ThemeContext';
import {
  readSpreadsheet,
  ImportResult,
  getImportExtensions,
  ImportedRow,
} from '../../import/spreadsheet';
import { geocodeRows, GeocodeResult } from '../../geocoding/geocoder';
import { saveDeliveries } from '../../storage/deliveries';
import ImportPreviewModal from './ImportPreviewModal';
import GeocodingProgressOverlay from './GeocodingProgressOverlay';

type ImportSectionProps = {
  disabled?: boolean;
  onImportComplete?: (savedCount: number) => void;
};

type GeocodeProgress = {
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
};

const ImportSection = ({ disabled = false, onImportComplete }: ImportSectionProps) => {
  const { colors } = useAppTheme();

  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeProgress, setGeocodeProgress] = useState<GeocodeProgress>({
    processed: 0,
    total: 0,
    succeeded: 0,
    failed: 0,
  });

  const handlePick = useCallback(async () => {
    try {
      const picked = await DocumentPicker.pickSingle({
        type: getImportExtensions(),
        copyTo: 'cachesDirectory',
      });

      const file: DocumentPickerResponse = picked;
      const sourceUri = file.fileCopyUri ?? file.uri;
      if (!sourceUri) {
        Alert.alert(
          'Erro',
          'Não foi possível acessar o arquivo selecionado.',
        );
        return;
      }

      setLoading(true);
      setPreviewVisible(true);

      const parsed = await readSpreadsheet(sourceUri, file.name ?? 'planilha');

      setResult(parsed);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setPreviewVisible(false);
      if (isCancel(error)) {
        return;
      }
      console.log('[Import] erro ao ler planilha:', error);
      Alert.alert(
        'Erro ao importar',
        (error as Error)?.message ||
          'Não foi possível ler a planilha selecionada. Verifique se o arquivo é XLSX ou CSV.',
      );
    }
  }, []);

  const handleClose = useCallback(() => {
    setPreviewVisible(false);
    setGeocoding(false);
    setResult(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!result) {
      return;
    }

    const validRows: ImportedRow[] = result.rows.filter(
      (_, i) => !result.errors.some(err => err.index === i),
    );

    if (validRows.length === 0) {
      Alert.alert(
        'Nenhuma entrega válida',
        'Não há linhas válidas para importar.',
      );
      return;
    }

    setPreviewVisible(false);
    setGeocoding(true);
    setGeocodeProgress({
      processed: 0,
      total: validRows.length,
      succeeded: 0,
      failed: 0,
    });

    try {
      const geocodeResults: GeocodeResult[] = await geocodeRows(
        validRows,
        progress =>
          setGeocodeProgress({
            processed: progress.processed,
            total: progress.total,
            succeeded: progress.succeeded,
            failed: progress.failed,
          }),
      );

      const coordsByIndex = geocodeResults.map(r => r.point);

      const saved = await saveDeliveries(validRows, coordsByIndex, geocodeResults);

      const succeeded = coordsByIndex.filter(Boolean).length;
      const failed = coordsByIndex.length - succeeded;

      const msg =
        `${saved.length} de ${validRows.length} entregas foram importadas ` +
        `com sucesso. ` +
        `${failed > 0 ? `${failed} não puderam ser geocodificadas.` : ''}`;
      Alert.alert(
        'Importação concluída',
        msg,
        [
          {
            text: 'Ver no Mapa',
            onPress: () => {
              handleClose();
              onImportComplete?.(saved.length);
            },
          },
          { text: 'OK', onPress: handleClose, style: 'cancel' },
        ],
      );
    } catch (error) {
      console.log('[Import] erro ao geocodificar:', error);
      Alert.alert(
        'Erro ao importar',
        'Ocorreu um erro durante a geocodificação. Tente novamente.',
        [{ text: 'OK', onPress: handleClose }],
      );
    } finally {
      setGeocoding(false);
    }
  }, [result, handleClose, onImportComplete]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.importButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={handlePick}
        activeOpacity={0.8}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 size={18} color={colors.primary} />
        ) : (
          <FileUp size={18} color={colors.primary} />
        )}
        <Text style={[styles.importText, { color: colors.text }]}>
          {loading ? 'Importando...' : 'Importar Planilha'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Suporte a arquivos XLSX e CSV com detecção automática de colunas.
      </Text>

      <ImportPreviewModal
        visible={previewVisible}
        result={result}
        loading={loading}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />

      {geocoding && <GeocodingProgressOverlay progress={geocodeProgress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 12,
  },

  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    width: '100%',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  importText: {
    fontSize: 15,
    fontWeight: '700',
  },

  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ImportSection;
