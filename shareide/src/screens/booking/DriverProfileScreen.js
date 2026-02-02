import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Header, Card, Avatar, Rating, Button, Badge } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const StatItem = ({ icon, value, label, colors }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const BadgeCard = ({ icon, label, colors, index }) => {
  return (
    <View style={styles.badgeCard}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.badgeCardContent, { backgroundColor: colors.surface }]}
      >
        <View style={[styles.badgeIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.badgeLabel, { color: colors.text }]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ReviewCard = ({ review, colors, index }) => (
  <View>
    <Card style={styles.reviewCard} shadow="sm">
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Avatar name={review.name} size="small" />
          <View style={styles.reviewerDetails}>
            <Text style={[styles.reviewerName, { color: colors.text }]}>
              {review.name}
            </Text>
            <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
              {review.date}
            </Text>
          </View>
        </View>
        <View style={styles.reviewRating}>
          <Ionicons name="star" size={14} color={colors.star} />
          <Text style={[styles.reviewRatingText, { color: colors.text }]}>
            {review.rating}
          </Text>
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
        {review.comment}
      </Text>
    </Card>
  </View>
);

const DriverProfileScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { driver, pickup, dropoff } = route.params;

  const badges = [
    { id: 1, icon: 'star', label: 'Top Rated' },
    { id: 2, icon: 'shield-checkmark', label: 'Verified' },
    { id: 3, icon: 'trophy', label: '500+ Rides' },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sara K.',
      rating: 5,
      comment: 'Very professional and on time! The car was clean and the ride was smooth.',
      date: '2 days ago',
    },
    {
      id: 2,
      name: 'Ali M.',
      rating: 5,
      comment: 'Clean car, friendly driver. Great experience overall!',
      date: '1 week ago',
    },
    {
      id: 3,
      name: 'Hassan R.',
      rating: 4,
      comment: 'Good experience overall. Would recommend.',
      date: '2 weeks ago',
    },
  ];

  const handleBookDriver = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('BookingConfirm', {
      driver,
      pickup,
      dropoff,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Driver Profile"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="heart-outline"
        onRightPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Card */}
        <View>
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.profileCard, shadows.goldLg]}
          >
            <Avatar
              source={driver?.avatar}
              name={driver?.name}
              size="xlarge"
              showBadge
              badgeType="verified"
            />

            <Text style={styles.driverName}>{driver?.name || 'Driver'}</Text>

            <View style={styles.ratingRow}>
              <Rating value={driver?.rating || 4.8} size={18} showValue />
              <Text style={styles.rideCount}>
                ({driver?.total_rides || 500}+ rides)
              </Text>
            </View>

            <View style={styles.statsRow}>
              <StatItem
                icon="star"
                value={driver?.rating || '4.8'}
                label="Rating"
                colors={{ ...colors, text: '#000', textSecondary: '#00000080' }}
              />
              <View style={styles.statDivider} />
              <StatItem
                icon="car"
                value={driver?.total_rides || '500+'}
                label="Rides"
                colors={{ ...colors, text: '#000', textSecondary: '#00000080' }}
              />
              <View style={styles.statDivider} />
              <StatItem
                icon="calendar"
                value="2y"
                label="Experience"
                colors={{ ...colors, text: '#000', textSecondary: '#00000080' }}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Badges Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Achievements
          </Text>
          <View style={styles.badgesRow}>
            {badges.map((badge, index) => (
              <BadgeCard
                key={badge.id}
                icon={badge.icon}
                label={badge.label}
                colors={colors}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Vehicle
          </Text>
          <View>
            <Card style={styles.vehicleCard} shadow="md">
              <View style={styles.vehicleContent}>
                <View
                  style={[
                    styles.vehicleIconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Ionicons name="car-sport" size={32} color={colors.primary} />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleModel, { color: colors.text }]}>
                    {driver?.vehicle?.model || 'Toyota Corolla'}
                  </Text>
                  <View style={styles.vehicleDetailsRow}>
                    <Badge
                      label={driver?.vehicle?.color || 'White'}
                      variant="outline"
                      size="small"
                    />
                    <Text
                      style={[styles.vehiclePlate, { color: colors.textSecondary }]}
                    >
                      {driver?.vehicle?.plate || 'ABC-123'}
                    </Text>
                  </View>
                </View>
                <View style={styles.vehicleFeatures}>
                  <View style={styles.featureItem}>
                    <Ionicons name="snow-outline" size={16} color={colors.info} />
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="musical-notes-outline" size={16} color={colors.primary} />
                  </View>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Reviews
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              colors={colors}
              index={index}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <View style={styles.fareInfo}>
          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
            Estimated Fare
          </Text>
          <Text style={[styles.fareAmount, { color: colors.primary }]}>
            Rs. {driver?.fare || 350}
          </Text>
        </View>
        <Button
          title="Book This Driver"
          onPress={handleBookDriver}
          variant="primary"
          size="large"
          icon="checkmark-circle"
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  driverName: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#000',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  rideCount: {
    fontSize: typography.caption,
    color: '#00000080',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: typography.h5,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#00000080',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#00000020',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badgeCard: {
    flex: 1,
  },
  badgeCardContent: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  vehicleCard: {
    padding: spacing.lg,
  },
  vehicleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehiclePlate: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  vehicleFeatures: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  featureItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerDetails: {
    marginLeft: spacing.sm,
  },
  reviewerName: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: typography.caption,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewRatingText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: typography.body,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  fareInfo: {
    flex: 1,
  },
  fareLabel: {
    fontSize: typography.caption,
    marginBottom: 2,
  },
  fareAmount: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  bookButton: {
    flex: 1,
    marginLeft: spacing.md,
  },
});

export default DriverProfileScreen;
