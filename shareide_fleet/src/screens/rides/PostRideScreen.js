import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import locationService from '../../utils/locationService';

const PRIMARY_COLOR = '#FCC014';
const DARK = '#0F0F1E';
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Scroll Picker Component ──
const ScrollPicker = ({ data, selectedIndex, onSelect, width }) => {
  const flatListRef = useRef(null);
  const isScrolling = useRef(false);

  // Pad data with empty items for centering
  const paddedData = [
    { label: '', value: '__pad1__' },
    { label: '', value: '__pad2__' },
    ...data,
    { label: '', value: '__pad3__' },
    { label: '', value: '__pad4__' },
  ];

  useEffect(() => {
    if (flatListRef.current && !isScrolling.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
  }, [selectedIndex]);

  const onMomentumEnd = useCallback((e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    if (clampedIndex !== selectedIndex) {
      Haptics.selectionAsync();
      onSelect(clampedIndex);
    }
    isScrolling.current = false;
  }, [data.length, selectedIndex, onSelect]);

  const renderItem = useCallback(({ item, index }) => {
    const actualIndex = index - 2; // account for padding
    const isSelected = actualIndex === selectedIndex;
    const isAdjacent = Math.abs(actualIndex - selectedIndex) === 1;

    return (
      <View style={[styles.pickerItem, { width }]}>
        <Text style={[
          styles.pickerItemText,
          isSelected && styles.pickerItemTextSelected,
          isAdjacent && styles.pickerItemTextAdjacent,
          !isSelected && !isAdjacent && styles.pickerItemTextFar,
        ]}>
          {item.label}
        </Text>
      </View>
    );
  }, [selectedIndex, width]);

  return (
    <View style={[styles.pickerColumn, { width }]}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={(item, i) => `${item.value}_${i}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={() => { isScrolling.current = true; }}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        bounces={false}
      />
    </View>
  );
};

// ── Helper functions ──
const generateDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push({
      label: `${dayName}, ${dateStr}`,
      value: d,
    });
  }
  return dates;
};

const generateHours = () => {
  const hours = [];
  for (let i = 1; i <= 12; i++) {
    hours.push({ label: i.toString().padStart(2, '0'), value: i });
  }
  return hours;
};

const generateMinutes = () => {
  const mins = [];
  for (let i = 0; i < 60; i += 5) {
    mins.push({ label: i.toString().padStart(2, '0'), value: i });
  }
  return mins;
};

const ampmData = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' },
];

const PostRideScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const driver = user?.driver;
  const vehicleType = driver?.vehicle_type?.toLowerCase() || 'car';

  const getDefaultSeats = () => {
    if (vehicleType === 'bike') return '1';
    if (vehicleType === 'rickshaw') return '2';
    return String(driver?.seats || 3);
  };

  const getMaxSeats = () => {
    if (vehicleType === 'bike') return 1;
    if (vehicleType === 'rickshaw') return 3;
    return driver?.seats || 4;
  };

  const [loading, setLoading] = useState(false);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [seats, setSeats] = useState(getDefaultSeats());
  const [price, setPrice] = useState('');
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [rideType, setRideType] = useState('single');
  const [recurringDays, setRecurringDays] = useState([]);

  const rideTypes = [
    { key: 'single', label: 'Single', icon: 'car-outline' },
    { key: 'daily', label: 'Daily', icon: 'sunny-outline' },
    { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'repeat-outline' },
  ];

  const weekDays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
  ];

  const toggleDay = (day) => {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Picker state
  const dates = generateDates();
  const hours = generateHours();
  const minutes = generateMinutes();

  const now = new Date();
  const currentHour12 = now.getHours() % 12 || 12;
  const currentMinute5 = Math.ceil(now.getMinutes() / 5) * 5;

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedHourIndex, setSelectedHourIndex] = useState(
    hours.findIndex(h => h.value === currentHour12)
  );
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(
    minutes.findIndex(m => m.value === (currentMinute5 >= 60 ? 0 : currentMinute5))
  );
  const [selectedAmPmIndex, setSelectedAmPmIndex] = useState(
    now.getHours() >= 12 ? 1 : 0
  );

  const getRouteMapHtml = () => {
    if (!pickup || !dropoff) return '';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>* { margin: 0; padding: 0; } html,body,#map { width: 100%; height: 100%; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

    const pickup = [${pickup.latitude}, ${pickup.longitude}];
    const dropoff = [${dropoff.latitude}, ${dropoff.longitude}];

    // Pickup marker (gold)
    L.circleMarker(pickup, { radius: 8, fillColor: '#FCC014', fillOpacity: 1, color: '#FFF', weight: 3 }).addTo(map);
    // Dropoff marker (green)
    L.circleMarker(dropoff, { radius: 8, fillColor: '#10B981', fillOpacity: 1, color: '#FFF', weight: 3 }).addTo(map);

    // Route line
    fetch('https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?overview=full&geometries=geojson')
      .then(r => r.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          L.polyline(coords, { color: '#FCC014', weight: 4, opacity: 0.9 }).addTo(map);
          map.fitBounds(L.polyline(coords).getBounds(), { padding: [30, 30] });
        } else {
          const line = L.polyline([pickup, dropoff], { color: '#FCC014', weight: 3, dashArray: '8 8' }).addTo(map);
          map.fitBounds(line.getBounds(), { padding: [30, 30] });
        }
      })
      .catch(() => {
        const line = L.polyline([pickup, dropoff], { color: '#FCC014', weight: 3, dashArray: '8 8' }).addTo(map);
        map.fitBounds(line.getBounds(), { padding: [30, 30] });
      });
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const loc = await locationService.getCurrentLocation();
    if (loc) {
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

  const buildDateFromPicker = () => {
    const baseDate = new Date(dates[selectedDateIndex].value);
    let hour24 = hours[selectedHourIndex].value;
    const min = minutes[selectedMinuteIndex].value;
    const ampm = ampmData[selectedAmPmIndex].value;

    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;

    baseDate.setHours(hour24, min, 0, 0);
    return baseDate;
  };

  const confirmPicker = () => {
    const newDate = buildDateFromPicker();
    setDepartureTime(newDate);
    setShowPicker(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatDepartureTime = () => {
    const now = new Date();
    const isToday = departureTime.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = departureTime.toDateString() === tomorrow.toDateString();

    const timeStr = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    const dateStr = departureTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
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
    if (rideType === 'weekly' && recurringDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day for weekly rides');
      return;
    }

    setLoading(true);
    try {
      const payload = {
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
        ride_type: rideType,
      };

      if (rideType === 'weekly') {
        payload.recurring_days = recurringDays;
      }

      const response = await client.post('/shared-rides', payload);

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
          {/* Ride Type Selector */}
          <Text style={[styles.label, { color: colors.text, marginTop: 8 }]}>Ride Type</Text>
          <View style={styles.rideTypeRow}>
            {rideTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.rideTypeChip,
                  { backgroundColor: colors.inputBackground },
                  rideType === type.key && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
                ]}
                onPress={() => { setRideType(type.key); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type.icon}
                  size={16}
                  color={rideType === type.key ? '#000' : colors.textSecondary}
                />
                <Text style={[
                  styles.rideTypeText,
                  { color: rideType === type.key ? '#000' : colors.textSecondary },
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weekly Day Selector */}
          {rideType === 'weekly' && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Select Days</Text>
              <View style={styles.dayRow}>
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayChip,
                      { backgroundColor: colors.inputBackground },
                      recurringDays.includes(day.key) && { backgroundColor: PRIMARY_COLOR },
                    ]}
                    onPress={() => toggleDay(day.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: recurringDays.includes(day.key) ? '#000' : colors.textSecondary },
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Recurring Info */}
          {rideType !== 'single' && (
            <View style={[styles.recurringInfo, { backgroundColor: PRIMARY_COLOR + '15' }]}>
              <Ionicons name="information-circle" size={18} color={PRIMARY_COLOR} />
              <Text style={[styles.recurringText, { color: colors.text }]}>
                {rideType === 'daily' ? 'This ride will repeat every weekday for 30 days.' :
                 rideType === 'weekly' ? `This ride will repeat every ${recurringDays.join(', ') || 'selected days'} for 4 weeks.` :
                 'This ride will repeat daily for 30 days.'}
              </Text>
            </View>
          )}

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
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={[styles.locationText, { color: colors.text, marginLeft: 12 }]}>
              {formatDepartureTime()}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Seats & Price Row */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={[styles.label, { color: colors.text }]}>Available Seats</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name={vehicleType === 'bike' ? 'bicycle-outline' : 'people-outline'} size={20} color={PRIMARY_COLOR} />
                {vehicleType === 'bike' ? (
                  <Text style={[styles.input, { color: colors.text }]}>1</Text>
                ) : (
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={seats}
                    onChangeText={(val) => {
                      const num = parseInt(val);
                      if (val === '') { setSeats(''); return; }
                      if (!isNaN(num) && num >= 1 && num <= getMaxSeats()) {
                        setSeats(String(num));
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={1}
                    placeholder={String(getMaxSeats())}
                    placeholderTextColor={colors.textSecondary}
                  />
                )}
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

          {/* Route Preview Map */}
          {pickup && dropoff && (
            <>
              <Text style={[styles.label, { color: colors.text }]}>Route Preview</Text>
              <View style={styles.mapPreview}>
                <WebView
                  source={{ html: getRouteMapHtml() }}
                  style={styles.mapWebview}
                  scrollEnabled={false}
                  javaScriptEnabled
                  domStorageEnabled
                />
              </View>
            </>
          )}

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

      {/* ── Scroll DateTime Picker Modal ── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          />
          <View style={[styles.pickerSheet, { backgroundColor: colors.card || colors.surface }]}>
            {/* Handle bar */}
            <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

            {/* Title */}
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Date & Time</Text>

            {/* Date scroll (full width) */}
            <Text style={[styles.pickerSectionLabel, { color: colors.textTertiary }]}>DATE</Text>
            <View style={[styles.pickerWrapper, { height: PICKER_HEIGHT, backgroundColor: colors.inputBackground }]}>
              <View style={styles.pickerHighlight} />
              <ScrollPicker
                data={dates}
                selectedIndex={selectedDateIndex}
                onSelect={setSelectedDateIndex}
                width={SCREEN_WIDTH - 64}
              />
            </View>

            {/* Time scroll (hour : minute AM/PM) */}
            <Text style={[styles.pickerSectionLabel, { marginTop: 16, color: colors.textTertiary }]}>TIME</Text>
            <View style={[styles.pickerWrapper, { height: PICKER_HEIGHT, backgroundColor: colors.inputBackground }]}>
              <View style={styles.pickerHighlight} />
              <View style={styles.timeRow}>
                <ScrollPicker
                  data={hours}
                  selectedIndex={selectedHourIndex}
                  onSelect={setSelectedHourIndex}
                  width={70}
                />
                <Text style={[styles.pickerColon, { color: colors.text }]}>:</Text>
                <ScrollPicker
                  data={minutes}
                  selectedIndex={selectedMinuteIndex}
                  onSelect={setSelectedMinuteIndex}
                  width={70}
                />
                <ScrollPicker
                  data={ampmData}
                  selectedIndex={selectedAmPmIndex}
                  onSelect={setSelectedAmPmIndex}
                  width={70}
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.pickerBtnRow}>
              <TouchableOpacity
                style={[styles.pickerCancelBtn, { backgroundColor: colors.inputBackground }]}
                onPress={() => setShowPicker(false)}
              >
                <Text style={[styles.pickerCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickerConfirmBtn}
                onPress={confirmPicker}
              >
                <LinearGradient
                  colors={[PRIMARY_COLOR, '#FF9500']}
                  style={styles.pickerConfirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.pickerConfirmText}>Confirm</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  rideTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  rideTypeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rideTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 4,
    marginTop: 8,
  },
  recurringText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
  mapPreview: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
  },
  mapWebview: {
    flex: 1,
    borderRadius: 16,
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

  // ── Modal Picker Styles ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },

  // Picker scroll
  pickerWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    backgroundColor: '#FCC01420',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FCC01440',
    zIndex: 1,
    pointerEvents: 'none',
  },
  pickerColumn: {
    height: PICKER_HEIGHT,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    fontSize: 18,
    color: DARK,
    fontWeight: '800',
  },
  pickerItemTextAdjacent: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  pickerItemTextFar: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '400',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PICKER_HEIGHT,
  },
  pickerColon: {
    fontSize: 24,
    fontWeight: '800',
    color: DARK,
    marginHorizontal: 4,
  },

  // Buttons
  pickerBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  pickerCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  pickerConfirmBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pickerConfirmGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  pickerConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default PostRideScreen;
