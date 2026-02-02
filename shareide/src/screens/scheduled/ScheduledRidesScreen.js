import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getScheduledRides, cancelScheduledRide } from '../../api/scheduledRides';
import { Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const ScheduledRidesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [pastRides, setPastRides] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchRides = async () => {
    try {
      const response = await getScheduledRides();
      if (response.success) {
        setUpcomingRides(response.data.upcoming || []);
        setPastRides(response.data.past || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled rides:', error);
      // Show empty - real data only
      setUpcomingRides([]);
      setPastRides([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchRides();
  }, []);

  const handleTabChange = (tab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleCancel = (ride) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cancel Scheduled Ride',
      'Are you sure you want to cancel this scheduled ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await cancelScheduledRide(ride.id);
              if (response.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Scheduled ride cancelled');
                fetchRides();
              }
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to cancel ride');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'booked':
        return '#22c55e';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#6b7280';
      case 'failed':
        return '#ef4444';
      default:
        return colors.text;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Scheduled';
      case 'processing':
        return 'Finding Driver';
      case 'booked':
        return 'Driver Assigned';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time';
      case 'processing':
        return 'search';
      case 'booked':
        return 'checkmark-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      case 'failed':
        return 'alert-circle';
      default:
        return 'ellipse';
    }
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'bike':
        return 'bicycle';
      case 'rickshaw':
        return 'car-sport';
      case 'car':
        return 'car';
      case 'ac_car':
        return 'snow';
      default:
        return 'car';
    }
  };

  const getVehicleLabel = (type) => {
    switch (type) {
      case 'bike':
        return 'Bike';
      case 'rickshaw':
        return 'Rickshaw';
      case 'car':
        return 'Car';
      case 'ac_car':
        return 'AC Car';
      default:
        return 'Car';
    }
  };

  const renderRideItem = ({ item, index }) => (
    <View >
      <TouchableOpacity
        style={[styles.rideCard, { backgroundColor: colors.surface }, shadows.md]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('ScheduledRideDetail', { ride: item });
        }}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.rideHeader}>
          <View style={styles.vehicleInfo}>
            <View style={[styles.vehicleIconBg, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={getVehicleIcon(item.vehicle_type)} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.vehicleType, { color: colors.text }]}>
              {getVehicleLabel(item.vehicle_type)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Schedule Info */}
        <View style={[styles.scheduleInfo, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.scheduleText, { color: colors.primary }]}>
            {item.formatted_schedule}
          </Text>
        </View>

        {/* Location Container */}
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={styles.locationDotContainer}>
              <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
              <View style={[styles.locationLine, { backgroundColor: colors.border }]} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Pickup</Text>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {item.pickup_address}
              </Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationDotContainer}>
              <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Drop-off</Text>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {item.drop_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Card Footer */}
        <View style={[styles.rideFooter, { borderTopColor: colors.border }]}>
          <View style={styles.fareContainer}>
            <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
            <View>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Est. Fare</Text>
              <Text style={[styles.fareAmount, { color: colors.text }]}>
                Rs. {item.estimated_fare}
              </Text>
            </View>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
            <View>
              <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>Distance</Text>
              <Text style={[styles.distanceValue, { color: colors.text }]}>
                {item.distance_km?.toFixed(1)} km
              </Text>
            </View>
          </View>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item)}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSkeletonItem = (index) => (
    <View
      key={index}
      style={[styles.rideCard, { backgroundColor: colors.surface }, shadows.md]}
    >
      <View style={styles.rideHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={80} height={16} borderRadius={4} />
        </View>
        <Skeleton width={100} height={24} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={44} borderRadius={8} style={{ marginVertical: spacing.md }} />
      <View style={{ gap: spacing.md }}>
        <Skeleton width="90%" height={16} borderRadius={4} />
        <Skeleton width="85%" height={16} borderRadius={4} />
      </View>
      <View style={[styles.rideFooter, { borderTopColor: colors.border, marginTop: spacing.md }]}>
        <Skeleton width={80} height={32} borderRadius={4} />
        <Skeleton width={80} height={32} borderRadius={4} />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View
            style={styles.emptyContainer}
    >
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons
          name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
          size={48}
          color={colors.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {activeTab === 'upcoming' ? 'No Upcoming Rides' : 'No Past Rides'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {activeTab === 'upcoming'
          ? 'Schedule a ride for later from the home screen'
          : 'Your past scheduled rides will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Home');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
            style={styles.scheduleButton}
          >
            <Ionicons name="add-circle" size={20} color="#000" />
            <Text style={styles.scheduleButtonText}>Schedule a Ride</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentData = activeTab === 'upcoming' ? upcomingRides : pastRides;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduled Rides</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Home');
          }}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View
                style={styles.tabSection}
      >
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }, shadows.sm]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'upcoming' && styles.activeTab,
              activeTab === 'upcoming' && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleTabChange('upcoming')}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={activeTab === 'upcoming' ? '#000' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'upcoming' ? '#000' : colors.text },
              ]}
            >
              Upcoming ({upcomingRides.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'past' && styles.activeTab,
              activeTab === 'past' && { backgroundColor: colors.primary },
            ]}
            onPress={() => handleTabChange('past')}
          >
            <Ionicons
              name="time"
              size={18}
              color={activeTab === 'past' ? '#000' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'past' ? '#000' : colors.text },
              ]}
            >
              Past ({pastRides.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.listContainer}>
          {[0, 1, 2].map(renderSkeletonItem)}
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  rideCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehicleIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  scheduleText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDotContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationLine: {
    width: 2,
    height: 24,
    marginVertical: spacing.xs,
  },
  locationTextContainer: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  locationLabel: {
    fontSize: typography.caption,
    marginBottom: 2,
  },
  locationText: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fareLabel: {
    fontSize: typography.caption,
  },
  fareAmount: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distanceLabel: {
    fontSize: typography.caption,
  },
  distanceValue: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  scheduleButtonText: {
    color: '#000',
    fontSize: typography.body,
    fontWeight: '600',
  },
});

export default ScheduledRidesScreen;
