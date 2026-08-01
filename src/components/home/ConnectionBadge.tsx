import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';

type ConnectionBadgeProps = {
  isOnline: boolean;
  top: number;
};

const ConnectionBadge = ({ isOnline, top }: ConnectionBadgeProps) => {
  const backgroundColor = isOnline
    ? 'rgba(16,185,129,0.95)'
    : 'rgba(239,68,68,0.95)';

  return (
    <View style={[styles.badge, { backgroundColor, top }]}>
      {isOnline ? (
        <Wifi size={12} color="#FFFFFF" />
      ) : (
        <WifiOff size={12} color="#FFFFFF" />
      )}
      <Text style={styles.text}>{isOnline ? 'Online' : 'Offline'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: -100,
  },

  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConnectionBadge;

