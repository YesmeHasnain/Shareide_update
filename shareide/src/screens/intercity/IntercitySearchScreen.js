import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import apiClient from '../../api/client';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', card: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444', info: '#3B82F6',
};

const popularRoutes = [
  { from: 'Lahore', to: 'Islamabad', icon: 'business' },
  { from: 'Lahore', to: 'Faisalabad', icon: 'business' },
  { from: 'Islamabad', to: 'Peshawar', icon: 'business' },
  { from: 'Karachi', to: 'Hyderabad', icon: 'business' },
];

const IntercityRideCard = ({ ride, colors, onPress }) => (
  <TouchableOpacity
    style={[styles.rideCard, { backgroundColor: colors.card }, shadows.sm]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.rideCardHeader}>
      <Avatar name={ride.rider?.name} size="small" />
      <View style={styles.rideCardInfo}>
        <Text style={[styles.rideCardName, { color: colors.text }]}>
          {ride.rider?.name || 'Traveler'}
        </Text>
        <Text style={[styles.rideCardDate, { color: colors.textSecondary }]}>
          {ride.departure_datetime ? new Date(ride.departure_datetime).toLocaleDateString('en-PK', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          }) : 'Flexible'}
        </Text>
      </View>
      <View style={styles.rideCardFare}>
        <Text style={[styles.rideCardFareAmount, { color: colors.primary }]}>
          Rs. {ride.estimated_fare || '---'}
        </Text>
        <Text style={[styles.rideCardPerSeat, { color: colors.textTertiary }]}>per seat</Text>
      </View>
    </View>
    <View style={styles.rideCardRoute}>
      <View style={styles.rideCardRouteRow}>
        <View style={[styles.routeDotSmall, { backgroundColor: colors.success }]} />
        <Text style={[styles.rideCardRouteText, { color: colors.text }]} numberOfLines={1}>
          {ride.pickup_address || 'Origin'}
        </Text>
      </View>
      <View style={[styles.routeLineSmall, { backgroundColor: colors.border }]} />
      <View style={styles.rideCardRouteRow}>
        <View style={[styles.routeDotSmall, { backgroundColor: colors.error }]} />
        <Text style={[styles.rideCardRouteText, { color: colors.text }]} numberOfLines={1}>
          {ride.drop_address || 'Destination'}
        </Text>
      </View>
    </View>
    <View style={styles.rideCardFooter}>
      <View style={[styles.rideCardBadge, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="people" size={14} color={colors.textSecondary} />
        <Text style={[styles.rideCardBadgeText, { color: colors.textSecondary }]}>
          {ride.seats || 1} seat{(ride.seats || 1) > 1 ? 's' : ''}
        </Text>
      </View>
      <View style={[styles.rideCardBadge, { backgroundColor: colors.info + '12' }]}>
        <Ionicons name="car" size={14} color={colors.info} />
        <Text style={[styles.rideCardBadgeText, { color: colors.info }]}>Intercity</Text>
      </View>
      {ride.bids?.length > 0 && (
        <View style={[styles.rideCardBadge, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.rideCardBadgeText, { color: colors.primary }]}>
            {ride.bids.length} bid{ride.bids.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const IntercitySearchScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    searchRides();
  }, []);

  const searchRides = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/intercity/search', {
        params: { date: selectedDate || undefined },
      });
      if (res.data?.success) {
        setRides(res.data.data?.data || res.data.data || []);
      }
    } catch (e) {
      // Use empty state
      setRides([]);
    }
    setLoading(false);
  };

  const handleCreateRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('LocationSearch', { type: 'dropoff', serviceType: 'intercity' });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Intercity Rides</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Search Box */}
        <View style={[styles.searchBox, { backgroundColor: colors.card }, shadows.md]}>
          <View style={styles.searchRow}>
            <View style={[styles.searchDot, { backgroundColor: colors.success }]} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="From city"
              placeholderTextColor={colors.textTertiary}
              value={fromCity}
              onChangeText={setFromCity}
            />
          </View>
          <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
          <View style={styles.searchRow}>
            <View style={[styles.searchDot, { backgroundColor: colors.error }]} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="To city"
              placeholderTextColor={colors.textTertiary}
              value={toCity}
              onChangeText={setToCity}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={searchRides}
          >
            <Ionicons name="search" size={20} color="#000" />
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Routes */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Routes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {popularRoutes.map((route, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.popularCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                setFromCity(route.from);
                setToCity(route.to);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name={route.icon} size={20} color={colors.primary} />
              <Text style={[styles.popularText, { color: colors.text }]}>
                {route.from} → {route.to}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Available Rides */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Available Rides ({rides.length})
        </Text>

        {rides.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No rides found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Be the first to create an intercity ride request
            </Text>
          </View>
        )}

        {rides.map((ride, idx) => (
          <IntercityRideCard
            key={ride.id || idx}
            ride={ride}
            colors={colors}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Negotiation', {
                rideRequestId: ride.id,
                pickup: { address: ride.pickup_address, latitude: ride.pickup_lat, longitude: ride.pickup_lng },
                dropoff: { address: ride.drop_address, latitude: ride.drop_lat, longitude: ride.drop_lng },
                estimatedFare: ride.estimated_fare,
              });
            }}
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Ride Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 8, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={handleCreateRide}
        >
          <Ionicons name="add-circle" size={22} color="#000" />
          <Text style={styles.createBtnText}>Post Intercity Ride</Text>
        </TouchableOpacity>
      </View>
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
  searchBox: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  searchDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16 },
  searchDivider: { height: 1, marginLeft: 22 },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, marginTop: 12, gap: 8,
  },
  searchBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  popularScroll: { marginBottom: 20 },
  popularCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginRight: 10,
  },
  popularText: { fontSize: 14, fontWeight: '600' },
  rideCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md },
  rideCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rideCardInfo: { flex: 1, marginLeft: 10 },
  rideCardName: { fontSize: 15, fontWeight: '600' },
  rideCardDate: { fontSize: 12, marginTop: 2 },
  rideCardFare: { alignItems: 'flex-end' },
  rideCardFareAmount: { fontSize: 18, fontWeight: '800' },
  rideCardPerSeat: { fontSize: 10 },
  rideCardRoute: { marginBottom: 12 },
  rideCardRouteRow: { flexDirection: 'row', alignItems: 'center' },
  routeDotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  routeLineSmall: { width: 2, height: 12, marginLeft: 3, marginVertical: 2 },
  rideCardRouteText: { flex: 1, fontSize: 13 },
  rideCardFooter: { flexDirection: 'row', gap: 8 },
  rideCardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  rideCardBadgeText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.lg, paddingTop: 10,
    borderTopWidth: 1,
  },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 28, gap: 8,
  },
  createBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default IntercitySearchScreen;
