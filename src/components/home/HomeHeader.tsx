import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Sun } from 'lucide-react-native';
import { useAppTheme } from '../../theme/ThemeContext';

const HomeHeader = () => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerSpacer} />

      <TouchableOpacity
        style={[styles.headerButton, { backgroundColor: colors.surface }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        {isDark ? (
          <Sun size={22} color={colors.text} strokeWidth={2} />
        ) : (
          <Moon size={22} color={colors.text} strokeWidth={2} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  headerSpacer: {
    width: 44,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HomeHeader;

