import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, typography, borderRadius } from '../../theme/colors';
import Header from '../../components/Header';
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

  const renderStars = (count) => (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= count ? 'star' : 'star-outline'}
          size={14}
          color={i <= count ? (colors.star || colors.primary) : (colors.starEmpty || colors.border)}
        />
      ))}
    </View>
  );

  const renderRatingBar = (star, count) => {
    const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
    return (
      <View key={star} style={styles.ratingBarRow}>
        <View style={styles.ratingBarLabelRow}>
          <Text style={[styles.ratingBarLabel, { color: colors.textSecondary }]}>{star}</Text>
          <Ionicons name="star" size={11} color={colors.star || colors.primary} />
        </View>
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
          {renderStars(item.rating)}
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Ratings & Reviews" onLeftPress={() => navigation.goBack()} />

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
                <View style={styles.overallStars}>{renderStars(Math.round(ratingStats.average))}</View>
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
                  <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(252,192,20,0.12)' }]}>
                    <Ionicons name="star" size={24} color="#FCC014" />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Top Rated</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                    <Ionicons name="flag" size={24} color="#EF4444" />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>100 Rides</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                    <Ionicons name="diamond" size={24} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Premium</Text>
                </View>
                <View style={styles.badge}>
                  <View style={[styles.badgeIconCircle, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  </View>
                  <Text style={[styles.badgeLabel, { color: colors.text }]}>Safe Driver</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reviews</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: (colors.star || colors.primary) + '15' }]}>
              <Ionicons name="star-outline" size={48} color={colors.star || colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No reviews yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Complete rides to get reviews from passengers
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  overallCard: {
    flexDirection: 'row',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  overallLeft: {
    alignItems: 'center',
    paddingRight: spacing.xl,
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  overallRating: {
    fontSize: 48,
    fontWeight: typography.bold,
  },
  overallStars: {
    marginBottom: spacing.xs,
  },
  overallCount: {
    fontSize: typography.caption,
  },
  overallRight: {
    flex: 1,
    paddingLeft: spacing.xl,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingBarLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 30,
    gap: 2,
  },
  ratingBarLabel: {
    fontSize: 11,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.xs,
    marginHorizontal: spacing.sm,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: borderRadius.xs,
  },
  ratingBarCount: {
    fontSize: 11,
    width: 25,
    textAlign: 'right',
  },
  badgesCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  badgesTitle: {
    fontSize: typography.h6,
    fontWeight: typography.semiBold,
    marginBottom: spacing.lg,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badge: {
    width: '22%',
    alignItems: 'center',
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeLabel: {
    fontSize: typography.tiny,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: typography.bold,
    marginBottom: spacing.md,
  },
  reviewCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.h5,
    fontWeight: typography.bold,
    color: '#000',
  },
  reviewInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  passengerName: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semiBold,
  },
  reviewDate: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  reviewRating: {},
  reviewComment: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  tagText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.h5,
    fontWeight: typography.semiBold,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.bodySmall,
    textAlign: 'center',
  },
});

export default RatingsScreen;
