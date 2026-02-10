import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const STATUS_CONFIG = {
  pending: { label: 'Awaiting', colorKey: 'statusPending', bgOpacity: 0.15 },
  awaiting: { label: 'Awaiting', colorKey: 'statusPending', bgOpacity: 0.15 },
  confirmed: { label: 'Confirmed', colorKey: 'statusActive', bgOpacity: 0.15 },
  accepted: { label: 'Accepted', colorKey: 'statusActive', bgOpacity: 0.15 },
  active: { label: 'On trip', colorKey: 'statusActive', bgOpacity: 0.15 },
  on_trip: { label: 'On trip', colorKey: 'statusActive', bgOpacity: 0.15 },
  completed: { label: 'Completed', colorKey: 'statusCompleted', bgOpacity: 0.15 },
  cancelled: { label: 'Cancelled', colorKey: 'statusCancelled', bgOpacity: 0.15 },
  rejected: { label: 'Rejected', colorKey: 'statusCancelled', bgOpacity: 0.15 },
  expired: { label: 'Expired', colorKey: 'statusCancelled', bgOpacity: 0.15 },
};

const StatusBadge = ({ status, label: customLabel, size = 'medium', style }) => {
  const { colors } = useTheme();

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const dotColor = colors[config.colorKey] || colors.statusPending;
  const displayLabel = customLabel || config.label;

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        { backgroundColor: `${dotColor}20` },
        style,
      ]}
    >
      <View style={[styles.dot, isSmall && styles.dotSmall, { backgroundColor: dotColor }]} />
      <Text
        style={[
          styles.text,
          isSmall && styles.textSmall,
          { color: dotColor },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});

export default StatusBadge;
