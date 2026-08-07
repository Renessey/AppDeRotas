import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type InfoCardProps = {
  title: string;
  value: string;
  accent?: string;
};

const InfoCard = ({ title, value, accent }: InfoCardProps) => {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
      <Text style={[styles.value, { color: accent || colors.primary }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    minHeight: 92,
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InfoCard;
