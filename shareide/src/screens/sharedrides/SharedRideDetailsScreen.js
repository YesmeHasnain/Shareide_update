import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card, Badge, Avatar, Button, Rating } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { getSharedRide, bookSharedRide } from '../../api/sharedRides';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  secondary: '#FFA500',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gradientStart: '#FFFFFF',
  gradientEnd: '#F5F5F5',
};

const SharedRideDetailsScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const params = route?.params || {};
  const { rideId } = params;
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const seatModalAnim = useRef(new Animated.Value(0)).current;

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

  const openSeatModal = () => {
    setShowSeatModal(true);
    Animated.spring(seatModalAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const closeSeatModal = () => {
    Animated.timing(seatModalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowSeatModal(false);
    });
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
        {/* Ride Type Badge */}
        {ride.ride_type && ride.ride_type !== 'single' && (
          <View style={[styles.rideTypeBadge, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons
              name={ride.ride_type === 'daily' ? 'sunny' : ride.ride_type === 'weekly' ? 'calendar' : 'repeat'}
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.rideTypeText, { color: colors.primary }]}>
              {ride.ride_type.charAt(0).toUpperCase() + ride.ride_type.slice(1)} Ride
            </Text>
          </View>
        )}

        {/* Driver Card - Enhanced */}
        <Card style={styles.driverCard}>
          <TouchableOpacity
            style={styles.driverSection}
            onPress={() => navigation.navigate('DriverProfile', { driverId: ride.driver?.id })}
          >
            <View style={styles.driverAvatarWrap}>
              <Avatar
                source={ride.driver?.avatar ? { uri: ride.driver.avatar } : null}
                name={ride.driver?.name}
                size={70}
              />
              {ride.driver?.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={[styles.driverName, { color: colors.text }]}>{ride.driver?.name || 'Driver'}</Text>
                {ride.driver?.verified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={[styles.rating, { color: colors.warning }]}>
                  {ride.driver?.rating?.toFixed(1) || '5.0'}
                </Text>
                <Text style={[styles.rides, { color: colors.textMuted }]}>
                  ({ride.driver?.rides_count || ride.driver?.total_rides || 0} rides)
                </Text>
              </View>
              <Text style={[styles.departureInfo, { color: colors.primary }]}>
                Departs at {time}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Vehicle Info */}
          <View style={styles.vehicleSection}>
            <Ionicons name="car-sport" size={24} color={colors.primary} />
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleModel, { color: colors.text }]}>
                {ride.vehicle?.model || ride.vehicle_model || ride.vehicle_type}
              </Text>
              <Text style={[styles.vehicleDetails, { color: colors.textMuted }]}>
                {ride.vehicle?.color || ride.vehicle_color} • {ride.vehicle?.plate || ride.plate_number}
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

        {/* Seat Layout Card */}
        <Card style={styles.passengersCard}>
          <View style={styles.passengerHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Seats</Text>
            <Badge
              text={`${ride.available_seats} available`}
              variant={ride.available_seats > 0 ? 'success' : 'error'}
            />
          </View>

          {/* Visual Seat Layout */}
          <View style={styles.seatLayoutRow}>
            {Array.from({ length: ride.total_seats }).map((_, index) => {
              const passengers = ride.passengers || ride.confirmed_bookings || [];
              const isOccupied = index < (ride.total_seats - ride.available_seats);
              const passenger = passengers[index];
              return (
                <View key={index} style={styles.seatItem}>
                  <View style={[
                    styles.seatIcon,
                    { backgroundColor: isOccupied ? colors.primary + '20' : '#F3F4F620' },
                    isOccupied && { borderColor: colors.primary, borderWidth: 2 },
                  ]}>
                    {isOccupied && passenger ? (
                      <Avatar
                        source={passenger.user?.photo ? { uri: passenger.user.photo } : null}
                        name={passenger.user?.name || passenger.passenger?.name}
                        size={36}
                      />
                    ) : isOccupied ? (
                      <Ionicons name="person" size={18} color={colors.primary} />
                    ) : (
                      <Ionicons name="person-outline" size={18} color={colors.textMuted} />
                    )}
                  </View>
                  <Text style={[styles.seatLabel, { color: isOccupied ? colors.text : colors.textMuted }]}>
                    {isOccupied ? (passenger?.user?.name?.split(' ')[0] || passenger?.passenger?.name?.split(' ')[0] || 'Booked') : 'Open'}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Passenger List */}
          {(ride.passengers || ride.confirmed_bookings)?.length > 0 && (
            <View style={styles.passengerList}>
              <Text style={[styles.subTitle, { color: colors.textMuted }]}>Other Passengers</Text>
              {(ride.passengers || ride.confirmed_bookings).map((booking, idx) => (
                <View key={booking.booking_id || booking.id || idx} style={styles.passengerRow}>
                  <Avatar
                    source={(booking.user?.photo || booking.passenger?.avatar) ? { uri: booking.user?.photo || booking.passenger?.avatar } : null}
                    name={booking.user?.name || booking.passenger?.name}
                    size={40}
                  />
                  <View style={styles.passengerInfo}>
                    <View style={styles.passengerNameRow}>
                      <Text style={[styles.passengerName, { color: colors.text }]}>
                        {booking.user?.name || booking.passenger?.name}
                      </Text>
                      {(booking.user?.verified || booking.passenger?.verified) && (
                        <Ionicons name="shield-checkmark" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <View style={styles.passengerDetails}>
                      <Ionicons name="star" size={12} color={colors.warning} />
                      <Text style={[styles.passengerRating, { color: colors.textMuted }]}>
                        {booking.user?.rating?.toFixed(1) || booking.passenger?.rating || '5.0'}
                      </Text>
                      <Text style={[styles.passengerSeats, { color: colors.textMuted }]}>
                        • {booking.seats || booking.seats_booked || 1} seat{(booking.seats || booking.seats_booked || 1) > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  {(booking.user?.gender === 'female' || booking.passenger?.gender === 'female') && (
                    <Ionicons name="female" size={18} color="#FF69B4" />
                  )}
                </View>
              ))}
            </View>
          )}

          {!(ride.passengers || ride.confirmed_bookings)?.length && (
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
          <TouchableOpacity style={styles.seatSelector} onPress={openSeatModal}>
            <Text style={[styles.seatLabelBottom, { color: colors.textMuted }]}>Seats</Text>
            <View style={styles.seatDisplay}>
              <Text style={[styles.seatCount, { color: colors.text }]}>{seatsToBook}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

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

      {/* Seat Selection Modal */}
      <Modal visible={showSeatModal} transparent animationType="none" onRequestClose={closeSeatModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeSeatModal}>
          <Animated.View style={[
            styles.modalSheet,
            {
              transform: [{
                translateY: seatModalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }),
              }],
            },
          ]}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>How many seats would you like?</Text>

              <View style={styles.modalSeatRow}>
                <TouchableOpacity
                  style={[styles.modalSeatBtn, seatsToBook <= 1 && styles.modalSeatBtnDisabled]}
                  onPress={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                  disabled={seatsToBook <= 1}
                >
                  <Ionicons name="remove" size={28} color={seatsToBook <= 1 ? '#D1D5DB' : colors.text} />
                </TouchableOpacity>

                <View style={styles.modalSeatDisplay}>
                  <Text style={[styles.modalSeatNumber, { color: colors.text }]}>{seatsToBook}</Text>
                  <Text style={[styles.modalSeatLabel, { color: colors.textMuted }]}>
                    seat{seatsToBook > 1 ? 's' : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalSeatBtn, seatsToBook >= ride.available_seats && styles.modalSeatBtnDisabled]}
                  onPress={() => setSeatsToBook(Math.min(ride.available_seats, seatsToBook + 1))}
                  disabled={seatsToBook >= ride.available_seats}
                >
                  <Ionicons name="add" size={28} color={seatsToBook >= ride.available_seats ? '#D1D5DB' : colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalPriceText, { color: colors.textSecondary }]}>
                Rs. {ride.price_per_seat} x {seatsToBook} = Rs. {totalPrice}
              </Text>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={closeSeatModal}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  rideTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  rideTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  driverCard: {
    marginBottom: 15,
    padding: 15,
  },
  driverAvatarWrap: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departureInfo: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
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
  seatLayoutRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  seatItem: {
    alignItems: 'center',
    width: 60,
  },
  seatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  seatLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  passengerList: {
    marginTop: 8,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  seatLabelBottom: {
    fontSize: 11,
    marginBottom: 4,
  },
  seatDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  seatCount: {
    fontSize: 18,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  modalSeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  modalSeatBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSeatBtnDisabled: {
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  modalSeatDisplay: {
    alignItems: 'center',
  },
  modalSeatNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  modalSeatLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
  modalPriceText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalConfirmBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default SharedRideDetailsScreen;
