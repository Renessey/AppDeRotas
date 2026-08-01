import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';
import { formatBytes } from '../../map/offlineMaps';

type DownloadOverlayProps = {
  progress: number;
  downloadedBytes: number;
};

const DownloadOverlay = ({ progress, downloadedBytes }: DownloadOverlayProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.absoluteFill, styles.overlay]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Baixando mapa offline...
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {progress}% · {formatBytes(downloadedBytes)}
        </Text>
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

  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  card: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
  },

  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  meta: {
    fontSize: 12,
  },
});

export default DownloadOverlay;

