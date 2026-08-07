import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import OfflineMapsScreen from '../screens/OfflineMapsScreen';
import DeliveriesScreen from '../screens/DeliveriesScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Map: undefined;
  OfflineMaps: undefined;
  Deliveries: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="OfflineMaps" component={OfflineMapsScreen} />
      <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

