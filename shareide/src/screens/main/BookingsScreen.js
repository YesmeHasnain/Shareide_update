import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Header, Card, Avatar, Badge, EmptyState, SkeletonList } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const TabButton = ({ label, isActive, count, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.tab,
        isActive && { borderBottomColor: colors.primary, borderBottomWidth: 3 },
      ]}
    >
      <Text
        style={[
          styles.tabText,
          { color: isActive ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.tabBadge,
            { backgroundColor: isActive ? colors.primary : colors.border },
          ]}
        >
          <Text
            style={[
              styles.tabBadgeText,
              { color: isActive ? '#000' : colors.textSecondary },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const BookingCard = ({ item, onPress, colors, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { color: colors.success, icon: 'checkmark-circle', label: 'Completed' };
      case 'cancelled':
        return { color: colors.error, icon: 'close-circle', label: 'Cancelled' };
      case 'ongoing':
        return { color: colors.info, icon: 'car', label: 'Ongoing' };
      case 'arriving':
        return { color: colors.warning, icon: 'time', label: 'Arriving' };
      default:
        return { color: colors.primary, icon: 'calendar', label: 'Upcoming' };
    }
  };

  const statusConfig = getStatusConfig(item.status);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Card style={styles.bookingCard} shadow="md">
          {/* Status Badge */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.color + '20' },
              ]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Text style={[styles.bookingDate, { color: colors.textSecondary }]}>
              {formatDate(item.date || item.created_at)}
            </Text>
          </View>

          {/* Route Info */}
          <View style={styles.routeInfo}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <Text
                style={[styles.routeText, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.pickup?.address || item.pickup}
              </Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <Text
                style={[styles.routeText, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.dropoff?.address || item.dropoff}
              </Text>
            </View>
          </View>

          {/* Driver Info */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.bookingFooter}>
            <View style={styles.driverInfo}>
              <Avatar
                name={item.driver?.name || 'Driver'}
                size="small"
                showBadge={item.status === 'completed'}
                badgeType="verified"
              />
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: colors.text }]}>
                  {item.driver?.name || 'Driver'}
                </Text>
                <View style={styles.vehicleRow}>
                  <Ionicons
                    name="car-outline"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                    {item.driver?.vehicle?.model || 'Vehicle'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.fareContainer}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                Fare
              </Text>
              <Text style={[styles.fareText, { color: colors.primary }]}>
                Rs. {item.fare}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const BookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState({
    upcoming: [],
    completed: [],
    cancelled: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBookings = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        pageNum = 1;
      }

      const response = await ridesAPI.getRideHistory(pageNum, null);
      const rawRides = response.data?.rides || response.rides || [];

      // Transform rides to the expected format
      const rides = rawRides.map(ride => ({
        id: ride.id,
        pickup: ride.pickup_address || 'Pickup',
        dropoff: ride.drop_address || 'Dropoff',
        status: ride.status,
        fare: ride.estimated_price || 0,
        date: ride.created_at,
        driver: {
          name: ride.driver?.user?.name || 'Driver',
          vehicle: {
            model: ride.driver?.vehicle_model || 'Vehicle',
            color: ride.driver?.vehicle_color || '',
            plate: ride.driver?.plate_number || '',
          },
        },
      }));

      // Categorize rides by status
      const categorized = {
        upcoming: rides.filter(
          (r) =>
            r.status === 'pending' ||
            r.status === 'driver_assigned' ||
            r.status === 'driver_arrived' ||
            r.status === 'in_progress' ||
            r.status === 'searching'
        ),
        completed: rides.filter((r) => r.status === 'completed'),
        cancelled: rides.filter((r) => r.status === 'cancelled' || r.status === 'cancelled_by_driver'),
      };

      if (refresh || pageNum === 1) {
        setBookings(categorized);
      } else {
        setBookings((prev) => ({
          upcoming: [...prev.upcoming, ...categorized.upcoming],
          completed: [...prev.completed, ...categorized.completed],
          cancelled: [...prev.cancelled, ...categorized.cancelled],
        }));
      }

      setHasMore(rides.length > 0);
      setPage(pageNum + 1);
    } catch (error) {
      console.log('Error fetching bookings:', error);
      setBookings({
        upcoming: [],
        completed: [],
        cancelled: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchBookings(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBookings(page);
    }
  };

  const getEmptyConfig = () => {
    switch (activeTab) {
      case 'upcoming':
        return {
          icon: 'calendar-outline',
          title: 'No Upcoming Rides',
          message: 'You have no scheduled rides at the moment. Book a ride to get started!',
          actionLabel: 'Book a Ride',
          onAction: () => navigation.navigate('HomeTab'),
        };
      case 'completed':
        return {
          icon: 'checkmark-circle-outline',
          title: 'No Completed Rides',
          message: 'Your completed rides will appear here.',
        };
      case 'cancelled':
        return {
          icon: 'close-circle-outline',
          title: 'No Cancelled Rides',
          message: 'Cancelled rides will appear here.',
        };
      default:
        return {};
    }
  };

  const renderBooking = ({ item, index }) => (
    <BookingCard
      item={item}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
      colors={colors}
      index={index}
    />
  );

  const renderEmpty = () => {
    const config = getEmptyConfig();
    return (
      <EmptyState
        icon={config.icon}
        title={config.title}
        message={config.message}
        actionLabel={config.actionLabel}
        onAction={config.onAction}
        style={styles.emptyState}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="My Bookings"
          leftIcon="menu"
          onLeftPress={() => navigation.navigate('ProfileTab')}
        />
        <View style={styles.loadingContainer}>
          <SkeletonList count={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="My Bookings"
        leftIcon="menu"
        onLeftPress={() => navigation.navigate('ProfileTab')}
      />

      {/* Tabs */}
      <View
        style={[styles.tabs, { backgroundColor: colors.surface }]}
      >
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <TabButton
            key={tab}
            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
            isActive={activeTab === tab}
            count={bookings[tab].length}
            onPress={() => setActiveTab(tab)}
            colors={colors}
          />
        ))}
      </View>

      <FlatList
        data={bookings[activeTab]}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  bookingDate: {
    fontSize: typography.caption,
  },
  routeInfo: {
    marginBottom: spacing.md,
  },
  routeRow: {
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
    marginLeft: 4,
    marginVertical: spacing.xs,
  },
  routeText: {
    flex: 1,
    fontSize: typography.body,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverDetails: {
    marginLeft: spacing.sm,
  },
  driverName: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  vehicleText: {
    fontSize: typography.caption,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: typography.caption,
  },
  fareText: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
  emptyState: {
    marginTop: spacing.xxxl,
  },
});

export default BookingsScreen;
