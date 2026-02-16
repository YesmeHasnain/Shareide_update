import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { pusherService } from '../../utils/pusherService';
import apiClient from '../../api/client';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', card: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444', info: '#3B82F6',
};

const BidCard = ({ bid, colors, onAccept, onReject, onCounter }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, friction: 6, tension: 40, useNativeDriver: true,
    }).start();
  }, []);

  const timeLeft = bid.expires_at
    ? Math.max(0, Math.floor((new Date(bid.expires_at) - new Date()) / 60000))
    : 15;

  return (
    <Animated.View style={[
      styles.bidCard,
      { backgroundColor: colors.card, transform: [{ scale: scaleAnim }] },
      shadows.md,
    ]}>
      <View style={styles.bidHeader}>
        <Avatar name={bid.driver?.name} size="medium" />
        <View style={styles.bidDriverInfo}>
          <Text style={[styles.bidDriverName, { color: colors.text }]}>
            {bid.driver?.name || 'Driver'}
          </Text>
          <View style={styles.bidMeta}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={[styles.bidMetaText, { color: colors.textSecondary }]}>
              {' '}{bid.driver?.rating || '4.8'}
            </Text>
            {bid.eta_minutes && (
              <Text style={[styles.bidMetaText, { color: colors.textSecondary }]}>
                {' '} · {bid.eta_minutes} min away
              </Text>
            )}
          </View>
        </View>
        <View style={styles.bidAmountBox}>
          <Text style={[styles.bidAmount, { color: colors.primary }]}>
            Rs. {bid.bid_amount}
          </Text>
          <Text style={[styles.bidTimer, { color: timeLeft < 3 ? colors.error : colors.textTertiary }]}>
            {timeLeft} min left
          </Text>
        </View>
      </View>

      {bid.note && (
        <Text style={[styles.bidNote, { color: colors.textSecondary }]}>
          "{bid.note}"
        </Text>
      )}

      <View style={styles.bidActions}>
        <TouchableOpacity
          style={[styles.bidActionBtn, { backgroundColor: colors.success }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onAccept(bid); }}
        >
          <Ionicons name="checkmark" size={18} color="#FFF" />
          <Text style={styles.bidActionText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bidActionBtn, { backgroundColor: colors.primary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCounter(bid); }}
        >
          <Ionicons name="swap-horizontal" size={18} color="#000" />
          <Text style={[styles.bidActionText, { color: '#000' }]}>Counter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bidActionBtn, { backgroundColor: colors.error + '15', borderWidth: 1, borderColor: colors.error }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onReject(bid); }}
        >
          <Ionicons name="close" size={18} color={colors.error} />
          <Text style={[styles.bidActionText, { color: colors.error }]}>Reject</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const NegotiationScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { rideRequestId, pickup, dropoff, estimatedFare } = params;

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterAmount, setCounterAmount] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Fetch existing bids
  useEffect(() => {
    fetchBids();
  }, []);

  // Subscribe to real-time bid updates
  useEffect(() => {
    let channel = null;
    const setup = async () => {
      if (!rideRequestId) return;
      try {
        channel = await pusherService.subscribe(`ride.${rideRequestId}`);
        if (channel) {
          channel.bind('bid.received', (data) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setBids(prev => {
              const exists = prev.find(b => b.id === data.bid_id);
              if (exists) return prev;
              return [{ id: data.bid_id, ...data }, ...prev];
            });
          });
        }
      } catch (e) { /* silent */ }
    };
    setup();
    return () => {
      if (channel) channel.unbind_all();
      if (rideRequestId) pusherService.unsubscribe(`ride.${rideRequestId}`);
    };
  }, [rideRequestId]);

  // Poll for new bids every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [rideRequestId]);

  const fetchBids = async () => {
    if (!rideRequestId) return;
    try {
      const res = await apiClient.get(`/ride-bids/rides/${rideRequestId}/bids`);
      if (res.data?.success) {
        setBids(res.data.data || []);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const handleAccept = async (bid) => {
    Alert.alert('Accept Bid', `Accept Rs. ${bid.bid_amount} from ${bid.driver?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: async () => {
          try {
            const res = await apiClient.post(`/ride-bids/${bid.id}/accept`);
            if (res.data?.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              const rideData = res.data.data?.rideRequest || res.data.data;
              navigation.reset({
                index: 0,
                routes: [
                  { name: 'MainTabs' },
                  {
                    name: 'RideTracking',
                    params: {
                      ride: rideData || { id: rideRequestId, status: 'accepted' },
                      driver: bid.driver,
                      pickup, dropoff,
                      fare: bid.bid_amount,
                    },
                  },
                ],
              });
            }
          } catch (e) {
            Alert.alert('Error', 'Failed to accept bid. Please try again.');
          }
        },
      },
    ]);
  };

  const handleReject = async (bid) => {
    try {
      await apiClient.post(`/ride-bids/${bid.id}/reject`);
      setBids(prev => prev.filter(b => b.id !== bid.id));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) { /* silent */ }
  };

  const handleCounter = (bid) => {
    setSelectedBid(bid);
    setCounterAmount(String(Math.round(bid.bid_amount * 0.9)));
    setShowCounterInput(true);
  };

  const submitCounter = async () => {
    if (!selectedBid || !counterAmount) return;
    try {
      await apiClient.post(`/ride-bids/${selectedBid.id}/counter`, {
        counter_amount: parseFloat(counterAmount),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCounterInput(false);
      setSelectedBid(null);
      Alert.alert('Sent', 'Counter offer sent to driver');
    } catch (e) {
      Alert.alert('Error', 'Failed to send counter offer');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Fare Negotiation</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {bids.length} driver{bids.length !== 1 ? 's' : ''} bidding
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Route Summary */}
      <View style={[styles.routeSummary, { backgroundColor: colors.card }, shadows.sm]}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {pickup?.address || 'Pickup'}
          </Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {dropoff?.address || 'Dropoff'}
          </Text>
        </View>
        <View style={[styles.fareRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Your offer</Text>
          <Text style={[styles.fareValue, { color: colors.primary }]}>Rs. {estimatedFare || '---'}</Text>
        </View>
      </View>

      {/* Waiting indicator */}
      {bids.length === 0 && !loading && (
        <View style={styles.waitingContainer}>
          <Animated.View style={[
            styles.waitingPulse,
            { backgroundColor: colors.primary, transform: [{ scale: pulseAnim }] },
          ]} />
          <View style={[styles.waitingIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="car-sport" size={32} color="#000" />
          </View>
          <Text style={[styles.waitingTitle, { color: colors.text }]}>
            Waiting for drivers...
          </Text>
          <Text style={[styles.waitingSubtitle, { color: colors.textSecondary }]}>
            Drivers nearby will see your request and submit offers
          </Text>
        </View>
      )}

      {/* Bids list */}
      <FlatList
        data={bids}
        keyExtractor={(item) => (item.id || item.bid_id || Math.random()).toString()}
        renderItem={({ item }) => (
          <BidCard
            bid={item}
            colors={colors}
            onAccept={handleAccept}
            onReject={handleReject}
            onCounter={handleCounter}
          />
        )}
        contentContainerStyle={styles.bidsList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {/* Counter offer input */}
      {showCounterInput && (
        <View style={styles.counterOverlay}>
          <TouchableOpacity
            style={styles.counterBackdrop}
            onPress={() => setShowCounterInput(false)}
          />
          <View style={[styles.counterSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.counterHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.counterTitle, { color: colors.text }]}>
              Counter Offer to {selectedBid?.driver?.name}
            </Text>
            <Text style={[styles.counterSubtitle, { color: colors.textSecondary }]}>
              Driver asked Rs. {selectedBid?.bid_amount}
            </Text>
            <View style={styles.counterInputRow}>
              <Text style={[styles.counterPrefix, { color: colors.text }]}>Rs.</Text>
              <TextInput
                style={[styles.counterInput, { color: colors.text, borderColor: colors.primary }]}
                value={counterAmount}
                onChangeText={setCounterAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <View style={styles.counterQuickAmounts}>
              {[-50, -20, 0, 20, 50].map(offset => {
                const amt = Math.round((selectedBid?.bid_amount || 0) + offset);
                return (
                  <TouchableOpacity
                    key={offset}
                    style={[styles.quickAmountBtn, {
                      backgroundColor: counterAmount === String(amt) ? colors.primary : colors.background,
                    }]}
                    onPress={() => setCounterAmount(String(amt))}
                  >
                    <Text style={[styles.quickAmountText, {
                      color: counterAmount === String(amt) ? '#000' : colors.text,
                    }]}>
                      {offset > 0 ? '+' : ''}{offset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.counterSubmitBtn, { backgroundColor: colors.primary }]}
              onPress={submitCounter}
            >
              <Text style={styles.counterSubmitText}>Send Counter Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', ...shadows.sm,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.h5, fontWeight: '700' },
  headerSubtitle: { fontSize: typography.caption, marginTop: 2 },
  routeSummary: {
    marginHorizontal: spacing.lg, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  routeLine: { width: 2, height: 16, marginLeft: 4, marginVertical: 4 },
  routeText: { flex: 1, fontSize: typography.bodySmall },
  fareRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1,
  },
  fareLabel: { fontSize: typography.bodySmall },
  fareValue: { fontSize: typography.h4, fontWeight: '800' },
  waitingContainer: { alignItems: 'center', paddingVertical: spacing.xxxl },
  waitingPulse: {
    position: 'absolute', top: 40, width: 100, height: 100, borderRadius: 50, opacity: 0.2,
  },
  waitingIcon: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  waitingTitle: { fontSize: typography.h5, fontWeight: '700', marginBottom: spacing.sm },
  waitingSubtitle: { fontSize: typography.bodySmall, textAlign: 'center', paddingHorizontal: 40 },
  bidsList: { paddingHorizontal: spacing.lg },
  bidCard: {
    borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md,
  },
  bidHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  bidDriverInfo: { flex: 1, marginLeft: spacing.md },
  bidDriverName: { fontSize: typography.body, fontWeight: '600' },
  bidMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  bidMetaText: { fontSize: typography.caption },
  bidAmountBox: { alignItems: 'flex-end' },
  bidAmount: { fontSize: typography.h4, fontWeight: '800' },
  bidTimer: { fontSize: 10, marginTop: 2 },
  bidNote: {
    fontSize: typography.bodySmall, fontStyle: 'italic',
    marginBottom: spacing.md, paddingLeft: spacing.sm,
  },
  bidActions: { flexDirection: 'row', gap: spacing.sm },
  bidActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: borderRadius.md, gap: 4,
  },
  bidActionText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  counterOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  counterBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  counterSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  counterHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  counterTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  counterSubtitle: { fontSize: 14, marginBottom: 16 },
  counterInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  counterPrefix: { fontSize: 24, fontWeight: '700', marginRight: 8 },
  counterInput: {
    flex: 1, fontSize: 28, fontWeight: '800', borderBottomWidth: 2,
    paddingVertical: 8, textAlign: 'center',
  },
  counterQuickAmounts: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  quickAmountBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  quickAmountText: { fontSize: 14, fontWeight: '600' },
  counterSubmitBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  counterSubmitText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default NegotiationScreen;
