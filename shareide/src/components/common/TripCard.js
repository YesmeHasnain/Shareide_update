import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows } from '../../theme/colors';
import LocationPill from './LocationPill';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

const TripCard = ({
  trip,
  onPress,
  showDriver = true,
  showStatus = true,
  showPrice = true,
  variant = 'default', // default, compact, detailed
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(trip);
  };

  const {
    pickup = 'Pickup location',
    dropoff = 'Dropoff location',
    date,
    time,
    price,
    status = 'pending',
    driver,
    type = 'daily',
    seatsBooked = 1,
  } = trip || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.compactCard, { backgroundColor: colors.surface }, shadows.sm, style]}
      >
        <View style={styles.compactLeft}>
          <View style={styles.pillRow}>
            <LocationPill type="pickup" compact />
            <LocationPill type="dropoff" compact />
          </View>
          <Text style={[styles.compactRoute, { color: colors.text }]} numberOfLines={1}>
            {pickup} → {dropoff}
          </Text>
          {date && (
            <Text style={[styles.compactDate, { color: colors.textSecondary }]}>
              {formatDate(date)} {time && `· ${time}`}
            </Text>
          )}
        </View>
        {showStatus && <StatusBadge status={status} size="small" />}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.surface }, shadows.md, style]}
    >
      {/* Header: Status + Type + Date */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          {showStatus && <StatusBadge status={status} />}
          {type && (
            <View style={[styles.typeBadge, { backgroundColor: colors.borderLight }]}>
              <Text style={[styles.typeText, { color: colors.textSecondary }]}>
                {type === 'monthly' ? 'Monthly' : 'Daily'}
              </Text>
            </View>
          )}
        </View>
        {showPrice && price && (
          <Text style={[styles.price, { color: colors.text }]}>Rs.{price}</Text>
        )}
      </View>

      {/* Route Info */}
      <View style={styles.routeSection}>
        {/* Pickup */}
        <View style={styles.routeRow}>
          <View style={styles.routeDotCol}>
            <View style={[styles.routeDot, { backgroundColor: colors.pickupDot }]} />
            <View style={[styles.routeLine, { backgroundColor: colors.routeConnector }]} />
          </View>
          <View style={styles.routeInfo}>
            <LocationPill type="pickup" compact />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
              {pickup}
            </Text>
          </View>
        </View>
        {/* Dropoff */}
        <View style={styles.routeRow}>
          <View style={styles.routeDotCol}>
            <View style={[styles.routeDot, { backgroundColor: colors.dropoffDot }]} />
          </View>
          <View style={styles.routeInfo}>
            <LocationPill type="dropoff" compact />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
              {dropoff}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer: Date, Time, Driver */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          {date && (
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {formatDate(date)}
              </Text>
            </View>
          )}
          {time && (
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{time}</Text>
            </View>
          )}
          {seatsBooked > 1 && (
            <View style={styles.footerItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {seatsBooked} seats
              </Text>
            </View>
          )}
        </View>
        {showDriver && driver && (
          <View style={styles.driverMini}>
            <Avatar source={driver.avatar} name={driver.name} gender={driver.gender} size="tiny" />
            <Text style={[styles.driverName, { color: colors.textSecondary }]} numberOfLines={1}>
              {driver.name}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  routeSection: {
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
  },
  routeDotCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    height: 20,
    marginVertical: 2,
  },
  routeInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 8,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  driverMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driverName: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 80,
  },
  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactLeft: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  compactRoute: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactDate: {
    fontSize: 12,
  },
});

export default TripCard;
