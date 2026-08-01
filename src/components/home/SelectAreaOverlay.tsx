import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type SelectAreaOverlayProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const SelectAreaOverlay = ({ onCancel, onConfirm }: SelectAreaOverlayProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.absoluteFill}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Selecione a área
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Ajuste o mapa até enquadrar a região desejada.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancel, { borderColor: colors.border }]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <X size={16} color={colors.text} />
            <Text style={[styles.cancelText, { color: colors.text }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirm, { backgroundColor: colors.primary }]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.confirmText}>Baixar área</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  card: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 16,
    padding: 16,
    gap: 4,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  hint: {
    fontSize: 13,
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },

  cancel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SelectAreaOverlay;

