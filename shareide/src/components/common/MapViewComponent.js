import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Text,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, borderRadius, spacing } from '../../theme/colors';

// Try to import react-native-maps, fallback to null if not available
let MapView = null;
let Marker = null;
let PROVIDER_GOOGLE = null;

try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch (e) {
  console.log('react-native-maps not available, using placeholder');
}

// Dark theme map style for premium look
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a8a9e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d2d4a' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#252540' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d4a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#FFD70030' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e0e1a' }],
  },
];

// Placeholder Map Component for Expo Go
const PlaceholderMap = forwardRef(({
  style,
  userLocation,
  pickupLocation,
  dropoffLocation,
  drivers = [],
  showUserLocation = true,
  onMapReady,
  onRegionChange,
  onPress,
}, ref) => {
  const { colors, isDark } = useTheme();
  const [location, setLocation] = useState(userLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setLoading(false);
      onMapReady?.();
    }
  };

  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    animateToCoordinate: () => {},
    fitToCoordinates: () => {},
  }));

  return (
    <View style={[styles.placeholderContainer, { backgroundColor: isDark ? '#1a1a2e' : '#e5e5e5' }, style]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity
          style={styles.placeholderContent}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {/* Grid pattern to simulate map */}
          <View style={styles.gridPattern}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  { backgroundColor: isDark ? '#2d2d4a' : '#d0d0d0' },
                  i % 5 === 0 && { backgroundColor: isDark ? '#3d3d5a' : '#c0c0c0', height: 2 }
                ]}
              />
            ))}
          </View>

          {/* Road pattern */}
          <View style={[styles.road, styles.roadHorizontal, { backgroundColor: colors.primary + '30' }]} />
          <View style={[styles.road, styles.roadVertical, { backgroundColor: colors.primary + '30' }]} />

          {/* Center marker */}
          <View style={styles.centerMarker}>
            <View style={[styles.markerPulse, { backgroundColor: colors.primary + '30' }]} />
            <View style={[styles.markerDot, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={24} color="#000" />
            </View>
          </View>

          {/* Location info */}
          {location && (
            <View style={[styles.locationBadge, { backgroundColor: colors.card }]}>
              <Ionicons name="navigate" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Drivers indicators */}
          {drivers.length > 0 && (
            <View style={styles.driversIndicator}>
              {drivers.slice(0, 5).map((driver, index) => (
                <View
                  key={driver.id || index}
                  style={[
                    styles.driverDot,
                    {
                      backgroundColor: colors.primary,
                      left: 30 + (index * 40) + (Math.random() * 20),
                      top: 50 + (index * 30) + (Math.random() * 20),
                    }
                  ]}
                >
                  <Ionicons name="car" size={12} color="#000" />
                </View>
              ))}
            </View>
          )}

          {/* Development mode banner */}
          <View style={[styles.devBanner, { backgroundColor: colors.primary }]}>
            <Ionicons name="construct" size={14} color="#000" />
            <Text style={styles.devBannerText}>Map Preview - Build for full experience</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
});

// Real Map Component
const RealMapView = forwardRef(({
  style,
  userLocation,
  pickupLocation,
  dropoffLocation,
  drivers = [],
  showUserLocation = true,
  onMapReady,
  onRegionChange,
  onPress,
  onMarkerPress,
  initialRegion,
  children,
}, ref) => {
  const { colors, isDark } = useTheme();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(userLocation);
  const [loading, setLoading] = useState(!userLocation);

  useEffect(() => {
    if (!userLocation) {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 500) => {
      mapRef.current?.animateToRegion(region, duration);
    },
    animateToCoordinate: (coordinate, duration = 500) => {
      mapRef.current?.animateCamera({ center: coordinate }, { duration });
    },
    fitToCoordinates: (coordinates, options) => {
      mapRef.current?.fitToCoordinates(coordinates, options);
    },
  }));

  const defaultRegion = {
    latitude: location?.latitude || 31.5204,
    longitude: location?.longitude || 74.3587,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  if (!MapView) {
    return <PlaceholderMap {...{ style, userLocation, pickupLocation, dropoffLocation, drivers, showUserLocation, onMapReady, onRegionChange, onPress }} ref={ref} />;
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion || defaultRegion}
        customMapStyle={isDark ? darkMapStyle : []}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={() => {
          setLoading(false);
          onMapReady?.();
        }}
        onRegionChangeComplete={onRegionChange}
        onPress={onPress}
      >
        {/* Pickup Marker */}
        {pickupLocation && (
          <Marker coordinate={pickupLocation}>
            <View style={[styles.customMarker, { backgroundColor: colors.success }]}>
              <Ionicons name="radio-button-on" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoffLocation && (
          <Marker coordinate={dropoffLocation}>
            <View style={[styles.customMarker, { backgroundColor: colors.error }]}>
              <Ionicons name="location" size={16} color="#fff" />
            </View>
          </Marker>
        )}

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: driver.latitude,
              longitude: driver.longitude,
            }}
            onPress={() => onMarkerPress?.(driver)}
          >
            <View style={[styles.driverMarker, { backgroundColor: colors.primary }]}>
              <Ionicons name="car" size={18} color="#000" />
            </View>
          </Marker>
        ))}

        {children}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
});

// Main export - automatically chooses the right component
const MapViewComponent = forwardRef((props, ref) => {
  if (MapView) {
    return <RealMapView {...props} ref={ref} />;
  }
  return <PlaceholderMap {...props} ref={ref} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...shadows.md,
  },
  // Placeholder styles
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholderContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  gridLine: {
    height: 1,
    width: '100%',
  },
  road: {
    position: 'absolute',
  },
  roadHorizontal: {
    height: 20,
    width: '100%',
    top: '50%',
    marginTop: -10,
  },
  roadVertical: {
    width: 20,
    height: '100%',
    left: '50%',
    marginLeft: -10,
  },
  centerMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  markerDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  locationBadge: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    ...shadows.md,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  driversIndicator: {
    ...StyleSheet.absoluteFillObject,
  },
  driverDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  devBanner: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  devBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
});

export default MapViewComponent;
