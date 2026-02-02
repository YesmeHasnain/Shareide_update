import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const RatingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingStats, setRatingStats] = useState({
    average: user?.driver?.rating || 0,
    total: user?.driver?.total_ratings || 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await client.get('/driver/ratings');
      if (response.success) {
        setReviews(response.data.reviews || []);
        setRatingStats(response.data.stats);
      }
    } catch (error) {
      console.log('Error fetching ratings:', error);
      // Show empty - real data only
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRatings();
  };

  const renderStars = (count) => {
    return '⭐'.repeat(count) + '☆'.repeat(5 - count);
  };

  const renderRatingBar = (star, count) => {
    const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
    return (
      <View key={star} style={styles.ratingBarRow}>
        <Text style={[styles.ratingBarLabel, { color: colors.textSecondary }]}>{star} ⭐</Text>
        <View style={[styles.ratingBarTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.ratingBarFill,
              { backgroundColor: colors.primary, width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={[styles.ratingBarCount, { color: colors.textSecondary }]}>{count}</Text>
      </View>
    );
  };

  const renderReview = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.passenger_name?.charAt(0) || 'P'}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={[styles.passengerName, { color: colors.text }]}>{item.passenger_name}</Text>
          <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.reviewRating}>
          <Text style={styles.reviewStars}>{renderStars(item.rating)}</Text>
        </View>
      </View>

      {item.comment && (
        <Text style={[styles.reviewComment, { color: colors.text }]}>{item.comment}</Text>
      )}

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Reviews</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReview}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Overall Rating */}
            <View style={[styles.overallCard, { backgroundColor: colors.surface }]}>
              <View style={styles.overallLeft}>
                <Text style={[styles.overallRating, { color: colors.text }]}>
                  {ratingStats.average.toFixed(1)}
                </Text>
                <Text style={styles.overallStars}>{renderStars(Math.round(ratingStats.average))}</Text>
                <Text style={[styles.overallCount, { color: colors.textSecondary }]}>
                  {ratingStats.total} ratings
                </Text>
              </View>
              <View style={styles.overallRight}>
                {[5, 4, 3, 2, 1].map((star) => renderRatingBar(star, ratingStats.breakdown[star] || 0))}
              </View>
            </View>

            {/* Badges */}
            <View style={[styles.badgesCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.badgesTitle, { color: colors.text }]}>Your Badges</Text>
              <View style={styles.badgesGrid}>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>⭐</Text>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Top Rated</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🎯</Text>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>100 Rides</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>💎</Text>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Premium</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🛡️</Text>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Safe Driver</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reviews</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No reviews yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Complete rides to get reviews from passengers
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    padding: 16,
  },
  overallCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  overallLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  overallRating: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  overallStars: {
    fontSize: 12,
    marginBottom: 4,
  },
  overallCount: {
    fontSize: 12,
  },
  overallRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabel: {
    fontSize: 11,
    width: 30,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 11,
    width: 25,
    textAlign: 'right',
  },
  badgesCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: '22%',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewRating: {},
  reviewStars: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RatingsScreen;
