import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const BookingConfirmScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { driver, pickup, dropoff } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'cash', icon: '💵', label: 'Cash' },
    { id: 'wallet', icon: '👛', label: 'Wallet' },
    { id: 'card', icon: '💳', label: 'Card' },
  ];

  const baseFare = driver.fare || 350;
  const serviceFee = Math.round(baseFare * 0.05);
  const totalFare = baseFare + serviceFee - discount;

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'FIRST50') {
      setDiscount(50);
      setPromoApplied(true);
      Alert.alert('Success', 'Promo code applied! Rs. 50 off');
    } else if (promoCode.toUpperCase() === 'RIDE100') {
      setDiscount(100);
      setPromoApplied(true);
      Alert.alert('Success', 'Promo code applied! Rs. 100 off');
    } else {
      Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      const response = await ridesAPI.bookRide({
        driverId: driver.id,
        pickup: {
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          address: pickup.address,
        },
        dropoff: {
          latitude: dropoff.latitude,
          longitude: dropoff.longitude,
          address: dropoff.address,
        },
        fare: totalFare,
        paymentMethod,
        promoCode: promoApplied ? promoCode : null,
      });

      navigation.reset({
        index: 0,
        routes: [
          { name: 'Drawer' },
          {
            name: 'RideTracking',
            params: {
              ride: response.ride || { id: Date.now(), status: 'arriving' },
              driver,
              pickup,
              dropoff,
            },
          },
        ],
      });
    } catch (error) {
      // For demo purposes, navigate anyway with mock data
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Drawer' },
          {
            name: 'RideTracking',
            params: {
              ride: { id: Date.now(), status: 'arriving' },
              driver,
              pickup,
              dropoff,
              fare: totalFare,
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.routeCard, { backgroundColor: colors.surface }]}>
          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <Text style={styles.dotGreen}>●</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>PICKUP</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                {pickup?.address || 'Pickup location'}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeRow}>
            <View style={styles.routeIcon}>
              <Text style={styles.dotRed}>●</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>DROPOFF</Text>
              <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                {dropoff?.address || 'Dropoff location'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.driverCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.driverInitial}>{driver.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>
            <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
              {driver.vehicle?.model} • {driver.vehicle?.plate}
            </Text>
          </View>
          <View style={styles.etaBox}>
            <Text style={[styles.etaValue, { color: colors.primary }]}>{driver.eta || 5}</Text>
            <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>min</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  {
                    backgroundColor: paymentMethod === method.id ? colors.primary : colors.surface,
                    borderColor: paymentMethod === method.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <Text style={[styles.paymentLabel, { color: paymentMethod === method.id ? '#000' : colors.text }]}>
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Code</Text>
          <View style={[styles.promoRow, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.promoInput, { color: colors.text }]}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              editable={!promoApplied}
            />
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: promoApplied ? colors.border : colors.primary }]}
              onPress={applyPromoCode}
              disabled={promoApplied || !promoCode.trim()}
            >
              <Text style={[styles.applyText, { color: promoApplied ? colors.textSecondary : '#000' }]}>
                {promoApplied ? 'Applied' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.fareCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fareTitle, { color: colors.text }]}>Fare Breakdown</Text>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Base Fare</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>Rs. {baseFare}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Service Fee</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>Rs. {serviceFee}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: '#22c55e' }]}>Discount</Text>
              <Text style={[styles.fareValue, { color: '#22c55e' }]}>- Rs. {discount}</Text>
            </View>
          )}
          <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />
          <View style={styles.fareRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>Rs. {totalFare}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: loading ? colors.border : colors.primary }]}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.confirmText}>Confirm Booking • Rs. {totalFare}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 16, paddingBottom: 100 },
  routeCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routeIcon: { width: 24, alignItems: 'center', marginRight: 12 },
  dotGreen: { fontSize: 16, color: '#22c55e' },
  dotRed: { fontSize: 16, color: '#ef4444' },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#ddd',
    marginLeft: 11,
    marginVertical: 4,
  },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  routeAddress: { fontSize: 14 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitial: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  vehicleText: { fontSize: 14 },
  etaBox: { alignItems: 'center' },
  etaValue: { fontSize: 24, fontWeight: 'bold' },
  etaLabel: { fontSize: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  paymentOptions: { flexDirection: 'row', gap: 12 },
  paymentOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paymentIcon: { fontSize: 24, marginBottom: 4 },
  paymentLabel: { fontSize: 14, fontWeight: '600' },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: 16,
    overflow: 'hidden',
  },
  promoInput: { flex: 1, height: 50, fontSize: 16 },
  applyButton: { paddingHorizontal: 20, height: 50, justifyContent: 'center' },
  applyText: { fontSize: 14, fontWeight: 'bold' },
  fareCard: { borderRadius: 16, padding: 16 },
  fareTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: { fontSize: 14 },
  fareValue: { fontSize: 14, fontWeight: '500' },
  fareDivider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  confirmButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default BookingConfirmScreen;
