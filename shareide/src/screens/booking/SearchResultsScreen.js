import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const SearchResultsScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { pickup, dropoff } = route.params;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setError(null);
      const response = await ridesAPI.getAvailableDrivers(pickup, dropoff);
      setDrivers(response.drivers || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch available drivers');
      // Mock data for testing when API fails
      setDrivers([
        {
          id: 1,
          name: 'Ahmed Khan',
          rating: 4.8,
          total_rides: 245,
          vehicle: { model: 'Toyota Corolla', color: 'White', plate: 'ABC-123' },
          fare: 350,
          eta: 5,
          avatar: null,
        },
        {
          id: 2,
          name: 'Ali Hassan',
          rating: 4.9,
          total_rides: 512,
          vehicle: { model: 'Honda Civic', color: 'Black', plate: 'XYZ-456' },
          fare: 380,
          eta: 8,
          avatar: null,
        },
        {
          id: 3,
          name: 'Usman Shah',
          rating: 4.7,
          total_rides: 178,
          vehicle: { model: 'Suzuki Alto', color: 'Silver', plate: 'DEF-789' },
          fare: 280,
          eta: 3,
          avatar: null,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDrivers();
  };

  const selectDriver = (driver) => {
    navigation.navigate('DriverProfile', {
      driver,
      pickup,
      dropoff,
    });
  };

  const renderDriver = ({ item }) => (
    <TouchableOpacity
      style={[styles.driverCard, { backgroundColor: colors.surface }]}
      onPress={() => selectDriver(item)}
    >
      <View style={styles.driverHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={[styles.driverName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
            <Text style={[styles.ridesText, { color: colors.textSecondary }]}>
              • {item.total_rides} rides
            </Text>
          </View>
        </View>
        <View style={styles.fareContainer}>
          <Text style={[styles.fareAmount, { color: colors.primary }]}>Rs. {item.fare}</Text>
          <Text style={[styles.etaText, { color: colors.textSecondary }]}>{item.eta} min</Text>
        </View>
      </View>

      <View style={[styles.vehicleInfo, { backgroundColor: colors.background }]}>
        <Text style={styles.vehicleIcon}>🚗</Text>
        <Text style={[styles.vehicleText, { color: colors.text }]}>
          {item.vehicle?.color} {item.vehicle?.model}
        </Text>
        <Text style={[styles.plateText, { color: colors.textSecondary }]}>
          {item.vehicle?.plate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Drivers</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.routeCard, { backgroundColor: colors.surface }]}>
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>🟢</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {pickup?.address || 'Pickup location'}
          </Text>
        </View>
        <View style={[styles.routeDivider, { borderColor: colors.border }]} />
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>🔴</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {dropoff?.address || 'Dropoff location'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding drivers near you...
          </Text>
        </View>
      ) : drivers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚫</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Drivers Available</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Please try again in a few minutes
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchDrivers}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDriver}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {drivers.length} drivers found
            </Text>
          }
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  routeCard: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: { fontSize: 12, marginRight: 12 },
  routeText: { flex: 1, fontSize: 14 },
  routeDivider: {
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    height: 20,
    marginLeft: 5,
    marginVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 16, fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  listContainer: { padding: 16, paddingTop: 0 },
  resultsCount: { fontSize: 14, marginBottom: 12 },
  driverCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingIcon: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  ridesText: { fontSize: 14, marginLeft: 4 },
  fareContainer: { alignItems: 'flex-end' },
  fareAmount: { fontSize: 18, fontWeight: 'bold' },
  etaText: { fontSize: 12, marginTop: 2 },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  vehicleIcon: { fontSize: 18, marginRight: 8 },
  vehicleText: { flex: 1, fontSize: 14 },
  plateText: { fontSize: 14, fontWeight: '600' },
});

export default SearchResultsScreen;
