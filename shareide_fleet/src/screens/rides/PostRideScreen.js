import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';
import locationService from '../../utils/locationService';

const PRIMARY_COLOR = '#FCC014';

const PostRideScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [seats, setSeats] = useState('3');
  const [price, setPrice] = useState('');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const loc = await locationService.getCurrentLocation();
    if (loc) {
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
        );
        const data = await response.json();
        setPickup({
          name: data.display_name?.split(',').slice(0, 2).join(',') || 'Current Location',
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      } catch (e) {
        setPickup({
          name: 'Current Location',
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
      }
    }
  };

  const selectLocation = (type) => {
    navigation.navigate('LocationSearch', {
      type,
      onSelect: (location) => {
        if (type === 'pickup') {
          setPickup(location);
        } else {
          setDropoff(location);
        }
      },
    });
  };

  const handlePostRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Error', 'Please select pickup and dropoff locations');
      return;
    }
    if (!price || isNaN(price)) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const response = await client.post('/shared-rides', {
        pickup_address: pickup.name,
        pickup_lat: pickup.latitude,
        pickup_lng: pickup.longitude,
        dropoff_address: dropoff.name,
        dropoff_lat: dropoff.latitude,
        dropoff_lng: dropoff.longitude,
        available_seats: parseInt(seats),
        price_per_seat: parseInt(price),
        departure_time: departureTime.toISOString(),
        notes: notes,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Ride posted successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post ride');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Post a Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pickup Location */}
          <Text style={[styles.label, { color: colors.text }]}>Pickup Location</Text>
          <TouchableOpacity
            style={[styles.locationBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => selectLocation('pickup')}
          >
            <View style={[styles.dot, { backgroundColor: PRIMARY_COLOR }]} />
            <Text
              style={[styles.locationText, { color: pickup ? colors.text : colors.textSecondary }]}
              numberOfLines={1}
            >
              {pickup?.name || 'Select pickup location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Dropoff Location */}
          <Text style={[styles.label, { color: colors.text }]}>Dropoff Location</Text>
          <TouchableOpacity
            style={[styles.locationBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => selectLocation('dropoff')}
          >
            <View style={[styles.pin, { backgroundColor: PRIMARY_COLOR }]} />
            <Text
              style={[styles.locationText, { color: dropoff ? colors.text : colors.textSecondary }]}
              numberOfLines={1}
            >
              {dropoff?.name || 'Select dropoff location'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Departure Time */}
          <Text style={[styles.label, { color: colors.text }]}>Departure Time</Text>
          <TouchableOpacity
            style={[styles.locationBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={[styles.locationText, { color: colors.text, marginLeft: 12 }]}>
              {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {departureTime.toLocaleDateString()}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={departureTime}
              mode="datetime"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) setDepartureTime(date);
              }}
            />
          )}

          {/* Seats & Price Row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Available Seats</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="people-outline" size={20} color={PRIMARY_COLOR} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={seats}
                  onChangeText={setSeats}
                  keyboardType="number-pad"
                  maxLength={1}
                  placeholder="3"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Price per Seat</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBackground }]}>
                <Text style={[styles.rsText, { color: PRIMARY_COLOR }]}>Rs.</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="number-pad"
                  placeholder="200"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Notes */}
          <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="AC available, female passengers only, etc."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.postBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handlePostRide}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.postBtnText}>Post Ride</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pin: {
    width: 12,
    height: 16,
    borderRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  rsText: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
  },
  notesInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  postBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default PostRideScreen;
