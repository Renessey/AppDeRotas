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
    <View style={styles.absoluteFill} pointerEvents="box-none">
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Selecione a área</Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Ajuste o mapa até enquadrar a região desejada.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancel, { borderColor: colors.border }]}
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <X size={16} color={colors.textSecondary} />
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
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
    bottom: 20,
    left: 16,
    right: 16,
    maxWidth: 380,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 18,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
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
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },

  cancel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
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
