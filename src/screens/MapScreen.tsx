import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import {
  Camera,
  CameraRef,
  Map as MapView,
  MapRef,
  Marker,
  UserLocation,
  GeoJSONSource,
  Layer,
  useCurrentPosition,
} from '@maplibre/maplibre-react-native';
import {
  Download,
  Home,
  LocateFixed,
  MapPin,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { requestLocationPermission } from '../map/location';
import { MAP_STYLE_URL } from '../map/offlineMaps';
import { downloadRegion, Bounds } from '../map/OfflineMapsService';
import {
  listDeliveries,
  LocalDeliveryRecord,
  saveOptimizedRoute,
} from '../storage/localDatabase';
import { calculateRouteSequence } from '../storage/deliveryRouting';
import BottomNavBar, { BottomTabKey } from '../components/navigation/BottomNavBar';
import ConnectionBadge from '../components/home/ConnectionBadge';
import SelectAreaOverlay from '../components/home/SelectAreaOverlay';
import DownloadOverlay from '../components/home/DownloadOverlay';

type MapScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

function hasValidCoords(d: LocalDeliveryRecord): boolean {
  return (
    typeof d?.latitude === 'number' &&
    typeof d?.longitude === 'number' &&
    Number.isFinite(d.latitude) &&
    Number.isFinite(d.longitude) &&
    d.latitude >= -90 &&
    d.latitude <= 90 &&
    d.longitude >= -180 &&
    d.longitude <= 180
  );
}

function getMarkerStyle(status: LocalDeliveryRecord['status']): {
  bg: string;
  ring: string;
} {
  switch (status) {
    case 'delivered':
      return { bg: '#10B981', ring: '#065F46' };
    case 'undelivered':
      return { bg: '#EF4444', ring: '#991B1B' };
    default:
      return { bg: '#4F46E5', ring: '#3730A3' };
  }
}

const MapScreen = ({ navigation }: MapScreenProps) => {
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
  const [deliveries, setDeliveries] = useState<LocalDeliveryRecord[]>([]);

  const currentPosition = useCurrentPosition({
    enabled: hasPermission,
  });

  const userLocation = useMemo(
    () =>
      currentPosition?.coords &&
      Number.isFinite(currentPosition.coords.latitude) &&
      Number.isFinite(currentPosition.coords.longitude)
        ? {
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
          }
        : null,
    [currentPosition],
  );

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const granted = await requestLocationPermission();
        if (mounted) {
          setHasPermission(granted);
        }
      } catch (error) {
        console.log('[MapScreen] erro ao solicitar permissão:', error);
        if (mounted) {
          setHasPermission(false);
        }
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

  const refreshDeliveries = useCallback(async () => {
    try {
      const data = await listDeliveries();
      const valid = data.filter(hasValidCoords);
      if (valid.length !== data.length) {
        console.log(
          `[MapScreen] ${data.length - valid.length} entregas ignoradas por coordenadas inválidas`,
        );
      }
      setDeliveries(valid);
    } catch (error) {
      console.log('[MapScreen] erro ao carregar entregas:', error);
      setDeliveries([]);
    }
  }, []);

  useEffect(() => {
    refreshDeliveries();
    const unsubscribe = navigation.addListener?.('focus', refreshDeliveries);
    return unsubscribe;
  }, [navigation, refreshDeliveries]);

  const routeStart = useMemo(
    () => ({
      latitude: userLocation?.latitude ?? -23.5505,
      longitude: userLocation?.longitude ?? -46.6333,
    }),
    [userLocation],
  );

  const route = useMemo(
    () => calculateRouteSequence(deliveries, routeStart),
    [deliveries, routeStart],
  );

  const orderById = useMemo(() => {
    const map = new Map<string, number>();
    route.forEach((item, index) => {
      if (item?.id) {
        map.set(item.id, index + 1);
      }
    });
    return map;
  }, [route]);

  useEffect(() => {
    if (route.length === 0) {
      return;
    }
    const sequence = route
      .filter(hasValidCoords)
      .map(d => d.id)
      .filter(Boolean);
    if (sequence.length < 2) {
      return;
    }
    const runSave = async () => {
      try {
        await saveOptimizedRoute({
          nome: `Rota ${new Date().toLocaleString('pt-BR')}`,
          startLatitude: routeStart.latitude,
          startLongitude: routeStart.longitude,
          sequence,
        });
      } catch (error) {
        console.log('[MapScreen] erro ao salvar rota otimizada:', error);
      }
    };
    runSave();
  }, [route, routeStart]);

  useEffect(() => {
    if (route.length === 0) {
      return;
    }
    const points: [number, number][] = [
      [routeStart.longitude, routeStart.latitude],
      ...route
        .filter(hasValidCoords)
        .map(d => [d.longitude, d.latitude] as [number, number]),
    ];
    if (points.length < 2) {
      return;
    }
    const lngs = points.map(p => p[0]);
    const lats = points.map(p => p[1]);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    try {
      cameraRef.current?.fitBounds(
        [west, south, east, north],
        { padding: { top: 80, right: 60, bottom: 80, left: 60 } },
        500,
      );
    } catch (error) {
      console.log('[MapScreen] erro ao ajustar câmera:', error);
    }
  }, [route, routeStart]);

  const routeGeoJSON = useMemo(() => {
    const coordinates: [number, number][] = [
      [routeStart.longitude, routeStart.latitude],
      ...route
        .filter(hasValidCoords)
        .map(d => [d.longitude, d.latitude] as [number, number]),
    ];
    return {
      type: 'FeatureCollection' as const,
      features: coordinates.length >= 2
        ? [
            {
              type: 'Feature' as const,
              id: 'route-line',
              properties: {},
              geometry: {
                type: 'LineString' as const,
                coordinates,
              },
            },
          ]
        : [],
    };
  }, [route, routeStart]);

  const recenterMap = useCallback(() => {
    if (route.length > 0) {
      const points: [number, number][] = [
        [routeStart.longitude, routeStart.latitude],
        ...route
          .filter(hasValidCoords)
          .map(d => [d.longitude, d.latitude] as [number, number]),
      ];
      if (points.length >= 2) {
        const lngs = points.map(p => p[0]);
        const lats = points.map(p => p[1]);
        try {
          cameraRef.current?.fitBounds(
            [
              Math.min(...lngs),
              Math.min(...lats),
              Math.max(...lngs),
              Math.max(...lats),
            ],
            { padding: { top: 80, right: 60, bottom: 80, left: 60 } },
            500,
          );
          return;
        } catch (error) {
          console.log('[MapScreen] erro no fitBounds do recenter:', error);
        }
      }
    }
    try {
      cameraRef.current?.easeTo({
        center: [routeStart.longitude, routeStart.latitude],
        zoom: 16,
        duration: 800,
      });
    } catch (error) {
      console.log('[MapScreen] erro no easeTo do recenter:', error);
    }
  }, [route, routeStart]);

  const zoomIn = useCallback(async () => {
    if (!mapRef.current || !cameraRef.current) {
      return;
    }

    try {
      const currentZoom = await mapRef.current.getZoom();
      cameraRef.current.zoomTo(currentZoom + 1, { duration: 250 });
    } catch (error) {
      console.log('[MapScreen] erro no zoomIn:', error);
    }
  }, []);

  const zoomOut = useCallback(async () => {
    if (!mapRef.current || !cameraRef.current) {
      return;
    }

    try {
      const currentZoom = await mapRef.current.getZoom();
      cameraRef.current.zoomTo(currentZoom - 1, { duration: 250 });
    } catch (error) {
      console.log('[MapScreen] erro no zoomOut:', error);
    }
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
      console.log('[MapScreen] erro ao baixar área:', error);
      Alert.alert('Erro', 'Não foi possível baixar a região selecionada.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadedBytes(0);
    }
  }, []);

  const handleBottomNav = useCallback(
    (tab: BottomTabKey) => {
      if (tab === 'Home') {
        navigation.navigate('Home');
        return;
      }

      if (tab === 'Deliveries') {
        navigation.navigate('Deliveries');
        return;
      }

      if (tab === 'OfflineMaps') {
        navigation.navigate('OfflineMaps');
        return;
      }

      navigation.navigate('Map');
    },
    [navigation],
  );

  const routeSourceId = 'route-source';
  const routeLayerId = 'route-line-layer';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <View style={styles.mapShell}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
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

          <Marker
            id="route-start"
            lngLat={[routeStart.longitude, routeStart.latitude]}
          >
            <View style={styles.startBadge}>
              <Home size={18} color="#FFFFFF" />
            </View>
          </Marker>

          {route.filter(hasValidCoords).map(delivery => {
            const orderNumber = orderById.get(delivery.id) ?? 0;
            const markerColor = getMarkerStyle(delivery.status);
            return (
              <Marker
                key={delivery.id}
                id={delivery.id}
                lngLat={[delivery.longitude, delivery.latitude]}
              >
                <View
                  style={[
                    styles.orderBadge,
                    {
                      backgroundColor: markerColor.bg,
                      borderColor: markerColor.ring,
                    },
                  ]}
                >
                  <Text style={styles.orderText}>{orderNumber}</Text>
                </View>
              </Marker>
            );
          })}

          {deliveries
            .filter(d => hasValidCoords(d) && !orderById.has(d.id))
            .map(delivery => {
              const markerColor = getMarkerStyle(delivery.status);
              return (
                <Marker
                  key={`orphan-${delivery.id}`}
                  id={`orphan-${delivery.id}`}
                  lngLat={[delivery.longitude, delivery.latitude]}
                >
                  <View
                    style={[
                      styles.markerBadge,
                      {
                        backgroundColor: markerColor.bg,
                        borderColor: markerColor.ring,
                      },
                    ]}
                  >
                    <MapPin size={16} color="#FFFFFF" />
                  </View>
                </Marker>
              );
            })}

          {routeGeoJSON.features.length > 0 && (
            <>
              <GeoJSONSource id={routeSourceId} shape={routeGeoJSON} />
              <Layer
                id={routeLayerId}
                source={routeSourceId}
                type="line"
                style={{
                  lineColor: colors.primary || '#4F46E5',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}
        </MapView>

        <ConnectionBadge isOnline={isOnline} top={insets.top + 12} />

        <View style={[styles.zoomStack, { top: insets.top + 72 }]}>
          <TouchableOpacity
            style={[
              styles.zoomButton,
              {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={zoomIn}
            activeOpacity={0.8}
          >
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={zoomOut}
            activeOpacity={0.8}
          >
            <Minus size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { top: insets.top + 12, right: 16 }]}
          onPress={recenterMap}
          activeOpacity={0.8}
        >
          <LocateFixed size={20} color={colors.primary} />
        </TouchableOpacity>

        {isSelectingArea && (
          <SelectAreaOverlay
            onCancel={toggleSelectArea}
            onConfirm={confirmDownloadArea}
          />
        )}

        {isDownloading && (
          <DownloadOverlay
            progress={downloadProgress}
            downloadedBytes={downloadedBytes}
          />
        )}

        <View
          style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}
        >
          {!isSelectingArea && route.length > 0 && (
            <View style={[styles.routeSummary, { backgroundColor: colors.surface }]}>
              <Text style={[styles.routeSummaryText, { color: colors.text }]}>
                {route.length} parada{route.length === 1 ? '' : 's'} na rota otimizada
              </Text>
            </View>
          )}

          {!isSelectingArea && (
            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: colors.primary }]}
              onPress={toggleSelectArea}
              activeOpacity={0.85}
              disabled={isDownloading}
            >
              <Download size={18} color="#FFFFFF" />
              <Text style={styles.selectButtonText}>
                Selecionar área p/ offline
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <BottomNavBar activeTab="Map" onNavigate={handleBottomNav} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapShell: {
    flex: 1,
  },
  iconButton: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomStack: {
    position: 'absolute',
    right: 16,
    width: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAction: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    gap: 10,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  routeSummary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  routeSummaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  markerBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  orderBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
  startBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default MapScreen;
