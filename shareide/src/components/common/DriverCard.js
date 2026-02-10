import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows } from '../../theme/colors';
import Avatar from './Avatar';

const DriverCard = ({
  driver,
  onPress,
  showPrice = true,
  showDepartTime = true,
  showDistance = true,
  showRating = true,
  showVerified = true,
  showSeats = false,
  variant = 'default', // default, compact, expanded
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(driver);
  };

  const {
    name = 'Driver',
    avatar,
    gender,
    rating = 4.5,
    totalRides = 0,
    departTime,
    distance,
    duration,
    price,
    vehicle,
    verified = false,
    seatsAvailable,
  } = driver || {};

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.compactCard, { backgroundColor: colors.surface }, shadows.sm, style]}
      >
        <Avatar source={avatar} name={name} gender={gender} size="small" />
        <View style={styles.compactInfo}>
          <View style={styles.compactNameRow}>
            <Text style={[styles.compactName, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            {verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={10} color="#000" />
              </View>
            )}
          </View>
          {showRating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={colors.star} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        {showPrice && price && (
          <Text style={[styles.compactPrice, { color: colors.text }]}>Rs.{price}</Text>
        )}
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
      {/* Top Row: Avatar + Info + Price */}
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Avatar source={avatar} name={name} gender={gender} size="medium" />
          {showVerified && verified && (
            <View style={[styles.verifiedOverlay, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={10} color="#000" />
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
          </View>

          <View style={styles.metaRow}>
            {showRating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.star} />
                <Text style={[styles.ratingValue, { color: colors.text }]}>
                  {rating.toFixed(1)}
                </Text>
                {totalRides > 0 && (
                  <Text style={[styles.ridesCount, { color: colors.textTertiary }]}>
                    ({totalRides} rides)
                  </Text>
                )}
              </View>
            )}
          </View>

          {vehicle && (
            <Text style={[styles.vehicleText, { color: colors.textSecondary }]} numberOfLines={1}>
              {vehicle.make} {vehicle.model} · {vehicle.color} · {vehicle.plate}
            </Text>
          )}
        </View>

        {showPrice && price && (
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Price</Text>
            <Text style={[styles.price, { color: colors.text }]}>Rs.{price}</Text>
          </View>
        )}
      </View>

      {/* Bottom Row: Time, Distance, Seats */}
      {(showDepartTime || showDistance || showSeats) && (
        <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
          {showDepartTime && departTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {departTime}
              </Text>
            </View>
          )}
          {showDistance && distance && (
            <View style={styles.metaItem}>
              <Ionicons name="navigate-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {distance}
              </Text>
            </View>
          )}
          {showSeats && seatsAvailable !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
  },
  verifiedOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  ridesCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  vehicleText: {
    fontSize: 12,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Compact variant styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 10,
  },
  compactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DriverCard;
