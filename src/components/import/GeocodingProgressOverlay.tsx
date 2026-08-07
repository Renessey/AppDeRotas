import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MapPin, XCircle } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type GeocodingProgressOverlayProps = {
  progress: {
    processed: number;
    total: number;
    succeeded: number;
    failed: number;
  };
};

const GeocodingProgressOverlay = ({
  progress,
}: GeocodingProgressOverlayProps) => {
  const { colors } = useAppTheme();
  const percentage =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  return (
    <View style={[styles.absoluteFill, styles.overlay]}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Geocodificando endereços...
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {progress.processed} de {progress.total} · {percentage}%
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MapPin size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {progress.succeeded} localizados
            </Text>
          </View>
          <View style={styles.stat}>
            <XCircle size={14} color="#EF4444" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {progress.failed} falhas
            </Text>
          </View>
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

  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statText: {
    fontSize: 12,
  },
});

export default GeocodingProgressOverlay;
