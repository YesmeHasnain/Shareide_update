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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

const PRIMARY_COLOR = '#FCC014';

const RideRequestsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [accepting, setAccepting] = useState(null);

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
        fetchRequests(loc.coords.latitude, loc.coords.longitude);
      } else {
        fetchRequests();
      }
    } catch (e) {
      fetchRequests();
    }
  };

  const fetchRequests = async (lat, lng) => {
    try {
      const params = { radius: 5 };
      if (lat && lng) {
        params.latitude = lat;
        params.longitude = lng;
      }

      const response = await client.get('/ride-requests/available', { params });
      if (response.data.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error) {
      console.log('Fetch requests error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (currentLocation) {
      fetchRequests(currentLocation.latitude, currentLocation.longitude);
    } else {
      fetchRequests();
    }
  };

  const acceptRequest = async (request) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAccepting(request.id);

    try {
      const response = await client.post(`/ride-requests/${request.id}/accept`);
      if (response.data.success) {
        Alert.alert('Accepted!', 'You have accepted this ride request. Contact the passenger now.', [
          {
            text: 'Chat',
            onPress: () => navigation.navigate('SharedRideChat', {
              rideId: request.id,
              passengerId: request.user_id,
              passengerName: request.user?.name,
              passengerPhone: request.user?.phone,
              rideInfo: {
                pickup_address: request.pickup_address,
                dropoff_address: request.dropoff_address,
              }
            }),
          },
          { text: 'OK' },
        ]);
        handleRefresh();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept request');
    } finally {
      setAccepting(null);
    }
  };

  const callPassenger = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const openWhatsApp = (request) => {
    const phone = request.user?.phone?.replace(/[^0-9]/g, '') || '';
    const message = `Hi! I'm a SHAREIDE driver. I can pick you up from ${request.pickup_address}. Are you still looking for a ride?`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return 'ASAP';
    if (diffMins < 60) return `In ${diffMins} mins`;
    if (diffMins < 1440) return `In ${Math.floor(diffMins / 60)} hrs`;
    return date.toLocaleDateString();
  };

  const calculateDistance = (lat, lng) => {
    if (!currentLocation) return null;
    const R = 6371;
    const dLat = (lat - currentLocation.latitude) * Math.PI / 180;
    const dLon = (lng - currentLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const renderRequest = ({ item }) => {
    const distance = calculateDistance(item.pickup_lat, item.pickup_lng);
    const isAccepting = accepting === item.id;

    return (
      <View style={[styles.requestCard, { backgroundColor: colors.card }]}>
        {/* User Info */}
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: PRIMARY_COLOR + '20' }]}>
            <Ionicons name="person" size={20} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.user?.name || 'Passenger'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={PRIMARY_COLOR} />
              <Text style={[styles.rating, { color: colors.textSecondary }]}>
                {item.user?.rating || '5.0'} • {item.seats_needed} seat{item.seats_needed > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          {distance && (
            <View style={[styles.distanceBadge, { backgroundColor: PRIMARY_COLOR }]}>
              <Text style={styles.distanceText}>{distance} km</Text>
            </View>
          )}
        </View>

        {/* Route */}
        <View style={styles.routeSection}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: PRIMARY_COLOR }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{item.pickup_address}</Text>
          </View>
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={styles.routeRow}>
            <View style={[styles.pin, { backgroundColor: PRIMARY_COLOR }]} />
            <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{item.dropoff_address}</Text>
          </View>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{formatTime(item.departure_time)}</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>Rs. {item.offered_price}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <Text style={[styles.notes, { color: colors.textSecondary }]} numberOfLines={1}>
            <Ionicons name="chatbubble-outline" size={13} color={colors.textSecondary} /> {item.notes}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => callPassenger(item.user?.phone)}
          >
            <Ionicons name="call" size={18} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#25D366' + '20' }]}
            onPress={() => openWhatsApp(item)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptBtn, { opacity: isAccepting ? 0.7 : 1 }]}
            onPress={() => acceptRequest(item)}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <Text style={styles.acceptBtnText}>Accept Ride</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Ride Requests</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        No passengers looking for rides within 5km. Pull down to refresh.
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Requests</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: PRIMARY_COLOR + '15' }]}>
        <Ionicons name="people" size={20} color={PRIMARY_COLOR} />
        <Text style={[styles.infoText, { color: colors.text, marginLeft: 8, flex: 1 }]}>
          Passengers looking for rides within 5km
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderRequest}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY_COLOR} />
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  requestCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  rating: { fontSize: 12, marginLeft: 4 },
  distanceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  distanceText: { fontSize: 12, fontWeight: '700', color: '#000' },
  routeSection: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  pin: { width: 10, height: 14, borderRadius: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  routeLine: { width: 2, height: 20, marginLeft: 4, marginVertical: 2 },
  routeText: { fontSize: 14, marginLeft: 12, flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  infoText: { fontSize: 13, marginLeft: 4 },
  priceTag: { backgroundColor: PRIMARY_COLOR, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
  priceText: { fontSize: 14, fontWeight: '700', color: '#000' },
  notes: { fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 48, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});

export default RideRequestsScreen;
