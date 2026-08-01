import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import OfflineMapsScreen from '../screens/OfflineMapsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  OfflineMaps: undefined;
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
      <Stack.Screen name="OfflineMaps" component={OfflineMapsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

