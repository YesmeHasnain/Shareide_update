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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Badge, Avatar, EmptyState } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
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

  const getStatusBadge = (status) => {
    const statusMap = {
      open: { text: 'Open', variant: 'success' },
      full: { text: 'Full', variant: 'warning' },
      in_progress: { text: 'In Progress', variant: 'primary' },
      completed: { text: 'Completed', variant: 'default' },
      cancelled: { text: 'Cancelled', variant: 'error' },
    };
    return statusMap[status] || { text: status, variant: 'default' };
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
    const status = getStatusBadge(item.status);
    const bookedSeats = item.total_seats - item.available_seats;
    const pendingCount = item.pending_bookings_count || 0;
    const isProcessing = processingId === item.id;

    return (
      <Card style={styles.rideCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Badge text={status.text} variant={status.variant} />
          {pendingCount > 0 && (
            <TouchableOpacity
              style={[styles.pendingBadge, { backgroundColor: colors.warning }]}
              onPress={() => navigation.navigate('SharedRideRequests')}
            >
              <Ionicons name="notifications" size={14} color="#fff" />
              <Text style={styles.pendingText}>{pendingCount} pending</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{date}</Text>
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeLine}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={styles.line} />
            <View style={[styles.dot, styles.dotEnd, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>{item.from_address}</Text>
              <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
            </View>
            <View style={[styles.locationRow, { marginTop: 15 }]}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>{item.to_address}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {bookedSeats}/{item.total_seats}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Booked</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cash" size={18} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>Rs. {item.price_per_seat}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Per Seat</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="wallet" size={18} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              Rs. {(bookedSeats * parseFloat(item.price_per_seat)).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Earnings</Text>
          </View>
        </View>

        {/* Passengers Preview */}
        {item.confirmed_bookings?.length > 0 && (
          <View style={styles.passengersSection}>
            <Text style={[styles.passengersLabel, { color: colors.textMuted }]}>Confirmed Passengers:</Text>
            <View style={styles.passengersRow}>
              {item.confirmed_bookings.slice(0, 5).map((booking, index) => (
                <Avatar
                  key={booking.id}
                  source={booking.passenger?.avatar ? { uri: booking.passenger.avatar } : null}
                  name={booking.passenger?.name}
                  size={35}
                  style={[styles.passengerAvatar, { marginLeft: index > 0 ? -8 : 0, borderColor: colors.surface }]}
                />
              ))}
              {item.confirmed_bookings.length > 5 && (
                <View style={styles.morePassengers}>
                  <Text style={[styles.moreText, { color: colors.textSecondary }]}>+{item.confirmed_bookings.length - 5}</Text>
                </View>
              )}
            </View>
          </View>
        )}

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
                  style={styles.actionBtn}
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
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleStartRide(item.id)}
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.startText}>Start Ride</Text>
              </TouchableOpacity>
            )}
            {item.status === 'in_progress' && (
              <>
                <TouchableOpacity
                  style={[styles.manageBtn, { borderColor: colors.primary }]}
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
            {item.status === 'completed' && (
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate('SharedRideDetails', { rideId: item.id })}
              >
                <Ionicons name="eye" size={18} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>View Details</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
        <Header title="My Rides" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header
        title="My Rides"
        onBack={() => navigation.goBack()}
        rightIcon="add-circle"
        onRightPress={() => navigation.navigate('CreateSharedRide')}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item.key && { backgroundColor: colors.primary }]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterText, { color: colors.textSecondary }, activeFilter === item.key && styles.filterTextActive]}>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="No Rides Posted"
            subtitle={
              activeFilter === 'all'
                ? "You haven't posted any shared rides yet. Start earning by posting your first ride!"
                : `No ${activeFilter} rides found`
            }
            actionText="Post a Ride"
            onAction={() => navigation.navigate('CreateSharedRide')}
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filtersList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  rideCard: {
    marginBottom: 15,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 3,
  },
  dotEnd: {},
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
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  passengersSection: {
    paddingTop: 10,
    paddingBottom: 5,
  },
  passengersLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  passengersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    borderWidth: 2,
  },
  morePassengers: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: 'rgba(244, 182, 66, 0.1)',
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
  manageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
});

export default MySharedRidesScreen;
