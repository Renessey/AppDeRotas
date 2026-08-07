import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/ThemeContext';

type DeliveryListCardProps = {
  name: string;
  subtitle: string;
  address: string;
  statusLabel: string;
  statusColor: string;
  onPress?: () => void;
};

const DeliveryListCard = ({
  name,
  subtitle,
  address,
  statusLabel,
  statusColor,
  onPress,
}: DeliveryListCardProps) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.header}> 
        <View style={styles.titleBlock}> 
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor }]}> 
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={[styles.address, { color: colors.textSecondary }]}>{address}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default DeliveryListCard;
