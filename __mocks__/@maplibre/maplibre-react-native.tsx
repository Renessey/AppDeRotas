import React from 'react';
import { View } from 'react-native';

export const Map = ({ children, style }: any) => (
  <View style={style}>{children}</View>
);

export const Camera = ({ children }: any) => <View>{children}</View>;

export const UserLocation = () => <View />;

export const NativeUserLocation = () => <View />;

export const Marker = ({ children }: any) => <View>{children}</View>;

export const PointAnnotation = ({ children }: any) => <View>{children}</View>;

export const Images = ({ children }: any) => <View>{children}</View>;

export const ImageSource = ({ children }: any) => <View>{children}</View>;

export const RasterSource = ({ children }: any) => <View>{children}</View>;

export const RasterDEMSource = ({ children }: any) => <View>{children}</View>;

export const VectorSource = ({ children }: any) => <View>{children}</View>;

export const GeoJSONSource = ({ children }: any) => <View>{children}</View>;

export const Layer = ({ children }: any) => <View>{children}</View>;

export const Callout = ({ children }: any) => <View>{children}</View>;

export const ViewAnnotation = ({ children }: any) => <View>{children}</View>;

export const LayerAnnotation = ({ children }: any) => <View>{children}</View>;

export const Animated = {
  Map: ({ children }: any) => <View>{children}</View>,
};

export const LocationManager = {
  requestPermissions: jest.fn(async () => true),
};

export const OfflineManager = {
  getPacks: jest.fn(async () => []),
  createPack: jest.fn(async () => ({ id: 'mock-pack' })),
  deletePack: jest.fn(async () => {}),
  mergeOfflineRegions: jest.fn(async () => {}),
  invalidatePack: jest.fn(async () => {}),
  clearAmbientCache: jest.fn(async () => {}),
  invalidateAmbientCache: jest.fn(async () => {}),
  setMaximumAmbientCacheSize: jest.fn(async () => {}),
  resetDatabase: jest.fn(async () => {}),
  setTileCountLimit: jest.fn(),
  setProgressEventThrottle: jest.fn(),
  addListener: jest.fn(async () => {}),
  removeListener: jest.fn(),
};

export const LogManager = {
  start: jest.fn(),
  stop: jest.fn(),
};

export const NetworkManager = {};

export const useCurrentPosition = jest.fn(() => ({
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
  },
}));

export default {
  Map,
  Camera,
  UserLocation,
  NativeUserLocation,
  Marker,
  PointAnnotation,
  Images,
  ImageSource,
  RasterSource,
  RasterDEMSource,
  VectorSource,
  GeoJSONSource,
  Layer,
  Callout,
  ViewAnnotation,
  LayerAnnotation,
  Animated,
  LocationManager,
  OfflineManager,
  LogManager,
  NetworkManager,
  useCurrentPosition,
};
