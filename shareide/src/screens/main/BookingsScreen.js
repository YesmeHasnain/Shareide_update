import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ridesAPI } from '../../api/rides';
import { useTheme } from '../../context/ThemeContext';

const PRIMARY_COLOR = '#FCC014';

const TabButton = ({ label, isActive, onPress, count, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.tab, isActive && styles.tabActive]}
    >
      <Text style={[styles.tabText, { color: colors.textSecondary }, isActive && [styles.tabTextActive, { color: colors.primary }]]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[styles.tabBadge, { backgroundColor: colors.border }, isActive && [styles.tabBadgeActive, { backgroundColor: colors.primary }]]}>
          <Text style={[styles.tabBadgeText, { color: colors.textSecondary }, isActive && styles.tabBadgeTextActive]}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const SubTabButton = ({ label, isActive, onPress, colors }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.7}
    style={[styles.subTab, { backgroundColor: colors.inputBackground }, isActive && [styles.subTabActive, { backgroundColor: colors.text }]]}
  >
    <Text style={[styles.subTabText, { color: colors.textSecondary }, isActive && [styles.subTabTextActive, { color: colors.background }]]}>{label}</Text>
  </TouchableOpacity>
);

const AnimatedTripCard = ({ item, onPress, index, colors }) => {
  const animValue = React.useRef(new Animated.Value(0)).current;
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day} ${month}, ${hour12.toString().padStart(2, '0')}:${mins} ${ampm}`;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'in_progress':
      case 'driver_arrived':
        return { label: 'On Trip', bg: '#D1FAE5', color: '#10B981', icon: 'navigate' };
      case 'pending':
        return { label: 'Pending', bg: '#FEF3C7', color: '#F59E0B', icon: 'time' };
      case 'driver_assigned':
        return { label: 'Driver Assigned', bg: '#DBEAFE', color: '#3B82F6', icon: 'car' };
      case 'confirmed':
        return { label: 'Confirmed', bg: '#D1FAE5', color: '#10B981', icon: 'checkmark-circle' };
      case 'completed':
        return { label: 'Completed', bg: '#F3F4F6', color: '#6B7280', icon: 'checkmark-done' };
      case 'cancelled':
        return { label: 'Cancelled', bg: '#FEE2E2', color: '#EF4444', icon: 'close-circle' };
      default:
        return { label: status, bg: '#F3F4F6', color: '#6B7280', icon: 'ellipse' };
    }
  };

  const statusConfig = getStatusConfig(item.status);

  return (
    <Animated.View style={{
      opacity: animValue,
      transform: [
        { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
        { scale: scaleValue },
      ],
    }}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
        style={[styles.tripCard, { backgroundColor: colors.card }]}
      >
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>

        {/* Route Visualization */}
        <View style={styles.routeVis}>
          <View style={styles.routeDots}>
            <View style={styles.routeDotYellow} />
            <View style={styles.routeConnector}>
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
              <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.routeDotGreen} />
          </View>
          <View style={styles.routeAddresses}>
            <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
              {item.pickup?.address || item.pickup || 'Pickup location'}
            </Text>
            <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
              {item.dropoff?.address || item.dropoff || 'Dropoff location'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.tripFooter, { borderTopColor: colors.borderLight }]}>
          <View style={styles.tripDateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.tripDateTime, { color: colors.textSecondary }]}>
              {formatDateTime(item.date || item.created_at)}
            </Text>
          </View>
          <Text style={[styles.tripPrice, { color: colors.text }]}>Rs. {item.fare || 0}</Text>
        </View>

        {/* Driver Info */}
        {item.driver?.name && item.driver.name !== 'Driver' && (
          <View style={styles.driverRow}>
            <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.driverName, { color: colors.textSecondary }]}>{item.driver.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = ({ icon, title, message, actionLabel, onAction, colors }) => (
  <View style={styles.emptyContainer}>
    <View style={[styles.emptyIconCircle, { backgroundColor: colors.inputBackground }]}>
      <Ionicons name={icon} size={48} color={colors.textTertiary} />
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>{message}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={onAction}>
        <Text style={styles.emptyButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BookingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('booked');
  const [subTab, setSubTab] = useState('upcoming');
  const [bookings, setBookings] = useState({
    booked: [],
    published: [],
    active: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async (refresh = false) => {
    try {
      const response = await ridesAPI.getRideHistory(1, null);
      const rawRides = response.data?.rides || response.rides || [];

      const rides = rawRides.map(ride => ({
        id: ride.id,
        pickup: ride.pickup_address || 'Pickup',
        dropoff: ride.drop_address || 'Dropoff',
        status: ride.status,
        fare: ride.estimated_price || 0,
        date: ride.created_at,
        driver: {
          name: ride.driver?.user?.name || 'Driver',
        },
      }));

      const categorized = {
        booked: rides.filter(r =>
          r.status === 'pending' || r.status === 'driver_assigned' || r.status === 'confirmed'
        ),
        published: rides.filter(r => r.status === 'completed'),
        active: rides.filter(r =>
          r.status === 'in_progress' || r.status === 'driver_arrived'
        ),
      };

      setBookings(categorized);
    } catch (error) {
      console.log('Error fetching bookings:', error);
      setBookings({ booked: [], published: [], active: [] });
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
    fetchBookings(true);
  };

  const getFilteredData = () => {
    const data = bookings[activeTab] || [];
    const now = new Date();
    if (subTab === 'upcoming') {
      return data.filter(item => new Date(item.date || item.created_at) >= now || ['pending', 'driver_assigned', 'confirmed', 'in_progress', 'driver_arrived'].includes(item.status));
    }
    return data.filter(item => new Date(item.date || item.created_at) < now && !['pending', 'driver_assigned', 'confirmed', 'in_progress', 'driver_arrived'].includes(item.status));
  };

  const getEmptyConfig = () => {
    switch (activeTab) {
      case 'booked':
        return {
          icon: 'calendar-outline',
          title: 'No Booked Trips',
          message: subTab === 'upcoming' ? 'Your upcoming trips will appear here' : 'Your past trips will appear here',
          actionLabel: 'Book a Ride',
          onAction: () => navigation.navigate('HomeTab'),
        };
      case 'published':
        return {
          icon: 'car-outline',
          title: 'No Past Trips',
          message: 'Your completed trips will appear here',
        };
      case 'active':
        return {
          icon: 'navigate-outline',
          title: 'No Active Trips',
          message: 'Your ongoing trips will appear here',
        };
      default:
        return {};
    }
  };

  const filteredData = getFilteredData();

  const renderTrip = ({ item, index }) => (
    <AnimatedTripCard
      item={item}
      index={index}
      colors={colors}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
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
        colors={colors}
      />
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Trips</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trips</Text>
      </View>

      {/* Primary Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {[
          { key: 'booked', label: 'Booked', count: bookings.booked.length },
          { key: 'published', label: 'Published', count: bookings.published.length },
          { key: 'active', label: 'Active', count: bookings.active.length },
        ].map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            count={tab.count}
            isActive={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
            colors={colors}
          />
        ))}
      </View>

      {/* Sub Tabs - Upcoming / Past */}
      <View style={[styles.subTabs, { backgroundColor: colors.background }]}>
        <SubTabButton
          label="Upcoming"
          isActive={subTab === 'upcoming'}
          onPress={() => setSubTab('upcoming')}
          colors={colors}
        />
        <SubTabButton
          label="Past"
          isActive={subTab === 'past'}
          onPress={() => setSubTab('past')}
          colors={colors}
        />
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderTrip}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 28,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {},
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBadgeTextActive: {
    color: '#000',
  },
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subTabActive: {},
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subTabTextActive: {},
  listContent: {
    padding: 24,
    flexGrow: 1,
  },
  tripCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeVis: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routeDots: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  routeDotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_COLOR,
  },
  routeConnector: {
    paddingVertical: 4,
    gap: 3,
  },
  routeDash: {
    width: 2,
    height: 4,
    marginLeft: 4,
  },
  routeDotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  routeAddresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDateTime: {
    fontSize: 13,
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 27,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default BookingsScreen;
