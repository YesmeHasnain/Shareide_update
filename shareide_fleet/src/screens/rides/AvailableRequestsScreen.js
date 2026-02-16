import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, RefreshControl, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../../components/Avatar';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import apiClient from '../../api/client';

const AvailableRequestsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bidAmounts, setBidAmounts] = useState({});
  const [bidNotes, setBidNotes] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
    fetchRequests();
    // Poll every 15 seconds
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords);
      }
    } catch (e) { /* silent */ }
  };

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get('/ride-requests/available', {
        params: location ? { latitude: location.latitude, longitude: location.longitude, radius: 10 } : {},
      });
      if (res.data?.success) {
        setRequests(res.data.data || []);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  };

  const handleBid = async (requestId) => {
    const amount = parseFloat(bidAmounts[requestId]);
    if (!amount || amount < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount');
      return;
    }
    setSubmitting(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await apiClient.post(`/ride-bids/rides/${requestId}/bid`, {
        bid_amount: amount,
        eta_minutes: 5,
        note: bidNotes[requestId] || '',
      });
      if (res.data?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Bid Placed!', `Your bid of Rs. ${amount} has been sent to the rider.`);
        // Remove from list or mark as bid
        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to place bid';
      Alert.alert('Error', msg);
    }
    setSubmitting(prev => ({ ...prev, [requestId]: false }));
  };

  const renderRequest = ({ item }) => {
    const fare = item.estimated_fare || item.estimated_price || 0;
    const distance = item.distance_km ? `${parseFloat(item.distance_km).toFixed(1)} km` : '';

    return (
      <View style={[styles.card, { backgroundColor: colors.card }, shadows.md]}>
        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeIndicator}>
            <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
            <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
              {item.pickup_address || 'Pickup'}
            </Text>
            <View style={{ height: 16 }} />
            <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
              {item.drop_address || item.dropoff_address || 'Dropoff'}
            </Text>
          </View>
        </View>

        {/* Ride Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Ionicons name="cash" size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>Rs. {fare}</Text>
          </View>
          {distance ? (
            <View style={styles.infoBadge}>
              <Ionicons name="navigate" size={14} color={colors.info} />
              <Text style={[styles.infoText, { color: colors.text }]}>{distance}</Text>
            </View>
          ) : null}
          <View style={styles.infoBadge}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{item.seats || 1} seat</Text>
          </View>
        </View>

        {/* Rider Info */}
        {item.rider && (
          <View style={styles.riderRow}>
            <Avatar name={item.rider.name} size="small" />
            <Text style={[styles.riderName, { color: colors.text }]}>{item.rider.name}</Text>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={[styles.riderRating, { color: colors.textSecondary }]}>
              {item.rider.rating || '4.8'}
            </Text>
          </View>
        )}

        {/* Bid Input */}
        <View style={styles.bidSection}>
          <Text style={[styles.bidLabel, { color: colors.textSecondary }]}>Your Offer</Text>
          <View style={styles.bidInputRow}>
            <Text style={[styles.bidPrefix, { color: colors.text }]}>Rs.</Text>
            <TextInput
              style={[styles.bidInput, { color: colors.text, borderColor: colors.primary }]}
              placeholder={String(fare)}
              placeholderTextColor={colors.textTertiary}
              value={bidAmounts[item.id] || ''}
              onChangeText={(text) => setBidAmounts(prev => ({ ...prev, [item.id]: text }))}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.bidBtn, { backgroundColor: submitting[item.id] ? colors.textTertiary : colors.primary }]}
              onPress={() => handleBid(item.id)}
              disabled={submitting[item.id]}
            >
              <Text style={styles.bidBtnText}>
                {submitting[item.id] ? 'Sending...' : 'Place Bid'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick bid amounts */}
          <View style={styles.quickBids}>
            {[-10, 0, 10, 20].map(offset => {
              const amt = Math.round(fare + (fare * offset / 100));
              return (
                <TouchableOpacity
                  key={offset}
                  style={[styles.quickBidBtn, {
                    backgroundColor: bidAmounts[item.id] === String(amt) ? colors.primary : colors.background,
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBidAmounts(prev => ({ ...prev, [item.id]: String(amt) }));
                  }}
                >
                  <Text style={[styles.quickBidText, {
                    color: bidAmounts[item.id] === String(amt) ? '#000' : colors.text,
                  }]}>
                    {offset > 0 ? `+${offset}%` : offset === 0 ? 'Base' : `${offset}%`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Available Requests</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchRequests(); }}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderRequest}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No requests nearby</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                New ride requests will appear here automatically
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.h5, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  routeSection: { flexDirection: 'row', marginBottom: 12 },
  routeIndicator: { alignItems: 'center', marginRight: 12, paddingTop: 2 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeLine: { width: 2, height: 20, marginVertical: 2 },
  routeInfo: { flex: 1 },
  routeAddress: { fontSize: 14, fontWeight: '500' },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, fontWeight: '600' },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  riderName: { flex: 1, fontSize: 14, fontWeight: '500' },
  riderRating: { fontSize: 13 },
  bidSection: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 },
  bidLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  bidInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bidPrefix: { fontSize: 18, fontWeight: '700' },
  bidInput: {
    flex: 1, fontSize: 20, fontWeight: '700', borderBottomWidth: 2,
    paddingVertical: 4, textAlign: 'center',
  },
  bidBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  bidBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  quickBids: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickBidBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  quickBidText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
});

export default AvailableRequestsScreen;
