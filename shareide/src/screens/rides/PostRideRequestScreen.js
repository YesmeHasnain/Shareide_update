import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

const PRIMARY_COLOR = '#FCC014';

const PostRideRequestScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [pickup, setPickup] = useState(route.params?.pickup || null);
  const [dropoff, setDropoff] = useState(route.params?.dropoff || null);
  const [departureTime, setDepartureTime] = useState(new Date(Date.now() + 30 * 60000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [seats, setSeats] = useState('1');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      if (route.params?.locationType === 'pickup') {
        setPickup(route.params.selectedLocation);
      } else {
        setDropoff(route.params.selectedLocation);
      }
    }
  }, [route.params]);

  const selectLocation = (type) => {
    navigation.navigate('LocationSearch', {
      type: type,
      returnScreen: 'PostRideRequest',
      locationType: type,
    });
  };

  const handleSubmit = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Error', 'Please select pickup and dropoff locations');
      return;
    }

    if (!offeredPrice || isNaN(offeredPrice)) {
      Alert.alert('Error', 'Please enter your offered price');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/ride-requests/create', {
        pickup_address: pickup.name || pickup.address,
        pickup_lat: pickup.latitude,
        pickup_lng: pickup.longitude,
        dropoff_address: dropoff.name || dropoff.address,
        dropoff_lat: dropoff.latitude,
        dropoff_lng: dropoff.longitude,
        departure_time: departureTime.toISOString(),
        seats_needed: parseInt(seats),
        offered_price: parseInt(offeredPrice),
        notes: notes,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Your ride request has been posted! Nearby drivers will see it.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post ride request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Request a Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pickup Location */}
        <Text style={[styles.label, { color: colors.text }]}>Pickup Location</Text>
        <TouchableOpacity
          style={[styles.locationBox, { backgroundColor: colors.card }]}
          onPress={() => selectLocation('pickup')}
        >
          <View style={[styles.dot, { backgroundColor: PRIMARY_COLOR }]} />
          <Text style={[styles.locationText, { color: pickup ? colors.text : colors.textSecondary }]} numberOfLines={1}>
            {pickup?.name || pickup?.address || 'Select pickup location'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Dropoff Location */}
        <Text style={[styles.label, { color: colors.text }]}>Dropoff Location</Text>
        <TouchableOpacity
          style={[styles.locationBox, { backgroundColor: colors.card }]}
          onPress={() => selectLocation('dropoff')}
        >
          <View style={[styles.pin, { backgroundColor: PRIMARY_COLOR }]} />
          <Text style={[styles.locationText, { color: dropoff ? colors.text : colors.textSecondary }]} numberOfLines={1}>
            {dropoff?.name || dropoff?.address || 'Select dropoff location'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Departure Time */}
        <Text style={[styles.label, { color: colors.text }]}>When do you need the ride?</Text>
        <TouchableOpacity
          style={[styles.locationBox, { backgroundColor: colors.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
          <Text style={[styles.locationText, { color: colors.text }]}>
            {departureTime.toLocaleString()}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={departureTime}
            mode="datetime"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setDepartureTime(date);
            }}
          />
        )}

        {/* Seats Needed */}
        <Text style={[styles.label, { color: colors.text }]}>How many seats?</Text>
        <View style={styles.seatsRow}>
          {['1', '2', '3', '4'].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.seatBtn,
                { backgroundColor: seats === num ? PRIMARY_COLOR : colors.card },
              ]}
              onPress={() => setSeats(num)}
            >
              <Text style={[styles.seatBtnText, { color: seats === num ? '#000' : colors.text }]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Offered Price */}
        <Text style={[styles.label, { color: colors.text }]}>Your Offered Price (Rs.)</Text>
        <View style={[styles.priceBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.rsLabel, { color: PRIMARY_COLOR }]}>Rs.</Text>
          <TextInput
            style={[styles.priceInput, { color: colors.text }]}
            value={offeredPrice}
            onChangeText={setOfferedPrice}
            keyboardType="number-pad"
            placeholder="Enter your price"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Notes */}
        <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special requirements..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="#000" />
              <Text style={styles.submitBtnText}>Post Ride Request</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  pin: { width: 12, height: 16, borderRadius: 6, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginRight: 12 },
  locationText: { flex: 1, fontSize: 15 },
  seatsRow: { flexDirection: 'row', gap: 12 },
  seatBtn: { flex: 1, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  seatBtnText: { fontSize: 18, fontWeight: '700' },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  rsLabel: { fontSize: 18, fontWeight: '700', marginRight: 8 },
  priceInput: { flex: 1, fontSize: 18, fontWeight: '600' },
  notesInput: {
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    height: 56,
    borderRadius: 14,
    marginTop: 30,
    gap: 10,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default PostRideRequestScreen;
