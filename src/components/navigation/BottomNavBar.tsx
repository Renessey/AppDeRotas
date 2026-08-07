import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, PackageCheck, Map as MapIcon } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

export type BottomTabKey = 'Home' | 'Deliveries' | 'Map' | 'OfflineMaps';

type BottomNavBarProps = {
  activeTab: BottomTabKey;
  onNavigate: (tab: BottomTabKey) => void;
};

const tabs: Array<{ key: BottomTabKey; label: string; icon: React.ComponentType<any> }> = [
  { key: 'Home', label: 'Início', icon: House },
  { key: 'Deliveries', label: 'Entregas', icon: PackageCheck },
  { key: 'Map', label: 'Mapa', icon: MapIcon },
  { key: 'OfflineMaps', label: 'Offline', icon: MapIcon },
];

const BottomNavBar = ({ activeTab, onNavigate }: BottomNavBarProps) => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            activeOpacity={0.8}
            onPress={() => onNavigate(tab.key)}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && { backgroundColor: colors.primary + '16' },
              ]}
            >
              <Icon size={20} color={isActive ? colors.primary : colors.textSecondary} />
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BottomNavBar;
