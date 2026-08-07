import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../theme/ThemeContext';
import HomeHeader from '../components/home/HomeHeader';
import HomeContent from '../components/home/HomeContent';
import BottomNavBar, { BottomTabKey } from '../components/navigation/BottomNavBar';
import { listDeliveries } from '../storage/localDatabase';
import { calculateRouteSequence, getDistanceKm, getEtaMinutes } from '../storage/deliveryRouting';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [deliveryCount, setDeliveryCount] = useState(0);
  const [nextDeliveryLabel, setNextDeliveryLabel] = useState('');
  const [nextEtaMinutes, setNextEtaMinutes] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const refreshDeliveries = async () => {
      try {
        const deliveries = await listDeliveries();
        if (!mounted) {
          return;
        }

        setDeliveryCount(deliveries.length);

        const route = calculateRouteSequence(deliveries, {
          latitude: -23.5505,
          longitude: -46.6333,
        });

        const next = route[0];
        if (next) {
          const distanceKm = getDistanceKm(
            { latitude: -23.5505, longitude: -46.6333 },
            next,
          );
          setNextDeliveryLabel(`${next.nome} • ${next.bairro}`);
          setNextEtaMinutes(getEtaMinutes(distanceKm));
        } else {
          setNextDeliveryLabel('');
          setNextEtaMinutes(null);
        }
      } catch (error) {
        console.log('[Home] erro ao carregar entregas:', error);
      }
    };

    refreshDeliveries();

    const focusSubscription = navigation.addListener?.('focus', refreshDeliveries);

    return () => {
      mounted = false;
      focusSubscription?.();
    };
  }, [navigation]);

  const handleBottomNav = (tab: BottomTabKey) => {
    if (tab === 'OfflineMaps') {
      navigation.navigate('OfflineMaps');
      return;
    }

    if (tab === 'Deliveries') {
      navigation.navigate('Deliveries');
      return;
    }

    if (tab === 'Map') {
      navigation.navigate('Map');
      return;
    }

    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HomeHeader />
        <HomeContent
          hasPermission
          deliveryCount={deliveryCount}
          nextDeliveryLabel={nextDeliveryLabel}
          nextEtaMinutes={nextEtaMinutes}
        />
      </ScrollView>

      <BottomNavBar activeTab="Home" onNavigate={handleBottomNav} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapSection: {
    height: 320,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});

export default HomeScreen;

