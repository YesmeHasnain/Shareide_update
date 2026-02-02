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
import { Header, Card, Badge, Avatar, EmptyState, Button } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { getMySharedBookings, cancelBooking, confirmBooking } from '../../api/sharedRides';

const MySharedBookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const status = activeFilter === 'all' ? null : activeFilter;
      const response = await getMySharedBookings(status);
      setBookings(response.data || []);
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [activeFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(bookingId);
              fetchBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await confirmBooking(bookingId, 'wallet');
      Alert.alert('Success', 'Booking confirmed! Have a safe trip.');
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Pending', variant: 'warning' },
      accepted: { text: 'Accepted', variant: 'info' },
      rejected: { text: 'Rejected', variant: 'error' },
      confirmed: { text: 'Confirmed', variant: 'success' },
      picked_up: { text: 'On Trip', variant: 'primary' },
      dropped_off: { text: 'Completed', variant: 'success' },
      cancelled: { text: 'Cancelled', variant: 'error' },
      no_show: { text: 'No Show', variant: 'error' },
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
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'dropped_off', label: 'Completed' },
  ];

  const renderBookingCard = ({ item }) => {
    const ride = item.shared_ride;
    const { date, time } = formatDateTime(ride?.departure_time);
    const status = getStatusBadge(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('SharedRideDetails', { rideId: ride?.id })}
      >
        <Card style={styles.bookingCard}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Badge text={status.text} variant={status.variant} />
            <Text style={[styles.bookingDate, { color: colors.textMuted }]}>{date}</Text>
          </View>

          {/* Driver Info */}
          <View style={styles.driverSection}>
            <Avatar
              source={ride?.driver?.avatar ? { uri: ride.driver.avatar } : null}
              name={ride?.driver?.name}
              size={45}
            />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.text }]}>{ride?.driver?.name || 'Driver'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={[styles.rating, { color: colors.textMuted }]}>{ride?.driver?.rating || '4.8'}</Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeSection}>
            <View style={styles.routeLine}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.line} />
              <View style={[styles.dot, styles.dotEnd, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.routeDetails}>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{ride?.from_address}</Text>
              <Text style={[styles.locationText, { marginTop: 12, color: colors.textSecondary }]} numberOfLines={1}>{ride?.to_address}</Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.bookingDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Seats</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{item.seats_booked}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Amount</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>Rs. {item.amount}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Payment</Text>
              <Text style={[styles.detailValue, { color: colors.text }, item.payment_status === 'paid' && { color: colors.success }]}>
                {item.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.error }]}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={[styles.cancelText, { color: colors.error }]}>Cancel Request</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'accepted' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.error }]}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={[styles.cancelText, { color: colors.error }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => handleConfirmBooking(item.id)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmText}>Pay & Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'dropped_off' && !item.driver_rating && (
            <TouchableOpacity
              style={[styles.rateBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('RateSharedRide', { bookingId: item.id })}
            >
              <Ionicons name="star-outline" size={18} color={colors.primary} />
              <Text style={[styles.rateBtnText, { color: colors.primary }]}>Rate this ride</Text>
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
        <Header title="My Bookings" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header title="My Bookings" onBack={() => navigation.goBack()} />

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
        data={bookings}
        renderItem={renderBookingCard}
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
            icon="ticket-outline"
            title="No Bookings"
            subtitle={
              activeFilter === 'all'
                ? "You haven't booked any shared rides yet"
                : `No ${activeFilter} bookings found`
            }
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
  bookingCard: {
    marginBottom: 15,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 12,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  routeSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },
  dotEnd: {},
  routeDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 13,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 10,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  rateBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MySharedBookingsScreen;
