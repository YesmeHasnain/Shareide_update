import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Card, Avatar } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  inputBackground: '#F5F5F5',
  border: '#E5E7EB',
  success: '#10B981',
  price: '#F5A623',
};

const VerifiedItem = ({ icon, label, verified, colors }) => (
  <View style={styles.verifiedItem}>
    <View style={[styles.verifiedIcon, { backgroundColor: verified ? colors.success + '15' : colors.border }]}>
      <Ionicons
        name={verified ? 'checkmark' : 'close'}
        size={14}
        color={verified ? colors.success : colors.textTertiary}
      />
    </View>
    <Text style={[styles.verifiedLabel, { color: colors.text }]}>{label}</Text>
  </View>
);

const ReviewCard = ({ review, colors }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <Avatar name={review.name} size="small" />
      <View style={styles.reviewerDetails}>
        <Text style={[styles.reviewerName, { color: colors.text }]}>
          {review.name}
        </Text>
        <View style={styles.reviewRating}>
          <Ionicons name="star" size={12} color={colors.primary} />
          <Text style={[styles.reviewRatingText, { color: colors.textSecondary }]}>
            {review.rating}
          </Text>
        </View>
      </View>
    </View>
    <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
      {review.comment}
    </Text>
  </View>
);

const DriverProfileScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { driver, pickup, dropoff } = params;

  const reviews = [
    {
      id: 1,
      name: 'Sara K.',
      rating: 5,
      comment: 'Very professional and on time! The car was clean and the ride was smooth.',
    },
    {
      id: 2,
      name: 'Ali M.',
      rating: 5,
      comment: 'Clean car, friendly driver. Great experience overall!',
    },
    {
      id: 3,
      name: 'Hassan R.',
      rating: 4,
      comment: 'Good experience overall. Would recommend.',
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>PROFILE</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar with verified badge */}
          <View style={styles.avatarSection}>
            <Avatar
              source={driver?.avatar}
              name={driver?.name}
              size="xlarge"
            />
            <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Ionicons name="checkmark" size={16} color="#000" />
            </View>
          </View>

          {/* Name */}
          <Text style={[styles.driverName, { color: colors.text }]}>
            {driver?.name || 'Driver'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statValue}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {driver?.rating?.toFixed(1) || '4.9'}
                </Text>
                <Ionicons name="star" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {driver?.total_rides || 500}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Riders</Text>
            </View>
          </View>
        </View>

        {/* Profile Details Card */}
        <Card style={styles.detailsCard} shadow="sm">
          <Text style={[styles.cardTitle, { color: colors.text }]}>Profile Details</Text>

          <View style={styles.verifiedList}>
            <VerifiedItem
              icon="car"
              label="Verified driver"
              verified={driver?.is_driver_verified || true}
              colors={colors}
            />
            <VerifiedItem
              icon="call"
              label="Verified phone number"
              verified={true}
              colors={colors}
            />
            <VerifiedItem
              icon="document"
              label="Verified Driver's Licence"
              verified={driver?.is_license_verified || true}
              colors={colors}
            />
            <VerifiedItem
              icon="calendar"
              label={`Member since ${driver?.member_since || '2022'}`}
              verified={true}
              colors={colors}
            />
          </View>
        </Card>

        {/* Car Details Card */}
        <Card style={styles.detailsCard} shadow="sm">
          <Text style={[styles.cardTitle, { color: colors.text }]}>Car Details</Text>

          <View style={styles.carInfo}>
            <View style={[styles.carImagePlaceholder, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}>
              <Ionicons name="car" size={32} color={colors.textTertiary} />
            </View>
            <View style={styles.carDetails}>
              <Text style={[styles.carModel, { color: colors.text }]}>
                {driver?.vehicle?.model || 'Toyota Corolla'}
              </Text>
              <Text style={[styles.carPlate, { color: colors.textSecondary }]}>
                {driver?.vehicle?.plate || 'ABC-123'}
              </Text>
              <Text style={[styles.carMeta, { color: colors.textTertiary }]}>
                {driver?.vehicle?.color || 'White'} • {driver?.vehicle?.year || '2020'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Ratings & Reviews Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ratings & Reviews
          </Text>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              colors={colors}
            />
          ))}
        </View>

        {/* Report Issue Button */}
        <TouchableOpacity
          style={[styles.reportButton, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('Support')}
        >
          <Ionicons name="flag-outline" size={20} color={colors.textSecondary} />
          <Text style={[styles.reportText, { color: colors.textSecondary }]}>
            Report an issue
          </Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.card,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <View style={styles.fareInfo}>
          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
            Fare
          </Text>
          <Text style={[styles.fareAmount, { color: colors.price || '#F5A623' }]}>
            Rs. {driver?.fare || 350}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={handleBookDriver}
        >
          <Text style={styles.bookButtonText}>Book This Driver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.h5,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  driverName: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  detailsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  verifiedList: {
    gap: spacing.md,
  },
  verifiedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verifiedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedLabel: {
    fontSize: typography.body,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  carImagePlaceholder: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carDetails: {
    flex: 1,
  },
  carModel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  carPlate: {
    fontSize: typography.bodySmall,
    marginTop: 2,
  },
  carMeta: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  reviewerName: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewRatingText: {
    fontSize: typography.caption,
  },
  reviewComment: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reportText: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    ...shadows.md,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#000',
  },
});

export default DriverProfileScreen;
