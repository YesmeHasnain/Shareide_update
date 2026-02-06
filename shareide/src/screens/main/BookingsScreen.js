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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ridesAPI } from '../../api/rides';

const PRIMARY_COLOR = '#FCC014';

const TabButton = ({ label, isActive, onPress }) => {
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
        isActive && styles.tabActive,
      ]}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const TripCard = ({ item, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
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

  const isActive = item.status === 'in_progress' || item.status === 'driver_arrived';

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.tripCard}>
      {/* Locations */}
      <View style={styles.locationsSection}>
        {/* Pickup */}
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>PICK UP</Text>
          <View style={styles.locationValue}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.pickup?.address || item.pickup || 'Pickup location'}
            </Text>
          </View>
        </View>

        {/* Dropoff */}
        <View style={styles.locationRow}>
          <Text style={styles.locationLabel}>DROP OFF</Text>
          <View style={styles.locationValue}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.dropoff?.address || item.dropoff || 'Dropoff location'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.tripFooter}>
        <Text style={styles.tripDateTime}>
          {formatDateTime(item.date || item.created_at)}
        </Text>
        <Text style={styles.tripPrice}>Rs. {item.fare || 0}</Text>
      </View>

      {/* Status Badge */}
      {isActive && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>On trip</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const EmptyState = ({ icon, title, message, actionLabel, onAction }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Ionicons name={icon} size={48} color="#9CA3AF" />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
        <Text style={styles.emptyButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BookingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('booked');
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

  const getEmptyConfig = () => {
    switch (activeTab) {
      case 'booked':
        return {
          icon: 'calendar-outline',
          title: 'No Booked Trips',
          message: 'Your booked trips will appear here',
          actionLabel: 'Book a Ride',
          onAction: () => navigation.navigate('HomeTab'),
        };
      case 'published':
        return {
          icon: 'car-outline',
          title: 'No Published Trips',
          message: 'Trips you publish will appear here',
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

  const renderTrip = ({ item }) => (
    <TripCard
      item={item}
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
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.headerTitle}>Trips</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Trips</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'booked', label: 'Booked' },
          { key: 'published', label: 'Published' },
          { key: 'active', label: 'Active' },
        ].map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            isActive={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      <FlatList
        data={bookings[activeTab]}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
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
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 32,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  listContent: {
    padding: 24,
    flexGrow: 1,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationsSection: {
    marginBottom: 16,
  },
  locationRow: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  locationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDateTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: PRIMARY_COLOR,
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
