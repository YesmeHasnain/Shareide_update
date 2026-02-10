import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const RouteVisualization = ({
  pickup,
  dropoff,
  pickupTime,
  dropoffTime,
  compact = false,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Pickup */}
      <View style={styles.row}>
        <View style={styles.dotColumn}>
          <View style={[styles.dot, styles.pickupDot, { backgroundColor: colors.pickupDot }]} />
          <View style={[styles.connector, { backgroundColor: colors.routeConnector }]} />
        </View>
        <View style={styles.infoColumn}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>PICK UP</Text>
          <Text
            style={[
              styles.location,
              { color: colors.locationAccent },
              compact && styles.locationCompact,
            ]}
            numberOfLines={1}
          >
            {pickup}
          </Text>
          {pickupTime && (
            <Text style={[styles.time, { color: colors.textSecondary }]}>{pickupTime}</Text>
          )}
        </View>
      </View>

      {/* Dropoff */}
      <View style={styles.row}>
        <View style={styles.dotColumn}>
          <View style={[styles.dot, { backgroundColor: colors.dropoffDot }]} />
        </View>
        <View style={styles.infoColumn}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>DROP OFF</Text>
          <Text
            style={[
              styles.location,
              { color: colors.locationAccent },
              compact && styles.locationCompact,
            ]}
            numberOfLines={1}
          >
            {dropoff}
          </Text>
          {dropoffTime && (
            <Text style={[styles.time, { color: colors.textSecondary }]}>{dropoffTime}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotColumn: {
    width: 24,
    alignItems: 'center',
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    borderWidth: 3,
    borderColor: 'rgba(252, 192, 20, 0.3)',
  },
  connector: {
    width: 2,
    height: 30,
    marginVertical: 2,
  },
  infoColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  location: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationCompact: {
    fontSize: 13,
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default RouteVisualization;
