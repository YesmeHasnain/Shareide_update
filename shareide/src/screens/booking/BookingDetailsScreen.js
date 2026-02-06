import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Card, Avatar } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  inputBackground: '#F5F5F5',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  price: '#F5A623',
};

const BookingDetailsScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { booking } = params;
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>RIDE DETAILS</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Info Row */}
        <View style={styles.driverRow}>
          <Avatar
            name={rideDetails.driver?.name}
            source={rideDetails.driver?.avatar}
            size="medium"
          />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>
              {rideDetails.driver?.name || 'Driver'}
            </Text>
            <Text style={[styles.driverDate, { color: colors.textSecondary }]}>
              {rideDetails.date || new Date(rideDetails.created_at || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { borderColor: getStatusColor(rideDetails.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(rideDetails.status)}
            size={16}
            color={getStatusColor(rideDetails.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(rideDetails.status) }]}>
            {getStatusLabel(rideDetails.status)}
          </Text>
        </View>

        {/* Departure Card */}
        <Card style={styles.departureCard} shadow="sm">
          <View style={styles.routeContainer}>
            {/* Pickup */}
            <View style={styles.routeRow}>
              <View style={[styles.routeIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="radio-button-on" size={16} color={colors.primary} />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>PICK UP</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]}>
                  {rideDetails.pickup?.address || rideDetails.pickup_address || 'Pickup location'}
                </Text>
              </View>
            </View>

            {/* Connector */}
            <View style={styles.routeConnector}>
              <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Dropoff */}
            <View style={styles.routeRow}>
              <View style={[styles.routeIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="location" size={16} color={colors.primary} />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>DROP OFF</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]}>
                  {rideDetails.dropoff?.address || rideDetails.drop_address || 'Dropoff location'}
                </Text>
              </View>
            </View>
          </View>

          {/* Seats info */}
          <View style={[styles.seatsRow, { borderTopColor: colors.border }]}>
            <View style={styles.seatsInfo}>
              <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.seatsText, { color: colors.textSecondary }]}>
                {rideDetails.seats || 1} seat{(rideDetails.seats || 1) > 1 ? 's' : ''}
              </Text>
            </View>
            {rideDetails.is_monthly && (
              <View style={[styles.monthlyBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.monthlyText}>Monthly</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Cancel Button */}
        {rideDetails.status !== 'completed' && rideDetails.status !== 'cancelled' && (
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.error }]}
            onPress={handleCancelBooking}
            disabled={cancelling}
          >
            <Text style={[styles.cancelButtonText, { color: colors.error }]}>
              {cancelling ? 'Cancelling...' : 'Cancel ride'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Payment Section */}
        <View style={styles.paymentSection}>
          <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Payment</Text>
          <View style={styles.paymentRow}>
            <View style={styles.paymentMethod}>
              <Ionicons
                name={getPaymentIcon(rideDetails.payment_method)}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                {rideDetails.payment_method || 'Cash'}
              </Text>
            </View>
            <Text style={[styles.fareAmount, { color: colors.price || '#F5A623' }]}>
              Rs. {rideDetails.fare || rideDetails.total || rideDetails.estimated_price || 350}
            </Text>
          </View>
        </View>

        {/* Rate Button */}
        {rideDetails.status === 'completed' && !rideDetails.rated && (
          <TouchableOpacity
            style={[styles.rateButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RateRide', {
                ride: rideDetails,
                driver: rideDetails.driver,
                fare: rideDetails.fare,
              });
            }}
          >
            <Ionicons name="star" size={20} color="#000" />
            <Text style={styles.rateButtonText}>Rate This Ride</Text>
          </TouchableOpacity>
        )}

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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.h5,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: spacing.lg,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  driverDate: {
    fontSize: typography.caption,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  departureCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routeConnector: {
    marginLeft: 15,
    paddingVertical: spacing.xs,
  },
  connectorLine: {
    width: 2,
    height: 20,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.tiny,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  seatsText: {
    fontSize: typography.bodySmall,
  },
  monthlyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  monthlyText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  cancelButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  paymentSection: {
    marginBottom: spacing.lg,
  },
  paymentLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentMethodText: {
    fontSize: typography.body,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  fareAmount: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  rateButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#000',
  },
});

export default BookingDetailsScreen;
