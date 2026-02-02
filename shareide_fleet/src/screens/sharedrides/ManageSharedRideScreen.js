import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getSharedRide, pickupPassenger, dropoffPassenger, completeSharedRide } from '../../api/sharedRides';

const ManageSharedRideScreen = ({ navigation, route }) => {
  const { rideId } = route.params;
  const { colors } = useTheme();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await getSharedRide(rideId);
      setRide(response.data?.ride || response.data);
    } catch (error) {
      console.log('Error fetching ride:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await pickupPassenger(bookingId);
      Alert.alert('Picked Up!', 'Passenger has been marked as picked up.');
      fetchRideDetails();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDropoff = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await dropoffPassenger(bookingId);
      Alert.alert('Dropped Off!', 'Passenger has been dropped off.');
      fetchRideDetails();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteRide = async () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride? All remaining passengers will be marked as dropped off.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await completeSharedRide(rideId);
              Alert.alert('Completed!', 'Your ride has been completed successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to complete ride');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      confirmed: colors.warning,
      picked_up: colors.primary,
      dropped_off: colors.success,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: 'time',
      picked_up: 'car',
      dropped_off: 'checkmark-circle',
    };
    return icons[status] || 'ellipse';
  };

  const renderPassengerCard = ({ item }) => {
    const passenger = item.user || item.passenger;
    const isProcessing = processingId === item.booking_id || processingId === item.id;
    const bookingId = item.booking_id || item.id;

    return (
      <View style={[styles.passengerCard, { backgroundColor: colors.surface }]}>
        <View style={styles.passengerHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            {passenger?.photo ? (
              <Image source={{ uri: passenger.photo }} style={styles.avatar} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {passenger?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            )}
          </View>
          <View style={styles.passengerInfo}>
            <Text style={[styles.passengerName, { color: colors.text }]}>{passenger?.name || 'Passenger'}</Text>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="people" size={14} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.seats || 1} seat(s)</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={14} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>{passenger?.phone || 'N/A'}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Pickup Location */}
        {item.pickup?.address && (
          <View style={[styles.locationRow, { borderTopColor: colors.border }]}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Custom Pickup</Text>
              <Text style={[styles.locationText, { color: colors.text }]}>{item.pickup.address}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {isProcessing ? (
          <View style={styles.actionLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.actionsRow}>
            {item.status === 'confirmed' && (
              <>
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: colors.success + '15' }]}
                  onPress={() => {/* Open phone dialer */}}
                >
                  <Ionicons name="call" size={20} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handlePickup(bookingId)}
                >
                  <Ionicons name="car" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Mark Picked Up</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'picked_up' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success, flex: 1 }]}
                onPress={() => handleDropoff(bookingId)}
              >
                <Ionicons name="flag" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Mark Dropped Off</Text>
              </TouchableOpacity>
            )}
            {item.status === 'dropped_off' && (
              <View style={[styles.completedBadge, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[styles.completedText, { color: colors.success }]}>Completed</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Ride</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const passengers = ride?.passengers || [];
  const confirmedCount = passengers.filter((p) => p.status === 'confirmed').length;
  const pickedUpCount = passengers.filter((p) => p.status === 'picked_up').length;
  const droppedCount = passengers.filter((p) => p.status === 'dropped_off').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Ride Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.routeSummary}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
              {ride?.from?.address || 'Pickup'}
            </Text>
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
              {ride?.to?.address || 'Destination'}
            </Text>
          </View>
        </View>

        <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{confirmedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Waiting</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{pickedUpCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>On Board</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>{droppedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dropped</Text>
          </View>
        </View>
      </View>

      {/* Passengers List */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Passengers ({passengers.length})</Text>

      <FlatList
        data={passengers}
        renderItem={renderPassengerCard}
        keyExtractor={(item) => (item.booking_id || item.id)?.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No passengers yet</Text>
          </View>
        }
      />

      {/* Complete Ride Button */}
      {passengers.length > 0 && pickedUpCount > 0 && (
        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: colors.success }]}
          onPress={handleCompleteRide}
        >
          <Ionicons name="checkmark-done" size={22} color="#fff" />
          <Text style={styles.completeBtnText}>Complete Ride</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  routeSummary: {
    marginBottom: 15,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  passengerCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  passengerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionLoading: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
  },
  completeBtn: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageSharedRideScreen;
