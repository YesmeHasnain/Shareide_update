import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { getMySharedRides, startSharedRide, completeSharedRide, cancelSharedRide } from '../../api/sharedRides';

const MySharedRidesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const fetchRides = async () => {
    try {
      const status = activeFilter === 'all' ? null : activeFilter;
      const response = await getMySharedRides(status);
      setRides(response.data || []);
    } catch (error) {
      console.log('Error fetching rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [activeFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const handleStartRide = async (rideId) => {
    setProcessingId(rideId);
    try {
      await startSharedRide(rideId);
      Alert.alert('Ride Started!', 'Your ride is now in progress.');
      fetchRides();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to start ride');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteRide = async (rideId) => {
    setProcessingId(rideId);
    try {
      await completeSharedRide(rideId);
      Alert.alert('Ride Completed!', 'Great job! Your ride has been completed.');
      fetchRides();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete ride');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRide = (rideId) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? All passengers will be notified.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(rideId);
            try {
              await cancelSharedRide(rideId);
              Alert.alert('Cancelled', 'The ride has been cancelled.');
              fetchRides();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel ride');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      open: colors.success,
      full: colors.warning,
      in_progress: colors.primary,
      completed: colors.textSecondary,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.textSecondary;
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'full', label: 'Full' },
    { key: 'in_progress', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

  const renderRideCard = ({ item }) => {
    const { date, time } = formatDateTime(item.departure_time);
    const bookedSeats = item.total_seats - item.available_seats;
    const pendingCount = item.pending_bookings_count || 0;
    const isProcessing = processingId === item.id;

    return (
      <View style={[styles.rideCard, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {pendingCount > 0 && (
            <TouchableOpacity
              style={[styles.pendingBadge, { backgroundColor: colors.warning }]}
              onPress={() => navigation.navigate('SharedRideRequests')}
            >
              <Ionicons name="notifications" size={14} color="#fff" />
              <Text style={styles.pendingText}>{pendingCount} pending</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{date}</Text>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeLine}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {item.from_address}
              </Text>
              <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
            </View>
            <View style={[styles.locationRow, { marginTop: 15 }]}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {item.to_address}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {bookedSeats}/{item.total_seats}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Booked</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cash" size={18} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>Rs. {item.price_per_seat}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Per Seat</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="wallet" size={18} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              Rs. {(bookedSeats * parseFloat(item.price_per_seat)).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earnings</Text>
          </View>
        </View>

        {/* Actions */}
        {isProcessing ? (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.actionsRow}>
            {item.status === 'open' && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
                  onPress={() => navigation.navigate('EditSharedRide', { rideId: item.id })}
                >
                  <Ionicons name="pencil" size={18} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                {bookedSeats > 0 && (
                  <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleStartRide(item.id)}
                  >
                    <Ionicons name="play" size={18} color="#fff" />
                    <Text style={styles.startText}>Start</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.error }]}
                  onPress={() => handleCancelRide(item.id)}
                >
                  <Ionicons name="close" size={18} color={colors.error} />
                </TouchableOpacity>
              </>
            )}
            {item.status === 'full' && (
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => handleStartRide(item.id)}
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startText}>Start Ride</Text>
              </TouchableOpacity>
            )}
            {item.status === 'in_progress' && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderWidth: 1, borderColor: colors.primary }]}
                  onPress={() => navigation.navigate('ManageSharedRide', { rideId: item.id })}
                >
                  <Ionicons name="list" size={18} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: colors.success }]}
                  onPress={() => handleCompleteRide(item.id)}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.startText}>Complete</Text>
                </TouchableOpacity>
              </>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Shared Rides</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Shared Rides</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateSharedRide')}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: activeFilter === item.key ? colors.primary : colors.surface },
              ]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: activeFilter === item.key ? '#fff' : colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={rides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Rides Posted</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Start earning by posting your first shared ride!
            </Text>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateSharedRide')}
            >
              <Text style={styles.createBtnText}>Post a Ride</Text>
            </TouchableOpacity>
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
  filtersContainer: {
    paddingVertical: 10,
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  rideCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  pendingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  routeSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    height: 25,
    marginVertical: 3,
  },
  routeDetails: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
  },
  processingRow: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  startBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  startText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
  },
  createBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default MySharedRidesScreen;
