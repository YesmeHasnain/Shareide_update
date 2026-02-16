import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import apiClient from '../../api/client';

const IntercityOffersScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    pickup_address: '',
    drop_address: '',
    seats: '4',
    fare_per_seat: '',
    departure_date: '',
  });

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const res = await apiClient.get('/intercity/search');
      if (res.data?.success) {
        setOffers(res.data.data?.data || res.data.data || []);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const createOffer = async () => {
    if (!form.pickup_address || !form.drop_address || !form.fare_per_seat) {
      Alert.alert('Missing Info', 'Please fill all required fields');
      return;
    }
    try {
      const res = await apiClient.post('/intercity/driver-offer', {
        pickup_address: form.pickup_address,
        pickup_lat: 31.5204, // TODO: Use actual location picker
        pickup_lng: 74.3587,
        drop_address: form.drop_address,
        drop_lat: 33.6844,
        drop_lng: 73.0479,
        departure_datetime: form.departure_date || new Date(Date.now() + 86400000).toISOString(),
        seats: parseInt(form.seats) || 4,
        fare_per_seat: parseFloat(form.fare_per_seat),
      });
      if (res.data?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Intercity ride offer posted!');
        setShowCreate(false);
        setForm({ pickup_address: '', drop_address: '', seats: '4', fare_per_seat: '', departure_date: '' });
        fetchOffers();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create offer');
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Intercity Rides</Text>
        <TouchableOpacity onPress={() => { setShowCreate(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.info + '10' }]}>
          <Ionicons name="information-circle" size={22} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Post your intercity route and let riders book seats. Set your price per seat.
          </Text>
        </View>

        {/* My Offers */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Offers</Text>

        {offers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No offers yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first intercity ride offer
            </Text>
          </View>
        )}

        {offers.map((offer, idx) => (
          <View key={offer.id || idx} style={[styles.offerCard, { backgroundColor: colors.card }, shadows.sm]}>
            <View style={styles.offerRoute}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.offerAddress, { color: colors.text }]} numberOfLines={1}>
                {offer.pickup_address}
              </Text>
            </View>
            <View style={[styles.offerRouteLine, { backgroundColor: colors.border }]} />
            <View style={styles.offerRoute}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.offerAddress, { color: colors.text }]} numberOfLines={1}>
                {offer.drop_address}
              </Text>
            </View>
            <View style={styles.offerMeta}>
              <View style={styles.offerBadge}>
                <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                <Text style={[styles.offerBadgeText, { color: colors.textSecondary }]}>
                  {offer.departure_datetime ? new Date(offer.departure_datetime).toLocaleDateString() : 'Flexible'}
                </Text>
              </View>
              <View style={styles.offerBadge}>
                <Ionicons name="people" size={14} color={colors.textSecondary} />
                <Text style={[styles.offerBadgeText, { color: colors.textSecondary }]}>
                  {offer.seats || offer.max_passengers} seats
                </Text>
              </View>
              <Text style={[styles.offerFare, { color: colors.primary }]}>
                Rs. {offer.estimated_fare}/seat
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Sheet */}
      {showCreate && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowCreate(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Post Intercity Ride</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="From (e.g., Lahore)"
              placeholderTextColor={colors.textTertiary}
              value={form.pickup_address}
              onChangeText={t => setForm(f => ({ ...f, pickup_address: t }))}
            />
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="To (e.g., Islamabad)"
              placeholderTextColor={colors.textTertiary}
              value={form.drop_address}
              onChangeText={t => setForm(f => ({ ...f, drop_address: t }))}
            />
            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Seats"
                placeholderTextColor={colors.textTertiary}
                value={form.seats}
                onChangeText={t => setForm(f => ({ ...f, seats: t }))}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, styles.halfInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Price/seat (Rs.)"
                placeholderTextColor={colors.textTertiary}
                value={form.fare_per_seat}
                onChangeText={t => setForm(f => ({ ...f, fare_per_seat: t }))}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={createOffer}
            >
              <Text style={styles.modalBtnText}>Post Ride Offer</Text>
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
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.h5, fontWeight: '700' },
  content: { paddingHorizontal: spacing.lg },
  infoBanner: {
    flexDirection: 'row', gap: 10, padding: spacing.lg,
    borderRadius: borderRadius.lg, marginBottom: spacing.lg,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  offerCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  offerRoute: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  offerRouteLine: { width: 2, height: 12, marginLeft: 4, marginVertical: 2 },
  offerAddress: { flex: 1, fontSize: 14, fontWeight: '500' },
  offerMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  offerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  offerBadgeText: { fontSize: 12 },
  offerFare: { marginLeft: 'auto', fontSize: 16, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  modalRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  modalBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default IntercityOffersScreen;
