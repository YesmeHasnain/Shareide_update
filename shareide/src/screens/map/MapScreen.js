import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { MapViewComponent } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock nearby drivers for demonstration
const generateMockDrivers = (userLocation) => {
  if (!userLocation) return [];

  const drivers = [];
  const numDrivers = Math.floor(Math.random() * 5) + 3; // 3-7 drivers

  for (let i = 0; i < numDrivers; i++) {
    drivers.push({
      id: `driver-${i}`,
      name: ['Ahmed', 'Hassan', 'Ali', 'Usman', 'Bilal', 'Imran', 'Farhan'][i % 7],
      latitude: userLocation.latitude + (Math.random() * 0.02 - 0.01),
      longitude: userLocation.longitude + (Math.random() * 0.02 - 0.01),
      heading: Math.random() * 360,
      rating: (4 + Math.random()).toFixed(1),
      vehicle: ['Toyota Corolla', 'Honda Civic', 'Suzuki Cultus', 'Honda City', 'Toyota Yaris'][i % 5],
      eta: Math.floor(Math.random() * 10) + 2, // 2-12 minutes
    });
  }

  return drivers;
};

const MapScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user location and nearby drivers
  const fetchLocationAndDrivers = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);

      // Generate mock drivers around user location
      const drivers = generateMockDrivers(coords);
      setNearbyDrivers(drivers);
    } catch (error) {
      console.log('Error getting location:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationAndDrivers();

    // Refresh drivers periodically
    const interval = setInterval(() => {
      if (userLocation) {
        const drivers = generateMockDrivers(userLocation);
        setNearbyDrivers(drivers);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchLocationAndDrivers]);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    fetchLocationAndDrivers();
  };

  const handleDriverPress = (type, driver) => {
    if (type === 'driver') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDriver(driver);
    }
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('LocationSearch', { type: 'pickup' });
  };

  const handleBookRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('LocationSearch', { type: 'pickup' });
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToCoordinate(userLocation, 500);
    }
  };

  const closeDriverCard = () => {
    setSelectedDriver(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* Full Screen Map */}
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        showUserLocation
        showCenterButton={false}
        showDrivers
        drivers={nearbyDrivers}
        onMarkerPress={handleDriverPress}
        centerOnUser
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.card }, shadows.lg]}
          onPress={handleSearchPress}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={22} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            Where would you like to go?
          </Text>
          <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('ScheduleRide');
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionChip, { backgroundColor: colors.card }, shadows.sm]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('SavedPlaces');
            }}
          >
            <Ionicons name="home" size={16} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionChip, { backgroundColor: colors.card }, shadows.sm]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('SavedPlaces');
            }}
          >
            <Ionicons name="briefcase" size={16} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionChip, { backgroundColor: colors.card }, shadows.sm]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('SharedRides');
            }}
          >
            <Ionicons name="people" size={16} color={colors.info} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Carpool</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControlsContainer}>
        <TouchableOpacity
          style={[styles.mapControlButton, { backgroundColor: colors.card }, shadows.md]}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="refresh" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mapControlButton, { backgroundColor: colors.card }, shadows.md]}
          onPress={handleCenterOnUser}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Drivers Count Badge */}
      {nearbyDrivers.length > 0 && (
        <View style={[styles.driversCountBadge, { backgroundColor: colors.card }, shadows.md]}>
          <View style={[styles.driversCountDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.driversCountText, { color: colors.text }]}>
            {nearbyDrivers.length} drivers nearby
          </Text>
        </View>
      )}

      {/* Selected Driver Card */}
      {selectedDriver && (
        <View style={[styles.driverCard, { backgroundColor: colors.card }, shadows.xl]}>
          <TouchableOpacity style={styles.closeDriverCard} onPress={closeDriverCard}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.driverCardContent}>
            <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="car-sport" size={24} color="#000" />
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.text }]}>{selectedDriver.name}</Text>
              <Text style={[styles.driverVehicle, { color: colors.textSecondary }]}>{selectedDriver.vehicle}</Text>
              <View style={styles.driverStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color={colors.star} />
                  <Text style={[styles.statText, { color: colors.text }]}>{selectedDriver.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>{selectedDriver.eta} min away</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Book Ride Button */}
      <View style={[styles.bookButtonContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookRide}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#F7931E', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            <Ionicons name="car-sport" size={24} color="#000" />
            <Text style={styles.bookButtonText}>Book a Ride</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding nearby drivers...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.body,
  },
  searchDivider: {
    width: 1,
    height: 24,
  },
  scheduleButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  mapControlsContainer: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    transform: [{ translateY: -60 }],
    gap: spacing.md,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driversCountBadge: {
    position: 'absolute',
    left: spacing.lg,
    top: '50%',
    transform: [{ translateY: -20 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  driversCountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  driversCountText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  driverCard: {
    position: 'absolute',
    bottom: 120,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  closeDriverCard: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: 2,
  },
  driverVehicle: {
    fontSize: typography.bodySmall,
    marginBottom: spacing.sm,
  },
  driverStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.caption,
    fontWeight: '500',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bookButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.goldLg,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: spacing.md,
  },
  bookButtonText: {
    fontSize: typography.h5,
    fontWeight: '700',
    color: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.body,
  },
});

export default MapScreen;
