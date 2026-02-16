import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

const AvailableRidesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rides, setRides] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Bid Modal
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidSeats, setBidSeats] = useState('1');
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        fetchRides(loc.coords.latitude, loc.coords.longitude);
      } else {
        fetchRides();
      }
    } catch (e) {
      fetchRides();
    }
  };

  const fetchRides = async (lat, lng) => {
    try {
      const params = { radius: 5 }; // 5km radius
      if (lat && lng) {
        params.latitude = lat;
        params.longitude = lng;
      }

      const response = await client.get('/shared-rides/available', { params });
      if (response.data.success) {
        setRides(response.data.rides || []);
      }
    } catch (error) {
      console.log('Fetch rides error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (currentLocation) {
      fetchRides(currentLocation.latitude, currentLocation.longitude);
    } else {
      fetchRides();
    }
  };

  const openBidModal = (ride) => {
    setSelectedRide(ride);
    setBidAmount(ride.price_per_seat?.toString() || '');
    setBidSeats('1');
    setShowBidModal(true);
  };

  const submitBid = async () => {
    if (!bidAmount || isNaN(bidAmount)) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    setBidding(true);
    try {
      const response = await client.post(`/shared-rides/${selectedRide.id}/bid`, {
        bid_amount: parseInt(bidAmount),
        seats_requested: parseInt(bidSeats),
      });

      if (response.data.success) {
        setShowBidModal(false);
        Alert.alert('Success', 'Your bid has been submitted! You can chat with the driver now.', [
          {
            text: 'Chat Now',
            onPress: () => navigation.navigate('RideChat', { rideId: selectedRide.id, driverId: selectedRide.driver_id }),
          },
          { text: 'OK' },
        ]);
        handleRefresh();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit bid');
    } finally {
      setBidding(false);
    }
  };

  const openChat = (ride) => {
    navigation.navigate('RideChat', { rideId: ride.id, driverId: ride.driver_id });
  };

  const shareOnWhatsApp = (ride) => {
    const message = `🚗 Ride Available!\n\n📍 From: ${ride.pickup_address}\n📍 To: ${ride.dropoff_address}\n⏰ Time: ${new Date(ride.departure_time).toLocaleString()}\n💰 Price: Rs. ${ride.price_per_seat}/seat\n🪑 Seats: ${ride.available_seats}\n\nBook on SHAREIDE app!`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed');
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `In ${diffMins} mins`;
    if (diffMins < 1440) return `In ${Math.floor(diffMins / 60)} hrs`;
    return date.toLocaleDateString();
  };

  const calculateDistance = (lat, lng) => {
    if (!currentLocation) return null;
    const R = 6371; // km
    const dLat = (lat - currentLocation.latitude) * Math.PI / 180;
    const dLon = (lng - currentLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const renderRide = ({ item }) => {
    const distance = calculateDistance(item.pickup_lat, item.pickup_lng);

    return (
      <View style={[styles.rideCard, { backgroundColor: colors.card }]}>
        {/* Driver Info */}
        <View style={styles.driverRow}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>{item.driver?.name || 'Driver'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {item.driver?.rating || '5.0'} • {item.driver?.vehicle_model || 'Car'}
              </Text>
            </View>
          </View>
          {distance && (
            <View style={[styles.distanceBadge, { backgroundColor: colors.inputBackground }]}>
              <Text style={[styles.distanceText, { color: colors.text }]}>{distance} km</Text>
            </View>
          )}
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{item.pickup_address}</Text>
          </View>
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={styles.routeRow}>
            <View style={[styles.pin, { backgroundColor: colors.primary }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{item.dropoff_address}</Text>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{formatTime(item.departure_time)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.available_seats} seats</Text>
          </View>
          <View style={[styles.priceTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.priceText}>Rs. {item.price_per_seat}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={1}>
            💬 {item.notes}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => openChat(item)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => shareOnWhatsApp(item)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bidBtn, { backgroundColor: colors.primary }]}
            onPress={() => openBidModal(item)}
          >
            <Text style={styles.bidBtnText}>Place Bid</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Rides Available</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        No shared rides found within 5km. Pull down to refresh.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Available Rides</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text, marginLeft: 8, flex: 1 }]}>
          Showing rides within 5km of your location
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderRide}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bid Modal */}
      <Modal visible={showBidModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Place Your Bid</Text>
              <TouchableOpacity onPress={() => setShowBidModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRide && (
              <>
                <View style={[styles.ridePreview, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                    {selectedRide.pickup_address} → {selectedRide.dropoff_address}
                  </Text>
                  <Text style={[styles.previewPrice, { color: colors.text }]}>
                    Driver's Price: Rs. {selectedRide.price_per_seat}/seat
                  </Text>
                </View>

                <Text style={[styles.inputLabel, { color: colors.text }]}>Your Bid Amount (per seat)</Text>
                <View style={[styles.bidInputBox, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.rsLabel, { color: colors.primary }]}>Rs.</Text>
                  <TextInput
                    style={[styles.bidInput, { color: colors.text }]}
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="number-pad"
                    placeholder="Enter amount"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: colors.text }]}>Seats Needed</Text>
                <View style={styles.seatsRow}>
                  {['1', '2', '3', '4'].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.seatBtn,
                        { backgroundColor: bidSeats === num ? colors.primary : colors.inputBackground },
                      ]}
                      onPress={() => setBidSeats(num)}
                    >
                      <Text style={[styles.seatBtnText, { color: bidSeats === num ? '#000' : colors.text }]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.submitBidBtn, { backgroundColor: colors.primary, opacity: bidding ? 0.7 : 1 }]}
                  onPress={submitBid}
                  disabled={bidding}
                >
                  {bidding ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.submitBidText}>Submit Bid</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 15, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { fontSize: 12, marginLeft: 4 },
  distanceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 12, fontWeight: '600' },
  routeSection: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pin: { width: 10, height: 14, borderRadius: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  routeLine: { width: 2, height: 20, marginLeft: 4, marginVertical: 2 },
  routeText: { fontSize: 14, marginLeft: 12, flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  infoText: { fontSize: 13, marginLeft: 4 },
  priceTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
  priceText: { fontSize: 14, fontWeight: '700', color: '#000' },
  notes: { fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, gap: 6 },
  actionText: { fontSize: 13, fontWeight: '600' },
  bidBtn: { flex: 1.5, alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10 },
  bidBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  ridePreview: { padding: 12, borderRadius: 12, marginBottom: 20 },
  previewText: { fontSize: 13 },
  previewPrice: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  bidInputBox: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  rsLabel: { fontSize: 16, fontWeight: '600' },
  bidInput: { flex: 1, fontSize: 16, marginLeft: 8 },
  seatsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  seatBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  seatBtnText: { fontSize: 16, fontWeight: '600' },
  submitBidBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  submitBidText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default AvailableRidesScreen;
