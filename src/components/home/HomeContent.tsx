import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Download, X } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type HomeContentProps = {
  isSelectingArea: boolean;
  isDownloading: boolean;
  hasPermission: boolean;
  onToggleSelectArea: () => void;
};

const HomeContent = ({
  isSelectingArea,
  isDownloading,
  hasPermission,
  onToggleSelectArea,
}: HomeContentProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.content}>
      <Text style={[styles.welcomeTitle, { color: colors.text }]}>
        Bem-vindo(a) ao EntregasApp!
      </Text>

      <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
        Gerencie suas entregas de forma rápida e eficiente.
      </Text>

      {/* Ações */}
      <TouchableOpacity
        style={[
          styles.downloadAreaButton,
          {
            backgroundColor: isSelectingArea
              ? colors.notification
              : colors.primary,
          },
        ]}
        onPress={onToggleSelectArea}
        activeOpacity={0.8}
        disabled={isDownloading}
      >
        {isSelectingArea ? (
          <X size={18} color="#FFFFFF" />
        ) : (
          <Download size={18} color="#FFFFFF" />
        )}
        <Text style={styles.downloadAreaButtonText}>
          {isSelectingArea
            ? 'Cancelar seleção'
            : 'Selecionar área p/ offline'}
        </Text>
      </TouchableOpacity>

      {!hasPermission && (
        <Text style={[styles.permissionHint, { color: colors.textSecondary }]}>
          Permita o acesso à localização para exibir sua posição no mapa.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  downloadAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    width: '100%',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  downloadAreaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  permissionHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default HomeContent;

