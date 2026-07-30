import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Moon, Sun } from 'lucide-react-native';
import { useAppTheme } from '../theme/ThemeContext';

const HomeScreen = () => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor={colors.background}
      />

      {/* Header com botão de tema */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.headerSpacer} />

        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: colors.surface },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {isDark ? (
            <Sun
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          ) : (
            <Moon
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Conteúdo central */}
      <View style={styles.content}>
        <Text
          style={[
            styles.welcomeTitle,
            { color: colors.text },
          ]}
        >
          Bem-vindo(a) ao EntregasApp!
        </Text>

        <Text
          style={[
            styles.welcomeSubtitle,
            { color: colors.textSecondary },
          ]}
        >
          Gerencie suas entregas de forma rápida e eficiente.
        </Text>
      </View>
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
    paddingBottom: 8,
  },

  headerSpacer: {
    width: 44,
  },

  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },

  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;

