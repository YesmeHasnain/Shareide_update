import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const LocationPill = ({
  type = 'pickup', // pickup, dropoff
  label,
  style,
  compact = false,
}) => {
  const { colors } = useTheme();

  const isPickup = type === 'pickup';
  const pillBg = isPickup ? colors.pillPickup : colors.pillDropoff;
  const pillText = isPickup ? colors.pillPickupText : colors.pillDropoffText;
  const dotColor = isPickup ? colors.pickupDot : colors.dropoffDot;
  const displayLabel = label || (isPickup ? 'PICK UP' : 'DROP OFF');

  return (
    <View
      style={[
        styles.pill,
        compact && styles.pillCompact,
        { backgroundColor: pillBg },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text
        style={[
          styles.text,
          compact && styles.textCompact,
          { color: pillText },
        ]}
        numberOfLines={1}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textCompact: {
    fontSize: 10,
  },
});

export default LocationPill;
