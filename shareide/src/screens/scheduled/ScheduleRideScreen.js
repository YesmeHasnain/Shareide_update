import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { createScheduledRide } from '../../api/scheduledRides';

const ScheduleRideScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { pickup, dropoff, vehicleType = 'car', paymentMethod = 'cash', estimatedFare, distance } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethod);

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: '🏍️', base: 30, perKm: 12 },
    { id: 'rickshaw', name: 'Rickshaw', icon: '🛺', base: 50, perKm: 18 },
    { id: 'car', name: 'Car', icon: '🚗', base: 100, perKm: 25 },
    { id: 'ac_car', name: 'AC Car', icon: '❄️', base: 150, perKm: 35 },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'wallet', name: 'Wallet', icon: '👛' },
    { id: 'jazzcash', name: 'JazzCash', icon: '📱' },
    { id: 'easypaisa', name: 'Easypaisa', icon: '📲' },
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
      setSelectedDate(date);
    }
  };

  const onTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  const validateSchedule = () => {
    const now = new Date();
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());

    const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    if (scheduledDateTime < minTime) {
      Alert.alert('Invalid Time', 'Scheduled time must be at least 30 minutes from now');
      return false;
    }

    const maxTime = new Date(now.getTime() + 7 * 24 * 60 * 60000); // 7 days from now
    if (scheduledDateTime > maxTime) {
      Alert.alert('Invalid Date', 'Cannot schedule rides more than 7 days in advance');
      return false;
    }

    return true;
  };

  const handleSchedule = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Missing Location', 'Please select pickup and drop-off locations');
      return;
    }

    if (!validateSchedule()) {
      return;
    }

    setLoading(true);

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
      Alert.alert('Error', error.response?.data?.message || 'Failed to schedule ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Schedule Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Details</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>
                {pickup?.address || 'Select pickup location'}
              </Text>
            </View>
            <View style={styles.locationLine} />
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={2}>
                {dropoff?.address || 'Select drop-off location'}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time Selection */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>When?</Text>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>📅</Text>
              <View>
                <Text style={[styles.dateTimeLabel, { color: colors.textSecondary }]}>Date</Text>
                <Text style={[styles.dateTimeValue, { color: colors.text }]}>
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeButton, { backgroundColor: colors.background }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeIcon}>🕐</Text>
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
        </View>

        {/* Vehicle Type */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
          <View style={styles.vehicleGrid}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleOption,
                  { backgroundColor: colors.background },
                  selectedVehicle === vehicle.id && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  { backgroundColor: colors.background },
                  selectedPayment === method.id && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <Text style={[styles.paymentName, { color: colors.text }]}>{method.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fare Estimate */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Estimated Fare</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>Rs. {calculateFare()}</Text>
          </View>
          <Text style={[styles.fareNote, { color: colors.textSecondary }]}>
            Final fare may vary based on traffic and actual distance
          </Text>
        </View>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            We'll automatically find a driver 5 minutes before your scheduled time and notify you when the ride is confirmed.
          </Text>
        </View>
      </ScrollView>

      {/* Schedule Button */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.scheduleButton, { backgroundColor: colors.primary }]}
          onPress={handleSchedule}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scheduleButtonText}>Schedule Ride</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 24,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  locationContainer: {
    paddingLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  locationLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginLeft: 5,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  vehicleOption: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    margin: '1%',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  paymentOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    margin: '1%',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 14,
  },
  fareValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  fareNote: {
    fontSize: 12,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    marginBottom: 100,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  scheduleButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleRideScreen;
