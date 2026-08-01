import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LocateFixed,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  Camera,
  CameraRef,
  Map,
  MapRef,
  UserLocation,
  useCurrentPosition,
} from '@maplibre/maplibre-react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { requestLocationPermission } from '../map/location';
import { MAP_STYLE_URL } from '../map/offlineMaps';
import { downloadRegion, Bounds } from '../map/OfflineMapsService';

import HomeHeader from '../components/home/HomeHeader';
import ConnectionBadge from '../components/home/ConnectionBadge';
import MapControlButton from '../components/home/MapControlButton';
import SelectAreaOverlay from '../components/home/SelectAreaOverlay';
import DownloadOverlay from '../components/home/DownloadOverlay';
import HomeContent from '../components/home/HomeContent';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);

  const currentPosition = useCurrentPosition({
    enabled: hasPermission,
  });

  const userLocation = useMemo(
    () =>
      currentPosition?.coords
        ? {
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
          }
        : null,
    [currentPosition],
  );

  // Permissão de GPS + status de conexão
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const granted = await requestLocationPermission();
      if (mounted) {
        setHasPermission(granted);
      }
    };
    init();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (mounted) {
        setIsOnline(
          state.isConnected !== false && state.isInternetReachable !== false,
        );
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const recenterMap = useCallback(() => {
    cameraRef.current?.easeTo({
      center: [
        userLocation?.longitude ?? -46.6333,
        userLocation?.latitude ?? -23.5505,
      ],
      zoom: 16,
      duration: 800,
    });
  }, [userLocation]);

  const zoomIn = useCallback(async () => {
    if (!mapRef.current || !cameraRef.current) {
      return;
    }
    const currentZoom = await mapRef.current.getZoom();
    cameraRef.current.zoomTo(currentZoom + 1, { duration: 300 });
  }, []);

  const zoomOut = useCallback(async () => {
    if (!mapRef.current || !cameraRef.current) {
      return;
    }
    const currentZoom = await mapRef.current.getZoom();
    cameraRef.current.zoomTo(currentZoom - 1, { duration: 300 });
  }, []);

  const toggleSelectArea = useCallback(() => {
    if (isDownloading) {
      return;
    }
    setIsSelectingArea(prev => !prev);
    setDownloadProgress(0);
    setDownloadedBytes(0);
  }, [isDownloading]);

  const confirmDownloadArea = useCallback(async () => {
    if (!mapRef.current) {
      return;
    }

    try {
      setIsDownloading(true);
      setIsSelectingArea(false);

      // Bounds atuais do viewport: [oeste, sul, leste, norte]
      const bounds = (await mapRef.current.getBounds()) as unknown as Bounds;

      const packId = await downloadRegion(
        bounds,
        progress => {
          setDownloadProgress(Math.round(progress.percentage));
          setDownloadedBytes(progress.completedTileSize);
        },
        error => {
          Alert.alert(
            'Erro no download',
            error.message || 'Não foi possível baixar a região selecionada.',
          );
        },
      );

      if (packId) {
        Alert.alert(
          'Download concluído',
          'A região selecionada foi salva e estará disponível offline.',
        );
      }
    } catch (error) {
      console.log('[Home] erro ao baixar área:', error);
      Alert.alert('Erro', 'Não foi possível baixar a região selecionada.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadedBytes(0);
    }
  }, []);

  const openOfflineMaps = useCallback(() => {
    navigation.navigate('OfflineMaps');
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <HomeHeader />

      {/* Mapa (50% da tela) */}
      <View style={styles.mapSection}>
        <Map
          ref={mapRef}
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          logo={false}
          attribution={false}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [-46.6333, -23.5505],
              zoom: 13,
            }}
            trackUserLocation={hasPermission ? 'default' : undefined}
          />

          {hasPermission && <UserLocation animated accuracy />}
        </Map>

        {/* Indicador online/offline */}
        <ConnectionBadge isOnline={isOnline} top={insets.top + 56} />

        {/* Botão recentralizar */}
        <MapControlButton top={insets.top + 52} onPress={recenterMap}>
          <LocateFixed size={20} color={colors.primary} />
        </MapControlButton>

        {/* Botão abrir mapas offline */}
        <MapControlButton top={insets.top + 100} onPress={openOfflineMaps}>
          <MapIcon size={20} color={colors.primary} />
        </MapControlButton>

        {/* Botões de zoom */}
        <MapControlButton top={insets.top + 148} onPress={zoomIn}>
          <ZoomIn size={20} color={colors.primary} />
        </MapControlButton>
        <MapControlButton top={insets.top + 196} onPress={zoomOut}>
          <ZoomOut size={20} color={colors.primary} />
        </MapControlButton>

        {/* Overlay de seleção de área */}
        {isSelectingArea && (
          <SelectAreaOverlay
            onCancel={toggleSelectArea}
            onConfirm={confirmDownloadArea}
          />
        )}

        {/* Overlay de download */}
        {isDownloading && (
          <DownloadOverlay
            progress={downloadProgress}
            downloadedBytes={downloadedBytes}
          />
        )}
      </View>

      {/* Conteúdo inferior */}
      <HomeContent
        isSelectingArea={isSelectingArea}
        isDownloading={isDownloading}
        hasPermission={hasPermission}
        onToggleSelectArea={toggleSelectArea}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ===== Mapa =====
  mapSection: {
    height: '60%',
    position: 'relative',
  },

  map: {
    flex: 1,
  },
});

export default HomeScreen;

