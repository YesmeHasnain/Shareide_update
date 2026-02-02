import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const BidOption = ({ percentage, label, bidAmount, newFare, isSelected, onSelect, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(percentage);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {isSelected ? (
        <LinearGradient
          colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
          style={[styles.bidOption, styles.bidOptionSelected]}
        >
          <Text style={styles.bidPercentageSelected}>+{percentage}%</Text>
          <Text style={styles.bidAmountSelected}>+Rs. {bidAmount}</Text>
          <Text style={styles.bidTotalSelected}>Rs. {newFare}</Text>
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={18} color="#000" />
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.bidOption, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.bidPercentage, { color: colors.primary }]}>+{percentage}%</Text>
          <Text style={[styles.bidAmount, { color: colors.textSecondary }]}>+Rs. {bidAmount}</Text>
          <Text style={[styles.bidTotal, { color: colors.text }]}>Rs. {newFare}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const BiddingCard = ({
  baseFare,
  selectedBid,
  onBidChange,
  driversCount,
  searchRadius,
  style,
}) => {
  const { colors } = useTheme();

  const bidOptions = [
    { percentage: 0, label: 'Standard', description: 'Normal search' },
    { percentage: 10, label: '+10%', description: 'More drivers' },
    { percentage: 20, label: '+20%', description: 'Priority' },
    { percentage: 30, label: '+30%', description: 'High Priority' },
    { percentage: 50, label: '+50%', description: 'Instant Match' },
  ];

  const calculateBidAmount = (percentage) => {
    return Math.round(baseFare * (percentage / 100));
  };

  const calculateNewFare = (percentage) => {
    return Math.round(baseFare + calculateBidAmount(percentage));
  };

  const getDescription = (percentage) => {
    switch (percentage) {
      case 0: return 'Standard fare';
      case 10: return 'Show to more drivers nearby';
      case 20: return 'Priority visibility to drivers';
      case 30: return 'High priority - Faster matching';
      case 50: return 'Maximum priority - Instant matching';
      default: return '';
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }, shadows.md, style]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Boost Your Ride</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Increase fare to get more drivers
            </Text>
          </View>
        </View>
        {driversCount !== undefined && (
          <View style={[styles.driversBadge, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="car" size={14} color={colors.success} />
            <Text style={[styles.driversCount, { color: colors.success }]}>{driversCount}</Text>
          </View>
        )}
      </View>

      {/* Bid Options */}
      <View style={styles.bidOptions}>
        {bidOptions.map((option) => (
          <BidOption
            key={option.percentage}
            percentage={option.percentage}
            label={option.label}
            bidAmount={calculateBidAmount(option.percentage)}
            newFare={calculateNewFare(option.percentage)}
            isSelected={selectedBid === option.percentage}
            onSelect={onBidChange}
            colors={colors}
          />
        ))}
      </View>

      {/* Description */}
      <View style={[styles.descriptionContainer, { backgroundColor: colors.primary + '10' }]}>
        <Ionicons name="information-circle" size={18} color={colors.primary} />
        <Text style={[styles.description, { color: colors.text }]}>
          {getDescription(selectedBid)}
        </Text>
      </View>

      {/* Stats */}
      {selectedBid > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Search radius: {searchRadius || 5 + (selectedBid / 5)}km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={16} color={colors.warning} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Priority: {selectedBid >= 30 ? 'High' : selectedBid >= 20 ? 'Medium' : 'Low'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.caption,
  },
  driversBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  driversCount: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
  bidOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  bidOption: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  bidOptionSelected: {
    borderWidth: 0,
  },
  bidPercentage: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
  bidPercentageSelected: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: '#000',
  },
  bidAmount: {
    fontSize: typography.tiny,
    marginTop: 2,
  },
  bidAmountSelected: {
    fontSize: typography.tiny,
    marginTop: 2,
    color: '#000',
    opacity: 0.7,
  },
  bidTotal: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  bidTotalSelected: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
    color: '#000',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  description: {
    flex: 1,
    fontSize: typography.bodySmall,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.caption,
  },
});

export default BiddingCard;
