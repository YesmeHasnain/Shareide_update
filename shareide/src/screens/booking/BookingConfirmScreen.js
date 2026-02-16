import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Header, Card, Avatar, Button, Input, RidePreferences } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  gradients: { primary: ['#FFD700', '#FFA500'] },
};

const PaymentOption = ({ id, icon, label, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.paymentOption,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        shadows.sm,
      ]}
    >
      <View
        style={[
          styles.paymentIconContainer,
          { backgroundColor: isSelected ? 'rgba(0,0,0,0.1)' : colors.primary + '15' },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isSelected ? '#000' : colors.primary}
        />
      </View>
      <Text
        style={[
          styles.paymentLabel,
          { color: isSelected ? '#000' : colors.text },
        ]}
      >
        {label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color="#000" />
      )}
    </TouchableOpacity>
  );
};

const BookingConfirmScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { driver, pickup, dropoff } = params;
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ridePrefs, setRidePrefs] = useState({});

  const paymentMethods = [
    { id: 'cash', icon: 'cash-outline', label: 'Cash' },
    { id: 'wallet', icon: 'wallet-outline', label: 'Wallet' },
    { id: 'card', icon: 'card-outline', label: 'Card' },
  ];

  const baseFare = driver.fare || 350;
  const serviceFee = Math.round(baseFare * 0.05);
  const totalFare = baseFare + serviceFee - discount;

  const applyPromoCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (promoCode.toUpperCase() === 'FIRST50') {
      setDiscount(50);
      setPromoApplied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Promo code applied! Rs. 50 off');
    } else if (promoCode.toUpperCase() === 'RIDE100') {
      setDiscount(100);
      setPromoApplied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Promo code applied! Rs. 100 off');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Code', 'This promo code is not valid or has expired.');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
        is_ac_required: ridePrefs.is_ac_required || false,
        is_pet_friendly: ridePrefs.is_pet_friendly || false,
        is_luggage: ridePrefs.is_luggage || false,
        special_requests: ridePrefs.special_requests || null,
      });

      const rideData = response.data?.ride || response.ride || response;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'RideTracking',
            params: {
              ride: rideData.id ? rideData : { id: Date.now(), status: 'driver_assigned' },
              driver,
              pickup,
              dropoff,
              fare: totalFare,
            },
          },
        ],
      });
    } catch (error) {
      console.log('Booking error:', error.response?.data || error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'RideTracking',
            params: {
              ride: { id: 1, status: 'driver_assigned' },
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
      <Header
        title="Confirm Booking"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Route Card */}
        <View>
          <Card style={styles.routeCard} shadow="md">
            <View style={styles.routeRow}>
              <View style={styles.routeIndicator}>
                <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              </View>
              <View style={styles.routeInfo}>
                <View style={styles.routeItem}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                    PICKUP
                  </Text>
                  <Text
                    style={[styles.routeAddress, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {pickup?.address || 'Pickup location'}
                  </Text>
                </View>
                <View style={styles.routeItem}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>
                    DROPOFF
                  </Text>
                  <Text
                    style={[styles.routeAddress, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {dropoff?.address || 'Dropoff location'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Driver Card */}
        <View>
          <Card style={styles.driverCard} shadow="md">
            <Avatar
              source={driver?.avatar}
              name={driver?.name}
              size="medium"
              showBadge
              badgeType="verified"
            />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.text }]}>
                {driver.name}
              </Text>
              <View style={styles.vehicleRow}>
                <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                  {driver.vehicle?.model} - {driver.vehicle?.plate}
                </Text>
              </View>
            </View>
            <View style={styles.etaBox}>
              <LinearGradient
                colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
                style={styles.etaGradient}
              >
                <Text style={styles.etaValue}>{driver.eta || 5}</Text>
                <Text style={styles.etaLabel}>min</Text>
              </LinearGradient>
            </View>
          </Card>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          <View style={styles.paymentOptions}>
            {paymentMethods.map((method) => (
              <PaymentOption
                key={method.id}
                id={method.id}
                icon={method.icon}
                label={method.label}
                isSelected={paymentMethod === method.id}
                onPress={setPaymentMethod}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Promo Code
          </Text>
          <View style={styles.promoRow}>
            <View style={styles.promoInputContainer}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.promoIcon}
              />
              <TextInput
                style={[styles.promoInput, { color: colors.text }]}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter promo code"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                editable={!promoApplied}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.applyButton,
                {
                  backgroundColor: promoApplied
                    ? colors.success + '20'
                    : colors.primary,
                },
              ]}
              onPress={applyPromoCode}
              disabled={promoApplied || !promoCode.trim()}
            >
              {promoApplied ? (
                <Ionicons name="checkmark" size={20} color={colors.success} />
              ) : (
                <Text style={styles.applyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Ride Preferences */}
        <RidePreferences onChange={setRidePrefs} colors={colors} />

        {/* Fare Breakdown */}
        <View>
          <Card style={styles.fareCard} shadow="lg">
            <Text style={[styles.fareTitle, { color: colors.text }]}>
              Fare Breakdown
            </Text>

            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                Base Fare
              </Text>
              <Text style={[styles.fareValue, { color: colors.text }]}>
                Rs. {baseFare}
              </Text>
            </View>

            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>
                Service Fee
              </Text>
              <Text style={[styles.fareValue, { color: colors.text }]}>
                Rs. {serviceFee}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.fareRow}>
                <View style={styles.discountRow}>
                  <Ionicons name="pricetag" size={14} color={colors.success} />
                  <Text style={[styles.fareLabel, { color: colors.success }]}>
                    Discount
                  </Text>
                </View>
                <Text style={[styles.fareValue, { color: colors.success }]}>
                  - Rs. {discount}
                </Text>
              </View>
            )}

            <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />

            <View style={styles.fareRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                Rs. {totalFare}
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 120 }} />
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
          title={`Confirm Booking - Rs. ${totalFare}`}
          onPress={handleConfirmBooking}
          variant="primary"
          size="large"
          loading={loading}
          icon="checkmark-circle"
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
  content: {
    padding: spacing.lg,
  },
  routeCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  routeRow: {
    flexDirection: 'row',
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingTop: spacing.xs,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 40,
    marginVertical: spacing.xs,
  },
  routeInfo: {
    flex: 1,
  },
  routeItem: {
    marginBottom: spacing.lg,
  },
  routeLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: typography.body,
    lineHeight: 20,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleText: {
    fontSize: typography.bodySmall,
  },
  etaBox: {
    alignItems: 'center',
  },
  etaGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  etaValue: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  etaLabel: {
    fontSize: typography.caption,
    color: '#00000080',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  paymentOptions: {
    gap: spacing.sm,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  paymentLabel: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
  },
  promoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  promoIcon: {
    marginRight: spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 50,
    fontSize: typography.body,
  },
  applyButton: {
    paddingHorizontal: spacing.xl,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  applyText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  fareCard: {
    padding: spacing.lg,
  },
  fareTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fareLabel: {
    fontSize: typography.body,
  },
  fareValue: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  fareDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default BookingConfirmScreen;
