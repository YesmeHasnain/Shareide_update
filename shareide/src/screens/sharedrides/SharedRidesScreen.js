import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Header, Card, Badge, EmptyState, Avatar } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { searchSharedRides } from '../../api/sharedRides';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  secondary: '#FFA500',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
};

const SharedRidesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const searchParams = route?.params || {};

  const fetchRides = async () => {
    try {
      const response = await searchSharedRides({
        from_lat: searchParams.fromLat,
        from_lng: searchParams.fromLng,
        to_lat: searchParams.toLat,
        to_lng: searchParams.toLng,
        seats: searchParams.seats || 1,
        date: searchParams.date,
        radius: 15,
      });
      setRides(response.data || []);
    } catch (error) {
      console.log('Error fetching shared rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [searchParams])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRides();
  };

  const formatTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderRideCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('SharedRideDetails', { rideId: item.id })}
    >
      <Card style={styles.rideCard}>
        <View style={styles.driverSection}>
          <Avatar
            source={item.driver?.avatar ? { uri: item.driver.avatar } : null}
            name={item.driver?.name}
            size={50}
          />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>{item.driver?.name || 'Driver'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.rating, { color: colors.warning }]}>{item.driver?.rating || '4.8'}</Text>
              <Text style={[styles.rides, { color: colors.textSecondary }]}>({item.driver?.total_rides || 0} rides)</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Per Seat</Text>
            <Text style={[styles.price, { color: colors.primary }]}>Rs. {item.price_per_seat}</Text>
          </View>
        </View>

        <View style={[styles.routeSection, { borderBottomColor: colors.border }]}>
          <View style={styles.routeLine}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>{item.from_address}</Text>
              <Text style={[styles.timeText, { color: colors.primary }]}>{formatTime(item.departure_time)}</Text>
            </View>
            <View style={[styles.locationRow, { marginTop: 15 }]}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>{item.to_address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDate(item.departure_time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.vehicle?.model || item.vehicle_model || item.vehicle_type}</Text>
          </View>
          <View style={styles.seatDetail}>
            <Ionicons name="people" size={16} color={colors.primary} />
            <Text style={[styles.seatDetailText, { color: colors.primary }]}>
              {(item.booked_seats || (item.total_seats - item.available_seats) || 0)}/{item.total_seats || item.available_seats}
            </Text>
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>booked</Text>
          </View>
        </View>

        {/* Passenger Previews + Seats Info */}
        <View style={styles.passengersSection}>
          <View style={styles.passengersRow}>
            {(item.passenger_previews || item.confirmed_bookings || []).slice(0, 4).map((p, index) => (
              <Avatar
                key={p.id || index}
                source={(p.photo || p.passenger?.avatar) ? { uri: p.photo || p.passenger?.avatar } : null}
                name={p.name || p.passenger?.name}
                size={28}
                style={[styles.passengerAvatar, { marginLeft: index > 0 ? -8 : 0, borderColor: colors.surface }]}
              />
            ))}
            {(item.passenger_previews || item.confirmed_bookings || []).length > 4 && (
              <View style={[styles.morePassengers, { backgroundColor: colors.surface }]}>
                <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                  +{(item.passenger_previews || item.confirmed_bookings).length - 4}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.seatsLeftText, { color: colors.success }]}>
            {item.available_seats} seat{item.available_seats !== 1 ? 's' : ''} available
          </Text>
        </View>

        <View style={styles.preferencesRow}>
          {item.ride_type && item.ride_type !== 'single' && (
            <Badge text={item.ride_type.charAt(0).toUpperCase() + item.ride_type.slice(1)} variant="warning" size="small" />
          )}
          {item.women_only && <Badge text="Women Only" variant="info" size="small" />}
          {item.ac_available && <Badge text="AC" variant="success" size="small" />}
          {item.luggage_allowed && <Badge text="Luggage OK" variant="default" size="small" />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Shared Rides" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Finding available rides...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Shared Rides" onBack={() => navigation.goBack()} />

      {searchParams.fromAddress && (
        <View style={[styles.searchBanner, { backgroundColor: colors.surface }]}>
          <View style={styles.searchRoute}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.searchText, { color: colors.textSecondary }]} numberOfLines={1}>
              {searchParams.fromAddress}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
          <View style={styles.searchRoute}>
            <Ionicons name="flag" size={16} color={colors.success} />
            <Text style={[styles.searchText, { color: colors.textSecondary }]} numberOfLines={1}>
              {searchParams.toAddress}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={rides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="car-outline"
            title="No Rides Found"
            subtitle="No shared rides available for this route. Try a different date or expand your search area."
          />
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
  },
  searchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  searchRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 5,
  },
  searchText: {
    fontSize: 13,
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  rideCard: {
    marginBottom: 15,
    padding: 15,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  rides: {
    fontSize: 12,
    marginLeft: 5,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeSection: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    height: 25,
    marginVertical: 3,
  },
  routeDetails: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
  },
  seatDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatDetailText: {
    fontSize: 13,
    fontWeight: '700',
  },
  passengersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  passengersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerAvatar: {
    borderWidth: 2,
  },
  morePassengers: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '600',
  },
  seatsLeftText: {
    fontSize: 12,
    fontWeight: '600',
  },
  preferencesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    borderRadius: 30,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SharedRidesScreen;
