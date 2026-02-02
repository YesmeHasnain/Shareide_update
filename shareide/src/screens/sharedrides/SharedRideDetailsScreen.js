import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Badge, Avatar, Button, Rating } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { getSharedRide, bookSharedRide } from '../../api/sharedRides';

const SharedRideDetailsScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { rideId } = route.params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await getSharedRide(rideId);
      setRide(response.data);
    } catch (error) {
      console.log('Error fetching ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    setBooking(true);
    try {
      await bookSharedRide(rideId, {
        seats: seatsToBook,
      });
      Alert.alert(
        'Request Sent!',
        'Your booking request has been sent to the driver. You will be notified once they respond.',
        [{ text: 'OK', onPress: () => navigation.navigate('MySharedBookings') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book ride');
    } finally {
      setBooking(false);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
        <Header title="Ride Details" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  if (!ride) return null;

  const { date, time } = formatDateTime(ride.departure_time);
  const totalPrice = ride.price_per_seat * seatsToBook;

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header title="Ride Details" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Driver Card */}
        <Card style={styles.driverCard}>
          <TouchableOpacity
            style={styles.driverSection}
            onPress={() => navigation.navigate('DriverProfile', { driverId: ride.driver?.id })}
          >
            <Avatar
              source={ride.driver?.avatar ? { uri: ride.driver.avatar } : null}
              name={ride.driver?.name}
              size={70}
            />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.text }]}>{ride.driver?.name || 'Driver'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={[styles.rating, { color: colors.warning }]}>{ride.driver?.rating || '4.8'}</Text>
                <Text style={[styles.rides, { color: colors.textMuted }]}>({ride.driver?.total_rides || 0} rides)</Text>
              </View>
              <Text style={[styles.memberSince, { color: colors.textMuted }]}>
                Member since {new Date(ride.driver?.created_at).getFullYear()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Vehicle Info */}
          <View style={styles.vehicleSection}>
            <Ionicons name="car-sport" size={24} color={colors.primary} />
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleModel, { color: colors.text }]}>{ride.vehicle_model || ride.vehicle_type}</Text>
              <Text style={[styles.vehicleDetails, { color: colors.textMuted }]}>
                {ride.vehicle_color} • {ride.plate_number}
              </Text>
            </View>
          </View>
        </Card>

        {/* Route Card */}
        <Card style={styles.routeCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Route</Text>
          <View style={styles.routeSection}>
            <View style={styles.routeLine}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.line} />
              <View style={[styles.dot, styles.dotEnd, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.locationBlock}>
                <Text style={[styles.locationLabel, { color: colors.textMuted }]}>PICKUP</Text>
                <Text style={[styles.locationText, { color: colors.text }]}>{ride.from_address}</Text>
              </View>
              <View style={styles.locationBlock}>
                <Text style={[styles.locationLabel, { color: colors.textMuted }]}>DROP-OFF</Text>
                <Text style={[styles.locationText, { color: colors.text }]}>{ride.to_address}</Text>
              </View>
            </View>
          </View>

          {/* Timing */}
          <View style={styles.timingRow}>
            <View style={styles.timingItem}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.timingText, { color: colors.text }]}>{date}</Text>
            </View>
            <View style={styles.timingItem}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.timingText, { color: colors.text }]}>{time}</Text>
            </View>
          </View>

          {ride.estimated_duration && (
            <View style={styles.durationRow}>
              <Ionicons name="hourglass-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.durationText, { color: colors.textMuted }]}>
                Estimated duration: {Math.round(ride.estimated_duration / 60)} hour(s)
              </Text>
            </View>
          )}
        </Card>

        {/* Passengers Card */}
        <Card style={styles.passengersCard}>
          <View style={styles.passengerHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fellow Passengers</Text>
            <Badge
              text={`${ride.total_seats - ride.available_seats}/${ride.total_seats} booked`}
              variant={ride.available_seats > 0 ? 'success' : 'error'}
            />
          </View>

          {ride.confirmed_bookings?.length > 0 ? (
            ride.confirmed_bookings.map((booking) => (
              <View key={booking.id} style={styles.passengerRow}>
                <Avatar
                  source={booking.passenger?.avatar ? { uri: booking.passenger.avatar } : null}
                  name={booking.passenger?.name}
                  size={45}
                />
                <View style={styles.passengerInfo}>
                  <Text style={[styles.passengerName, { color: colors.text }]}>{booking.passenger?.name}</Text>
                  <View style={styles.passengerDetails}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <Text style={[styles.passengerRating, { color: colors.textMuted }]}>
                      {booking.passenger?.rating || '4.5'}
                    </Text>
                    <Text style={[styles.passengerSeats, { color: colors.textMuted }]}>
                      • {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                {booking.passenger?.gender === 'female' && (
                  <Ionicons name="female" size={18} color="#FF69B4" />
                )}
              </View>
            ))
          ) : (
            <Text style={[styles.noPassengers, { color: colors.textMuted }]}>
              Be the first to book this ride!
            </Text>
          )}
        </Card>

        {/* Preferences Card */}
        <Card style={styles.preferencesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ride Preferences</Text>
          <View style={styles.preferencesGrid}>
            <View style={[styles.preferenceItem, ride.ac_available && styles.preferenceActive]}>
              <Ionicons
                name="snow"
                size={20}
                color={ride.ac_available ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.preferenceText, { color: colors.textMuted }, ride.ac_available && { color: colors.text }]}>
                AC Available
              </Text>
            </View>
            <View style={[styles.preferenceItem, ride.luggage_allowed && styles.preferenceActive]}>
              <Ionicons
                name="briefcase"
                size={20}
                color={ride.luggage_allowed ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.preferenceText, { color: colors.textMuted }, ride.luggage_allowed && { color: colors.text }]}>
                Luggage OK
              </Text>
            </View>
            <View style={[styles.preferenceItem, ride.women_only && styles.preferenceActive]}>
              <Ionicons
                name="female"
                size={20}
                color={ride.women_only ? '#FF69B4' : colors.textMuted}
              />
              <Text style={[styles.preferenceText, { color: colors.textMuted }, ride.women_only && { color: colors.text }]}>
                Women Only
              </Text>
            </View>
            <View style={[styles.preferenceItem, !ride.smoking_allowed && styles.preferenceActive]}>
              <Ionicons
                name={ride.smoking_allowed ? 'flame' : 'flame-outline'}
                size={20}
                color={!ride.smoking_allowed ? colors.success : colors.textMuted}
              />
              <Text style={[styles.preferenceText, { color: colors.textMuted }, !ride.smoking_allowed && { color: colors.text }]}>
                {ride.smoking_allowed ? 'Smoking OK' : 'No Smoking'}
              </Text>
            </View>
          </View>

          {ride.notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.notesLabel, { color: colors.textMuted }]}>Driver's Note:</Text>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>{ride.notes}</Text>
            </View>
          )}
        </Card>

        {/* Spacer for bottom bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Booking Bar */}
      {ride.available_seats > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface }]}>
          <View style={styles.seatSelector}>
            <Text style={[styles.seatLabel, { color: colors.textMuted }]}>Seats:</Text>
            <View style={styles.seatControls}>
              <TouchableOpacity
                style={styles.seatBtn}
                onPress={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                disabled={seatsToBook <= 1}
              >
                <Ionicons name="remove" size={20} color={seatsToBook <= 1 ? colors.textMuted : colors.text} />
              </TouchableOpacity>
              <Text style={[styles.seatCount, { color: colors.text }]}>{seatsToBook}</Text>
              <TouchableOpacity
                style={styles.seatBtn}
                onPress={() => setSeatsToBook(Math.min(ride.available_seats, seatsToBook + 1))}
                disabled={seatsToBook >= ride.available_seats}
              >
                <Ionicons name="add" size={20} color={seatsToBook >= ride.available_seats ? colors.textMuted : colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>Rs. {totalPrice}</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookRide}
            disabled={booking}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.bookGradient}
            >
              {booking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.bookText}>Request to Book</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  driverCard: {
    marginBottom: 15,
    padding: 15,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 15,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  rides: {
    fontSize: 12,
    marginLeft: 5,
  },
  memberSince: {
    fontSize: 12,
    marginTop: 4,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  vehicleInfo: {
    marginLeft: 12,
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '500',
  },
  vehicleDetails: {
    fontSize: 13,
    marginTop: 2,
  },
  routeCard: {
    marginBottom: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  routeSection: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 5,
  },
  dotEnd: {},
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationBlock: {
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
  },
  timingRow: {
    flexDirection: 'row',
    gap: 20,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timingText: {
    fontSize: 14,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  durationText: {
    fontSize: 13,
  },
  passengersCard: {
    marginBottom: 15,
    padding: 15,
  },
  passengerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '500',
  },
  passengerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  passengerRating: {
    fontSize: 12,
    marginLeft: 4,
  },
  passengerSeats: {
    fontSize: 12,
  },
  noPassengers: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  preferencesCard: {
    marginBottom: 15,
    padding: 15,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '48%',
  },
  preferenceActive: {
    backgroundColor: 'rgba(244, 182, 66, 0.1)',
  },
  preferenceText: {
    fontSize: 13,
  },
  notesSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  seatSelector: {
    alignItems: 'center',
  },
  seatLabel: {
    fontSize: 11,
    marginBottom: 5,
  },
  seatControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  seatBtn: {
    padding: 8,
  },
  seatCount: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  priceSection: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  bookText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SharedRideDetailsScreen;
