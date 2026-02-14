import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { rideAPI } from '../../api/ride';
import { spacing, typography, borderRadius } from '../../theme/colors';

const RideHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (pageNum = 1, append = false) => {
    try {
      const response = await rideAPI.getRideHistory(pageNum);
      if (response.success) {
        const newRides = response.data.rides || [];
        setRides(append ? [...rides, ...newRides] : newRides);
        setHasMore(newRides.length >= 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.log('Error fetching ride history:', error);
      setRides([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRides(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchRides(page + 1, true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success || '#22c55e';
      case 'cancelled':
        return colors.error || '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const renderRide = ({ item }) => (
    <TouchableOpacity
      style={[styles.rideCard, { backgroundColor: colors.card || colors.surface }]}
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
      activeOpacity={0.7}
    >
      <View style={styles.rideHeader}>
        <View style={styles.passengerInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.passenger?.name?.charAt(0) || 'P'}</Text>
          </View>
          <View>
            <Text style={[styles.passengerName, { color: colors.text }]}>
              {item.passenger?.name || 'Passenger'}
            </Text>
            <Text style={[styles.rideDate, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.pickupDot || '#22c55e' }]} />
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {item.pickup_address}
          </Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.routeConnector || colors.border }]} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.dropoffDot || '#ef4444' }]} />
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {item.dropoff_address}
          </Text>
        </View>
      </View>

      <View style={[styles.rideFooter, { borderTopColor: colors.border }]}>
        <View style={styles.rideStats}>
          <View style={styles.rideStat}>
            <Text style={[styles.rideStatValue, { color: colors.text }]}>
              {item.distance?.toFixed(1)} km
            </Text>
            <Text style={[styles.rideStatLabel, { color: colors.textSecondary }]}>Distance</Text>
          </View>
          <View style={styles.rideStat}>
            <Text style={[styles.rideStatValue, { color: colors.text }]}>
              {item.duration} min
            </Text>
            <Text style={[styles.rideStatLabel, { color: colors.textSecondary }]}>Duration</Text>
          </View>
          {item.rating && (
            <View style={styles.rideStat}>
              <View style={styles.ratingRow}>
                <Text style={[styles.rideStatValue, { color: colors.text }]}>
                  {item.rating}
                </Text>
                <Ionicons name="star" size={14} color={colors.star || colors.primary} style={{ marginLeft: 2 }} />
              </View>
              <Text style={[styles.rideStatLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>
          )}
        </View>
        <Text style={[styles.rideFare, { color: colors.primary }]}>Rs. {item.fare}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && rides.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Ride History" onLeftPress={() => navigation.goBack()} />
        <Loading />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Ride History" onLeftPress={() => navigation.goBack()} />

      <FlatList
        data={rides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRide}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="car-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No rides yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Complete your first ride to see it here
            </Text>
          </View>
        }
        ListFooterComponent={
          loading && rides.length > 0 ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : null
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
  rideCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.h5,
    fontWeight: '700',
    color: '#000',
  },
  passengerName: {
    fontSize: typography.h6,
    fontWeight: '600',
  },
  rideDate: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeContainer: {
    marginBottom: spacing.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: spacing.xs,
    marginVertical: spacing.xs,
  },
  routeAddress: {
    fontSize: typography.bodySmall,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  rideStats: {
    flexDirection: 'row',
  },
  rideStat: {
    marginRight: spacing.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideStatValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  rideStatLabel: {
    fontSize: typography.tiny + 1,
  },
  rideFare: {
    fontSize: typography.h4,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.massive,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.bodySmall,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.xl,
  },
});

export default RideHistoryScreen;
