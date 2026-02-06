import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { Header, Card, Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { createSharedRide } from '../../api/sharedRides';

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
  info: '#3B82F6',
  error: '#EF4444',
  gradientStart: '#FFFFFF',
  gradientEnd: '#F5F5F5',
};

const CreateSharedRideScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const [formData, setFormData] = useState({
    from_address: '',
    from_lat: null,
    from_lng: null,
    to_address: '',
    to_lat: null,
    to_lng: null,
    departure_time: new Date(Date.now() + 3600000), // 1 hour from now
    total_seats: 3,
    price_per_seat: '',
    vehicle_type: 'car',
    vehicle_model: '',
    vehicle_color: '',
    plate_number: '',
    women_only: false,
    ac_available: true,
    luggage_allowed: true,
    smoking_allowed: false,
    pets_allowed: false,
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (type) => {
    navigation.navigate('LocationSearch', {
      onSelect: (location) => {
        if (type === 'from') {
          setFormData({
            ...formData,
            from_address: location.address,
            from_lat: location.lat,
            from_lng: location.lng,
          });
        } else {
          setFormData({
            ...formData,
            to_address: location.address,
            to_lat: location.lat,
            to_lng: location.lng,
          });
        }
      },
      placeholder: type === 'from' ? 'Enter pickup location' : 'Enter destination',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(formData.departure_time);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setFormData({ ...formData, departure_time: newDate });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(formData.departure_time);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setFormData({ ...formData, departure_time: newDate });
    }
  };

  const validateForm = () => {
    if (!formData.from_address || !formData.to_address) {
      Alert.alert('Error', 'Please select pickup and drop-off locations');
      return false;
    }
    if (!formData.price_per_seat || parseFloat(formData.price_per_seat) <= 0) {
      Alert.alert('Error', 'Please enter a valid price per seat');
      return false;
    }
    if (formData.departure_time <= new Date()) {
      Alert.alert('Error', 'Departure time must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createSharedRide({
        ...formData,
        price_per_seat: parseFloat(formData.price_per_seat),
        departure_time: formData.departure_time.toISOString(),
      });
      Alert.alert(
        'Ride Posted!',
        'Your shared ride has been posted successfully. Passengers can now book seats.',
        [{ text: 'OK', onPress: () => navigation.navigate('MySharedRides') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const vehicleTypes = [
    { key: 'car', label: 'Car', icon: 'car' },
    { key: 'suv', label: 'SUV', icon: 'car-sport' },
    { key: 'van', label: 'Van', icon: 'bus' },
    { key: 'bike', label: 'Bike', icon: 'bicycle' },
  ];

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header title="Post a Ride" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Route Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Route</Text>

          {/* Pickup */}
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationSelect('from')}
          >
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={formData.from_address ? [styles.locationText, { color: colors.text }] : [styles.placeholderText, { color: colors.textMuted }]}>
              {formData.from_address || 'Select pickup location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Drop-off */}
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationSelect('to')}
          >
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={formData.to_address ? [styles.locationText, { color: colors.text }] : [styles.placeholderText, { color: colors.textMuted }]}>
              {formData.to_address || 'Select drop-off location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Date & Time Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Departure</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatDate(formData.departure_time)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>{formatTime(formData.departure_time)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.departure_time}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={formData.departure_time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </Card>

        {/* Seats & Price Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seats & Price</Text>

          {/* Seats */}
          <View style={styles.seatsRow}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Available Seats</Text>
            <View style={styles.seatSelector}>
              <TouchableOpacity
                style={styles.seatBtn}
                onPress={() => setFormData({ ...formData, total_seats: Math.max(1, formData.total_seats - 1) })}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.seatCount, { color: colors.text }]}>{formData.total_seats}</Text>
              <TouchableOpacity
                style={styles.seatBtn}
                onPress={() => setFormData({ ...formData, total_seats: Math.min(7, formData.total_seats + 1) })}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Price per Seat (Rs.)</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Enter price"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={formData.price_per_seat}
              onChangeText={(text) => setFormData({ ...formData, price_per_seat: text })}
            />
          </View>
        </Card>

        {/* Vehicle Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle</Text>

          {/* Vehicle Type */}
          <View style={styles.vehicleTypes}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.vehicleTypeBtn,
                  formData.vehicle_type === type.key && { borderColor: colors.primary },
                ]}
                onPress={() => setFormData({ ...formData, vehicle_type: type.key })}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={formData.vehicle_type === type.key ? colors.primary : colors.textMuted}
                />
                <Text style={[
                  styles.vehicleTypeText,
                  { color: colors.textMuted },
                  formData.vehicle_type === type.key && { color: colors.primary },
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vehicle Details */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vehicle Model</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="e.g., Honda City"
              placeholderTextColor={colors.textMuted}
              value={formData.vehicle_model}
              onChangeText={(text) => setFormData({ ...formData, vehicle_model: text })}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g., White"
                placeholderTextColor={colors.textMuted}
                value={formData.vehicle_color}
                onChangeText={(text) => setFormData({ ...formData, vehicle_color: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Plate Number</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="e.g., ABC-123"
                placeholderTextColor={colors.textMuted}
                value={formData.plate_number}
                onChangeText={(text) => setFormData({ ...formData, plate_number: text })}
              />
            </View>
          </View>
        </Card>

        {/* Preferences Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="female" size={22} color="#FF69B4" />
              <Text style={[styles.preferenceText, { color: colors.text }]}>Women Only</Text>
            </View>
            <Switch
              value={formData.women_only}
              onValueChange={(value) => setFormData({ ...formData, women_only: value })}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary + '50' }}
              thumbColor={formData.women_only ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="snow" size={22} color={colors.info} />
              <Text style={[styles.preferenceText, { color: colors.text }]}>AC Available</Text>
            </View>
            <Switch
              value={formData.ac_available}
              onValueChange={(value) => setFormData({ ...formData, ac_available: value })}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary + '50' }}
              thumbColor={formData.ac_available ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="briefcase" size={22} color={colors.warning} />
              <Text style={[styles.preferenceText, { color: colors.text }]}>Luggage Allowed</Text>
            </View>
            <Switch
              value={formData.luggage_allowed}
              onValueChange={(value) => setFormData({ ...formData, luggage_allowed: value })}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary + '50' }}
              thumbColor={formData.luggage_allowed ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="flame" size={22} color={colors.error} />
              <Text style={[styles.preferenceText, { color: colors.text }]}>Smoking Allowed</Text>
            </View>
            <Switch
              value={formData.smoking_allowed}
              onValueChange={(value) => setFormData({ ...formData, smoking_allowed: value })}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary + '50' }}
              thumbColor={formData.smoking_allowed ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Ionicons name="paw" size={22} color={colors.success} />
              <Text style={[styles.preferenceText, { color: colors.text }]}>Pets Allowed</Text>
            </View>
            <Switch
              value={formData.pets_allowed}
              onValueChange={(value) => setFormData({ ...formData, pets_allowed: value })}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary + '50' }}
              thumbColor={formData.pets_allowed ? colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* Notes Section */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Notes</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput, { color: colors.text }]}
            placeholder="Any special instructions or notes for passengers..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </Card>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="car" size={22} color="#fff" />
                <Text style={styles.submitText}>Post Ride</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
  },
  seatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  seatSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  seatBtn: {
    padding: 10,
  },
  seatCount: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 15,
  },
  inputGroup: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
  },
  vehicleTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  vehicleTypeBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  vehicleTypeText: {
    fontSize: 12,
    marginTop: 5,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceText: {
    fontSize: 14,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateSharedRideScreen;
