import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const DriverProfileScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { driver, pickup, dropoff } = route.params;

  const badges = [
    { id: 1, icon: '⭐', label: 'Top Rated' },
    { id: 2, icon: '🛡️', label: 'Verified' },
    { id: 3, icon: '🏆', label: '500+ Rides' },
  ];

  const reviews = [
    { id: 1, name: 'Sara K.', rating: 5, comment: 'Very professional and on time!', date: '2 days ago' },
    { id: 2, name: 'Ali M.', rating: 5, comment: 'Clean car, friendly driver.', date: '1 week ago' },
    { id: 3, name: 'Hassan R.', rating: 4, comment: 'Good experience overall.', date: '2 weeks ago' },
  ];

  const handleBookDriver = () => {
    navigation.navigate('BookingConfirm', {
      driver,
      pickup,
      dropoff,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{driver.name?.charAt(0) || '?'}</Text>
          </View>
          <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{driver.rating}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🚗</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{driver.total_rides}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rides</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>2y</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Experience</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges</Text>
          <View style={styles.badgesRow}>
            {badges.map((badge) => (
              <View key={badge.id} style={[styles.badge, { backgroundColor: colors.surface }]}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={[styles.badgeLabel, { color: colors.text }]}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle</Text>
          <View style={[styles.vehicleCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.vehicleIcon}>🚗</Text>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleModel, { color: colors.text }]}>
                {driver.vehicle?.model || 'Unknown'}
              </Text>
              <Text style={[styles.vehicleDetails, { color: colors.textSecondary }]}>
                {driver.vehicle?.color || 'N/A'} • {driver.vehicle?.plate || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </View>
          {reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text }]}>{review.name}</Text>
                <View style={styles.reviewRating}>
                  <Text style={styles.reviewStar}>⭐</Text>
                  <Text style={[styles.reviewRatingText, { color: colors.text }]}>{review.rating}</Text>
                </View>
              </View>
              <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{review.comment}</Text>
              <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={styles.fareInfo}>
          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Estimated Fare</Text>
          <Text style={[styles.fareAmount, { color: colors.primary }]}>Rs. {driver.fare}</Text>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 16, paddingBottom: 100 },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  driverName: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 40 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  badgesRow: { flexDirection: 'row', gap: 12 },
  badge: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  badgeIcon: { fontSize: 24, marginBottom: 4 },
  badgeLabel: { fontSize: 12, fontWeight: '600' },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  vehicleIcon: { fontSize: 40, marginRight: 16 },
  vehicleInfo: { flex: 1 },
  vehicleModel: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  vehicleDetails: { fontSize: 14 },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: { fontSize: 14, fontWeight: 'bold' },
  reviewRating: { flexDirection: 'row', alignItems: 'center' },
  reviewStar: { fontSize: 14 },
  reviewRatingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  reviewComment: { fontSize: 14, marginBottom: 4 },
  reviewDate: { fontSize: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
  },
  fareInfo: { flex: 1 },
  fareLabel: { fontSize: 12 },
  fareAmount: { fontSize: 24, fontWeight: 'bold' },
  bookButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});

export default DriverProfileScreen;
