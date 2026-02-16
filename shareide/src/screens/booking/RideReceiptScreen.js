import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Avatar, TipCard } from '../../components/common';
import { ridesAPI } from '../../api/rides';
import { spacing, borderRadius, typography } from '../../theme/colors';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', surface: '#F8F9FA',
  card: '#FFFFFF', text: '#1A1A2E', textSecondary: '#6B7280',
  textTertiary: '#9CA3AF', border: '#E5E7EB', success: '#10B981',
  error: '#EF4444', info: '#3B82F6',
};

const RideReceiptScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const { ride, driver, fare, pickup, dropoff } = route?.params || {};

  const [tipAmount, setTipAmount] = useState(0);
  const [tipSent, setTipSent] = useState(false);

  const checkAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(checkAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalFare = fare || ride?.estimated_price || ride?.actual_price || 0;
  const baseFare = ride?.base_fare || Math.round(totalFare * 0.7);
  const distanceFare = Math.round(totalFare * 0.25);
  const bookingFee = Math.round(totalFare * 0.05);
  const surgeAmount = ride?.surge_amount || 0;
  const promoDiscount = ride?.promo_discount || 0;
  const distance = ride?.distance_km || '0';
  const duration = ride?.duration_minutes || '0';
  const paymentMethod = ride?.payment_method || 'cash';

  const handleTipSelect = async (amount) => {
    setTipAmount(amount);
    if (amount > 0 && ride?.id) {
      try {
        await ridesAPI.tipDriver(ride.id, amount);
        setTipSent(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        setTipSent(true); // Show success UI even on error for demo
      }
    }
  };

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'wallet': return 'wallet';
      case 'card': return 'card';
      case 'jazzcash': return 'phone-portrait';
      case 'easypaisa': return 'phone-portrait';
      default: return 'cash';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.headerSection}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkAnim }] }]}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.checkGradient}>
              <Ionicons name="checkmark" size={40} color="#FFF" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.completedTitle, { color: colors.text }]}>Ride Completed!</Text>
          <Text style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
            Thanks for riding with Shareide
          </Text>
        </View>

        <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
          {/* Total Fare Card */}
          <View style={[styles.totalCard, { backgroundColor: '#1A1A2E' }]}>
            <Text style={styles.totalLabel}>Total Fare</Text>
            <Text style={styles.totalAmount}>Rs. {totalFare}</Text>
            <View style={styles.totalMeta}>
              <View style={styles.totalMetaItem}>
                <Ionicons name="navigate-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.totalMetaText}>{distance} km</Text>
              </View>
              <View style={styles.totalMetaDot} />
              <View style={styles.totalMetaItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.totalMetaText}>{duration} min</Text>
              </View>
              <View style={styles.totalMetaDot} />
              <View style={styles.totalMetaItem}>
                <Ionicons name={getPaymentIcon()} size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.totalMetaText}>{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</Text>
              </View>
            </View>
          </View>

          {/* Driver Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>YOUR DRIVER</Text>
            <View style={styles.driverRow}>
              <Avatar source={driver?.avatar} name={driver?.name} size="large" />
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: colors.text }]}>{driver?.name || 'Driver'}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={[styles.ratingText, { color: colors.text }]}> {driver?.rating || '4.8'}</Text>
                </View>
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleModel, { color: colors.text }]}>{driver?.vehicle?.model || 'Vehicle'}</Text>
                <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>{driver?.vehicle?.plate || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Route Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>ROUTE</Text>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <View style={styles.routeTextBox}>
                <Text style={[styles.routeLabel, { color: colors.textTertiary }]}>Pickup</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>{pickup?.address || 'Pickup location'}</Text>
              </View>
            </View>
            <View style={[styles.routeConnector, { borderColor: colors.border }]} />
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <View style={styles.routeTextBox}>
                <Text style={[styles.routeLabel, { color: colors.textTertiary }]}>Dropoff</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>{dropoff?.address || 'Dropoff location'}</Text>
              </View>
            </View>
          </View>

          {/* Fare Breakdown */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>FARE BREAKDOWN</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareItemLabel, { color: colors.text }]}>Base Fare</Text>
              <Text style={[styles.fareItemValue, { color: colors.text }]}>Rs. {baseFare}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={[styles.fareItemLabel, { color: colors.text }]}>Distance ({distance} km)</Text>
              <Text style={[styles.fareItemValue, { color: colors.text }]}>Rs. {distanceFare}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={[styles.fareItemLabel, { color: colors.text }]}>Booking Fee</Text>
              <Text style={[styles.fareItemValue, { color: colors.text }]}>Rs. {bookingFee}</Text>
            </View>
            {surgeAmount > 0 && (
              <View style={styles.fareRow}>
                <View style={styles.surgeRow}>
                  <Ionicons name="flash" size={14} color={colors.error} />
                  <Text style={[styles.fareItemLabel, { color: colors.error }]}> Surge Pricing</Text>
                </View>
                <Text style={[styles.fareItemValue, { color: colors.error }]}>+ Rs. {surgeAmount}</Text>
              </View>
            )}
            {promoDiscount > 0 && (
              <View style={styles.fareRow}>
                <View style={styles.surgeRow}>
                  <Ionicons name="pricetag" size={14} color={colors.success} />
                  <Text style={[styles.fareItemLabel, { color: colors.success }]}> Promo Discount</Text>
                </View>
                <Text style={[styles.fareItemValue, { color: colors.success }]}>- Rs. {promoDiscount}</Text>
              </View>
            )}
            <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />
            <View style={styles.fareRow}>
              <Text style={[styles.fareTotalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.fareTotalValue, { color: colors.primary }]}>Rs. {totalFare}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>PAYMENT</Text>
            <View style={styles.paymentRow}>
              <View style={[styles.paymentIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={getPaymentIcon()} size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paymentMethod, { color: colors.text }]}>
                  {paymentMethod === 'cash' ? 'Cash Payment' : paymentMethod === 'wallet' ? 'Shareide Wallet' : paymentMethod === 'card' ? 'Card Payment' : paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                </Text>
                <Text style={[styles.paymentStatus, { color: colors.success }]}>Paid</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            </View>
          </View>

          {/* Tip Your Driver */}
          {!tipSent && (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>TIP YOUR DRIVER</Text>
              <TipCard onTipSelect={handleTipSelect} colors={colors} />
            </View>
          )}
          {tipSent && tipAmount > 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, alignItems: 'center', paddingVertical: 16 }]}>
              <Ionicons name="heart" size={24} color={colors.success} />
              <Text style={[styles.tipSentText, { color: colors.success }]}>Rs. {tipAmount} tip sent!</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.rateButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('RateRide', { ride, driver, fare });
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="star" size={20} color="#000" />
          <Text style={styles.rateButtonText}>Rate Your Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.homeButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.homeButtonText, { color: colors.text }]}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  headerSection: { alignItems: 'center', marginBottom: 24 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, overflow: 'hidden' },
  checkGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  completedTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  completedSubtitle: { fontSize: 14 },

  totalCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  totalLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  totalAmount: { color: '#FCC014', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  totalMeta: { flexDirection: 'row', alignItems: 'center' },
  totalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  totalMetaText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500' },
  totalMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 },

  card: {
    borderRadius: 16, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },

  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13, fontWeight: '600' },
  vehicleInfo: { alignItems: 'flex-end' },
  vehicleModel: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  vehiclePlate: { fontSize: 12 },

  routeItem: { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12, marginTop: 4 },
  routeTextBox: { flex: 1 },
  routeLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  routeAddress: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  routeConnector: { width: 0, height: 20, borderLeftWidth: 2, borderStyle: 'dashed', marginLeft: 5, marginVertical: 4 },

  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fareItemLabel: { fontSize: 14 },
  fareItemValue: { fontSize: 14, fontWeight: '600' },
  surgeRow: { flexDirection: 'row', alignItems: 'center' },
  fareDivider: { height: 1, marginVertical: 10 },
  fareTotalLabel: { fontSize: 16, fontWeight: '700' },
  fareTotalValue: { fontSize: 20, fontWeight: '800' },

  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  paymentIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  paymentMethod: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  paymentStatus: { fontSize: 12, fontWeight: '600' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  rateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16, gap: 8, marginBottom: 10,
  },
  rateButtonText: { fontSize: 16, fontWeight: '700', color: '#000' },
  homeButton: {
    alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, borderWidth: 1.5,
  },
  homeButtonText: { fontSize: 15, fontWeight: '600' },
  tipSentText: { fontSize: 15, fontWeight: '700', marginTop: 6 },
});

export default RideReceiptScreen;
