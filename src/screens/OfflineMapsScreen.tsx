import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Download, Trash2, HardDrive, Map as MapIcon } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeContext';
import {
  InstalledMap,
  formatBytes,
} from '../map/offlineMaps';
import {
  deleteMap,
  getInstalledMaps,
  getTotalSizeBytes,
} from '../map/OfflineMapsService';

type OfflineMapsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const OfflineMapsScreen = ({ navigation }: OfflineMapsScreenProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [maps, setMaps] = useState<InstalledMap[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMaps = useCallback(async () => {
    try {
      const [installed, total] = await Promise.all([
        getInstalledMaps(),
        getTotalSizeBytes(),
      ]);
      setMaps(installed);
      setTotalSize(total);
    } catch (error) {
      console.log('[OfflineMaps] erro ao carregar:', error);
      Alert.alert('Erro', 'Não foi possível carregar os mapas offline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadMaps();
  }, [loadMaps]);

  const handleDelete = useCallback(
    (map: InstalledMap) => {
      Alert.alert(
        'Excluir mapa',
        `Deseja excluir "${map.name}"? Isso liberará ${formatBytes(
          map.sizeBytes,
        )} de espaço.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(map.id);
              const ok = await deleteMap(map.id);
              setDeletingId(null);
              if (ok) {
                await loadMaps();
              } else {
                Alert.alert('Erro', 'Não foi possível excluir o mapa.');
              }
            },
          },
        ],
      );
    },
    [loadMaps],
  );

  const renderItem = ({ item }: { item: InstalledMap }) => {
    const isDeleting = deletingId === item.id;

    return (
      <View
        style={[
          styles.mapCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.mapCardHeader}>
          <View style={[styles.mapIcon, { backgroundColor: colors.primary + '1A' }]}>
            <MapIcon size={20} color={colors.primary} />
          </View>

          <View style={styles.mapInfo}>
            <Text
              style={[styles.mapName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.mapMeta, { color: colors.textSecondary }]}>
              {formatBytes(item.sizeBytes)}
              {' · '}
              {item.state === 'complete'
                ? 'Pronto'
                : item.state === 'active'
                ? `Baixando ${item.percentage}%`
                : 'Pausado'}
            </Text>
          </View>

          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.notification} />
          ) : (
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: colors.border }]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
              disabled={item.state === 'active'}
            >
              <Trash2 size={18} color={colors.notification} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mapas Offline
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Resumo de armazenamento */}
      <View
        style={[
          styles.storageCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.storageIcon, { backgroundColor: colors.primary + '1A' }]}>
          <HardDrive size={22} color={colors.primary} />
        </View>
        <View style={styles.storageInfo}>
          <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
            Espaço ocupado pelos mapas
          </Text>
          <Text style={[styles.storageValue, { color: colors.text }]}>
            {loading ? '—' : formatBytes(totalSize)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Download size={16} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>Baixar área</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mapas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : maps.length === 0 ? (
        <View style={styles.center}>
          <MapIcon size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhum mapa baixado
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Na tela inicial, toque em "Selecionar área" e escolha a região do
            mapa que deseja usar offline.
          </Text>
        </View>
      ) : (
        <FlatList
          data={maps}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  headerSpacer: {
    width: 40,
  },

  storageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },

  storageIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  storageInfo: {
    flex: 1,
  },

  storageLabel: {
    fontSize: 12,
  },

  storageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  mapCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },

  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  mapInfo: {
    flex: 1,
    marginRight: 8,
  },

  mapName: {
    fontSize: 15,
    fontWeight: '600',
  },

  mapMeta: {
    fontSize: 12,
    marginTop: 4,
  },

  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default OfflineMapsScreen;

