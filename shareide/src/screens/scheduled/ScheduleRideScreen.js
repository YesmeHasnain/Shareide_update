import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { createScheduledRide } from '../../api/scheduledRides';
import { Button, Card } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const VehicleOption = ({ vehicle, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(vehicle.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.vehicleOption}
    >
      <LinearGradient
        colors={
          isSelected
            ? colors.gradients?.premium || ['#FFD700', '#FFA500']
            : [colors.surface, colors.surface]
        }
        style={[
          styles.vehicleOptionInner,
          !isSelected && { borderColor: colors.border, borderWidth: 1 },
          isSelected && shadows.md,
        ]}
      >
        <Ionicons
          name={vehicle.icon}
          size={28}
          color={isSelected ? '#000' : colors.text}
        />
        <Text
          style={[
            styles.vehicleName,
            { color: isSelected ? '#000' : colors.text },
          ]}
        >
          {vehicle.name}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const PaymentOption = ({ method, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(method.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.paymentOption}
    >
      <View
        style={[
          styles.paymentOptionInner,
          { backgroundColor: isSelected ? colors.primary + '20' : colors.surface },
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
          !isSelected && { borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Ionicons
          name={method.icon}
          size={20}
          color={isSelected ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.paymentName,
            { color: isSelected ? colors.primary : colors.text },
          ]}
        >
          {method.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ScheduleRideScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { pickup, dropoff, vehicleType = 'car', paymentMethod = 'cash', estimatedFare, distance } = params;

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethod);

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: 'bicycle', base: 30, perKm: 12 },
    { id: 'rickshaw', name: 'Rickshaw', icon: 'car-sport', base: 50, perKm: 18 },
    { id: 'car', name: 'Car', icon: 'car', base: 100, perKm: 25 },
    { id: 'ac_car', name: 'AC Car', icon: 'snow', base: 150, perKm: 35 },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'cash-outline' },
    { id: 'wallet', name: 'Wallet', icon: 'wallet-outline' },
    { id: 'jazzcash', name: 'JazzCash', icon: 'phone-portrait-outline' },
    { id: 'easypaisa', name: 'Easypaisa', icon: 'phone-landscape-outline' },
  ];

  const calculateFare = () => {
    const dist = distance || 5;
    const vehicle = vehicleTypes.find(v => v.id === selectedVehicle);
    const fare = vehicle.base + (vehicle.perKm * dist);
    return Math.ceil(fare / 10) * 10;
  };

  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const onDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      Haptics.selectionAsync();
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      Haptics.selectionAsync();
      setSelectedTime(time);
    }
  };

  const validateSchedule = () => {
    const now = new Date();
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());

    const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    if (scheduledDateTime < minTime) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Time', 'Scheduled time must be at least 30 minutes from now');
      return false;
    }

    const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days from now
    if (scheduledDateTime > maxTime) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Date', 'Cannot schedule rides more than 7 days in advance');
      return false;
    }

    return true;
  };

  const handleSchedule = async () => {
    if (!pickup || !dropoff) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Missing Location', 'Please select pickup and drop-off locations');
      return;
    }

    if (!validateSchedule()) {
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const timeStr = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;

      const response = await createScheduledRide({
        pickup_address: pickup.address,
        pickup_lat: pickup.latitude,
        pickup_lng: pickup.longitude,
        drop_address: dropoff.address,
        drop_lat: dropoff.latitude,
        drop_lng: dropoff.longitude,
        scheduled_date: dateStr,
        scheduled_time: timeStr,
        vehicle_type: selectedVehicle,
        payment_method: selectedPayment,
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Ride Scheduled!',
          `Your ride has been scheduled for ${formatDate(selectedDate)} at ${formatTime(selectedTime)}. We'll notify you when it's time.`,
          [
            {
              text: 'View Scheduled Rides',
              onPress: () => navigation.replace('ScheduledRides'),
            },
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to schedule ride');
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Schedule Ride</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Location Summary */}
        <View >
          <Card style={styles.section} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Details</Text>
            </View>
            <View style={styles.locationContainer}>
              <View style={styles.locationRow}>
                <View style={styles.locationDotContainer}>
                  <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
                  <View style={[styles.locationLine, { backgroundColor: colors.border }]} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Pickup</Text>
                  <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>
                    {pickup?.address || 'Select pickup location'}
                  </Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <View style={styles.locationDotContainer}>
                  <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>Drop-off</Text>
                  <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>
                    {dropoff?.address || 'Select drop-off location'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Date & Time Selection */}
        <View >
          <Card style={styles.section} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>When?</Text>
            </View>

            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowDatePicker(true);
                }}
              >
                <View style={[styles.dateTimeIconBg, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Date</Text>
                  <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTimePicker(true);
                }}
              >
                <View style={[styles.dateTimeIconBg, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="alarm" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Time</Text>
                  <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                    {formatTime(selectedTime)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                onChange={onDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </Card>
        </View>

        {/* Vehicle Type */}
        <View >
          <Card style={styles.section} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="car" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
            </View>
            <View style={styles.vehicleGrid}>
              {vehicleTypes.map((vehicle) => (
                <VehicleOption
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicle === vehicle.id}
                  onPress={setSelectedVehicle}
                  colors={colors}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Payment Method */}
        <View >
          <Card style={styles.section} shadow="md">
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="wallet" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
            </View>
            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => (
                <PaymentOption
                  key={method.id}
                  method={method}
                  isSelected={selectedPayment === method.id}
                  onPress={setSelectedPayment}
                  colors={colors}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* Fare Estimate */}
        <View >
          <Card style={styles.section} shadow="md">
            <View style={styles.fareRow}>
              <View style={styles.fareLeft}>
                <View style={[styles.fareIconBg, { backgroundColor: '#22c55e20' }]}>
                  <Ionicons name="cash" size={20} color="#22c55e" />
                </View>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                  Estimated Fare
                </Text>
              </View>
              <Text style={[styles.fareValue, { color: colors.text }]}>
                Rs. {calculateFare()}
              </Text>
            </View>
            <Text style={[styles.fareNote, { color: colors.textTertiary }]}>
              Final fare may vary based on traffic and actual distance
            </Text>
          </Card>
        </View>

        {/* Info Note */}
        <View >
          <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
            <View style={[styles.infoIconBg, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoText, { color: colors.text }]}>
              We'll automatically find a driver 5 minutes before your scheduled time and notify you when the ride is confirmed.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
                style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <Button
          title="Schedule Ride"
          onPress={handleSchedule}
          variant="primary"
          size="large"
          loading={loading}
          icon="calendar"
          fullWidth
        />
      </View>
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
    flex: 1,
    padding: spacing.lg,
  },
  section: {
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  locationContainer: {
    paddingLeft: spacing.xs,
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
    lineHeight: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  dateTimeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeLabel: {
    fontSize: typography.caption,
  },
  dateTimeValue: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vehicleOption: {
    width: '48%',
    flexGrow: 1,
  },
  vehicleOptionInner: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  vehicleName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  paymentOption: {
    width: '48%',
    flexGrow: 1,
  },
  paymentOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  paymentName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  fareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fareIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: typography.body,
  },
  fareValue: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  fareNote: {
    fontSize: typography.caption,
    marginLeft: 44,
  },
  infoBox: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default ScheduleRideScreen;
