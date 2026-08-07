import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, Check, AlertCircle, FileSpreadsheet } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { ImportResult, DetectedColumn } from '../../import/spreadsheet';

type ImportPreviewModalProps = {
  visible: boolean;
  result: ImportResult | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const COLUMN_LABELS: Record<DetectedColumn, string> = {
  nome: 'Nome',
  endereco: 'Endereço',
  cidade: 'Cidade',
  bairro: 'Bairro',
  cep: 'CEP',
  pedido: 'Pedido',
  telefone: 'Telefone',
};

const ImportPreviewModal = ({
  visible,
  result,
  loading,
  onClose,
  onConfirm,
}: ImportPreviewModalProps) => {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '1A' }]}>
              <FileSpreadsheet size={22} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>
                Pré-visualização
              </Text>
              <Text
                style={[styles.fileName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {result?.fileName ?? 'Importando...'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loading || !result ? (
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Lendo planilha...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              {/* Resumo */}
              <View style={styles.summaryRow}>
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: colors.primary + '1A' },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {result.totalRows}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.textSecondary }]}
                  >
                    Total
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: 'rgba(16,185,129,0.15)' },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                    {result.validRows}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.textSecondary }]}
                  >
                    Válidas
                  </Text>
                </View>
                <View
                  style={[
                    styles.summaryBadge,
                    { backgroundColor: 'rgba(239,68,68,0.15)' },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                    {result.invalidRows}
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.textSecondary }]}
                  >
                    Erros
                  </Text>
                </View>
              </View>

              {/* Colunas detectadas */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Colunas detectadas
              </Text>
              <View style={styles.chips}>
                {result.columns.map(col => (
                  <View
                    key={col}
                    style={[styles.chip, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: colors.primary }]}>
                      {COLUMN_LABELS[col]}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Pré-visualização da tabela */}
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Dados (primeiras linhas)
              </Text>
              <View
                style={[
                  styles.table,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                {result.rows.slice(0, 5).map((row, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[styles.tableCell, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {row.pedido ? `#${row.pedido} ` : ''}
                      {row.nome}
                    </Text>
                    <Text
                      style={[styles.tableSub, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {[row.endereco, row.bairro, row.cidade, row.cep]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                ))}
                {result.rows.length === 0 && (
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    Nenhuma linha de dados encontrada.
                  </Text>
                )}
              </View>

              {/* Erros de validação */}
              {result.errors.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Erros de validação
                  </Text>
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: 'rgba(239,68,68,0.08)' },
                    ]}
                  >
                    {result.errors.slice(0, 10).map((err, i) => (
                      <View key={i} style={styles.errorRow}>
                        <AlertCircle size={14} color="#EF4444" />
                        <Text
                          style={[styles.errorText, { color: colors.textSecondary }]}
                        >
                          Linha {err.index + 1}: {err.message}
                        </Text>
                      </View>
                    ))}
                    {result.errors.length > 10 && (
                      <Text
                        style={[styles.moreErrors, { color: colors.textSecondary }]}
                      >
                        + {result.errors.length - 10} mais
                      </Text>
                    )}
                  </View>
                </>
              )}

              {/* Rodapé */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={16} color={colors.text} />
                  <Text style={[styles.cancelText, { color: colors.text }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                  disabled={result.rows.length === 0}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.confirmText}>
                    Importar {result.rows.length} entregas
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  card: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '85%',
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
    marginRight: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
  },

  fileName: {
    fontSize: 13,
    marginTop: 2,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    paddingHorizontal: 16,
  },

  center: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  summaryBadge: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  table: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
  },

  tableRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  tableCell: {
    fontSize: 14,
    fontWeight: '600',
  },

  tableSub: {
    fontSize: 12,
    marginTop: 2,
  },

  errorBox: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },

  moreErrors: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ImportPreviewModal;
