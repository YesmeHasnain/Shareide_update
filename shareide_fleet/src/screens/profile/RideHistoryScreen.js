import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { rideAPI } from '../../api/ride';

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
      // Show empty - real data only
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
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  const renderRide = ({ item }) => (
    <TouchableOpacity
      style={[styles.rideCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('RideDetails', { ride: item })}
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
          <View style={[styles.routeDot, { backgroundColor: '#22c55e' }]} />
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {item.pickup_address}
          </Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {item.dropoff_address}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
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
              <Text style={[styles.rideStatValue, { color: colors.text }]}>
                {item.rating} ⭐
              </Text>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride History</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{ width: 28 }} />
      </View>

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
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rideDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeAddress: {
    fontSize: 14,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 12,
  },
  rideStats: {
    flexDirection: 'row',
  },
  rideStat: {
    marginRight: 16,
  },
  rideStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rideStatLabel: {
    fontSize: 11,
  },
  rideFare: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  footer: {
    paddingVertical: 20,
  },
});

export default RideHistoryScreen;
