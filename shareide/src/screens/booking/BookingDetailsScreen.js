import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);
  const [rideDetails, setRideDetails] = useState(booking);

  useEffect(() => {
    if (booking?.id) {
      fetchRideDetails();
    }
  }, []);

  const fetchRideDetails = async () => {
    try {
      const response = await ridesAPI.getRideDetails(booking.id);
      setRideDetails(response.ride || response);
    } catch (error) {
      // Use existing booking data
    }
  };

  const handleCancelBooking = () => {
    if (rideDetails.status === 'completed' || rideDetails.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This ride has already been completed or cancelled.');
      return;
    }

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
              setLoading(true);
              await ridesAPI.cancelRide(rideDetails.id, 'User cancelled');
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      case 'ongoing':
        return '#3b82f6';
      default:
        return colors.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'ongoing':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(rideDetails.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(rideDetails.status)}</Text>
        </View>

        <View style={[styles.fareCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.fareIcon}>💰</Text>
          <View style={styles.fareInfo}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
            <Text style={[styles.fareAmount, { color: colors.primary }]}>
              Rs. {rideDetails.fare || rideDetails.total || 350}
            </Text>
          </View>
          <View style={[styles.paymentBadge, { backgroundColor: colors.background }]}>
            <Text style={styles.paymentIcon}>
              {rideDetails.payment_method === 'cash' ? '💵' : rideDetails.payment_method === 'wallet' ? '👛' : '💳'}
            </Text>
            <Text style={[styles.paymentText, { color: colors.text }]}>
              {rideDetails.payment_method || 'Cash'}
            </Text>
          </View>
        </View>

        <View style={[styles.routeCard, { backgroundColor: colors.surface }]}>
          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <Text style={styles.dotGreen}>●</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>PICKUP</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]}>
                {rideDetails.pickup?.address || rideDetails.pickup_address || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <Text style={styles.dotRed}>●</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>DROPOFF</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]}>
                {rideDetails.dropoff?.address || rideDetails.dropoff_address || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.driverCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.driverInitial}>
              {rideDetails.driver?.name?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>
              {rideDetails.driver?.name || 'Driver'}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {rideDetails.driver?.rating || 4.5}
              </Text>
            </View>
            <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
              {rideDetails.driver?.vehicle?.model || 'Vehicle'} •{' '}
              {rideDetails.driver?.vehicle?.plate || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Trip Details</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Booking ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              #{rideDetails.id || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {rideDetails.date || new Date().toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {rideDetails.time || new Date().toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Distance</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {rideDetails.distance || '5.2'} km
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {rideDetails.duration || '15'} mins
            </Text>
          </View>
        </View>

        {rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#ef4444' }]}
            onPress={handleCancelBooking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.cancelText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}

        {rideDetails.status === 'completed' && !rideDetails.rated && (
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate('RateRide', {
                ride: rideDetails,
                driver: rideDetails.driver,
                fare: rideDetails.fare,
              })
            }
          >
            <Text style={styles.rateText}>Rate This Ride</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 16 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  fareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  fareIcon: { fontSize: 32, marginRight: 12 },
  fareInfo: { flex: 1 },
  fareLabel: { fontSize: 12, marginBottom: 2 },
  fareAmount: { fontSize: 24, fontWeight: 'bold' },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  paymentIcon: { fontSize: 16 },
  paymentText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  routeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routeIcon: { width: 20, alignItems: 'center', marginRight: 12 },
  dotGreen: { fontSize: 14, color: '#22c55e' },
  dotRed: { fontSize: 14, color: '#ef4444' },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 8,
    marginVertical: 4,
  },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  routeAddress: { fontSize: 14 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitial: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingStar: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  vehicleText: { fontSize: 14 },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  rateButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  rateText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});

export default BookingDetailsScreen;
