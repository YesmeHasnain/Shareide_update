import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Card, Button, Avatar, Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rideDetails, setRideDetails] = useState(booking);

  useEffect(() => {
    if (booking?.id) {
      fetchRideDetails();
    }
  }, []);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const response = await ridesAPI.getRideDetails(booking.id);
      setRideDetails(response.ride || response);
    } catch (error) {
      // Use existing booking data
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    if (rideDetails.status === 'completed' || rideDetails.status === 'cancelled') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Cannot Cancel', 'This ride has already been completed or cancelled.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
              setCancelling(true);
              await ridesAPI.cancelRide(rideDetails.id, 'User cancelled');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
              navigation.goBack();
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setCancelling(false);
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
      case 'started':
        return '#3b82f6';
      case 'driver_assigned':
      case 'accepted':
        return '#f59e0b';
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      case 'ongoing':
      case 'started':
        return 'car';
      case 'driver_assigned':
      case 'accepted':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'ongoing':
      case 'started':
        return 'In Progress';
      case 'driver_assigned':
        return 'Driver Assigned';
      case 'accepted':
        return 'Confirmed';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash':
        return 'cash-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'card':
        return 'card-outline';
      case 'jazzcash':
      case 'easypaisa':
        return 'phone-portrait-outline';
      default:
        return 'cash-outline';
    }
  };

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
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(rideDetails.status) + '20' },
            ]}
          >
            <Ionicons
              name={getStatusIcon(rideDetails.status)}
              size={20}
              color={getStatusColor(rideDetails.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(rideDetails.status) }]}>
              {getStatusLabel(rideDetails.status)}
            </Text>
          </View>
        </View>

        {/* Fare Card */}
        <View>
          <Card style={styles.fareCard} shadow="lg">
            <View style={styles.fareMain}>
              <View style={[styles.fareIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="cash" size={28} color={colors.primary} />
              </View>
              <View style={styles.fareInfo}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
                <Text style={[styles.fareAmount, { color: colors.text }]}>
                  Rs. {rideDetails.fare || rideDetails.total || rideDetails.estimated_price || 350}
                </Text>
              </View>
            </View>
            <View style={[styles.paymentBadge, { backgroundColor: colors.background }]}>
              <Ionicons
                name={getPaymentIcon(rideDetails.payment_method)}
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.paymentText, { color: colors.text }]}>
                {rideDetails.payment_method || 'Cash'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Route Card */}
        <View>
          <Card style={styles.routeCard} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="navigate" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Route</Text>
            </View>
            <View style={styles.routeContainer}>
              <View style={styles.routeRow}>
                <View style={styles.routeDotContainer}>
                  <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
                  <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>PICKUP</Text>
                  <Text style={[styles.routeAddress, { color: colors.text }]}>
                    {rideDetails.pickup?.address || rideDetails.pickup_address || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.routeRow}>
                <View style={styles.routeDotContainer}>
                  <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>DROP-OFF</Text>
                  <Text style={[styles.routeAddress, { color: colors.text }]}>
                    {rideDetails.dropoff?.address || rideDetails.drop_address || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Driver Card */}
        <View>
          <Card style={styles.driverCard} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="person" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Driver</Text>
            </View>
            <View style={styles.driverContent}>
              <Avatar
                name={rideDetails.driver?.name}
                source={rideDetails.driver?.avatar}
                size="large"
                showBadge
                badgeType="verified"
              />
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: colors.text }]}>
                  {rideDetails.driver?.name || 'Driver'}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.star || '#FFD700'} />
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {rideDetails.driver?.rating || 4.5}
                  </Text>
                </View>
                <View style={styles.vehicleRow}>
                  <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                    {rideDetails.driver?.vehicle?.model || 'Vehicle'} •{' '}
                    {rideDetails.driver?.vehicle?.plate || rideDetails.driver?.plate_number || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Trip Details Card */}
        <View>
          <Card style={styles.detailsCard} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Details</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="receipt-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Booking ID</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  #{rideDetails.id || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {rideDetails.date || new Date(rideDetails.created_at || Date.now()).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Time</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {rideDetails.time || new Date(rideDetails.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="navigate-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Distance</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {rideDetails.distance || rideDetails.distance_km || '5.2'} km
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="hourglass-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Duration</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {rideDetails.duration || '15'} mins
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {rideDetails.vehicle_type?.replace('_', ' ') || 'Car'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
            <Button
              title="Cancel Booking"
              onPress={handleCancelBooking}
              variant="danger"
              size="large"
              loading={cancelling}
              icon="close-circle"
              fullWidth
            />
          )}

          {rideDetails.status === 'completed' && !rideDetails.rated && (
            <Button
              title="Rate This Ride"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('RateRide', {
                  ride: rideDetails,
                  driver: rideDetails.driver,
                  fare: rideDetails.fare,
                });
              }}
              variant="primary"
              size="large"
              icon="star"
              fullWidth
            />
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  fareCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  fareMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fareIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fareInfo: {
    flex: 1,
  },
  fareLabel: {
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  fareAmount: {
    fontSize: typography.h3,
    fontWeight: '700',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  paymentText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  routeContainer: {
    paddingLeft: spacing.xs,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDotContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginVertical: spacing.xs,
  },
  routeTextContainer: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  routeLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: typography.body,
    lineHeight: 20,
  },
  driverCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  driverContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleText: {
    fontSize: typography.bodySmall,
  },
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.caption,
  },
  detailValue: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: spacing.md,
  },
});

export default BookingDetailsScreen;
