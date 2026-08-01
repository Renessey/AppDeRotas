import React, { ReactNode } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type MapControlButtonProps = {
  top: number;
  onPress: () => void;
  children: ReactNode;
};

const MapControlButton = ({ top, onPress, children }: MapControlButtonProps) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.surface, top }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default MapControlButton;

